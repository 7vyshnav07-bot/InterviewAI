from typing import Any

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    resume_text: str | None
    analysis_json: dict[str, Any] | None
    user_id: int

    class Config:
        from_attributes = True