"use client";

import Toast from "@/components/Toast";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getInterview,
  deleteInterview,
} from "@/services/interviewService";

type Question = {
  id: number;
  type: string;
  question: string;
  answer: string | null;
  score: number | null;
  feedback: string | null;
  ideal_answer: string | null;
  strengths: string[];
  improvements: string[];
};

type Interview = {
  id: number;
  role: string;
  difficulty: string;
  completed: boolean;
  completed_at: string | null;
  questions: Question[];
};

export default function InterviewDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const idParam = params.id;

  const [interview, setInterview] =
    useState<Interview | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================================================
  // TOAST
  // ============================================================

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ============================================================
  // DELETE CONFIRMATION MODAL
  // ============================================================

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  // ============================================================
  // LOAD INTERVIEW
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const interviewId = Number(idParam);

    if (
      !idParam ||
      Number.isNaN(interviewId)
    ) {
      setTimeout(() => {
        if (cancelled) return;

        setError("Invalid interview ID.");
        setLoading(false);
      }, 0);

      return () => {
        cancelled = true;
      };
    }

    const loadInterview = async () => {
      try {
        const data = await getInterview(
          String(interviewId)
        );

        setTimeout(() => {
          if (cancelled) return;

          setInterview(data);
          setLoading(false);
        }, 0);
      } catch (err) {
        console.error(
          "Failed to load interview:",
          err
        );

        setTimeout(() => {
          if (cancelled) return;

          setError(
            "Failed to load interview. Please try again."
          );

          setLoading(false);
        }, 0);
      }
    };

    loadInterview();

    return () => {
      cancelled = true;
    };
  }, [idParam]);

  // ============================================================
  // OPEN DELETE MODAL
  // ============================================================

  const openDeleteConfirm = () => {
    if (!interview) {
      return;
    }

    setShowDeleteConfirm(true);
  };

  // ============================================================
  // CLOSE DELETE MODAL
  // ============================================================

  const closeDeleteConfirm = () => {
    if (deleting) {
      return;
    }

    setShowDeleteConfirm(false);
  };

  // ============================================================
  // DELETE INTERVIEW
  // ============================================================

  const handleDelete = async () => {
    if (!interview) {
      return;
    }

    try {
      setDeleting(true);

      await deleteInterview(interview.id);

      setShowDeleteConfirm(false);

      setToast({
        message:
          "Interview deleted successfully.",
        type: "success",
      });

      setTimeout(() => {
        router.push("/history");
      }, 1200);
    } catch (error) {
      console.log(
        "DELETE ERROR:",
        error
      );

      setToast({
        message:
          "Failed to delete interview. Please try again.",
        type: "error",
      });

      setDeleting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-8">

        <button
          onClick={() =>
            router.push("/history")
          }
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to History
        </button>

        <h1 className="mt-6 text-3xl font-bold">
          Interview Details
        </h1>

        <p className="mt-2 text-muted-foreground">
          Loading interview...
        </p>

        <div className="mt-8 space-y-4">

          <div className="h-32 animate-pulse rounded-xl bg-slate-100" />

          <div className="h-48 animate-pulse rounded-xl bg-slate-100" />

        </div>

      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !interview) {
    return (
      <div className="mx-auto max-w-6xl p-8">

        <button
          onClick={() =>
            router.push("/history")
          }
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to History
        </button>

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">

          <h1 className="text-xl font-bold text-red-700">
            Interview Not Found
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error ??
              "This interview does not exist."}
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // CALCULATE STATISTICS
  // ============================================================

  const evaluatedQuestions =
    interview.questions.filter(
      (question) =>
        question.score !== null
    );

  const answeredQuestions =
    interview.questions.filter(
      (question) =>
        question.answer &&
        question.answer.trim().length > 0
    );

  const averageScore =
    evaluatedQuestions.length > 0
      ? evaluatedQuestions.reduce(
          (sum, question) =>
            sum +
            (question.score ?? 0),
          0
        ) /
        evaluatedQuestions.length
      : null;

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">

      {/* ======================================================
          TOAST
      ====================================================== */}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <button
            onClick={() =>
              router.push("/history")
            }
            className="mb-5 text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to History
          </button>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-3xl font-bold">
              {interview.role}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                interview.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {interview.completed
                ? "Completed"
                : "In Progress"}
            </span>

          </div>

          <p className="mt-2 text-muted-foreground">

            {interview.difficulty}

            {" • "}

            {interview.questions.length}

            {" questions"}

            {interview.completed_at &&
              ` • Completed ${new Date(
                interview.completed_at
              ).toLocaleDateString(
                undefined,
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )}`}

          </p>

        </div>

        {/* DELETE BUTTON */}

        <button
          onClick={openDeleteConfirm}
          disabled={deleting}
          className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🗑 Delete Interview
        </button>

      </div>

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid gap-6 md:grid-cols-3">

        {/* SCORE */}

        <div className="rounded-xl border bg-card p-6">

          <p className="text-sm font-medium text-muted-foreground">
            Overall Score
          </p>

          <p className="mt-2 text-3xl font-bold">

            {averageScore !== null
              ? `${averageScore.toFixed(
                  1
                )}/10`
              : "--"}

          </p>

        </div>

        {/* ANSWERED */}

        <div className="rounded-xl border bg-card p-6">

          <p className="text-sm font-medium text-muted-foreground">
            Answered
          </p>

          <p className="mt-2 text-3xl font-bold">

            {answeredQuestions.length}

            <span className="ml-1 text-base font-medium text-muted-foreground">
              / {interview.questions.length}
            </span>

          </p>

        </div>

        {/* EVALUATED */}

        <div className="rounded-xl border bg-card p-6">

          <p className="text-sm font-medium text-muted-foreground">
            Evaluated
          </p>

          <p className="mt-2 text-3xl font-bold">

            {evaluatedQuestions.length}

            <span className="ml-1 text-base font-medium text-muted-foreground">
              / {interview.questions.length}
            </span>

          </p>

        </div>

      </div>

      {/* ======================================================
          QUESTIONS
      ====================================================== */}

      <div>

        <h2 className="text-2xl font-bold">
          Interview Questions
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Review your answers and AI evaluation.
        </p>

        <div className="mt-6 space-y-6">

          {interview.questions.map(
            (question, index) => (

              <div
                key={`${question.id}-${index}`}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >

                {/* QUESTION HEADER */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="flex gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {index + 1}
                    </div>

                    <div>

                      <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {question.type}
                      </span>

                      <h3 className="mt-3 text-lg font-semibold leading-7">
                        {question.question}
                      </h3>

                    </div>

                  </div>

                  {/* SCORE */}

                  <div className="shrink-0">

                    {question.score !== null ? (

                      <div className="rounded-lg bg-blue-50 px-4 py-2 text-center">

                        <p className="text-xs text-muted-foreground">
                          Score
                        </p>

                        <p className="text-xl font-bold text-blue-700">
                          {question.score.toFixed(
                            1
                          )}
                          /10
                        </p>

                      </div>

                    ) : (

                      <div className="rounded-lg bg-slate-100 px-4 py-2 text-center">

                        <p className="text-xs text-muted-foreground">
                          Score
                        </p>

                        <p className="font-semibold">
                          Not evaluated
                        </p>

                      </div>

                    )}

                  </div>

                </div>

                {/* YOUR ANSWER */}

                <div className="mt-6">

                  <h4 className="font-semibold">
                    Your Answer
                  </h4>

                  <div className="mt-2 rounded-lg bg-slate-50 p-4">

                    {question.answer ? (

                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {question.answer}
                      </p>

                    ) : (

                      <p className="text-sm italic text-muted-foreground">
                        No answer submitted.
                      </p>

                    )}

                  </div>

                </div>

                {/* AI FEEDBACK */}

                {question.feedback && (

                  <div className="mt-6">

                    <h4 className="font-semibold">
                      🤖 AI Feedback
                    </h4>

                    <div className="mt-2 rounded-lg border bg-white p-4">

                      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {question.feedback}
                      </p>

                    </div>

                  </div>

                )}

                {/* STRENGTHS + IMPROVEMENTS */}

                <div className="mt-6 grid gap-4 md:grid-cols-2">

                  {/* STRENGTHS */}

                  <div className="rounded-lg border p-4">

                    <h4 className="font-semibold">
                      💪 Strengths
                    </h4>

                    {question.strengths &&
                    question.strengths.length >
                      0 ? (

                      <ul className="mt-3 space-y-2">

                        {question.strengths.map(
                          (
                            strength,
                            strengthIndex
                          ) => (

                            <li
                              key={
                                strengthIndex
                              }
                              className="flex gap-2 text-sm text-muted-foreground"
                            >

                              <span className="mt-1 text-green-600">
                                ✓
                              </span>

                              <span>
                                {strength}
                              </span>

                            </li>

                          )
                        )}

                      </ul>

                    ) : (

                      <p className="mt-3 text-sm text-muted-foreground">
                        No strengths recorded.
                      </p>

                    )}

                  </div>

                  {/* IMPROVEMENTS */}

                  <div className="rounded-lg border p-4">

                    <h4 className="font-semibold">
                      🎯 Improvements
                    </h4>

                    {question.improvements &&
                    question.improvements.length >
                      0 ? (

                      <ul className="mt-3 space-y-2">

                        {question.improvements.map(
                          (
                            improvement,
                            improvementIndex
                          ) => (

                            <li
                              key={
                                improvementIndex
                              }
                              className="flex gap-2 text-sm text-muted-foreground"
                            >

                              <span className="mt-1 text-orange-600">
                                →
                              </span>

                              <span>
                                {improvement}
                              </span>

                            </li>

                          )
                        )}

                      </ul>

                    ) : (

                      <p className="mt-3 text-sm text-muted-foreground">
                        No improvements recorded.
                      </p>

                    )}

                  </div>

                </div>

                {/* IDEAL ANSWER */}

                {question.ideal_answer && (

                  <div className="mt-6">

                    <h4 className="font-semibold">
                      💡 Ideal Answer
                    </h4>

                    <div className="mt-2 rounded-lg bg-blue-50 p-4">

                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {question.ideal_answer}
                      </p>

                    </div>

                  </div>

                )}

              </div>

            )
          )}

        </div>

      </div>

      {/* ======================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {showDeleteConfirm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDeleteConfirm}
        >

          <div
            className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-2xl">
                🗑️
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Delete Interview?
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Are you sure you want to delete this
                  interview? This action cannot be undone.
                </p>

              </div>

            </div>

            {/* MODAL BUTTONS */}

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="rounded-lg border px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Interview"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}