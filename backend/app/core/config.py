from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal Hub API"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str = "dummy_secret_for_local_dev"
    DATABASE_URL: str
    ADMIN_EMAIL: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
