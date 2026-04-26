from fastapi import HTTPException, Header, Depends
from sqlalchemy.orm import Session
import jwt
from app.db.supabase import supabase
from app.db.database import get_db
from app.models.profile import Profile
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_current_user_id(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = authorization.replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")
        
    user_id = None
    email = None
    
    try:
        # 1. Local JWT Validation using PyJWT
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        email = payload.get("email")
    except jwt.InvalidSignatureError:
        # Fallback to Supabase API if dummy secret is used during development
        logger.warning("[SECURITY] Local JWT signature verification failed. Falling back to Supabase API. Please set correct SUPABASE_JWT_SECRET in .env")
        try:
            user_response = supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                raise HTTPException(status_code=401, detail="Invalid token")
            user_id = user_response.user.id
            email = user_response.user.email
        except Exception as e:
            raise HTTPException(status_code=401, detail="Could not validate credentials via Supabase API")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials locally")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    # 2. Check and auto-create Profile if it doesn't exist
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        is_admin = settings.ADMIN_EMAIL and email and email.lower() == settings.ADMIN_EMAIL.lower()
        profile = Profile(
            id=user_id,
            email=email,
            role="admin" if is_admin else "user",
            is_approved=True if is_admin else False
        )
        db.add(profile)
        db.commit()
        logger.info(f"[SECURITY] Auto-created profile for {email} (admin: {is_admin})")

    # 3. Check approval status
    if not profile.is_approved:
        raise HTTPException(status_code=403, detail="Waiting for admin approval")

    return user_id

def get_current_admin_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> str:
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile or profile.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user_id
