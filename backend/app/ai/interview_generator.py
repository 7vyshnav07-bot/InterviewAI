import json

from app.ai.groq_client import client
from app.ai.prompts import INTERVIEW_GENERATOR_PROMPT

MODEL_NAME = "llama-3.3-70b-versatile"


def generate_questions(role, difficulty, types, count):
    prompt = INTERVIEW_GENERATOR_PROMPT.format(
        role=role,
        difficulty=difficulty,
        types=", ".join(types),
        count=count,
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
        content = content.replace("```json", "")
        content = content.replace("```", "").strip()

    return json.loads(content)