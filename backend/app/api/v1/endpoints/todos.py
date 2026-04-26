from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.security import get_current_user_id
from app.db.database import get_db
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse
from app.services.todo_service import TodoService

router = APIRouter()

@router.get("/", response_model=List[TodoResponse])
def get_todos(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve todos for the current user."""
    return TodoService.get_todos(db=db, user_id=user_id)

@router.post("/", response_model=TodoResponse)
def create_todo(
    todo_in: TodoCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new todo."""
    return TodoService.create_todo(db=db, user_id=user_id, todo_in=todo_in)

@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: str,
    todo_in: TodoUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update a todo."""
    return TodoService.update_todo(db=db, user_id=user_id, todo_id=todo_id, todo_in=todo_in)

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a todo."""
    TodoService.delete_todo(db=db, user_id=user_id, todo_id=todo_id)
    return {"message": "Deleted successfully"}
