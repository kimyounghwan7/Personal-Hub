from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import todos

app = FastAPI(title="Personal Hub API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add production frontend URL here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Personal Hub API"}
