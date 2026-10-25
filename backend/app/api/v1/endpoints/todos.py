from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.security import get_current_approved_profile
from app.db.database import get_db
from app.models.profile import Profile
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate
from app.services.todo_queries import TodoQueries
from app.services.todo_service import TodoService

router = APIRouter()


@router.get("/", response_model=List[TodoResponse])
def get_todos(
    from_date: Optional[date] = Query(default=None),
    to_date: Optional[date] = Query(default=None),
    include_undated: bool = Query(default=True),
    profile: Profile = Depends(get_current_approved_profile),
    db: Session = Depends(get_db),
):
    if from_date and to_date:
        return TodoQueries.list_calendar_todos(
            db=db,
            user_id=profile.id,
            from_date=from_date,
            to_date=to_date,
            include_undated=include_undated,
        )
    return TodoService.get_todos(db=db, user_id=profile.id)


@router.post("/", response_model=TodoResponse)
def create_todo(
    todo_in: TodoCreate,
    profile: Profile = Depends(get_current_approved_profile),
    db: Session = Depends(get_db),
):
    return TodoService.create_todo(db=db, user_id=profile.id, todo_in=todo_in)


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: str,
    todo_in: TodoUpdate,
    profile: Profile = Depends(get_current_approved_profile),
    db: Session = Depends(get_db),
):
    return TodoService.update_todo(
        db=db,
        user_id=profile.id,
        todo_id=todo_id,
        todo_in=todo_in,
    )


@router.delete("/{todo_id}")
def delete_todo(
    todo_id: str,
    profile: Profile = Depends(get_current_approved_profile),
    db: Session = Depends(get_db),
):
    TodoService.delete_todo(db=db, user_id=profile.id, todo_id=todo_id)
    return {"message": "Deleted successfully"}
