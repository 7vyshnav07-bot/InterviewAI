"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  getInterviewHistory,
  deleteInterview,
} from "@/services/interviewService";

import Toast from "@/components/Toast";

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

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function InterviewHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [history, setHistory] =
    useState<InterviewHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  // ============================================================
  // TOAST
  // ============================================================

  const showToast = (
    message: string,
    type: "success" | "error"
  ) => {
    setToast({
      message,
      type,
    });
  };

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        setLoading(true);

        const data =
          await getInterviewHistory();

        if (!cancelled) {
          setHistory(data);
        }
      } catch (err) {
        console.error(
          "Failed to load interview history:",
          err
        );

        /*
         * Schedule the state update asynchronously.
         * This avoids React's synchronous setState-in-effect
         * warning.
         */

        setTimeout(() => {
          if (!cancelled) {
            showToast(
              "Failed to load interview history.",
              "error"
            );
          }
        }, 0);
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
  // AUTO HIDE TOAST
  // ============================================================

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  // ============================================================
  // SUBMISSION SUCCESS TOAST
  // ============================================================

  useEffect(() => {
    const submitted =
      searchParams.get("submitted");

    if (submitted !== "true") {
      return;
    }

    /*
     * Schedule the toast state update asynchronously.
     * React 19 no longer complains about a synchronous
     * setState call directly inside the effect.
     */

    const timer = setTimeout(() => {
      showToast(
        "Interview submitted successfully!",
        "success"
      );
    }, 0);

    /*
     * Remove ?submitted=true from the URL.
     */

    window.history.replaceState(
      {},
      "",
      "/interview/history"
    );

    return () => {
      clearTimeout(timer);
    };
  }, [searchParams]);

  // ============================================================
  // DELETE INTERVIEW
  // ============================================================

  const handleDelete = async (
    interviewId: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this interview history? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(interviewId);

      await deleteInterview(
        interviewId
      );

      /*
       * Remove the deleted interview
       * from the UI immediately.
       */

      setHistory((prev) =>
        prev.filter(
          (item) =>
            item.id !== interviewId
        )
      );

      showToast(
        "Interview history deleted successfully.",
        "success"
      );
    } catch (err) {
      console.error(
        "Failed to delete interview:",
        err
      );

      showToast(
        "Failed to delete interview.",
        "error"
      );
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

        <p className="mt-4 text-muted-foreground">
          Loading your interviews...
        </p>

      </div>
    );
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-6xl p-8">

        {/* TOAST */}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() =>
              setToast(null)
            }
          />
        )}

        {/* HEADER */}

        <div>

          <h1 className="text-3xl font-bold">
            Interview History
          </h1>

          <p className="mt-2 text-muted-foreground">
            Review your previous AI interviews.
          </p>

        </div>

        {/* EMPTY CARD */}

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
              router.push(
                "/interview"
              )
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
    <div className="mx-auto max-w-6xl p-8">

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

        {history.map(
          (interview) => (

            <div
              key={interview.id}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                {/* ==================================================
                    INTERVIEW INFORMATION
                ================================================== */}

                <div className="flex-1">

                  {/* TITLE + BADGES */}

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-xl font-bold">
                      {interview.role}
                    </h2>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {interview.difficulty}
                    </span>

                    {interview.completed && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        ✓ Completed
                      </span>
                    )}

                  </div>

                  {/* ==================================================
                      STATISTICS
                  ================================================== */}

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">

                    {/* QUESTIONS */}

                    <div>

                      <p className="text-muted-foreground">
                        Questions
                      </p>

                      <p className="font-semibold">
                        {
                          interview.total_questions
                        }
                      </p>

                    </div>

                    {/* ANSWERED */}

                    <div>

                      <p className="text-muted-foreground">
                        Answered
                      </p>

                      <p className="font-semibold">
                        {
                          interview.answered_questions
                        }{" "}
                        /{" "}
                        {
                          interview.total_questions
                        }
                      </p>

                    </div>

                    {/* SCORE */}

                    <div>

                      <p className="text-muted-foreground">
                        Average Score
                      </p>

                      <p className="font-semibold">

                        {interview.average_score !==
                        null
                          ? `${interview.average_score.toFixed(
                              1
                            )}/10`
                          : "Not evaluated"}

                      </p>

                    </div>

                    {/* DATE */}

                    <div>

                      <p className="text-muted-foreground">
                        Date
                      </p>

                      <p className="font-semibold">

                        {interview.completed_at
                          ? new Date(
                              interview.completed_at
                            ).toLocaleDateString()
                          : "In progress"}

                      </p>

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    ACTION BUTTONS
                ================================================== */}

                <div className="flex flex-wrap gap-3">

                  {/* VIEW */}

                  <button
                    onClick={() =>
                      router.push(
                        `/interview/session/${interview.id}`
                      )
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                  >
                    👁 View
                  </button>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      handleDelete(
                        interview.id
                      )
                    }
                    disabled={
                      deletingId ===
                      interview.id
                    }
                    className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {deletingId ===
                    interview.id
                      ? "Deleting..."
                      : "🗑 Delete"}

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}