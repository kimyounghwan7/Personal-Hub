from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.security import get_current_admin_profile
from app.db.database import get_db
from app.models.profile import Profile
from app.schemas.user import UserResponse
from app.services.admin_service import AdminService

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    _admin_profile: Profile = Depends(get_current_admin_profile),
    db: Session = Depends(get_db)
):
    """Retrieve all users. Admin only."""
    return AdminService.get_all_users(db=db)

@router.delete("/users/{target_user_id}")
def delete_user(
    target_user_id: str,
    admin_profile: Profile = Depends(get_current_admin_profile),
    db: Session = Depends(get_db)
):
    """Delete a user account. Admin only."""
    AdminService.delete_user_as_admin(
        db=db,
        admin_user_id=admin_profile.id,
        target_user_id=target_user_id,
    )
    return {"message": "User deleted successfully"}

@router.patch("/users/{target_user_id}/approve")
def approve_user(
    target_user_id: str,
    _admin_profile: Profile = Depends(get_current_admin_profile),
    db: Session = Depends(get_db)
):
    """Approve a pending user account. Admin only."""
    AdminService.approve_user(db=db, target_user_id=target_user_id)
    return {"message": "User approved successfully"}
