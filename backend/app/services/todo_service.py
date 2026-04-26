from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate

class TodoService:
    @staticmethod
    def get_todos(db: Session, user_id: str) -> List[Todo]:
        return db.query(Todo).filter(Todo.user_id == user_id).all()

    @staticmethod
    def create_todo(db: Session, user_id: str, todo_in: TodoCreate) -> Todo:
        data = todo_in.model_dump(exclude_unset=True)
        db_todo = Todo(**data, user_id=user_id)
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        return db_todo

    @staticmethod
    def update_todo(db: Session, user_id: str, todo_id: str, todo_in: TodoUpdate) -> Todo:
        db_todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).first()
        if not db_todo:
            raise HTTPException(status_code=404, detail="Todo not found")
            
        data = todo_in.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(db_todo, key, value)
            
        db.commit()
        db.refresh(db_todo)
        return db_todo

    @staticmethod
    def delete_todo(db: Session, user_id: str, todo_id: str) -> None:
        db_todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).first()
        if not db_todo:
            raise HTTPException(status_code=404, detail="Todo not found")
            
        db.delete(db_todo)
        db.commit()
