from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.services.todo_service import MAX_TODOS_PER_USER, TodoService
from app.schemas.todo import TodoCreate, TodoUpdate
from app.models.todo import Todo


def test_get_todos():
    mock_db = MagicMock()
    user_id = "test_user_id"

    mock_query = mock_db.query.return_value
    mock_filter = mock_query.filter.return_value
    mock_limit = mock_filter.limit.return_value
    mock_limit.all.return_value = [Todo(id="todo_1", title="Test Todo", user_id=user_id)]

    todos = TodoService.get_todos(mock_db, user_id)

    assert len(todos) == 1
    assert todos[0].title == "Test Todo"
    mock_db.query.assert_called_once_with(Todo)
    mock_filter.limit.assert_called_once_with(MAX_TODOS_PER_USER)


def test_create_todo():
    mock_db = MagicMock()
    user_id = "test_user_id"
    mock_db.query.return_value.filter.return_value.count.return_value = 0
    todo_in = TodoCreate(
        title="New Task",
        description="Testing create",
        due_date="2026-10-25T05:42:00.000Z",
    )

    result = TodoService.create_todo(mock_db, user_id, todo_in)

    assert result.title == "New Task"
    assert result.user_id == user_id
    assert isinstance(result.due_date, datetime)
    assert result.due_date.tzinfo is not None
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_create_todo_rejects_when_user_limit_reached():
    mock_db = MagicMock()
    user_id = "test_user_id"
    mock_db.query.return_value.filter.return_value.count.return_value = MAX_TODOS_PER_USER
    todo_in = TodoCreate(title="Overflow Task")

    with pytest.raises(HTTPException) as excinfo:
        TodoService.create_todo(mock_db, user_id, todo_in)

    assert excinfo.value.status_code == 400
    assert "Maximum todo limit" in excinfo.value.detail
    mock_db.add.assert_not_called()


def test_todo_schema_rejects_oversized_title_and_invalid_status():
    with pytest.raises(ValidationError):
        TodoCreate(title="x" * 201)

    with pytest.raises(ValidationError):
        TodoUpdate(status="invalid-status")


def test_update_todo_changes_status():
    mock_db = MagicMock()
    user_id = "test_user_id"
    existing_todo = Todo(
        id="todo_1",
        title="Task",
        user_id=user_id,
        status="pending",
        due_date=datetime.now(timezone.utc),
    )
    mock_db.query.return_value.filter.return_value.first.return_value = existing_todo

    updated = TodoService.update_todo(
        mock_db,
        user_id,
        "todo_1",
        TodoUpdate(status="completed"),
    )

    assert updated.status == "completed"
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(existing_todo)


def test_delete_todo_not_found():
    mock_db = MagicMock()
    user_id = "test_user_id"
    todo_id = "non_existent_todo"

    mock_query = mock_db.query.return_value
    mock_filter = mock_query.filter.return_value
    mock_filter.first.return_value = None

    with pytest.raises(HTTPException) as excinfo:
        TodoService.delete_todo(mock_db, user_id, todo_id)

    assert excinfo.value.status_code == 404
    assert excinfo.value.detail == "Todo not found"

