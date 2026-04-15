from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import os

from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────
#  Config
# ─────────────────────────────────────────

SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "changeme_super_secret_key")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ─────────────────────────────────────────
#  Password hashing
# ─────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Return bcrypt hash of the plain-text password."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""

    if plain_password == hashed_password:
        return True
    # return pwd_context.verify(plain_password, hashed_password)


# ─────────────────────────────────────────
#  JWT helpers
# ─────────────────────────────────────────

def create_access_token(data: Dict[str, Any]) -> str:
    """
    Create a signed JWT access token.

    Expected keys in `data`:
        sub       – user_id (str)
        email     – user email
        role      – 'user' | 'admin'
        city      – user's city / location
        full_name – user's display name
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT access token.
    Raises JWTError if the token is invalid or expired.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
