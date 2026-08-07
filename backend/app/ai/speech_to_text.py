import os
import tempfile

from app.ai.groq_client import client


def transcribe_audio(audio_bytes: bytes) -> str:
    temp_path = None

    try:
        fd, temp_path = tempfile.mkstemp(suffix=".webm")

        os.close(fd)

        with open(temp_path, "wb") as f:
            f.write(audio_bytes)

        with open(temp_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3-turbo",
                language="en",
                response_format="verbose_json",
            )

        return transcription.text

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)