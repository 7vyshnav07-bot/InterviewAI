import json

from app.ai.groq_client import client
from app.ai.prompts import RESUME_ANALYZER_PROMPT

MODEL_NAME = "llama-3.3-70b-versatile"


def analyze_resume(resume_text: str):
    prompt = RESUME_ANALYZER_PROMPT.format(
        resume=resume_text
    )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0,
    )

    content = response.choices[0].message.content

    print("\n========== RAW GROQ RESPONSE ==========\n")
    print(content)
    print("\n=======================================\n")

    content = content.strip()

    # Remove markdown code fences
    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    print("\n========== CLEAN JSON ==========\n")
    print(content)
    print("\n================================\n")

    return json.loads(content)