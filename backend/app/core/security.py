from fastapi import HTTPException, Header, Depends
from sqlalchemy.orm import Session
import jwt
from dataclasses import dataclass
from app.db.supabase import supabase
from app.db.database import get_db
from app.models.profile import Profile
from app.services.auth_service import AuthService
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    email: str
    provider: str = "email"


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


def _extract_provider(payload: dict | None) -> str:
    app_metadata = (payload or {}).get("app_metadata")
    if isinstance(app_metadata, dict) and app_metadata.get("provider"):
        return app_metadata["provider"]
    return "email"


def _decode_authenticated_user(token: str) -> AuthenticatedUser:
    user_id = None
    email = None
    provider = "email"
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
        provider = _extract_provider(payload)
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
            provider = _extract_provider({"app_metadata": getattr(user_response.user, "app_metadata", None)})
        except HTTPException:
            raise
        except Exception:
            logger.exception("[SECURITY] Supabase fallback token validation failed.")
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    if not user_id or not email:
        raise credentials_exception

    return AuthenticatedUser(user_id=user_id, email=email, provider=provider)


def get_current_authenticated_user(
    authorization: str = Header(None),
):
    token = _extract_bearer_token(authorization)
    return _decode_authenticated_user(token)


def get_current_authenticated_profile(
    authenticated_user: AuthenticatedUser | str = Depends(get_current_authenticated_user),
    db: Session = Depends(get_db)
) -> Profile:
    if isinstance(authenticated_user, str):
        authenticated_user = get_current_authenticated_user(authenticated_user)

    return AuthService.ensure_profile(
        db=db,
        user_id=authenticated_user.user_id,
        email=authenticated_user.email,
        provider=authenticated_user.provider,
    )


def get_current_approved_profile(
    profile: Profile = Depends(get_current_authenticated_profile),
) -> Profile:
    if not profile.is_approved:
        raise HTTPException(status_code=403, detail="Waiting for admin approval")
    return profile

def get_current_user_id(
    profile: Profile = Depends(get_current_approved_profile),
) -> str:
    if not profile.is_approved:
        raise HTTPException(status_code=403, detail="Waiting for admin approval")
    return profile.id


def get_current_admin_profile(
    profile: Profile = Depends(get_current_approved_profile),
) -> Profile:
    if profile.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return profile

def get_current_admin_user(
    profile: Profile = Depends(get_current_admin_profile),
) -> str:
    return profile.id
