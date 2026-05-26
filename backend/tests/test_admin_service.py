from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.services.admin_service import AdminService


def test_delete_user_as_admin_rejects_self_delete():
    mock_db = MagicMock()

    with pytest.raises(HTTPException) as excinfo:
        AdminService.delete_user_as_admin(
            db=mock_db,
            admin_user_id="admin-1",
            target_user_id="admin-1",
        )

    assert excinfo.value.status_code == 400
    assert excinfo.value.detail == "Admins cannot delete their own account"
    mock_db.commit.assert_not_called()


def test_delete_user_as_admin_delegates_for_other_users(monkeypatch):
    mock_db = MagicMock()
    delete_user = MagicMock()
    monkeypatch.setattr(AdminService, "delete_user", delete_user)

    AdminService.delete_user_as_admin(
        db=mock_db,
        admin_user_id="admin-1",
        target_user_id="user-2",
    )

    delete_user.assert_called_once_with(db=mock_db, target_user_id="user-2")
