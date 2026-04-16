from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, Literal, List
import re


# ─────────────────────────────────────────
#  REGISTER
# ─────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    mobile_number: str
    password: str
    confirm_password: str
    city: str
    role: Literal["user"] = "user"  # only "user" allowed via registration

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        if not re.fullmatch(r"[6-9]\d{9}", v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class RegisterResponse(BaseModel):
    message: str
    user_id: str
    email: str


# ─────────────────────────────────────────
#  LOGIN
# ─────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    type: Literal["user", "admin"] = "user"   # query distinguishes login type


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str
    email: str
    role: str
    city: str


# ─────────────────────────────────────────
#  TOKEN PAYLOAD (internal)
# ─────────────────────────────────────────

class TokenData(BaseModel):
    user_id: str
    email: str
    role: str
    city: str
    full_name: str


# ─────────────────────────────────────────
#  GRIEVANCE
# ─────────────────────────────────────────

class GrievanceUpdateRequest(BaseModel):
    """Used by admins to update any field of an existing grievance."""
    issue: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    dept_allocated: Optional[str] = None


class GrievanceResponse(BaseModel):
    """Serialised Grievance row returned to the client."""
    id: str
    complaint_id: Optional[str] = None
    identity: Optional[str] = None
    issue: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    upvotes: int = 0
    upvoted_by: List[str] = []
    dept_allocated: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True
