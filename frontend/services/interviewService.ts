import api from "@/lib/api";

export interface InterviewRequest {
  role: string;
  difficulty: string;
  types: string[];
  count: number;
}

export interface InterviewResponse {
  interview_id: string;
}

export interface EvaluationRequest {
  question: string;
  answer: string;
}

export const generateInterview = async (
  data: InterviewRequest
): Promise<InterviewResponse> => {
  const response = await api.post("/interview/generate", data);
  return response.data;
};

export const getInterview = async (id: string) => {
  const response = await api.get(`/interview/${id}`);
  return response.data;
};

export const evaluateAnswer = async (
  data: EvaluationRequest
) => {
  const response = await api.post(
    "/interview/evaluate",
    data
  );

  return response.data;
};
export const transcribeAudio = async (audio: Blob) => {
  const formData = new FormData();

  formData.append("file", audio, "answer.webm");

  const response = await api.post(
    "/interview/transcribe",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};