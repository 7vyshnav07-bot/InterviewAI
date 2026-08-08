"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateInterview } from "@/services/interviewService";

export default function InterviewPage() {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [interviewType, setInterviewType] = useState("Technical");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
  try {
    setLoading(true);

    const data = await generateInterview({
      role,
      difficulty,
      count: questionCount,
      types: [interviewType],
    });

    router.push(
      `/interview/session/${data.interview_id}`
    );
  } catch (err) {
    console.error(err);
    alert("Failed to generate interview.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mx-auto max-w-4xl p-8">

      <h1 className="mb-2 text-4xl font-bold">
        AI Mock Interview
      </h1>

      <p className="mb-8 text-muted-foreground">
        Configure your interview before starting.
      </p>

      <div className="space-y-6 rounded-xl border bg-card p-8">

        <div>
          <label className="mb-2 block font-semibold">
            Job Role
          </label>

          <input
            type="text"
            placeholder="Software Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Interview Type
          </label>

          <select
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option>Technical</option>
            <option>HR</option>
            <option>Behavioral</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Difficulty
          </label>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Number of Questions
          </label>

          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full rounded-lg border p-3"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating Interview..." : "Start Interview"}
        </button>

      </div>

    </div>
  );
}