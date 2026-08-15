from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.interview import router as interview_router
from fastapi import FastAPI
from app.api.routes.users import router as users_router
from app.api.routes.auth import router as auth_router
from app.api.routes.resume import router as resume_router
app = FastAPI(
    title="InterviewAI API",
    version="1.0.0",
)
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://interview-iv0nqhgdj-portfolio-3fa4.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(resume_router)
app.include_router(interview_router)
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
