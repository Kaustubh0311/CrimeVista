from fastapi import APIRouter
from fastapi import Depends

from backend.app.auth.dependencies import require_role
from backend.app.models.user import User


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(
        require_role("admin")
    )
):

    return {
        "message": "Welcome to Admin Dashboard",
        "user": current_user.name,
        "role": current_user.role
    }