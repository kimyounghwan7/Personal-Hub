from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.supabase import supabase
from app.models.profile import Profile
from app.models.todo import Todo

class AdminService:
    @staticmethod
    def get_all_users(db: Session) -> List[Profile]:
        return db.query(Profile).all()

    @staticmethod
    def delete_user(db: Session, target_user_id: str) -> None:
        try:
            # 1. Delete user from auth.users (requires service_role key)
            admin_auth = supabase.auth.admin
            admin_auth.delete_user(target_user_id)
            
            # 2. Delete from DB via SQLAlchemy
            db.query(Todo).filter(Todo.user_id == target_user_id).delete()
            db.query(Profile).filter(Profile.id == target_user_id).delete()
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")

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
