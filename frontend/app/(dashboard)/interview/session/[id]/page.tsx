"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  getInterview,
  evaluateAnswer,
  transcribeAudio,
} from "@/services/interviewService";

interface InterviewQuestion {
  id: number;
  type: string;
  question: string;
}

interface Interview {
  role: string;
  difficulty: string;
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

  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<Interview | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [recording, setRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
    useEffect(() => {
    const loadInterview = async () => {
      try {
        const data = await getInterview(interviewId);

        setInterview(data);

        setQuestionStates(
          data.questions.map(() => ({
            answer: "",
            audioBlob: null,
            result: null,
          }))
        );
      } catch (err) {
        console.error(err);
        alert("Failed to load interview.");
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      loadInterview();
    }
  }, [interviewId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        stream.getTracks().forEach((track) => track.stop());

        setRecording(false);

        setQuestionStates((prev) => {
          const updated = [...prev];

          updated[currentQuestion] = {
            ...updated[currentQuestion],
            audioBlob: blob,
          };

          return updated;
        });

        try {
          const data = await transcribeAudio(blob);

          setQuestionStates((prev) => {
            const updated = [...prev];

            updated[currentQuestion] = {
              ...updated[currentQuestion],
              answer: data.transcript,
            };

            return updated;
          });
        } catch (err) {
          console.error(err);
          alert("Failed to transcribe audio.");
        }
      };

      mediaRecorderRef.current = recorder;

      recorder.start();

      setRecording(true);
    } catch (err) {
      console.error(err);
      alert("Unable to access microphone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold">
          Loading Interview...
        </h1>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold">
          Interview Not Found
        </h1>
      </div>
    );
  }

  const question = interview.questions[currentQuestion];
  const currentState = questionStates[currentQuestion];

  const handleEvaluate = async () => {
    if (!currentState?.answer.trim()) {
      alert("Please answer the question first.");
      return;
    }

    try {
      setEvaluating(true);

      const data = await evaluateAnswer({
        question: question.question,
        answer: currentState.answer,
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
      alert("Evaluation failed.");
    } finally {
      setEvaluating(false);
    }
  };
    return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">

      <h1 className="text-3xl font-bold">
        AI Interview Session
      </h1>

      <div className="rounded-xl border bg-card p-8">

        <p className="text-sm font-semibold text-blue-600">
          Question {currentQuestion + 1} of {interview.questions.length}
        </p>

        <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {question.type}
        </span>

        <h2 className="mt-6 text-2xl font-semibold">
          {question.question}
        </h2>

        <div className="mt-8 flex gap-4">

          <button
            onClick={startRecording}
            disabled={recording}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            🎤 Start Recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!recording}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            ⏹ Stop Recording
          </button>

        </div>

        {recording && (
          <p className="mt-4 font-semibold text-green-600">
            🎙️ Recording...
          </p>
        )}

        {currentState?.audioBlob && (
          <div className="mt-6 rounded-lg border bg-green-50 p-4">

            <p className="font-semibold text-green-700">
              ✅ Recording Completed
            </p>

            <audio
              controls
              className="mt-4 w-full"
              src={URL.createObjectURL(currentState.audioBlob)}
            />

          </div>
        )}

        <div className="mt-8">

          <label className="mb-2 block font-semibold">
            Your Answer
          </label>

          <textarea
            rows={6}
            value={currentState?.answer ?? ""}
            onChange={(e) =>
              setQuestionStates((prev) => {
                const updated = [...prev];

                updated[currentQuestion] = {
                  ...updated[currentQuestion],
                  answer: e.target.value,
                };

                return updated;
              })
            }
            className="w-full rounded-lg border p-4"
            placeholder="Your transcribed answer will appear here..."
          />

          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {evaluating ? "Evaluating..." : "Evaluate Answer"}
          </button>

        </div>
                {currentState?.result && (
          <div className="mt-8 rounded-xl border bg-slate-50 p-6">

            <h2 className="text-2xl font-bold">
              🤖 AI Feedback
            </h2>

            <div className="mt-6 rounded-lg bg-green-100 p-4">

              <h3 className="text-xl font-bold text-green-700">
                ⭐ Score: {currentState.result.score}/10
              </h3>

            </div>

            <div className="mt-6">

              <h3 className="font-semibold text-lg">
                Feedback
              </h3>

              <p className="mt-2">
                {currentState.result.feedback}
              </p>

            </div>

            <div className="mt-6">

              <h3 className="font-semibold text-lg">
                Ideal Answer
              </h3>

              <p className="mt-2">
                {currentState.result.ideal_answer}
              </p>

            </div>

            <div className="mt-6">

              <h3 className="font-semibold text-green-700 text-lg">
                ✅ Strengths
              </h3>

              <ul className="mt-3 list-disc pl-6 space-y-2">
                {currentState.result.strengths.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>

            </div>

            <div className="mt-6">

              <h3 className="font-semibold text-red-700 text-lg">
                🔧 Improvements
              </h3>

              <ul className="mt-3 list-disc pl-6 space-y-2">
                {currentState.result.improvements.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>

            </div>

          </div>
        )}

      </div>
            <div className="flex justify-between">

        <button
          disabled={currentQuestion === 0}
          onClick={() => {
            setCurrentQuestion((prev) => prev - 1);
          }}
          className="rounded-lg bg-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          ← Previous
        </button>

        <button
          disabled={currentQuestion === interview.questions.length - 1}
          onClick={() => {
            setCurrentQuestion((prev) => prev + 1);
          }}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Next →
        </button>

      </div>

    </div>
  );
}