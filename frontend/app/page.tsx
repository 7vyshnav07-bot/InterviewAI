"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);

    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, 3000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl animate-pulse" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* Logo */}
        

        {/* Brand */}
        <div
          className={`mt-6 transition-all duration-1000 ${
            showText
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Interview<span className="text-blue-500">AI</span>
          </h1>

          <p className="mt-3 text-sm tracking-[0.25em] text-slate-400 uppercase">
            AI-Powered Interview Preparation
          </p>
        </div>

        

        

      </div>

      {/* Custom animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

    </main>
  );
}