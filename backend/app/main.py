from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.endpoints import todos, admin
from app.core.config import settings
from app.db.database import SessionLocal
from app.models.profile import Profile
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup: Auto-promote admin if profile exists ---
    if settings.ADMIN_EMAIL:
        db = SessionLocal()
        try:
            profile = db.query(Profile).filter(Profile.email == settings.ADMIN_EMAIL).first()
            if profile:
                if profile.role != "admin" or not profile.is_approved:
                    profile.role = "admin"
                    profile.is_approved = True
                    db.commit()
                    logger.info(f"[ADMIN] Auto-promoted {settings.ADMIN_EMAIL} to admin.")
                else:
                    logger.info(f"[ADMIN] {settings.ADMIN_EMAIL} is already admin.")
            else:
                logger.info(f"[ADMIN] Admin profile not found yet. Please sign up with: {settings.ADMIN_EMAIL}")
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

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

