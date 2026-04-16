from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserRole
from models.schemas import RegisterRequest, RegisterResponse, LoginRequest, LoginResponse
from utils.auth import hash_password, verify_password, create_access_token
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


# ─────────────────────────────────────────
#  Helper – trigger Supabase email verify
# ─────────────────────────────────────────

async def _send_supabase_verification_email(email: str) -> None:
    """
    Uses the Supabase Auth Admin API (service-role key) to send a
    magic-link / OTP verification email to the newly registered user.
    This is a best-effort call; a failure here does not block registration.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        # Supabase credentials not configured – skip silently
        return

    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"email": email, "email_confirm": False}  # sends confirmation email

    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, json=payload, headers=headers, timeout=10)
    except Exception:
        pass  # non-blocking


# ─────────────────────────────────────────
#  POST /auth/register
# ─────────────────────────────────────────

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new citizen account",
)
async def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        # 1. Duplicate email check
        if db.query(User).filter(User.email == payload.email).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        # 2. Duplicate mobile check
        if db.query(User).filter(User.mobile_number == payload.mobile_number).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this mobile number already exists.",
            )

        # 3. Create user
        new_user = User(
            full_name=payload.full_name,
            email=payload.email,
            mobile_number=payload.mobile_number,
            # hashed_password=hash_password(payload.password),
            hashed_password=payload.password,

            city=payload.city,
            role=UserRole.user,          # only 'user' can self-register
            is_email_verified="false",
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return RegisterResponse(
            message="Registration successful",
            user_id=str(new_user.id),
            email=new_user.email,
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration. Please try again.",
        )


# ─────────────────────────────────────────
#  POST /auth/login
# ─────────────────────────────────────────

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login and receive a JWT access token",
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        login_type = payload.type  # "user" or "admin"

        # 1. Fetch user by email
        user: User | None = db.query(User).filter(User.email == payload.email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        # 2. Role-based gate
        if login_type == "admin" and user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. This account does not have admin privileges.",
            )

        if login_type == "officer" and user.role != UserRole.officer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. This account does not have officer privileges.",
            )

        if login_type == "user" and user.role not in (UserRole.user,):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please use the appropriate login portal for your role.",
            )

        # 3. Password check
        if not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        # 4. Build JWT
        token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value,
                "city": user.city,
                "full_name": user.full_name,
                "department": user.department,
            }
        )

        return LoginResponse(
            access_token=token,
            token_type="bearer",
            user_id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            role=user.role.value,
            city=user.city,
            department=user.department,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login. Please try again.",
        )