from fastapi import HTTPException
from typing import List, Dict, Any
from app.db.supabase import supabase
from app.schemas.todo import TodoCreate, TodoUpdate

class TodoService:
    @staticmethod
    def get_todos(user_id: str) -> List[Dict[str, Any]]:
        response = supabase.table("Todos").select("*").eq("user_id", user_id).execute()
        return response.data

    @staticmethod
    def create_todo(user_id: str, todo_in: TodoCreate) -> Dict[str, Any]:
        data = todo_in.model_dump(exclude_unset=True)
        if data.get("due_date"):
            data["due_date"] = data["due_date"].isoformat()
        data["user_id"] = user_id
        
        response = supabase.table("Todos").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create todo")
        return response.data[0]

    @staticmethod
    def update_todo(user_id: str, todo_id: str, todo_in: TodoUpdate) -> Dict[str, Any]:
        data = todo_in.model_dump(exclude_unset=True)
        if data.get("due_date"):
            data["due_date"] = data["due_date"].isoformat()
            
        response = supabase.table("Todos").update(data).eq("id", todo_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Todo not found")
        return response.data[0]

    @staticmethod
    def delete_todo(user_id: str, todo_id: str) -> None:
        response = supabase.table("Todos").delete().eq("id", todo_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Todo not found")
