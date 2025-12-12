from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_core import core_schema
from typing import Optional, Annotated
from datetime import datetime
from bson import ObjectId


EMPLOYEE_ROLES = ("waiter", "floor_staff", "bartender")


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type, handler
    ):
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid objectid")
            return ObjectId(v)
        raise ValueError("Invalid objectid")

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema, handler):
        field_schema.update(type="string")
        return field_schema


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = None  # Optional for phone-based auth
    phone: Optional[str] = None  # Phone number for authentication
    role: str = Field(..., pattern="^(admin|manager|barista|customer)$")
    name: str = Field(..., min_length=1, max_length=100)
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    address: Optional[str] = None
    details: Optional[str] = None
    cafe_id: Optional[int] = None  # None for customers
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class UserCreate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    phone: Optional[str] = None
    role: str = Field(..., pattern="^(admin|manager|barista|customer)$")
    name: str = Field(..., min_length=1, max_length=100)
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    address: Optional[str] = None
    details: Optional[str] = None
    cafe_id: Optional[int] = None


class PhoneLoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: Optional[str] = None  # OTP code for verification

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        """Strip non-digits so inputs with +, spaces, or dashes don't 422."""
        digits = "".join(ch for ch in v if ch.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError("Phone must contain 10-15 digits")
        return digits


class VerifyOTPRequest(BaseModel):
    phone: str
    # Accept both `code` and `otp` keys; always coerce to a 6-char string
    code: str = Field(..., min_length=6, max_length=6, alias="otp")

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        digits = "".join(ch for ch in v if ch.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError("Phone must contain 10-15 digits")
        return digits

    @field_validator("code")
    @classmethod
    def normalize_code(cls, v: str) -> str:
        code_str = str(v).strip()
        if len(code_str) != 6 or not code_str.isdigit():
            raise ValueError("Code must be a 6-digit string")
        return code_str

    model_config = {"populate_by_name": True}

class PhoneLoginComplete(BaseModel):
    phone: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    address: Optional[str] = None
    details: Optional[str] = None

class UserLogin(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    name: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    address: Optional[str] = None
    details: Optional[str] = None
    cafe_id: Optional[int] = None
    created_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    user_id: Optional[str] = None

class ProfileUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    details: Optional[str] = None
    name: Optional[str] = None  # Full name can be updated


class EmployeeBase(BaseModel):
    nationalId: str = Field(..., min_length=5, max_length=32)
    phone: str = Field(..., min_length=10, max_length=15)
    firstName: str = Field(..., min_length=1, max_length=100)
    lastName: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., pattern="^(waiter|floor_staff|bartender)$")
    is_active: bool = True

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        digits = "".join(ch for ch in v if ch.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError("Phone must contain 10-15 digits")
        return digits


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EmployeeStatusUpdate(BaseModel):
    is_active: bool


# Shift Scheduling Models
class ShiftSchedulingBase(BaseModel):
    employee_id: str = Field(..., description="Employee ID")
    date: str = Field(..., description="Shift date (YYYY-MM-DD)")
    start_time: str = Field(..., description="Shift start time (HH:MM)")
    end_time: str = Field(..., description="Shift end time (HH:MM)")


class ShiftSchedulingCreate(ShiftSchedulingBase):
    pass


class ShiftSchedulingResponse(ShiftSchedulingBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Inventory Models
class InventoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    quantity: float = Field(..., ge=0, description="Current quantity")
    unit: str = Field(..., min_length=1, max_length=50, description="Unit of measurement")
    min_quantity: Optional[float] = Field(None, ge=0, description="Minimum stock level")


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    min_quantity: Optional[float] = Field(None, ge=0)


class InventoryResponse(InventoryBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Discount Code Models
class OffCodeBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=50, description="Discount code")
    percent: float = Field(..., ge=0, le=100, description="Discount percentage")
    max_uses: Optional[int] = Field(None, ge=1, description="Maximum number of uses")
    current_uses: int = Field(default=0, ge=0, description="Current number of uses")
    is_active: bool = Field(default=True, description="Whether the code is active")
    expires_at: Optional[datetime] = Field(None, description="Expiration date")


class OffCodeCreate(OffCodeBase):
    current_uses: int = 0


class OffCodeUpdate(BaseModel):
    percent: Optional[float] = Field(None, ge=0, le=100)
    max_uses: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class OffCodeResponse(OffCodeBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Product Models
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., ge=0, description="Product price")
    is_active: bool = Field(default=True, description="Whether the product is active")
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    price: Optional[float] = Field(None, ge=0)
    is_active: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Reward Models
class RewardBase(BaseModel):
    employee_id: str = Field(..., description="Target employee ID")
    title: Optional[str] = Field(None, max_length=200)
    reason: Optional[str] = Field(None, max_length=500)
    amount: float = Field(..., ge=0)
    reward_type: str = Field(..., pattern="^(bonus|penalty)$")
    note: Optional[str] = Field(None, max_length=1000)
    date: Optional[str] = Field(None, description="YYYY-MM-DD")


class RewardCreate(RewardBase):
    pass


class RewardResponse(RewardBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Rule Models
class RuleBase(BaseModel):
    text: str = Field(..., min_length=3, max_length=1000)
    is_active: bool = Field(default=True)


class RuleCreate(RuleBase):
    pass


class RuleUpdate(BaseModel):
    text: Optional[str] = Field(None, min_length=3, max_length=1000)
    is_active: Optional[bool] = None


class RuleResponse(RuleBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}

