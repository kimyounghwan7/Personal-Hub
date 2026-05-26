from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.models.profile import Profile


class AuthService:
    @staticmethod
    def _upsert_profile(
        db: Session,
        user_id: str,
        email: str,
        provider: str = "email",
        *,
        sync_identity_fields: bool,
    ) -> Profile:
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        is_admin = settings.is_admin_email(email)
        provider = provider or "email"

        if not profile:
            profile = Profile(
                id=user_id,
                email=email,
                provider=provider,
                role="admin" if is_admin else "user",
                is_approved=is_admin,
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
            return profile

        updated = False
        if sync_identity_fields and profile.email != email:
            profile.email = email
            updated = True

        if sync_identity_fields and profile.provider != provider:
            profile.provider = provider
            updated = True

        if is_admin and (profile.role != "admin" or not profile.is_approved):
            profile.role = "admin"
            profile.is_approved = True
            updated = True

        if updated:
            db.commit()
            db.refresh(profile)

        return profile

    @staticmethod
    def ensure_profile(db: Session, user_id: str, email: str, provider: str = "email") -> Profile:
        return AuthService._upsert_profile(
            db=db,
            user_id=user_id,
            email=email,
            provider=provider,
            sync_identity_fields=False,
        )

    @staticmethod
    def sync_profile(db: Session, user_id: str, email: str, provider: str = "email") -> Profile:
        return AuthService._upsert_profile(
            db=db,
            user_id=user_id,
            email=email,
            provider=provider,
            sync_identity_fields=True,
        )

    @staticmethod
    def ensure_configured_admin(db: Session) -> tuple[Profile | None, bool]:
        if not settings.normalized_admin_email:
            return None, False

        profile = (
            db.query(Profile)
            .filter(func.lower(Profile.email) == settings.normalized_admin_email)
            .first()
        )
        if not profile:
            return None, False

        updated = False
        if profile.role != "admin":
            profile.role = "admin"
            updated = True
        if not profile.is_approved:
            profile.is_approved = True
            updated = True

        if updated:
            db.commit()
            db.refresh(profile)

        return profile, updated
