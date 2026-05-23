from unittest.mock import MagicMock
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import HTTPException
from app.models.profile import Profile

from app.core import security


def _build_authorization_header(secret: str, payload: dict | None = None) -> str:
    token_payload = payload or {
        "sub": "user-1",
        "email": "user@example.com",
        "aud": "authenticated",
        "iss": "https://example.supabase.co/auth/v1",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
    }
    token = jwt.encode(token_payload, secret, algorithm="HS256")
    return f"Bearer {token}"


def test_get_current_user_id_rejects_invalid_signature_without_fallback(monkeypatch):
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = MagicMock(is_approved=True)

    monkeypatch.setattr(security.settings, "SUPABASE_JWT_SECRET", "expected-secret")
    monkeypatch.setattr(security.settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(security.settings, "SUPABASE_JWT_AUDIENCE", "authenticated")
    monkeypatch.setattr(security.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(security.settings, "ALLOW_SUPABASE_AUTH_FALLBACK", False)
    fallback_client = MagicMock()
    monkeypatch.setattr(security, "supabase", fallback_client)

    with pytest.raises(HTTPException) as excinfo:
        security.get_current_authenticated_profile(_build_authorization_header("wrong-secret"), mock_db)

    assert excinfo.value.status_code == 401
    assert excinfo.value.detail == "Could not validate credentials"
    fallback_client.auth.get_user.assert_not_called()


def test_get_current_user_id_uses_fallback_only_when_enabled(monkeypatch):
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = Profile(
        id="fallback-user",
        email="fallback@example.com",
        role="user",
        is_approved=True,
    )

    monkeypatch.setattr(security.settings, "SUPABASE_JWT_SECRET", "expected-secret")
    monkeypatch.setattr(security.settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(security.settings, "SUPABASE_JWT_AUDIENCE", "authenticated")
    monkeypatch.setattr(security.settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(security.settings, "ALLOW_SUPABASE_AUTH_FALLBACK", True)

    fallback_client = MagicMock()
    fallback_client.auth.get_user.return_value = MagicMock(
        user=MagicMock(id="fallback-user", email="fallback@example.com")
    )
    monkeypatch.setattr(security, "supabase", fallback_client)

    profile = security.get_current_authenticated_profile(_build_authorization_header("wrong-secret"), mock_db)

    assert profile.id == "fallback-user"
    fallback_client.auth.get_user.assert_called_once()


def test_get_current_user_id_rejects_non_bearer_authorization(monkeypatch):
    mock_db = MagicMock()
    monkeypatch.setattr(security.settings, "SUPABASE_JWT_SECRET", "expected-secret")
    monkeypatch.setattr(security.settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(security.settings, "SUPABASE_JWT_AUDIENCE", "authenticated")
    monkeypatch.setattr(security.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(security.settings, "ALLOW_SUPABASE_AUTH_FALLBACK", False)

    with pytest.raises(HTTPException) as excinfo:
        security.get_current_authenticated_profile("Token invalid", mock_db)

    assert excinfo.value.status_code == 401
    assert excinfo.value.detail == "Could not validate credentials"


def test_get_current_user_id_rejects_fallback_outside_development(monkeypatch):
    mock_db = MagicMock()

    monkeypatch.setattr(security.settings, "SUPABASE_JWT_SECRET", "expected-secret")
    monkeypatch.setattr(security.settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(security.settings, "SUPABASE_JWT_AUDIENCE", "authenticated")
    monkeypatch.setattr(security.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(security.settings, "ALLOW_SUPABASE_AUTH_FALLBACK", True)

    fallback_client = MagicMock()
    monkeypatch.setattr(security, "supabase", fallback_client)

    with pytest.raises(HTTPException) as excinfo:
        security.get_current_authenticated_profile(_build_authorization_header("wrong-secret"), mock_db)

    assert excinfo.value.status_code == 401
    assert excinfo.value.detail == "Could not validate credentials"
    fallback_client.auth.get_user.assert_not_called()


def test_get_current_user_id_rejects_unapproved_profile():
    profile = Profile(id="user-1", email="user@example.com", role="user", is_approved=False)

    with pytest.raises(HTTPException) as excinfo:
        security.get_current_user_id(profile)

    assert excinfo.value.status_code == 403
    assert excinfo.value.detail == "Waiting for admin approval"


def test_get_current_user_id_returns_approved_profile_id():
    profile = Profile(id="user-2", email="user2@example.com", role="user", is_approved=True)

    user_id = security.get_current_user_id(profile)

    assert user_id == "user-2"


def test_get_current_user_id_rejects_wrong_audience(monkeypatch):
    mock_db = MagicMock()

    monkeypatch.setattr(security.settings, "SUPABASE_JWT_SECRET", "expected-secret")
    monkeypatch.setattr(security.settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(security.settings, "SUPABASE_JWT_AUDIENCE", "authenticated")
    monkeypatch.setattr(security.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(security.settings, "ALLOW_SUPABASE_AUTH_FALLBACK", False)

    with pytest.raises(HTTPException) as excinfo:
        security.get_current_authenticated_profile(
            _build_authorization_header(
                "expected-secret",
                {"sub": "user-1", "email": "user@example.com", "aud": "wrong", "iss": "https://example.supabase.co/auth/v1", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
            ),
            mock_db,
        )

    assert excinfo.value.status_code == 401


def test_get_current_user_id_rejects_wrong_issuer(monkeypatch):
    mock_db = MagicMock()

    monkeypatch.setattr(security.settings, "SUPABASE_JWT_SECRET", "expected-secret")
    monkeypatch.setattr(security.settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(security.settings, "SUPABASE_JWT_AUDIENCE", "authenticated")
    monkeypatch.setattr(security.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(security.settings, "ALLOW_SUPABASE_AUTH_FALLBACK", False)

    with pytest.raises(HTTPException) as excinfo:
        security.get_current_authenticated_profile(
            _build_authorization_header(
                "expected-secret",
                {"sub": "user-1", "email": "user@example.com", "aud": "authenticated", "iss": "https://wrong.supabase.co/auth/v1", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
            ),
            mock_db,
        )

    assert excinfo.value.status_code == 401


def test_get_current_user_id_rejects_missing_exp(monkeypatch):
    mock_db = MagicMock()

    monkeypatch.setattr(security.settings, "SUPABASE_JWT_SECRET", "expected-secret")
    monkeypatch.setattr(security.settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(security.settings, "SUPABASE_JWT_AUDIENCE", "authenticated")
    monkeypatch.setattr(security.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(security.settings, "ALLOW_SUPABASE_AUTH_FALLBACK", False)

    with pytest.raises(HTTPException) as excinfo:
        security.get_current_authenticated_profile(
            _build_authorization_header(
                "expected-secret",
                {"sub": "user-1", "email": "user@example.com", "aud": "authenticated", "iss": "https://example.supabase.co/auth/v1"},
            ),
            mock_db,
        )

    assert excinfo.value.status_code == 401