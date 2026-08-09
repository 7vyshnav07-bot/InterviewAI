import json

from app.core.config import settings
from langchain_groq import ChatGroq


def generate_performance_insights(
    role: str,
    average_score: float,
    strongest_skill: str | None,
    weakest_skill: str | None,
    skill_scores: list,
    interviews: list,
    question_feedback: list,
):
    """
    Generate personalized AI performance insights
    from the user's interview history and evaluations.
    """

    # ========================================================
    # PREPARE SKILL DATA
    # ========================================================

    skills_text = "\n".join(
        [
            f"- {skill['skill']}: "
            f"{skill['score']:.1f}/10 "
            f"({skill['questions']} questions)"
            for skill in skill_scores
        ]
    )

    # ========================================================
    # PREPARE INTERVIEW HISTORY
    # ========================================================

    interviews_text = "\n".join(
        [
            f"- Role: {item['role']}, "
            f"Difficulty: {item['difficulty']}, "
            f"Score: {item['score']:.1f}/10"
            for item in interviews
        ]
    )

    # ========================================================
    # PREPARE QUESTION FEEDBACK
    # ========================================================

    feedback_blocks = []

    for item in question_feedback:

        strengths = item.get(
            "strengths",
            ""
        )

        improvements = item.get(
            "improvements",
            ""
        )

        feedback_blocks.append(
            f"""
Question:
{item.get("question", "")}

Score:
{item.get("score", 0)}/10

Feedback:
{item.get("feedback", "")}

Strengths:
{strengths}

Improvements:
{improvements}
""".strip()
        )

    feedback_text = "\n\n".join(
        feedback_blocks
    )

    # ========================================================
    # LLM
    # ========================================================

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        api_key=settings.GROQ_API_KEY,
    )

    # ========================================================
    # PROMPT
    # ========================================================

    prompt = f"""
You are an expert interview coach.

Analyze the candidate's interview performance using
ONLY the provided interview data.

Do not invent information that is not present in the data.

Candidate role:
{role}

Overall average score:
{average_score:.1f}/10

Strongest skill:
{strongest_skill or "Not enough data"}

Weakest skill:
{weakest_skill or "Not enough data"}

Skill performance:
{skills_text or "No skill data available"}

Interview history:
{interviews_text or "No interview history available"}

Detailed question evaluations:
{feedback_text or "No detailed feedback available"}

Your job is to give practical and personalized
interview coaching.

Do NOT simply repeat the candidate's scores.

Analyze:

1. Biggest strength
2. Biggest weakness
3. Answer pattern
4. Practice focus
5. Specific improvement actions
6. Recommended interview practice questions
7. How the candidate can improve their answers

Be honest and specific.

Avoid generic statements such as:
"Practice more"
"Improve communication"
"Keep working hard"

Instead explain exactly what the candidate should do.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "summary": "Concise overall assessment.",

    "biggest_strength": "Specific explanation of the candidate's strongest area.",

    "biggest_weakness": "Specific explanation of the candidate's weakest area.",

    "answer_pattern": "Important pattern observed across the candidate's answers.",

    "practice_focus": "The most important area the candidate should practice next.",

    "action_plan": [
        "Specific actionable step 1.",
        "Specific actionable step 2.",
        "Specific actionable step 3."
    ],

    "recommended_questions": [
        "Practice question 1.",
        "Practice question 2.",
        "Practice question 3.",
        "Practice question 4.",
        "Practice question 5."
    ],

    "answer_improvement": "Explain how the candidate should structure or improve their answers based on the observed weaknesses."
}}

Do not include markdown.
Do not include ```json.
Do not include any text outside the JSON object.
"""

    # ========================================================
    # GENERATE RESPONSE
    # ========================================================

    response = llm.invoke(prompt)

    content = response.content

    if isinstance(content, list):

        content = "".join(
            str(item)
            for item in content
        )

    content = str(content).strip()

    # ========================================================
    # PARSE JSON
    # ========================================================

    try:

        return json.loads(content)

    except json.JSONDecodeError:

        start = content.find("{")
        end = content.rfind("}")

        if start != -1 and end != -1:

            json_content = content[
                start:end + 1
            ]

            return json.loads(
                json_content
            )

        raise ValueError(
            "AI returned invalid JSON"
        )