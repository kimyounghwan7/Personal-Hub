from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


PLACEHOLDER_JWT_SECRETS = {
    "",
    "dummy_secret_for_local_dev",
    "your-jwt-secret-from-supabase-dashboard",
    "replace_me",
    "changeme",
    "your_secret_here",
}

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

    @property
    def normalized_admin_email(self) -> str:
        return self.ADMIN_EMAIL.strip().casefold()

    def is_admin_email(self, email: str | None) -> bool:
        return bool(email and self.normalized_admin_email and email.strip().casefold() == self.normalized_admin_email)

    @model_validator(mode="after")
    def validate_auth_security(self):
        environment = self.ENVIRONMENT.lower()
        normalized_secret = self.SUPABASE_JWT_SECRET.strip().casefold()
        if environment not in {"development", "local"} and normalized_secret in PLACEHOLDER_JWT_SECRETS:
            raise ValueError("SUPABASE_JWT_SECRET must be set to a real secret outside local development.")
        return self

    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
