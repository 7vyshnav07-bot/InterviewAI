import api from "@/lib/api";

export interface InterviewRequest {
  role: string;
  difficulty: string;
  types: string[];
  count: number;
}

export interface EvaluationRequest {
  interview_id: number;
  question_id: number;
  answer: string;
}

export const generateInterview = async (
  data: InterviewRequest
) => {
  const response = await api.post(
    "/interview/generate",
    data
  );

  return response.data;
};

export const getInterview = async (
  id: string
) => {
  const response = await api.get(
    `/interview/${id}`
  );

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

export const transcribeAudio = async (
  audioBlob: Blob
) => {
  const formData = new FormData();

  formData.append(
    "file",
    audioBlob,
    "answer.webm"
  );

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
export const getInterviewHistory = async () => {
  const response = await api.get("/interview/history");

  return response.data;
};
export const deleteInterview = async (
  id: number
) => {
  const response = await api.delete(
    `/interview/${id}`
  );

  return response.data;
};
export const submitInterview = async (
  interviewId: number
) => {
  const response = await api.post(
    `/interview/${interviewId}/submit`
  );

  return response.data;
};