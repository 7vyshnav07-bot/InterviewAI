from fastapi import FastAPI



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