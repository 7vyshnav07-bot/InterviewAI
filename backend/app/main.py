from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.interview import router as interview_router
from app.api.routes.users import router as users_router
from app.api.routes.auth import router as auth_router
from app.api.routes.resume import router as resume_router


app = FastAPI(
    title="InterviewAI API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STATIC UPLOADS
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(resume_router)
app.include_router(interview_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "InterviewAI Backend Running 🚀"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }