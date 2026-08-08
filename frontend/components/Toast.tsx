"use client";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  onClose,
}: ToastProps) {
  return (
    <div className="fixed right-6 top-6 z-50">

      <div
        className={`flex min-w-[300px] items-center justify-between gap-4 rounded-xl border px-5 py-4 shadow-lg ${
          type === "success"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}
      >

        <div className="flex items-center gap-3">

          <span className="text-xl">
            {type === "success"
              ? "✅"
              : "❌"}
          </span>

          <p className="font-medium">
            {message}
          </p>

        </div>

        <button
          onClick={onClose}
          className="text-lg font-bold opacity-60 hover:opacity-100"
        >
          ×
        </button>

      </div>

    </div>
  );
}