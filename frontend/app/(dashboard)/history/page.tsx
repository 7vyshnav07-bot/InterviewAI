"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getInterviewHistory,
  deleteInterview,
} from "@/services/interviewService";

interface InterviewHistoryItem {
  id: number;
  role: string;
  difficulty: string;
  total_questions: number;
  answered_questions: number;
  evaluated_questions: number;
  average_score: number | null;
  completed: boolean;
  completed_at: string | null;
}

export default function InterviewHistoryPage() {
  const router = useRouter();

  const [history, setHistory] = useState<
    InterviewHistoryItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  // ============================================================
  // CUSTOM DELETE MODAL
  // ============================================================

  const [deleteTarget, setDeleteTarget] =
    useState<number | null>(null);

  // ============================================================
  // DELETE SUCCESS / ERROR MESSAGE
  // ============================================================

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const data = await getInterviewHistory();

        if (!cancelled) {
          setHistory(data);
        }
      } catch (err) {
        console.error(
          "Failed to load interview history:",
          err
        );

        if (!cancelled) {
          setError(
            "Failed to load interview history. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // SHOW DELETE MODAL
  // ============================================================

  const openDeleteModal = (interviewId: number) => {
    setDeleteTarget(interviewId);
  };

  // ============================================================
  // CLOSE DELETE MODAL
  // ============================================================

  const closeDeleteModal = () => {
    if (deletingId !== null) {
      return;
    }

    setDeleteTarget(null);
  };

  // ============================================================
  // CONFIRM DELETE
  // ============================================================

  const confirmDelete = async () => {
    if (deleteTarget === null) {
      return;
    }

    const interviewId = deleteTarget;

    try {
      setDeletingId(interviewId);

      await deleteInterview(interviewId);

      setHistory((previous) =>
        previous.filter(
          (interview) =>
            interview.id !== interviewId
        )
      );

      setDeleteTarget(null);

      setMessage({
        text: "Interview deleted successfully.",
        type: "success",
      });

      // Automatically remove message
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to delete interview:",
        err
      );

      setMessage({
        text: "Failed to delete interview. Please try again.",
        type: "error",
      });

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-8">

        <h1 className="text-3xl font-bold">
          Interview History
        </h1>

        <p className="mt-2 text-muted-foreground">
          Loading your previous interviews...
        </p>

        <div className="mt-8 space-y-4">

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-xl border bg-slate-100"
            />
          ))}

        </div>

      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-8">

        <h1 className="text-3xl font-bold">
          Interview History
        </h1>

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">

          <p className="font-semibold text-red-700">
            Something went wrong
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ============================================================
  // EMPTY
  // ============================================================

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-6xl p-8">

        <div>

          <h1 className="text-3xl font-bold">
            Interview History
          </h1>

          <p className="mt-2 text-muted-foreground">
            Review your previous AI interview
            performances.
          </p>

        </div>

        <div className="mt-10 rounded-xl border bg-card p-10 text-center">

          <div className="text-5xl">
            📋
          </div>

          <h2 className="mt-4 text-xl font-bold">
            No Interview History
          </h2>

          <p className="mt-2 text-muted-foreground">
            Complete an AI interview and it
            will appear here.
          </p>

          <button
            onClick={() =>
              router.push("/interview")
            }
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Start an Interview
          </button>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="relative mx-auto max-w-6xl p-8">

      {/* ======================================================
          SUCCESS / ERROR MESSAGE
      ====================================================== */}

      {message && (
        <div
          className={`fixed right-6 top-6 z-[100] rounded-lg border px-5 py-4 shadow-lg ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-3">

            <span className="text-lg">
              {message.type === "success"
                ? "✓"
                : "✕"}
            </span>

            <p className="font-medium">
              {message.text}
            </p>

            <button
              onClick={() =>
                setMessage(null)
              }
              className="ml-3 text-lg opacity-60 hover:opacity-100"
            >
              ×
            </button>

          </div>
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <h1 className="text-3xl font-bold">
          Interview History
        </h1>

        <p className="mt-2 text-muted-foreground">
          Review your previous AI interview
          performances.
        </p>

      </div>

      {/* ======================================================
          HISTORY LIST
      ====================================================== */}

      <div className="mt-8 space-y-4">

        {history.map((interview) => (

          <div
            key={interview.id}
            className="rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md"
          >

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              {/* ==================================================
                  INTERVIEW INFORMATION
              ================================================== */}

              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-xl font-bold">
                    {interview.role}
                  </h2>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {interview.difficulty}
                  </span>

                  {interview.completed ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                      In Progress
                    </span>
                  )}

                </div>

                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <div className="mt-5 grid grid-cols-2 gap-5 text-sm md:grid-cols-4">

                  <div>

                    <p className="text-muted-foreground">
                      Questions
                    </p>

                    <p className="mt-1 font-semibold">
                      {interview.total_questions}
                    </p>

                  </div>

                  <div>

                    <p className="text-muted-foreground">
                      Answered
                    </p>

                    <p className="mt-1 font-semibold">
                      {interview.answered_questions}
                      {" / "}
                      {interview.total_questions}
                    </p>

                  </div>

                  <div>

                    <p className="text-muted-foreground">
                      Average Score
                    </p>

                    <p className="mt-1 font-semibold">
                      {interview.average_score !== null
                        ? `${interview.average_score.toFixed(
                            1
                          )}/10`
                        : "Not evaluated"}
                    </p>

                  </div>

                  <div>

                    <p className="text-muted-foreground">
                      Date
                    </p>

                    <p className="mt-1 font-semibold">
                      {interview.completed_at
                        ? new Date(
                            interview.completed_at
                          ).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "In progress"}
                    </p>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  BUTTONS
              ================================================== */}

              <div className="flex shrink-0 gap-3">

                {/* VIEW */}

                <button
                  onClick={() =>
                    router.push(
                      `/history/${interview.id}`
                    )
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  👁 View
                </button>

                {/* DELETE */}

                <button
                  onClick={() =>
                    openDeleteModal(interview.id)
                  }
                  disabled={
                    deletingId === interview.id
                  }
                  className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === interview.id
                    ? "Deleting..."
                    : "🗑 Delete"}
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* ======================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {deleteTarget !== null && (

        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          onClick={closeDeleteModal}
        >

          <div
            className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-2xl">
                🗑️
              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Delete Interview?
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Are you sure you want to delete this
                  interview? This action cannot be undone.
                </p>

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              {/* CANCEL */}

              <button
                onClick={closeDeleteModal}
                disabled={deletingId !== null}
                className="rounded-lg border px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              {/* CONFIRM */}

              <button
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId !== null
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}