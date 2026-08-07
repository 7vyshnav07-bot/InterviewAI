from app.ai.resume_analyzer import analyze_resume

resume = """
John Doe

Skills:
Python
React
FastAPI

Projects:
InterviewAI
"""

print(analyze_resume(resume))