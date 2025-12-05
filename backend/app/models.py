from pydantic import BaseModel, EmailStr, Field
from pydantic_core import core_schema
from typing import Optional, Annotated
from datetime import datetime
from bson import ObjectId


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
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str
    role: str = Field(..., pattern="^(admin|manager|barista|customer)$")
    name: str = Field(..., min_length=1, max_length=100)
    cafe_id: Optional[int] = None  # None for customers
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(admin|manager|barista|customer)$")
    name: str = Field(..., min_length=1, max_length=100)
    cafe_id: Optional[int] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    name: str
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

