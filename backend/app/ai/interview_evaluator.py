import json

from app.ai.groq_client import client
from app.ai.prompts import INTERVIEW_EVALUATOR_PROMPT

MODEL_NAME = "llama-3.3-70b-versatile"


def evaluate_answer(question: str, answer: str):
    prompt = INTERVIEW_EVALUATOR_PROMPT.format(
        question=question,
        answer=answer,
    )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.3,
    )

    content = response.choices[0].message.content.strip()

    if content.startswith("```"):
        content = (
            content.replace("```json", "")
            .replace("```", "")
            .strip()
        )

    return json.loads(content)