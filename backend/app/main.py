from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.exc import SQLAlchemyError
from app.api.v1.endpoints import todos, admin, auth
from app.core.config import settings
from app.db.database import SessionLocal
from app.services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.normalized_admin_email:
        db = SessionLocal()
        try:
            profile, updated = AuthService.ensure_configured_admin(db)
            admin_email = settings.ADMIN_EMAIL.strip()
            if profile and updated:
                logger.info(f"[ADMIN] Auto-promoted {admin_email} to admin.")
            elif profile:
                logger.info(f"[ADMIN] {admin_email} is already admin.")
            else:
                logger.info(f"[ADMIN] Admin profile not found yet. Please sign up with: {admin_email}")
        except SQLAlchemyError as error:
            logger.warning(f"[ADMIN] Skipping startup admin check because database is unreachable: {error}")
        finally:
            db.close()
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Configure CORS
origins = [
    settings.FRONTEND_URL,
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(todos.router, prefix="/api/v1/todos", tags=["todos"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
