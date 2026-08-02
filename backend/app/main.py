from fastapi import FastAPI
from app.api.routes.users import router as users_router
from app.api.routes.auth import router as auth_router

app = FastAPI(
    title="InterviewAI API",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(users_router)

@app.get("/")
def root():
    return {
        "message": "InterviewAI Backend Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
