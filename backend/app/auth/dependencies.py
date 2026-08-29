from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from jose import JWTError
from jose import jwt

from sqlalchemy.orm import Session

from backend.app.database.connection import SessionLocal
from backend.app.models.user import User

from backend.app.auth.config import (
    SECRET_KEY,
    ALGORITHM
)


security = HTTPBearer()


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = (
        db.query(User)
        .filter(
            User.id == int(user_id)
        )
        .first()
    )

    if user is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user
def require_role(required_role: str):

    def role_checker(
        current_user: User = Depends(
            get_current_user
        )
    ):

        if current_user.role != required_role:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return current_user

    return role_checker