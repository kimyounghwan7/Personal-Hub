from fastapi import APIRouter, Depends

from app.core.security import get_current_authenticated_profile
from app.models.profile import Profile
from app.schemas.user import UserResponse

router = APIRouter()


@router.post("/profile-sync", response_model=UserResponse)
def sync_profile(profile: Profile = Depends(get_current_authenticated_profile)):
    """Synchronize profile row for the authenticated user and return current profile state."""
    return profile
