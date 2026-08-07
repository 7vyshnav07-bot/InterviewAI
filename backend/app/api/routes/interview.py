from uuid import uuid4
from fastapi import UploadFile, File

from app.ai.speech_to_text import transcribe_audio
from fastapi import APIRouter, HTTPException

from app.ai.interview_generator import generate_questions
from app.ai.interview_evaluator import evaluate_answer

router = APIRouter(prefix="/interview", tags=["Interview"])

# Temporary in-memory storage
INTERVIEWS = {}


@router.post("/generate")
def generate(data: dict):
    questions = generate_questions(
        role=data["role"],
        difficulty=data["difficulty"],
        types=data["types"],
        count=data["count"],
    )

    interview_id = str(uuid4())

    INTERVIEWS[interview_id] = {
        "role": data["role"],
        "difficulty": data["difficulty"],
        "questions": questions["questions"],
        "answers": [],
    }

    return {
        "interview_id": interview_id,
    }


@router.get("/{interview_id}")
def get_interview(interview_id: str):
    interview = INTERVIEWS.get(interview_id)

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    return interview


@router.post("/evaluate")
def evaluate(data: dict):
    return evaluate_answer(
        question=data["question"],
        answer=data["answer"],
    )


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio = await file.read()

    text = transcribe_audio(audio)

    return {
        "transcript": text
    }