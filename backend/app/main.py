from fastapi import FastAPI

from app.db.database import Base, engine

from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InterviewAI API",
    version="1.0.0"
)


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