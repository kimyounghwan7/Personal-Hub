from fastapi import HTTPException, Header, Depends
from app.db.supabase import supabase

def get_current_user_id(authorization: str = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = authorization.replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")
        
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.profile import Profile

def get_current_admin_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> str:
    # Query the Profiles table via SQLAlchemy to check the role
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile or profile.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user_id
