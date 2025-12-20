from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Response
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import ProductCreate, ProductUpdate, ProductResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin
from app.db_helpers import (
    get_cafe_products_collection, require_cafe_access, get_cafe_product_images_collection
)
import base64

router = APIRouter(prefix="/api/products", tags=["products"])


@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload a product image. Returns a URL that can be stored in product records.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    cafe_id = await require_cafe_access(db, current_user)

    # Read file contents
    contents = await file.read()
    
    # Convert to base64
    image_base64 = base64.b64encode(contents).decode('utf-8')
    image_data_url = f"data:{file.content_type};base64,{image_base64}"
    
    # Store in images collection
    images_collection = db["images"]
    image_doc = {
        "type": "product_image",
        "cafe_id": cafe_id,
        "data": image_data_url,
        "content_type": file.content_type,
        "created_at": datetime.utcnow()
    }
    result = await images_collection.insert_one(image_doc)
    image_id = str(result.inserted_id)
    
    # Return URL pointing to image retrieval endpoint
    return {"url": f"/api/products/image/{image_id}"}


@router.get("/image/{image_id}")
async def get_product_image(image_id: str):
    """Retrieve a product image by ID"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
    
    images_collection = db["images"]
    try:
        image_oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image ID"
        )
    
    image_doc = await images_collection.find_one({"_id": image_oid, "type": "product_image"})
    if not image_doc:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )
    
    # Extract base64 data from data URL
    data_url = image_doc.get("data", "")
    if data_url.startswith("data:"):
        base64_data = data_url.split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        content_type = image_doc.get("content_type", "image/jpeg")
        return Response(content=image_bytes, media_type=content_type)
    else:
        raise HTTPException(
            status_code=500,
            detail="Invalid image data format"
        )


@router.get("", response_model=list[ProductResponse])
async def list_products(current_user: TokenData = Depends(get_current_user)):
    """Get all products for the current user's café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    # Get café ID and enforce isolation
    cafe_id = await require_cafe_access(db, current_user)

    products_collection = get_cafe_products_collection(db, cafe_id)
    cursor = products_collection.find({}).sort("name", 1)
    products = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        products.append(ProductResponse(**doc))
    return products


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(product: ProductCreate, current_user: TokenData = Depends(get_current_user)):
    """Create a new product for the current user's café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    # Get café ID and enforce isolation
    cafe_id = await require_cafe_access(db, current_user)

    products_collection = get_cafe_products_collection(db, cafe_id)
    
    # Check if product with same name already exists in this café
    existing = await products_collection.find_one({"name": product.name})
    if existing:
        raise HTTPException(status_code=400, detail="Product with this name already exists")

    doc = product.model_dump()
    doc["cafe_id"] = cafe_id  # Store café ID for reference
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    result = await products_collection.insert_one(doc)
    created = await products_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    return ProductResponse(**created)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a product in the current user's café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    # Get café ID and enforce isolation
    cafe_id = await require_cafe_access(db, current_user)

    products_collection = get_cafe_products_collection(db, cafe_id)
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    update_data = product_update.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()

    result = await products_collection.update_one(
        {"_id": oid},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = await products_collection.find_one({"_id": oid})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return ProductResponse(**updated)


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: str, current_user: TokenData = Depends(get_current_user)):
    """Delete a product from the current user's café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    # Get café ID and enforce isolation
    cafe_id = await require_cafe_access(db, current_user)

    products_collection = get_cafe_products_collection(db, cafe_id)
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await products_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return None
