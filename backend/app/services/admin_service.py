import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.supabase import supabase
from app.models.profile import Profile
from app.models.todo import Todo

logger = logging.getLogger(__name__)
MAX_ADMIN_USERS_LIMIT = 1000


class AdminService:
    @staticmethod
    def get_all_users(db: Session, limit: int = MAX_ADMIN_USERS_LIMIT) -> List[Profile]:
        bounded_limit = max(1, min(limit, MAX_ADMIN_USERS_LIMIT))
        return db.query(Profile).limit(bounded_limit).all()

    @staticmethod
    def delete_user(db: Session, target_user_id: str) -> None:
        if supabase is None:
            logger.error("[ADMIN] Supabase client is not configured; cannot delete auth user.")
            raise HTTPException(status_code=503, detail="Authentication service unavailable")

        try:
            admin_auth = supabase.auth.admin
            admin_auth.delete_user(target_user_id)

            db.query(Todo).filter(Todo.user_id == target_user_id).delete()
            db.query(Profile).filter(Profile.id == target_user_id).delete()
            db.commit()
        except HTTPException:
            db.rollback()
            raise
        except Exception:
            db.rollback()
            logger.exception("[ADMIN] Failed to delete user %s", target_user_id)
            raise HTTPException(status_code=500, detail="Failed to delete user")


    @staticmethod
    def delete_user_as_admin(db: Session, admin_user_id: str, target_user_id: str) -> None:
        if admin_user_id == target_user_id:
            raise HTTPException(status_code=400, detail="Admins cannot delete their own account")

        AdminService.delete_user(db=db, target_user_id=target_user_id)

    @staticmethod
    def approve_user(db: Session, target_user_id: str) -> None:
        profile = db.query(Profile).filter(Profile.id == target_user_id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile.is_approved = True
        db.commit()
