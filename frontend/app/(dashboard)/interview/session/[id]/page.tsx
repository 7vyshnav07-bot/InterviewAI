"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getInterview,
  evaluateAnswer,
  transcribeAudio,
  submitInterview,
} from "@/services/interviewService";

interface InterviewQuestion {
  id: number;
  type: string;
  question: string;

  answer?: string | null;
  score?: number | null;
  feedback?: string | null;
  ideal_answer?: string | null;
  strengths?: string[] | null;
  improvements?: string[] | null;
}

interface Interview {
  id?: number;
  role: string;
  difficulty: string;
  completed?: boolean;
  completed_at?: string | null;
  questions: InterviewQuestion[];
}

interface EvaluationResult {
  score: number;
  feedback: string;
  ideal_answer: string;
  strengths: string[];
  improvements: string[];
}

interface QuestionState {
  answer: string;
  audioBlob: Blob | null;
  result: EvaluationResult | null;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();

  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [interview, setInterview] =
    useState<Interview | null>(null);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [recording, setRecording] =
    useState(false);

  const [evaluating, setEvaluating] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [questionStates, setQuestionStates] =
    useState<QuestionState[]>([]);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  // ============================================================
  // LOAD INTERVIEW
  // ============================================================

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const data = await getInterview(
          interviewId
        );

        setInterview(data);

        /*
         * Load saved answers and evaluations.
         *
         * This is important for:
         *
         * Question 1
         * -> Question 2
         * -> Previous
         *
         * and also when opening an already completed
         * interview from Interview History.
         */

        setQuestionStates(
          data.questions.map(
            (question: InterviewQuestion) => ({
              answer:
                question.answer ?? "",

              audioBlob: null,

              result:
                question.score !== null &&
                question.score !== undefined
                  ? {
                      score: question.score,

                      feedback:
                        question.feedback ?? "",

                      ideal_answer:
                        question.ideal_answer ?? "",

                      strengths:
                        question.strengths ?? [],

                      improvements:
                        question.improvements ?? [],
                    }
                  : null,
            })
          )
        );
      } catch (err) {
        console.error(err);

        alert(
          "Failed to load interview."
        );
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      loadInterview();
    }
  }, [interviewId]);

  // ============================================================
  // START RECORDING
  // ============================================================

  const startRecording = async () => {
    /*
     * Don't allow recording for completed interviews.
     */

    if (interview?.completed) {
      return;
    }

    try {
      if (recording) {
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      const recorder =
        new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          chunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type: "audio/webm",
          }
        );

        // Stop microphone
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        setRecording(false);

        // Save audio locally
        setQuestionStates((prev) => {
          const updated = [...prev];

          updated[currentQuestion] = {
            ...updated[currentQuestion],
            audioBlob: blob,
          };

          return updated;
        });

        // Transcribe audio
        try {
          const data =
            await transcribeAudio(blob);

          setQuestionStates((prev) => {
            const updated = [...prev];

            updated[currentQuestion] = {
              ...updated[currentQuestion],

              answer:
                data.transcript,

              // New answer means the previous
              // evaluation is no longer valid.
              result: null,
            };

            return updated;
          });
        } catch (err) {
          console.error(err);

          alert(
            "Failed to transcribe audio."
          );
        }
      };

      mediaRecorderRef.current =
        recorder;

      recorder.start();

      setRecording(true);
    } catch (err) {
      console.error(err);

      alert(
        "Unable to access microphone."
      );
    }
  };

  // ============================================================
  // STOP RECORDING
  // ============================================================

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      recording
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // ============================================================
  // EVALUATE ANSWER
  // ============================================================

  const handleEvaluate = async () => {
    /*
     * Completed interviews are read-only.
     */

    if (interview?.completed) {
      return;
    }

    if (!interview) {
      return;
    }

    const question =
      interview.questions[
        currentQuestion
      ];

    const currentState =
      questionStates[
        currentQuestion
      ];

    if (!currentState?.answer.trim()) {
      alert(
        "Please answer the question first."
      );

      return;
    }

    try {
      setEvaluating(true);

      const data =
        await evaluateAnswer({
          interview_id:
            Number(interviewId),

          question_id:
            question.id,

          answer:
            currentState.answer,
        });

      setQuestionStates((prev) => {
        const updated = [...prev];

        updated[currentQuestion] = {
          ...updated[currentQuestion],

          result: data,
        };

        return updated;
      });
    } catch (err) {
      console.error(err);

      alert(
        "Evaluation failed."
      );
    } finally {
      setEvaluating(false);
    }
  };

  // ============================================================
  // SUBMIT INTERVIEW
  // ============================================================

  const handleSubmitInterview =
    async () => {
      if (!interview) {
        return;
      }

      /*
       * Don't submit a completed interview again.
       */

      if (interview.completed) {
        return;
      }

      /*
       * Every question must have:
       *
       * 1. An answer
       * 2. An evaluation
       */

      const incompleteQuestion =
        questionStates.find(
          (state) =>
            !state.answer.trim() ||
            !state.result
        );

      if (incompleteQuestion) {
        alert(
          "Please answer and evaluate all questions before submitting the interview."
        );

        return;
      }

      try {
        setSubmitting(true);

        await submitInterview(
          Number(interviewId)
        );

        router.push(
  "/interview/history?submitted=true"
);
      } catch (err) {
        console.error(err);

        alert(
          "Failed to submit interview."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold">
          Loading Interview...
        </h1>
      </div>
    );
  }

  // ============================================================
  // INTERVIEW NOT FOUND
  // ============================================================

  if (!interview) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold">
          Interview Not Found
        </h1>
      </div>
    );
  }

  const question =
    interview.questions[
      currentQuestion
    ];

  const currentState =
    questionStates[
      currentQuestion
    ];

  const isLastQuestion =
    currentQuestion ===
    interview.questions.length - 1;

  /*
   * Determine whether this is a completed
   * read-only interview.
   */

  const isCompleted =
    interview.completed === true;

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <h1 className="text-3xl font-bold">
          {isCompleted
            ? "Interview Results"
            : "AI Interview Session"}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {isCompleted
            ? "Review your answers and AI-powered interview feedback."
            : "Answer each question and get AI-powered feedback."}
        </p>
      </div>

      {/* ======================================================
          COMPLETED INTERVIEW NOTICE
      ====================================================== */}

      {isCompleted && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">

          <div className="flex items-start gap-3">

            <div className="text-2xl">
              ✅
            </div>

            <div>

              <h2 className="font-bold text-green-700">
                Interview Completed
              </h2>

              {interview.completed_at && (
                <p className="mt-1 text-sm text-green-600">
                  Submitted on{" "}
                  {new Date(
                    interview.completed_at
                  ).toLocaleString()}
                </p>
              )}

              <p className="mt-2 text-sm text-slate-600">
                This interview is read-only.
                You can review your answers
                and AI feedback, but you cannot
                modify or re-evaluate them.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          QUESTION CARD
      ====================================================== */}

      <div className="rounded-xl border bg-card p-8">

        {/* QUESTION NUMBER */}

        <p className="text-sm font-semibold text-blue-600">
          Question{" "}
          {currentQuestion + 1} of{" "}
          {interview.questions.length}
        </p>

        {/* QUESTION TYPE */}

        <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {question.type}
        </span>

        {/* QUESTION */}

        <h2 className="mt-6 text-2xl font-semibold">
          {question.question}
        </h2>

        {/* ==================================================
            RECORDING CONTROLS
        ================================================== */}

        {!isCompleted && (
          <div className="mt-8 flex flex-wrap gap-4">

            <button
              onClick={
                startRecording
              }
              disabled={
                recording ||
                evaluating ||
                submitting
              }
              className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              🎤 Start Recording
            </button>

            <button
              onClick={
                stopRecording
              }
              disabled={
                !recording
              }
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              ⏹ Stop Recording
            </button>

          </div>
        )}

        {/* ==================================================
            RECORDING STATUS
        ================================================== */}

        {recording && (
          <p className="mt-4 font-semibold text-green-600">
            🎙️ Recording...
          </p>
        )}

        {/* ==================================================
            AUDIO PLAYER
        ================================================== */}

        {currentState?.audioBlob && (
          <div className="mt-6 rounded-lg border bg-green-50 p-4">

            <p className="font-semibold text-green-700">
              ✅ Recording Completed
            </p>

            <audio
              controls
              className="mt-4 w-full"
              src={URL.createObjectURL(
                currentState.audioBlob
              )}
            />

          </div>
        )}

        {/* ==================================================
            ANSWER
        ================================================== */}

        <div className="mt-8">

          <label className="mb-2 block font-semibold">
            Your Answer
          </label>

          <textarea
            rows={6}
            value={
              currentState?.answer ??
              ""
            }
            readOnly={isCompleted}
            onChange={(e) => {

              /*
               * Don't allow editing
               * completed interviews.
               */

              if (isCompleted) {
                return;
              }

              const newAnswer =
                e.target.value;

              setQuestionStates(
                (prev) => {
                  const updated = [
                    ...prev,
                  ];

                  updated[
                    currentQuestion
                  ] = {
                    ...updated[
                      currentQuestion
                    ],

                    answer:
                      newAnswer,

                    /*
                     * Changing the answer
                     * invalidates the previous
                     * evaluation.
                     */
                    result: null,
                  };

                  return updated;
                }
              );
            }}
            className={`w-full rounded-lg border p-4 outline-none focus:ring-2 focus:ring-blue-500 ${
              isCompleted
                ? "cursor-not-allowed bg-slate-100 text-slate-700"
                : ""
            }`}
            placeholder={
              isCompleted
                ? "Submitted answer"
                : "Type your answer or record your answer using the microphone..."
            }
          />

          {/* ==================================================
              EVALUATE BUTTON
          ================================================== */}

          {!isCompleted && (
            <button
              onClick={
                handleEvaluate
              }
              disabled={
                evaluating ||
                submitting ||
                !currentState?.answer.trim()
              }
              className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {evaluating
                ? "Evaluating..."
                : "🤖 Evaluate Answer"}
            </button>
          )}

        </div>

        {/* ==================================================
            AI FEEDBACK
        ================================================== */}

        {currentState?.result && (
          <div className="mt-8 rounded-xl border bg-slate-50 p-6">

            <h2 className="text-2xl font-bold">
              🤖 AI Feedback
            </h2>

            {/* SCORE */}

            <div className="mt-6 rounded-lg bg-green-100 p-4">

              <h3 className="text-xl font-bold text-green-700">
                ⭐ Score:{" "}
                {
                  currentState.result
                    .score
                }
                /10
              </h3>

            </div>

            {/* FEEDBACK */}

            <div className="mt-6">

              <h3 className="text-lg font-semibold">
                Feedback
              </h3>

              <p className="mt-2">
                {
                  currentState
                    .result
                    .feedback
                }
              </p>

            </div>

            {/* IDEAL ANSWER */}

            <div className="mt-6">

              <h3 className="text-lg font-semibold">
                Ideal Answer
              </h3>

              <p className="mt-2">
                {
                  currentState
                    .result
                    .ideal_answer
                }
              </p>

            </div>

            {/* STRENGTHS */}

            <div className="mt-6">

              <h3 className="text-lg font-semibold text-green-700">
                ✅ Strengths
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-6">

                {currentState.result.strengths.map(
                  (item, index) => (
                    <li
                      key={index}
                    >
                      {item}
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* IMPROVEMENTS */}

            <div className="mt-6">

              <h3 className="text-lg font-semibold text-red-700">
                🔧 Improvements
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-6">

                {currentState.result.improvements.map(
                  (item, index) => (
                    <li
                      key={index}
                    >
                      {item}
                    </li>
                  )
                )}

              </ul>

            </div>

          </div>
        )}

      </div>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex items-center justify-between gap-4">

        {/* PREVIOUS */}

        <button
          disabled={
            currentQuestion === 0 ||
            recording ||
            evaluating ||
            submitting
          }
          onClick={() => {
            setCurrentQuestion(
              (prev) => prev - 1
            );
          }}
          className="rounded-lg bg-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          ← Previous
        </button>

        {/* ==================================================
            NEXT QUESTION
        ================================================== */}

        {!isLastQuestion && (
          <button
            onClick={() => {
              setCurrentQuestion(
                (prev) => prev + 1
              );
            }}
            disabled={
              recording ||
              evaluating ||
              submitting
            }
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Next →
          </button>
        )}

        {/* ==================================================
            SUBMIT INTERVIEW
        ================================================== */}

        {isLastQuestion &&
          !isCompleted && (
            <button
              onClick={
                handleSubmitInterview
              }
              disabled={
                submitting ||
                recording ||
                evaluating ||
                !currentState?.answer.trim() ||
                !currentState?.result
              }
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "🏁 Submit Interview"}
            </button>
          )}

        {/* ==================================================
            BACK TO HISTORY
        ================================================== */}

        {isCompleted &&
          isLastQuestion && (
            <button
              onClick={() => {
                router.push(
                  "/interview/history"
                );
              }}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              ← Back to History
            </button>
          )}

      </div>

    </div>
  );
}