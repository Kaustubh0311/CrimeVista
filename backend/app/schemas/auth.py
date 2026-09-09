from pydantic import BaseModel
from pydantic import EmailStr


class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    password: str

    role: str = "user"


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int

    name: str

    email: EmailStr

    role: str

    is_active: bool


class TokenResponse(BaseModel):

    access_token: str

    token_type: str