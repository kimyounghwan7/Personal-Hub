from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


PLACEHOLDER_JWT_SECRETS = {"dummy_secret_for_local_dev", "your-jwt-secret-from-supabase-dashboard"}

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal Hub API"
    ENVIRONMENT: str = "production"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_JWT_AUDIENCE: str = "authenticated"
    ALLOW_SUPABASE_AUTH_FALLBACK: bool = False
    DATABASE_URL: str
    ADMIN_EMAIL: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    @model_validator(mode="after")
    def validate_auth_security(self):
        environment = self.ENVIRONMENT.lower()
        if environment not in {"development", "local"} and self.SUPABASE_JWT_SECRET in PLACEHOLDER_JWT_SECRETS:
            raise ValueError("SUPABASE_JWT_SECRET must be set to a real secret outside local development.")
        return self

    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
