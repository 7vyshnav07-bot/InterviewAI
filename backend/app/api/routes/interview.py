from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from sqlalchemy.orm import Session
from app.ai.performance_insights import (
    generate_performance_insights,
)
from app.ai.interview_evaluator import evaluate_answer
from app.ai.interview_generator import generate_questions
from app.ai.speech_to_text import transcribe_audio

from app.api.dependencies import (
    get_current_user,
    get_db,
)

from app.models.interview import (
    Interview,
    InterviewQuestion,
)

from app.models.user import User


router = APIRouter(
    prefix="/interview",
    tags=["Interview"],
)


# ============================================================
# GENERATE INTERVIEW
# ============================================================

@router.post("/generate")
def generate(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    questions_data = generate_questions(
        role=data["role"],
        difficulty=data["difficulty"],
        types=data["types"],
        count=data["count"],
    )

    # --------------------------------------------------------
    # Create interview
    # --------------------------------------------------------

    interview = Interview(
        user_id=current_user.id,
        role=data["role"],
        difficulty=data["difficulty"],
    )

    db.add(interview)
    db.flush()

    # --------------------------------------------------------
    # Save generated questions
    # --------------------------------------------------------

    for index, question_data in enumerate(
        questions_data["questions"],
        start=1,
    ):
        question = InterviewQuestion(
            interview_id=interview.id,
            question_id=question_data.get(
                "id",
                index,
            ),
            question_type=question_data["type"],
            question=question_data["question"],
        )

        db.add(question)

    db.commit()
    db.refresh(interview)

    return {
        "interview_id": str(interview.id),
    }


# ============================================================
# GET INTERVIEW HISTORY
#
# IMPORTANT:
# This MUST come BEFORE /{interview_id}
# ============================================================

@router.get("/history")
def get_interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all interviews belonging to
    the currently logged-in user.
    """

    interviews = (
        db.query(Interview)
        .filter(
            Interview.user_id == current_user.id
        )
        .order_by(
            Interview.id.desc()
        )
        .all()
    )

    history = []

    for interview in interviews:

        questions = interview.questions

        # ----------------------------------------------------
        # Questions which have been evaluated
        # ----------------------------------------------------

        scored_questions = [
            question
            for question in questions
            if question.score is not None
        ]

        # ----------------------------------------------------
        # Calculate average score
        # ----------------------------------------------------

        if scored_questions:

            total_score = sum(
                question.score
                for question in scored_questions
            )

            average_score = (
                total_score
                / len(scored_questions)
            )

        else:
            average_score = None

        # ----------------------------------------------------
        # Count answered questions
        # ----------------------------------------------------

        answered_questions = len(
            [
                question
                for question in questions
                if question.answer
                and question.answer.strip()
            ]
        )

        history.append(
            {
                "id": interview.id,

                "role": interview.role,

                "difficulty": interview.difficulty,

                "total_questions": len(
                    questions
                ),

                "answered_questions":
                    answered_questions,

                "evaluated_questions":
                    len(scored_questions),

                "average_score":
                    average_score,

                "completed":
                    interview.completed,

                "completed_at":
                    interview.completed_at,
            }
        )

    return history


# ============================================================
# PERFORMANCE DASHBOARD
# ============================================================

@router.get("/dashboard")
def get_interview_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get performance statistics for the
    currently logged-in user.

    The dashboard is calculated from completed
    interviews and their evaluated questions.
    """

    # ========================================================
    # GET COMPLETED INTERVIEWS
    # ========================================================

    interviews = (
        db.query(Interview)
        .filter(
            Interview.user_id == current_user.id,
            Interview.completed == True,
        )
        .order_by(
            Interview.id.desc()
        )
        .all()
    )

    # ========================================================
    # BASIC COUNTERS
    # ========================================================

    total_interviews = len(interviews)

    total_questions = 0
    answered_questions = 0
    evaluated_questions = 0

    all_scores = []

    # ========================================================
    # SCORE HISTORY
    # ========================================================

    score_history = []

    # ========================================================
    # QUESTION TYPE PERFORMANCE
    # ========================================================

    skill_data = {}

    # ========================================================
    # RECENT INTERVIEWS
    # ========================================================

    recent_interviews = []

    # ========================================================
    # PROCESS INTERVIEWS
    # ========================================================

    for interview in interviews:

        questions = interview.questions

        total_questions += len(
            questions
        )

        interview_scores = []

        for question in questions:

            # ------------------------------------------------
            # Answered
            # ------------------------------------------------

            if (
                question.answer
                and question.answer.strip()
            ):
                answered_questions += 1

            # ------------------------------------------------
            # Evaluated
            # ------------------------------------------------

            if question.score is not None:

                evaluated_questions += 1

                all_scores.append(
                    question.score
                )

                interview_scores.append(
                    question.score
                )

                # --------------------------------------------
                # Group by question type
                # --------------------------------------------

                question_type = (
                    question.question_type
                    or "Other"
                )

                # Make the display nicer
                display_type = (
                    question_type
                    .replace("_", " ")
                    .replace("-", " ")
                    .title()
                )

                if (
                    display_type
                    not in skill_data
                ):
                    skill_data[
                        display_type
                    ] = {
                        "total_score": 0.0,
                        "count": 0,
                    }

                skill_data[
                    display_type
                ]["total_score"] += (
                    question.score
                )

                skill_data[
                    display_type
                ]["count"] += 1

        # ----------------------------------------------------
        # Average score for this interview
        # ----------------------------------------------------

        if interview_scores:

            interview_average = (
                sum(interview_scores)
                / len(interview_scores)
            )

            score_history.append(
                {
                    "interview_id":
                        interview.id,

                    "role":
                        interview.role,

                    "difficulty":
                        interview.difficulty,

                    "score":
                        round(
                            interview_average,
                            2,
                        ),

                    "completed_at":
                        interview.completed_at,
                }
            )

        # ----------------------------------------------------
        # Recent interview information
        # ----------------------------------------------------

        if interview_scores:

            recent_average = (
                sum(interview_scores)
                / len(interview_scores)
            )

        else:

            recent_average = None

        recent_interviews.append(
            {
                "id":
                    interview.id,

                "role":
                    interview.role,

                "difficulty":
                    interview.difficulty,

                "score":
                    round(
                        recent_average,
                        2,
                    )
                    if recent_average is not None
                    else None,

                "total_questions":
                    len(questions),

                "answered_questions":
                    len(
                        [
                            question
                            for question in questions
                            if question.answer
                            and question.answer.strip()
                        ]
                    ),

                "completed_at":
                    interview.completed_at,
            }
        )

    # ========================================================
    # OVERALL AVERAGE SCORE
    # ========================================================

    if all_scores:

        average_score = (
            sum(all_scores)
            / len(all_scores)
        )

    else:

        average_score = None

    # ========================================================
    # CALCULATE SKILL / QUESTION TYPE SCORES
    # ========================================================

    skill_scores = []

    for skill, data in skill_data.items():

        if data["count"] > 0:

            average = (
                data["total_score"]
                / data["count"]
            )

            skill_scores.append(
                {
                    "skill":
                        skill,

                    "score":
                        round(
                            average,
                            2,
                        ),

                    "questions":
                        data["count"],
                }
            )

    # ========================================================
    # SORT SKILLS BY SCORE
    # ========================================================

    skill_scores.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    # ========================================================
    # STRONGEST / WEAKEST SKILL
    # ========================================================

    if skill_scores:

        strongest_skill = (
            skill_scores[0]
        )

        weakest_skill = (
            skill_scores[-1]
        )

    else:

        strongest_skill = None
        weakest_skill = None

    # ========================================================
    # SORT SCORE HISTORY
    #
    # Oldest → Newest for the chart
    # ========================================================

    score_history.reverse()

    # ========================================================
    # LIMIT RECENT INTERVIEWS
    # ========================================================

    recent_interviews = (
        recent_interviews[:5]
    )

    # ========================================================
    # RETURN DASHBOARD DATA
    # ========================================================

    return {
        # ----------------------------------------------------
        # Summary cards
        # ----------------------------------------------------

        "total_interviews":
            total_interviews,

        "average_score":
            round(
                average_score,
                2,
            )
            if average_score is not None
            else None,

        "strongest_skill":
            strongest_skill["skill"]
            if strongest_skill
            else None,

        "strongest_score":
            strongest_skill["score"]
            if strongest_skill
            else None,

        "weakest_skill":
            weakest_skill["skill"]
            if weakest_skill
            else None,

        "weakest_score":
            weakest_skill["score"]
            if weakest_skill
            else None,

        # ----------------------------------------------------
        # Overall statistics
        # ----------------------------------------------------

        "total_questions":
            total_questions,

        "answered_questions":
            answered_questions,

        "evaluated_questions":
            evaluated_questions,

        # ----------------------------------------------------
        # Chart data
        # ----------------------------------------------------

        "score_history":
            score_history,

        "skill_scores":
            skill_scores,

        # ----------------------------------------------------
        # Recent interviews
        # ----------------------------------------------------

        "recent_interviews":
            recent_interviews,
    }


# ============================================================
# SUBMIT INTERVIEW
# ============================================================

@router.post("/{interview_id}/submit")
def submit_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark an interview as completed.

    The interview can only be submitted when:
    - Every question has an answer
    - Every question has been evaluated
    """

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    # --------------------------------------------------------
    # Don't allow submitting twice
    # --------------------------------------------------------

    if interview.completed:

        raise HTTPException(
            status_code=400,
            detail="Interview has already been submitted",
        )

    # --------------------------------------------------------
    # Check unanswered questions
    # --------------------------------------------------------

    unanswered_questions = [
        question
        for question in interview.questions
        if not question.answer
        or not question.answer.strip()
    ]

    if unanswered_questions:

        raise HTTPException(
            status_code=400,
            detail=(
                f"You still have "
                f"{len(unanswered_questions)} "
                f"unanswered question(s)."
            ),
        )

    # --------------------------------------------------------
    # Check unevaluated questions
    # --------------------------------------------------------

    unevaluated_questions = [
        question
        for question in interview.questions
        if question.score is None
    ]

    if unevaluated_questions:

        raise HTTPException(
            status_code=400,
            detail=(
                f"You still have "
                f"{len(unevaluated_questions)} "
                f"question(s) that have not been evaluated."
            ),
        )

    # --------------------------------------------------------
    # Mark interview as completed
    # --------------------------------------------------------

    interview.completed = True

    interview.completed_at = datetime.utcnow()

    db.commit()

    db.refresh(interview)

    return {
        "message":
            "Interview submitted successfully",

        "interview_id":
            interview.id,

        "completed":
            interview.completed,

        "completed_at":
            interview.completed_at,
    }


# ============================================================
# DELETE INTERVIEW
# ============================================================

@router.delete("/{interview_id}")
def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an interview belonging to
    the logged-in user.

    Because InterviewQuestion uses:
        ondelete="CASCADE"

    deleting the interview will also delete
    its questions.
    """

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    db.delete(interview)

    db.commit()

    return {
        "message":
            "Interview deleted successfully",

        "interview_id":
            interview_id,
    }

# ============================================================
# AI PERFORMANCE INSIGHTS
# ============================================================

@router.get("/performance-insights")
def get_performance_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate personalized AI coaching insights
    from the user's completed interview history.
    """

    # --------------------------------------------------------
    # Get completed interviews
    # --------------------------------------------------------

    interviews = (
        db.query(Interview)
        .filter(
            Interview.user_id == current_user.id,
            Interview.completed == True,
        )
        .order_by(
            Interview.completed_at.desc()
        )
        .all()
    )

    if not interviews:

        raise HTTPException(
            status_code=400,
            detail=(
                "Complete at least one interview "
                "to generate performance insights."
            ),
        )

    # --------------------------------------------------------
    # Collect evaluated questions
    # --------------------------------------------------------

    all_questions = []

    for interview in interviews:

        for question in interview.questions:

            if question.score is not None:

                strengths = (
                    question.strengths
                    or ""
                )

                improvements = (
                    question.improvements
                    or ""
                )

                all_questions.append(
                    {
                        "question":
                            question.question,

                        "score":
                            float(
                                question.score
                            ),

                        "feedback":
                            question.feedback
                            or "",

                        "strengths":
                            strengths,

                        "improvements":
                            improvements,
                    }
                )

    if not all_questions:

        raise HTTPException(
            status_code=400,
            detail=(
                "No evaluated questions are "
                "available yet."
            ),
        )

    # --------------------------------------------------------
    # Calculate average score
    # --------------------------------------------------------

    average_score = (
        sum(
            question["score"]
            for question in all_questions
        )
        / len(all_questions)
    )

    # --------------------------------------------------------
    # Calculate skill scores
    #
    # Question type is used as the skill category.
    # --------------------------------------------------------

    skill_data = {}

    for interview in interviews:

        for question in interview.questions:

            if question.score is None:
                continue

            skill = (
                question.question_type
                or "General"
            )

            if skill not in skill_data:

                skill_data[skill] = {
                    "total": 0,
                    "count": 0,
                }

            skill_data[skill]["total"] += (
                float(question.score)
            )

            skill_data[skill]["count"] += 1

    skill_scores = []

    for skill, data in skill_data.items():

        score = (
            data["total"]
            / data["count"]
        )

        skill_scores.append(
            {
                "skill": skill,
                "score": score,
                "questions": data["count"],
            }
        )

    skill_scores.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    strongest_skill = (
        skill_scores[0]["skill"]
        if skill_scores
        else None
    )

    weakest_skill = (
        skill_scores[-1]["skill"]
        if skill_scores
        else None
    )

    # --------------------------------------------------------
    # Interview history
    # --------------------------------------------------------

    interview_history = []

    for interview in interviews:

        scored = [
            question
            for question in interview.questions
            if question.score is not None
        ]

        if not scored:
            continue

        score = (
            sum(
                float(question.score)
                for question in scored
            )
            / len(scored)
        )

        interview_history.append(
            {
                "role":
                    interview.role,

                "difficulty":
                    interview.difficulty,

                "score":
                    score,
            }
        )

    # --------------------------------------------------------
    # Generate AI insights
    # --------------------------------------------------------

    try:

        insights = (
            generate_performance_insights(
                role=interviews[0].role,
                average_score=average_score,
                strongest_skill=strongest_skill,
                weakest_skill=weakest_skill,
                skill_scores=skill_scores,
                interviews=interview_history,
                question_feedback=all_questions,
            )
        )

    except Exception as e:

        print(
            "PERFORMANCE INSIGHTS ERROR:",
            repr(e),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate "
                "performance insights."
            ),
        )

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "average_score":
            round(
                average_score,
                2,
            ),

        "strongest_skill":
            strongest_skill,

        "weakest_skill":
            weakest_skill,

        "insights":
            insights,
    }
# ============================================================
# GET SINGLE INTERVIEW
# ============================================================

@router.get("/{interview_id}")
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    questions = []

    for question in interview.questions:

        # ----------------------------------------------------
        # Convert comma-separated strings
        # back into arrays for frontend
        # ----------------------------------------------------

        strengths = []

        if question.strengths:

            strengths = [
                item.strip()
                for item in question.strengths.split(",")
                if item.strip()
            ]

        improvements = []

        if question.improvements:

            improvements = [
                item.strip()
                for item in question.improvements.split(",")
                if item.strip()
            ]

        questions.append(
            {
                "id":
                    question.question_id,

                "type":
                    question.question_type,

                "question":
                    question.question,

                "answer":
                    question.answer,

                "score":
                    question.score,

                "feedback":
                    question.feedback,

                "ideal_answer":
                    question.ideal_answer,

                "strengths":
                    strengths,

                "improvements":
                    improvements,
            }
        )

    return {
        "id":
            interview.id,

        "role":
            interview.role,

        "difficulty":
            interview.difficulty,

        "completed":
            interview.completed,

        "completed_at":
            interview.completed_at,

        "questions":
            questions,
    }


# ============================================================
# EVALUATE ANSWER
# ============================================================

@router.post("/evaluate")
def evaluate(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview_id = data.get(
        "interview_id"
    )

    question_id = data.get(
        "question_id"
    )

    answer = data.get(
        "answer",
        "",
    ).strip()

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    if interview_id is None:

        raise HTTPException(
            status_code=400,
            detail="interview_id is required",
        )

    if question_id is None:

        raise HTTPException(
            status_code=400,
            detail="question_id is required",
        )

    if not answer:

        raise HTTPException(
            status_code=400,
            detail="Answer cannot be empty",
        )

    # --------------------------------------------------------
    # Find interview
    # --------------------------------------------------------

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    # --------------------------------------------------------
    # Don't allow editing after submission
    # --------------------------------------------------------

    if interview.completed:

        raise HTTPException(
            status_code=400,
            detail="Interview has already been submitted",
        )

    # --------------------------------------------------------
    # Find question
    # --------------------------------------------------------

    question = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.interview_id
            == interview.id,

            InterviewQuestion.question_id
            == question_id,
        )
        .first()
    )

    if not question:

        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    # --------------------------------------------------------
    # Ask AI to evaluate
    # --------------------------------------------------------

    result = evaluate_answer(
        question=question.question,
        answer=answer,
    )

    # --------------------------------------------------------
    # Save evaluation
    # --------------------------------------------------------

    question.answer = answer

    question.score = result.get(
        "score"
    )

    question.feedback = result.get(
        "feedback"
    )

    question.ideal_answer = result.get(
        "ideal_answer"
    )

    question.strengths = ", ".join(
        result.get(
            "strengths",
            [],
        )
    )

    question.improvements = ", ".join(
        result.get(
            "improvements",
            [],
        )
    )

    db.commit()

    db.refresh(question)

    return result


# ============================================================
# TRANSCRIBE AUDIO
# ============================================================

@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
):
    audio = await file.read()

    if not audio:

        raise HTTPException(
            status_code=400,
            detail="Audio file is empty",
        )

    try:

        text = transcribe_audio(
            audio
        )

    except Exception as e:

        print(
            "TRANSCRIPTION ERROR:",
            repr(e),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to transcribe audio",
        )

    return {
        "transcript":
            text,
    }