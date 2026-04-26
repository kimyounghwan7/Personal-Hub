from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from database import supabase

router = APIRouter(
    prefix="/todos",
    tags=["todos"]
)

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[int] = 1

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[int] = None

def get_user_id(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    token = authorization.replace("Bearer ", "")
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/")
def get_todos(user_id: str = Depends(get_user_id)):
    response = supabase.table("Todos").select("*").eq("user_id", user_id).execute()
    return response.data

@router.post("/")
def create_todo(todo: TodoCreate, user_id: str = Depends(get_user_id)):
    data = todo.model_dump(exclude_unset=True)
    # due_date is a date object, so it will be serialized to ISO string by supabase client (or we might need to cast to str)
    if data.get("due_date"):
        data["due_date"] = data["due_date"].isoformat()
    data["user_id"] = user_id
    response = supabase.table("Todos").insert(data).execute()
    return response.data[0] if response.data else None

@router.put("/{todo_id}")
def update_todo(todo_id: str, todo: TodoUpdate, user_id: str = Depends(get_user_id)):
    data = todo.model_dump(exclude_unset=True)
    if data.get("due_date"):
        data["due_date"] = data["due_date"].isoformat()
    response = supabase.table("Todos").update(data).eq("id", todo_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Todo not found")
    return response.data[0]

@router.delete("/{todo_id}")
def delete_todo(todo_id: str, user_id: str = Depends(get_user_id)):
    response = supabase.table("Todos").delete().eq("id", todo_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Deleted successfully"}
