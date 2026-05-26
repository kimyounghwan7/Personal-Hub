import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_settings_reject_placeholder_jwt_secret_outside_development():
    with pytest.raises(ValidationError):
        Settings(
            ENVIRONMENT="production",
            SUPABASE_URL="https://example.supabase.co",
            SUPABASE_KEY="service-role-key",
            SUPABASE_JWT_SECRET="dummy_secret_for_local_dev",
            DATABASE_URL="postgresql://user:pass@localhost:5432/db",
        )


def test_settings_allow_real_jwt_secret_outside_development():
    settings = Settings(
        ENVIRONMENT="production",
        SUPABASE_URL="https://example.supabase.co",
        SUPABASE_KEY="service-role-key",
        SUPABASE_JWT_SECRET="real-jwt-secret",
        DATABASE_URL="postgresql://user:pass@localhost:5432/db",
    )

    assert settings.SUPABASE_JWT_SECRET == "real-jwt-secret"


def test_settings_reject_placeholder_jwt_secret_with_default_environment(monkeypatch):
    monkeypatch.delenv("ENVIRONMENT", raising=False)

    with pytest.raises(ValidationError):
        Settings(
            SUPABASE_URL="https://example.supabase.co",
            SUPABASE_KEY="service-role-key",
            SUPABASE_JWT_SECRET="your-jwt-secret-from-supabase-dashboard",
            DATABASE_URL="postgresql://user:pass@localhost:5432/db",
        )


def test_settings_normalize_admin_email_and_match_case_insensitively():
    settings = Settings(
        ENVIRONMENT="development",
        SUPABASE_URL="https://example.supabase.co",
        SUPABASE_KEY="service-role-key",
        SUPABASE_JWT_SECRET="dummy_secret_for_local_dev",
        DATABASE_URL="postgresql://user:pass@localhost:5432/db",
        ADMIN_EMAIL=" Admin@Example.com ",
    )

    assert settings.normalized_admin_email == "admin@example.com"
    assert settings.is_admin_email("admin@example.com") is True
    assert settings.is_admin_email(" ADMIN@example.com ") is True
    assert settings.is_admin_email("other@example.com") is False