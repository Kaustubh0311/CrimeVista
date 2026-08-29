from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_db
from backend.app.auth.dependencies import get_current_user

from backend.app.auth.security import hash_password
from backend.app.auth.security import verify_password

from backend.app.auth.jwt import create_access_token

from backend.app.models.user import User

from backend.app.schemas.auth import RegisterRequest
from backend.app.schemas.auth import LoginRequest
from backend.app.schemas.auth import TokenResponse


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=TokenResponse
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(
            User.email == request.email
        )
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if request.role not in [
        "admin",
        "officer"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    hashed_password = hash_password(
        request.password
    )

    user = User(
        name=request.name,
        email=request.email,
        password_hash=hashed_password,
        role=request.role,
        is_active=True
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    token = create_access_token(
        user_id=user.id,
        role=user.role
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.email == request.email
        )
        .first()
    )

    if user is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    password_correct = verify_password(
        request.password,
        user.password_hash
    )

    if not password_correct:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    token = create_access_token(
        user_id=user.id,
        role=user.role
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(
        get_current_user
    )
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }