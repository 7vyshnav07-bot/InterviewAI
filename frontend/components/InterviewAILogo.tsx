"use client";

import { BrainCircuit } from "lucide-react";

type InterviewAILogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

export default function InterviewAILogo({
  size = "md",
  showText = true,
}: InterviewAILogoProps) {
  const sizes = {
    sm: {
      container: "h-9 w-9 rounded-lg",
      icon: "h-5 w-5",
      text: "text-lg",
    },
    md: {
      container: "h-11 w-11 rounded-xl",
      icon: "h-6 w-6",
      text: "text-xl",
    },
    lg: {
      container: "h-16 w-16 rounded-2xl",
      icon: "h-8 w-8",
      text: "text-2xl",
    },
  };

  const current = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex ${current.container} items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20`}
      >
        <BrainCircuit
          className={`${current.icon} text-white`}
          strokeWidth={1.8}
        />
      </div>

      {showText && (
        <span
          className={`${current.text} font-bold tracking-tight text-white`}
        >
          Interview
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AI
          </span>
        </span>
      )}
    </div>
  );
}