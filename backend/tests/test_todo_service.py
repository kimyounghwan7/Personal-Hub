import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.services.todo_service import TodoService
from app.schemas.todo import TodoCreate, TodoUpdate
from app.models.todo import Todo

def test_get_todos():
    mock_db = MagicMock()
    user_id = "test_user_id"
    
    # Mock the DB query chain
    mock_query = mock_db.query.return_value
    mock_filter = mock_query.filter.return_value
    mock_filter.all.return_value = [Todo(id="todo_1", title="Test Todo", user_id=user_id)]
    
    todos = TodoService.get_todos(mock_db, user_id)
    
    assert len(todos) == 1
    assert todos[0].title == "Test Todo"
    mock_db.query.assert_called_once_with(Todo)

def test_create_todo():
    mock_db = MagicMock()
    user_id = "test_user_id"
    todo_in = TodoCreate(title="New Task", description="Testing create")
    
    result = TodoService.create_todo(mock_db, user_id, todo_in)
    
    assert result.title == "New Task"
    assert result.user_id == user_id
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()

def test_delete_todo_not_found():
    mock_db = MagicMock()
    user_id = "test_user_id"
    todo_id = "non_existent_todo"
    
    mock_query = mock_db.query.return_value
    mock_filter = mock_query.filter.return_value
    mock_filter.first.return_value = None  # Not found
    
    with pytest.raises(HTTPException) as excinfo:
        TodoService.delete_todo(mock_db, user_id, todo_id)
        
    assert excinfo.value.status_code == 404
    assert excinfo.value.detail == "Todo not found"
