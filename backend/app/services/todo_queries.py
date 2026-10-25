from datetime import date, datetime, time, timezone
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.todo import Todo

MAX_TODOS_PER_USER = 500


class TodoQueries:
    @staticmethod
    def list_calendar_todos(
        db: Session,
        user_id: str,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        include_undated: bool = True,
        limit: int = MAX_TODOS_PER_USER,
    ) -> List[Todo]:
        bounded_limit = max(1, min(limit, MAX_TODOS_PER_USER))
        query = db.query(Todo).filter(
            Todo.user_id == user_id,
            Todo.deleted_at.is_(None),
        )

        if from_date and to_date:
            window_start = datetime.combine(from_date, time.min, tzinfo=timezone.utc)
            window_end = datetime.combine(to_date, time.max, tzinfo=timezone.utc)
            range_condition = Todo.due_date.between(window_start, window_end)
            if include_undated:
                query = query.filter(or_(range_condition, Todo.due_date.is_(None)))
            else:
                query = query.filter(range_condition)

        return query.limit(bounded_limit).all()
