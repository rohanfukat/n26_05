from sqlalchemy import Column, String, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base
import uuid
import enum


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    officer = "officer"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    mobile_number = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    city = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.user)
    department = Column(String, nullable=True)  # only for officer role
    is_email_verified = Column(String, nullable=False, default="false")  # "true" / "false"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
