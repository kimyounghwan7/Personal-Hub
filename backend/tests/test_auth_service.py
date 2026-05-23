from unittest.mock import MagicMock

from app.models.profile import Profile
from app.services.auth_service import AuthService


def test_sync_profile_creates_profile_for_new_user(monkeypatch):
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None

    monkeypatch.setattr("app.services.auth_service.settings.ADMIN_EMAIL", "admin@example.com")

    profile = AuthService.sync_profile(mock_db, "user-1", "new@example.com")

    assert isinstance(profile, Profile)
    assert profile.id == "user-1"
    assert profile.email == "new@example.com"
    assert profile.role == "user"
    assert profile.is_approved is False
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(profile)


def test_sync_profile_promotes_admin_email(monkeypatch):
    mock_db = MagicMock()
    existing_profile = Profile(id="user-2", email="admin@example.com", role="user", is_approved=False)
    mock_db.query.return_value.filter.return_value.first.return_value = existing_profile

    monkeypatch.setattr("app.services.auth_service.settings.ADMIN_EMAIL", "admin@example.com")

    profile = AuthService.sync_profile(mock_db, "user-2", "admin@example.com")

    assert profile.role == "admin"
    assert profile.is_approved is True
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(profile)


def test_sync_profile_returns_existing_profile_without_update(monkeypatch):
    mock_db = MagicMock()
    existing_profile = Profile(id="user-3", email="user3@example.com", role="user", is_approved=False)
    mock_db.query.return_value.filter.return_value.first.return_value = existing_profile

    monkeypatch.setattr("app.services.auth_service.settings.ADMIN_EMAIL", "admin@example.com")

    profile = AuthService.sync_profile(mock_db, "user-3", "user3@example.com")

    assert profile is existing_profile
    mock_db.commit.assert_not_called()
    mock_db.refresh.assert_not_called()