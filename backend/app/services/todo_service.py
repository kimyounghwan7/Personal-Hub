from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate
from app.services.todo_queries import MAX_TODOS_PER_USER


class TodoService:
    @staticmethod
    def get_todos(db: Session, user_id: str, limit: int = MAX_TODOS_PER_USER) -> List[Todo]:
        bounded_limit = max(1, min(limit, MAX_TODOS_PER_USER))
        return (
            db.query(Todo)
            .filter(Todo.user_id == user_id, Todo.deleted_at.is_(None))
            .limit(bounded_limit)
            .all()
        )

    @staticmethod
    def create_todo(db: Session, user_id: str, todo_in: TodoCreate) -> Todo:
        existing_count = (
            db.query(Todo)
            .filter(Todo.user_id == user_id, Todo.deleted_at.is_(None))
            .count()
        )
        if existing_count >= MAX_TODOS_PER_USER:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum todo limit ({MAX_TODOS_PER_USER}) reached",
            )
        payload = todo_in.model_dump(exclude_unset=True)
        db_todo = Todo(**payload, user_id=user_id)
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        return db_todo

    @staticmethod
    def update_todo(db: Session, user_id: str, todo_id: str, todo_in: TodoUpdate) -> Todo:
        db_todo = (
            db.query(Todo)
            .filter(
                Todo.id == todo_id,
                Todo.user_id == user_id,
                Todo.deleted_at.is_(None),
            )
            .first()
        )
        if not db_todo:
            raise HTTPException(status_code=404, detail="Todo not found")

        payload = todo_in.model_dump(exclude_unset=True)
        for field_name, field_value in payload.items():
            setattr(db_todo, field_name, field_value)

        if db_todo.started_on and db_todo.due_date:
            if db_todo.started_on > db_todo.due_date.date():
                raise HTTPException(
                    status_code=400,
                    detail="started_on cannot be later than due_date",
                )

        db.commit()
        db.refresh(db_todo)
        return db_todo

    @staticmethod
    def delete_todo(
        db: Session,
        user_id: str,
        todo_id: str,
        delete_reason: str = "user_deleted",
    ) -> None:
        db_todo = (
            db.query(Todo)
            .filter(
                Todo.id == todo_id,
                Todo.user_id == user_id,
                Todo.deleted_at.is_(None),
            )
            .first()
        )
        if not db_todo:
            raise HTTPException(status_code=404, detail="Todo not found")

        db_todo.deleted_at = datetime.now(timezone.utc)
        db_todo.deleted_by = user_id
        db_todo.delete_reason = delete_reason[:200]
        db.commit()
