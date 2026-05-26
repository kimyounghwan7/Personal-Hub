from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, get_current_authenticated_user
from app.db.database import get_db
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/profile-sync", response_model=UserResponse)
def sync_profile(
    authenticated_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_db),
):
    """Synchronize profile row for the authenticated user and return current profile state."""
    return AuthService.sync_profile(
        db=db,
        user_id=authenticated_user.user_id,
        email=authenticated_user.email,
        provider=authenticated_user.provider,
    )
