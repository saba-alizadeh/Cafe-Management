"""
Zarinpal payment gateway integration (sandbox).
"""
import httpx
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Literal, Optional
from app.database import get_database, connect_to_mongo
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user
from app.db_helpers import get_cafe_id_for_access

router = APIRouter(prefix="/api/payments", tags=["payments"])

ZARINPAL_MERCHANT_ID = "199342e2-53e4-4e0e-bc28-5454b9e476a6"
# Zarinpal v4 API (old WebGate URLs return 404)
ZARINPAL_REQUEST = "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
ZARINPAL_VERIFY = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
ZARINPAL_STARTPAY = "https://sandbox.zarinpal.com/pg/StartPay/"


def get_orders_collection(db, cafe_id: str):
    return db[f"cafe_{cafe_id}_orders"]


def get_reservations_collection(db, cafe_id: str):
    return db[f"cafe_{cafe_id}_reservations"]


class PaymentRequest(BaseModel):
    amount: int  # in Rials
    item_kind: Literal["order", "reservation"]
    item_id: str
    cafe_id: str
    description: str = "پرداخت سفارش"


class PaymentRequestResponse(BaseModel):
    payment_url: str
    authority: str


@router.post("/request", response_model=PaymentRequestResponse)
async def request_payment(
    body: PaymentRequest,
    callback_url: str = Query(..., description="URL where user will be redirected after payment"),
    current_user: TokenData = Depends(get_current_user),
):
    """Request payment from Zarinpal and return redirect URL."""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    cafe_id = await get_cafe_id_for_access(db, current_user, body.cafe_id)

    if body.amount < 1000:
        raise HTTPException(status_code=400, detail="حداقل مبلغ پرداخت ۱۰۰۰ ریال است")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            ZARINPAL_REQUEST,
            json={
                "merchant_id": ZARINPAL_MERCHANT_ID,
                "amount": body.amount,
                "callback_url": callback_url,
                "description": body.description or "پرداخت سفارش کافه",
            },
            headers={"accept": "application/json", "content-type": "application/json"},
        )

    if not resp.text or not resp.text.strip():
        raise HTTPException(
            status_code=502,
            detail="درگاه پرداخت پاسخی ارسال نکرد. لطفاً دوباره تلاش کنید یا اتصال اینترنت را بررسی کنید.",
        )
    try:
        data = resp.json()
    except Exception:
        raise HTTPException(
            status_code=502,
            detail=f"پاسخ نامعتبر از درگاه پرداخت: {resp.text[:200] if resp.text else 'بدون محتوا'}",
        )

    # v4 response: data.code == 100 for success; errors is object {code, message}
    errors = data.get("errors") or {}
    if errors or data.get("data", {}).get("code") != 100:
        err_msg = errors.get("message", "خطا در ایجاد درخواست پرداخت") if isinstance(errors, dict) else "خطا در ایجاد درخواست پرداخت"
        raise HTTPException(status_code=400, detail=err_msg)

    authority = (data.get("data") or {}).get("authority")
    if not authority:
        raise HTTPException(status_code=500, detail="پاسخ نامعتبر از درگاه پرداخت")

    # Store mapping for verification
    payments_col = db["payment_pending"]
    await payments_col.insert_one({
        "authority": authority,
        "item_kind": body.item_kind,
        "item_id": body.item_id,
        "cafe_id": cafe_id,
        "amount": body.amount,
        "user_id": str(user["_id"]),
    })

    payment_url = f"{ZARINPAL_STARTPAY}{authority}"
    return PaymentRequestResponse(payment_url=payment_url, authority=authority)


@router.get("/verify")
async def verify_payment(
    authority: str = Query(..., description="Authority from Zarinpal callback"),
    status: Optional[str] = Query(None, description="Status from Zarinpal: OK or NOK"),
    current_user: TokenData = Depends(get_current_user),
):
    """Verify payment after user returns from Zarinpal. Updates order/reservation status on success."""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not available.")

    payments_col = db["payment_pending"]
    pending = await payments_col.find_one({"authority": authority})
    if not pending:
        return {"success": False, "message": "درخواست پرداخت یافت نشد یا منقضی شده است"}

    if status and status.upper() != "OK":
        return {"success": False, "message": "پرداخت توسط کاربر لغو شد"}

    amount = pending["amount"]
    item_kind = pending["item_kind"]
    item_id = pending["item_id"]
    cafe_id = pending["cafe_id"]

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            ZARINPAL_VERIFY,
            json={
                "merchant_id": ZARINPAL_MERCHANT_ID,
                "amount": amount,
                "authority": authority,
            },
            headers={"accept": "application/json", "content-type": "application/json"},
        )

    if not resp.text or not resp.text.strip():
        return {"success": False, "message": "درگاه پرداخت پاسخی ارسال نکرد. لطفاً دوباره تلاش کنید."}
    try:
        data = resp.json()
    except Exception:
        return {"success": False, "message": "پاسخ نامعتبر از درگاه پرداخت"}

    # v4 response: data.code == 100 for success
    resp_data = data.get("data") or {}
    if data.get("errors") or resp_data.get("code") != 100:
        return {"success": False, "message": "پرداخت تایید نشد"}

    ref_id = resp_data.get("ref_id")

    # Update order or reservation status to completed
    from bson import ObjectId
    from datetime import datetime
    try:
        oid = ObjectId(item_id)
        now = datetime.utcnow()
        if item_kind == "order":
            orders_col = get_orders_collection(db, cafe_id)
            await orders_col.update_one(
                {"_id": oid},
                {"$set": {"status": "completed", "updated_at": now}},
            )
            # Also update the linked reservation record (orders create a reservation)
            reservations_col = get_reservations_collection(db, cafe_id)
            await reservations_col.update_one(
                {"order_id": item_id},
                {"$set": {"status": "completed", "updated_at": now}},
            )
        else:
            reservations_col = get_reservations_collection(db, cafe_id)
            await reservations_col.update_one(
                {"_id": oid},
                {"$set": {"status": "completed", "updated_at": now}},
            )
    except Exception:
        pass

    # Remove pending record
    await payments_col.delete_one({"authority": authority})

    return {
        "success": True,
        "message": "پرداخت با موفقیت انجام شد",
        "ref_id": str(ref_id) if ref_id else None,
    }
