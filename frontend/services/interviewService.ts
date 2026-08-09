import api from "@/lib/api";

// ============================================================
// INTERVIEW DASHBOARD
// ============================================================

export interface DashboardStats {
  total_interviews: number;

  average_score: number | null;

  strongest_skill: string | null;
  strongest_score: number | null;

  weakest_skill: string | null;
  weakest_score: number | null;

  total_questions: number;
  answered_questions: number;
  evaluated_questions: number;

  score_history: {
    interview_id: number;
    role: string;
    difficulty: string;
    score: number;
    completed_at: string | null;
  }[];

  skill_scores: {
    skill: string;
    score: number;
    questions: number;
  }[];

  recent_interviews: {
    id: number;
    role: string;
    difficulty: string;
    score: number | null;
    total_questions: number;
    answered_questions: number;
    completed_at: string | null;
  }[];
}


// ============================================================
// GET INTERVIEW DASHBOARD
// ============================================================

export const getInterviewDashboard =
  async (): Promise<DashboardStats> => {

    const response = await api.get(
      "/interview/dashboard"
    );

    return response.data;
  };
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