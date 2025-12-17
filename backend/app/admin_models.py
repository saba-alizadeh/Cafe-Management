from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class AdminBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Admin full name")
    username: str = Field(..., min_length=3, max_length=50, description="Admin username")
    email: Optional[EmailStr] = Field(default=None, description="Admin email")
    phone: Optional[str] = Field(default=None, max_length=15, description="Admin phone")
    cafe_id: Optional[int] = Field(default=None, description="Linked cafe id")
    is_active: bool = Field(default=True, description="Whether admin is active")

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            trimmed = v.strip()
            if trimmed == "":
                return None
            return trimmed
        return v

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            digits = "".join(ch for ch in v if ch.isdigit())
            if len(digits) < 10 or len(digits) > 15:
                raise ValueError("Admin phone must contain 10-15 digits")
            return digits
        return v


class AdminCreate(AdminBase):
    password: str = Field(..., min_length=6, description="Admin password")


class AdminResponse(AdminBase):
    id: str
    user_id: Optional[str] = Field(default=None, description="Linked user id")
    created_at: datetime

    model_config = {"from_attributes": True}

