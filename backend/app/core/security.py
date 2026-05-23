from fastapi import HTTPException, Header, Depends
from sqlalchemy.orm import Session
import jwt
from app.db.supabase import supabase
from app.db.database import get_db
from app.models.profile import Profile
from app.services.auth_service import AuthService
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def _is_dev_fallback_allowed() -> bool:
    return settings.ENVIRONMENT.lower() in {"development", "local"} and settings.ALLOW_SUPABASE_AUTH_FALLBACK


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _jwt_issuer() -> str:
    return f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise _credentials_exception()

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise _credentials_exception()

    return token.strip()


def _decode_authenticated_user(token: str) -> tuple[str, str]:
    user_id = None
    email = None
    credentials_exception = _credentials_exception()

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience=settings.SUPABASE_JWT_AUDIENCE,
            issuer=_jwt_issuer(),
            options={"require": ["exp", "sub", "email", "aud", "iss"]},
        )
        user_id = payload.get("sub")
        email = payload.get("email")
    except jwt.InvalidSignatureError:
        if not _is_dev_fallback_allowed():
            logger.error("[SECURITY] JWT signature validation failed while fallback is disabled.")
            raise credentials_exception

        logger.warning("[SECURITY] Local JWT signature verification failed. Falling back to Supabase API because ALLOW_SUPABASE_AUTH_FALLBACK is enabled.")
        try:
            if not supabase:
                raise credentials_exception
            user_response = supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                raise credentials_exception
            user_id = user_response.user.id
            email = user_response.user.email
        except HTTPException:
            raise
        except Exception:
            logger.exception("[SECURITY] Supabase fallback token validation failed.")
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    if not user_id or not email:
        raise credentials_exception

    return user_id, email


def get_current_authenticated_profile(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> Profile:
    token = _extract_bearer_token(authorization)
    user_id, email = _decode_authenticated_user(token)
    return AuthService.sync_profile(db=db, user_id=user_id, email=email)

def get_current_user_id(
    profile: Profile = Depends(get_current_authenticated_profile),
) -> str:
    if not profile.is_approved:
        raise HTTPException(status_code=403, detail="Waiting for admin approval")

    return profile.id

def get_current_admin_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> str:
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile or profile.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user_id
