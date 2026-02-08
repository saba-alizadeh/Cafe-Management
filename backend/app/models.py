from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_core import core_schema
from typing import Optional, Annotated, List
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
    profile_image_url: Optional[str] = None  # URL to profile picture (optional)

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
    profile_image_url: Optional[str] = None

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
    email: Optional[EmailStr] = None
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
    username: Optional[str] = Field(default=None, min_length=3, max_length=50, description="Username for login")
    password: Optional[str] = Field(default=None, min_length=6, description="Password for login (will be hashed)")
    iban: Optional[str] = Field(default=None, max_length=34, description="IBAN (Sheba number)")
    father_name: Optional[str] = Field(default=None, max_length=100, description="Father's name")
    date_of_birth: Optional[str] = Field(default=None, max_length=10, description="Date of birth (YYYY-MM-DD)")
    address: Optional[str] = Field(default=None, max_length=500, description="Address")

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        digits = "".join(ch for ch in v if ch.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError("Phone must contain 10-15 digits")
        return digits


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    nationalId: Optional[str] = Field(default=None, min_length=5, max_length=32)
    phone: Optional[str] = Field(default=None, min_length=10, max_length=15)
    firstName: Optional[str] = Field(default=None, min_length=1, max_length=100)
    lastName: Optional[str] = Field(default=None, min_length=1, max_length=100)
    role: Optional[str] = Field(default=None, pattern="^(waiter|floor_staff|bartender)$")
    username: Optional[str] = Field(default=None, min_length=3, max_length=50, description="Username for login")
    password: Optional[str] = Field(default=None, min_length=6, description="Password for login (will be hashed)")
    iban: Optional[str] = Field(default=None, max_length=34, description="IBAN (Sheba number)")
    father_name: Optional[str] = Field(default=None, max_length=100, description="Father's name")
    date_of_birth: Optional[str] = Field(default=None, max_length=10, description="Date of birth (YYYY-MM-DD)")
    address: Optional[str] = Field(default=None, max_length=500, description="Address")

    @field_validator("phone", mode="before")
    @classmethod
    def normalize_phone(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            digits = "".join(ch for ch in v if ch.isdigit())
            if len(digits) < 10 or len(digits) > 15:
                raise ValueError("Phone must contain 10-15 digits")
            return digits
        return v


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
    image_url: Optional[str] = Field(None, description="Image URL for custom drink builder")
    price: Optional[float] = Field(None, ge=0, description="Price for custom drink builder")


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    min_quantity: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)


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


# Coffee Blend Model
class CoffeeBlendOption(BaseModel):
    ratio: str = Field(..., description="Blend ratio (e.g., '100%', '80-20', '60-40', '50-50')")
    price: float = Field(..., ge=0, description="Price for this specific blend")


# Product Models
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., ge=0, description="Base product price (default price)")
    is_active: bool = Field(default=True, description="Whether the product is active")
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = None
    discount_percent: Optional[float] = Field(None, ge=0, le=100, description="Discount percentage (0-100)")
    labels: Optional[List[str]] = Field(None, description="Product labels/categories (e.g., 'warm drinks', 'cold drinks')")
    coffee_blends: Optional[List[CoffeeBlendOption]] = Field(None, description="Coffee blend options with prices (for coffee products)")
    coffee_type: Optional[str] = Field(None, description="Coffee type (e.g., 'Robusta', 'Arabica')")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    price: Optional[float] = Field(None, ge=0)
    is_active: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = None
    discount_percent: Optional[float] = Field(None, ge=0, le=100)
    labels: Optional[List[str]] = None
    coffee_blends: Optional[List[CoffeeBlendOption]] = None
    coffee_type: Optional[str] = None


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


# Cafe Models
class CafeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Cafe name")
    location: Optional[str] = Field(default=None, max_length=500, description="Cafe location/address")
    phone: Optional[str] = Field(default=None, max_length=15, description="Contact phone number")
    email: Optional[EmailStr] = Field(default=None, description="Contact email")
    details: Optional[str] = Field(default=None, max_length=1000, description="Additional cafe details")
    hours: Optional[str] = Field(default=None, max_length=100, description="Operating hours")
    capacity: Optional[int] = Field(default=None, ge=0, description="Maximum capacity")
    wifi_password: Optional[str] = Field(default=None, max_length=100, description="WiFi password")
    is_active: bool = Field(default=True, description="Whether the cafe is active")
    # Optional features
    has_cinema: bool = Field(default=False, description="Whether the cafe has cinema feature")
    cinema_seating_capacity: Optional[int] = Field(default=None, ge=1, description="Cinema seating capacity (required if has_cinema is True)")
    has_coworking: bool = Field(default=False, description="Whether the cafe has co-working space feature")
    coworking_capacity: Optional[int] = Field(default=None, ge=1, description="Co-working space total capacity (required if has_coworking is True)")
    has_events: bool = Field(default=False, description="Whether the cafe has events feature")
    image_url: Optional[str] = Field(default=None, max_length=500, description="URL of the cafe image")
    logo_url: Optional[str] = Field(default=None, max_length=500, description="URL of the cafe logo")
    banner_url: Optional[str] = Field(default=None, max_length=500, description="URL of the cafe banner")
    
    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            # Remove non-digits for validation
            digits = "".join(ch for ch in v if ch.isdigit())
            if len(digits) < 10 or len(digits) > 15:
                raise ValueError("Phone must contain 10-15 digits")
            return digits
        return v
    
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
    
    @field_validator("capacity", mode="before")
    @classmethod
    def validate_capacity(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                return None
        return v


class CafeCreate(CafeBase):
    # Admin account details for the cafe
    admin_username: str = Field(..., min_length=3, max_length=50, description="Username for cafe admin")
    admin_password: str = Field(..., min_length=6, description="Password for cafe admin")
    admin_email: Optional[EmailStr] = Field(default=None, description="Email for cafe admin")
    admin_phone: Optional[str] = Field(default=None, max_length=15, description="Phone for cafe admin")
    # Extended KYC fields for admin registration (all required at cafe creation time)
    admin_first_name: str = Field(..., min_length=1, max_length=100, description="Admin first name")
    admin_last_name: str = Field(..., min_length=1, max_length=100, description="Admin last name")
    admin_national_id: str = Field(..., min_length=5, max_length=32, description="Admin national ID")
    admin_registration_date: str = Field(..., min_length=4, max_length=20, description="Admin registration date")
    admin_commitment_image_url: str = Field(..., min_length=1, max_length=500, description="URL of commitment/contract image")
    admin_business_license_image_url: str = Field(..., min_length=1, max_length=500, description="URL of business license image")
    admin_national_id_image_url: str = Field(..., min_length=1, max_length=500, description="URL of national ID card image")
    
    @field_validator("admin_email", mode="before")
    @classmethod
    def validate_admin_email(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            trimmed = v.strip()
            if trimmed == "":
                return None
            return trimmed
        return v
    
    @field_validator("admin_phone", mode="before")
    @classmethod
    def validate_admin_phone(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            # Remove non-digits for validation
            digits = "".join(ch for ch in v if ch.isdigit())
            if len(digits) < 10 or len(digits) > 15:
                raise ValueError("Admin phone must contain 10-15 digits")
            return digits
        return v
    


class CafeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    details: Optional[str] = Field(None, max_length=1000)
    hours: Optional[str] = Field(None, max_length=100)
    capacity: Optional[int] = Field(None, ge=0)
    wifi_password: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    has_cinema: Optional[bool] = None
    cinema_seating_capacity: Optional[int] = Field(None, ge=1)
    has_coworking: Optional[bool] = None
    coworking_capacity: Optional[int] = Field(None, ge=1)
    has_events: Optional[bool] = None
    image_url: Optional[str] = Field(None, max_length=500)
    logo_url: Optional[str] = Field(None, max_length=500)
    banner_url: Optional[str] = Field(None, max_length=500)


class CafeResponse(CafeBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    admin_id: Optional[str] = Field(None, description="ID of the cafe admin user")

    model_config = {"from_attributes": True}


# Table Management Models
class TableBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Table name or number")
    capacity: int = Field(..., ge=1, le=50, description="Seating capacity")
    status: str = Field(default="available", pattern="^(available|reserved)$", description="Table status")
    is_active: bool = Field(default=True, description="Whether the table is active")


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100, description="Table name or number")
    capacity: Optional[int] = Field(default=None, ge=1, le=50, description="Seating capacity")
    status: Optional[str] = Field(default=None, pattern="^(available|reserved)$", description="Table status")
    is_active: Optional[bool] = Field(default=None, description="Whether the table is active")


class TableResponse(TableBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Cinema Models
class FilmBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Film title")
    description: Optional[str] = Field(default=None, max_length=1000, description="Film description")
    duration_minutes: int = Field(..., ge=1, le=300, description="Film duration in minutes")
    genre: Optional[str] = Field(default=None, max_length=100, description="Film genre")
    rating: Optional[str] = Field(default=None, max_length=10, description="Film rating (e.g., PG, PG-13, R)")
    banner_url: Optional[str] = Field(default=None, max_length=500, description="URL of the film banner image")


class FilmCreate(FilmBase):
    pass


class FilmUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    duration_minutes: Optional[int] = Field(None, ge=1, le=300)
    genre: Optional[str] = Field(None, max_length=100)
    rating: Optional[str] = Field(None, max_length=10)
    banner_url: Optional[str] = Field(None, max_length=500)


class FilmResponse(FilmBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MovieSessionBase(BaseModel):
    film_id: str = Field(..., description="ID of the film")
    session_date: str = Field(..., description="Session date (YYYY-MM-DD)")
    start_time: str = Field(..., description="Session start time (HH:MM)")
    end_time: Optional[str] = Field(default=None, description="Session end time (HH:MM)")
    available_seats: int = Field(..., ge=0, description="Number of available seats")
    price_per_seat: float = Field(..., ge=0, description="Price per seat")
    image_url: str = Field(..., min_length=1, description="Image URL for the movie session (e.g., movie poster)")


class MovieSessionCreate(MovieSessionBase):
    pass


class MovieSessionUpdate(BaseModel):
    film_id: Optional[str] = None
    session_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    available_seats: Optional[int] = Field(None, ge=0)
    price_per_seat: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, min_length=1, description="Image URL for the movie session")


class MovieSessionResponse(MovieSessionBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Co-working Space Models
class CoworkingTableBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Table name or identifier")
    capacity: int = Field(..., ge=1, le=20, description="Number of seats at this table")
    is_available: bool = Field(default=True, description="Whether the table is currently available")
    amenities: Optional[str] = Field(default=None, max_length=500, description="Table amenities (e.g., power outlet, monitor)")


class CoworkingTableCreate(CoworkingTableBase):
    pass


class CoworkingTableUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    capacity: Optional[int] = Field(None, ge=1, le=20)
    is_available: Optional[bool] = None
    amenities: Optional[str] = Field(None, max_length=500)


class CoworkingTableResponse(CoworkingTableBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Events Models
class EventBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Event name")
    description: Optional[str] = Field(default=None, max_length=2000, description="Event description")
    duration_minutes: int = Field(..., ge=15, le=1440, description="Event duration in minutes")
    price_per_person: float = Field(..., ge=0, description="Price per person")
    image_urls: List[str] = Field(..., min_length=1, description="At least one image URL is required for the event")


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    duration_minutes: Optional[int] = Field(None, ge=15, le=1440)
    price_per_person: Optional[float] = Field(None, ge=0)
    image_urls: Optional[List[str]] = Field(None, min_length=1, description="At least one image URL is required if provided")


class EventSessionBase(BaseModel):
    event_id: str = Field(..., description="ID of the event")
    session_date: str = Field(..., description="Session date (YYYY-MM-DD)")
    start_time: str = Field(..., description="Session start time (HH:MM)")
    end_time: Optional[str] = Field(default=None, description="Session end time (HH:MM)")
    available_spots: int = Field(..., ge=0, description="Number of available spots")
    price_per_person: Optional[float] = Field(default=None, ge=0, description="Price per person (overrides event default)")


class EventSessionCreate(EventSessionBase):
    pass


class EventSessionUpdate(BaseModel):
    event_id: Optional[str] = None
    session_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    available_spots: Optional[int] = Field(None, ge=0)
    price_per_person: Optional[float] = Field(None, ge=0)


class EventResponse(EventBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class EventSessionResponse(EventSessionBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Reservation Models
class ReservationBase(BaseModel):
    reservation_type: str = Field(..., description="Type: table, cinema, event, coworking, order")
    cafe_id: str
    date: str
    time: str
    number_of_people: int = Field(..., ge=1)
    status: str = Field(default="pending_approval", description="pending_approval, confirmed, completed, cancelled, rejected")
    notes: Optional[str] = None


class TableReservationCreate(ReservationBase):
    reservation_type: str = "table"
    table_id: str


class CinemaReservationCreate(ReservationBase):
    reservation_type: str = "cinema"
    session_id: str
    seat_numbers: List[str] = Field(..., min_length=1)
    attendee_names: List[str] = Field(default_factory=list)

    @field_validator("seat_numbers", mode="before")
    @classmethod
    def coerce_seat_numbers(cls, v):
        if isinstance(v, list) and v:
            return [str(x) for x in v]
        return v


class EventReservationCreate(ReservationBase):
    reservation_type: str = "event"
    event_id: str
    session_id: str
    attendee_names: List[str] = Field(default_factory=list)


class CoworkingReservationCreate(ReservationBase):
    reservation_type: str = "coworking"
    table_id: str


class ReservationResponse(ReservationBase):
    id: str
    user_id: str
    table_id: Optional[str] = None
    session_id: Optional[str] = None
    event_id: Optional[str] = None
    seat_numbers: Optional[List[str]] = None
    attendee_names: Optional[List[str]] = None
    # For food & drink orders stored in the unified reservations table
    order_id: Optional[str] = Field(
        default=None, description="Linked order ID when reservation_type is 'order'"
    )
    items: Optional[List[OrderItem]] = Field(
        default=None,
        description="Food & drink items when reservation_type is 'order'",
    )
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Order Models (for product orders)
class OrderItem(BaseModel):
    product_id: Optional[str] = Field(None, description="Product ID if it's a regular product")
    product_name: str = Field(..., description="Product name")
    product_type: str = Field(..., description="Type: product, custom_drink, etc.")
    price: float = Field(..., ge=0, description="Individual product price")
    quantity: int = Field(..., ge=1, description="Quantity ordered")
    custom_ingredients: Optional[str] = Field(None, description="For custom drinks")


class OrderCreate(BaseModel):
    cafe_id: str
    items: List[OrderItem] = Field(..., min_length=1, description="Ordered items")
    customer_name: Optional[str] = Field(None, description="Customer name")
    customer_phone: Optional[str] = Field(None, description="Customer phone number")
    table_number: Optional[str] = Field(None, description="Table number if applicable")
    discount_code: Optional[str] = Field(None, description="Applied discount code")
    discount_percent: Optional[float] = Field(None, ge=0, le=100, description="Discount percentage applied")
    discount_amount: Optional[float] = Field(None, ge=0, description="Discount amount")
    subtotal: float = Field(..., ge=0, description="Subtotal before discount")
    total: float = Field(..., ge=0, description="Final total after discount")
    notes: Optional[str] = Field(None, description="Additional notes")


class OrderResponse(OrderCreate):
    id: str
    user_id: str
    status: str = Field(default="pending_approval", description="pending_approval, confirmed, preparing, ready, completed, cancelled, rejected")
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}