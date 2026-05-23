from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.profile import Profile


class AuthService:
    @staticmethod
    def sync_profile(db: Session, user_id: str, email: str) -> Profile:
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        is_admin = bool(settings.ADMIN_EMAIL and email.lower() == settings.ADMIN_EMAIL.lower())

        if not profile:
            profile = Profile(
                id=user_id,
                email=email,
                role="admin" if is_admin else "user",
                is_approved=True if is_admin else False,
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
            return profile

        updated = False
        if profile.email != email:
            profile.email = email
            updated = True

        if is_admin and (profile.role != "admin" or not profile.is_approved):
            profile.role = "admin"
            profile.is_approved = True
            updated = True

        if updated:
            db.commit()
            db.refresh(profile)

        return profile
