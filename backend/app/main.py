from fastapi import FastAPI

app = FastAPI(
    title="InterviewAI API",
    description="Backend API for the AI Interview Coach",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to InterviewAI 🚀"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }