"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const [showLogo, setShowLogo] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 150);

    const brandTimer = setTimeout(() => {
      setShowBrand(true);
    }, 650);

    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 950);

    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, 3200);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(brandTimer);
      clearTimeout(taglineTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">

        {/* Main blue glow */}

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[140px] animate-pulse" />

        {/* Cyan glow */}

        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />

        {/* Purple glow */}

        <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[130px]" />

      </div>

      {/* =====================================================
          SUBTLE PARTICLES
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[20%] top-[25%] h-1 w-1 rounded-full bg-blue-400/60 animate-ping" />

        <div
          className="absolute left-[75%] top-[30%] h-1 w-1 rounded-full bg-cyan-400/60 animate-ping"
          style={{ animationDelay: "700ms" }}
        />

        <div
          className="absolute left-[30%] top-[75%] h-1 w-1 rounded-full bg-purple-400/60 animate-ping"
          style={{ animationDelay: "1200ms" }}
        />

        <div
          className="absolute left-[80%] top-[70%] h-1 w-1 rounded-full bg-blue-400/60 animate-ping"
          style={{ animationDelay: "1700ms" }}
        />

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-10 flex flex-col items-center text-center">

        {/* ===================================================
            LOGO
        =================================================== */}

        <div
          className={`transition-all duration-1000 ease-out ${
            showLogo
              ? "scale-100 opacity-100"
              : "scale-50 opacity-0"
          }`}
        >

          <div className="relative">

            {/* Outer glow */}

            <div className="absolute inset-0 rounded-3xl bg-blue-500/30 blur-2xl animate-pulse" />

            {/* Logo container */}

            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl shadow-blue-500/30">

              <BrainCircuit
                className="h-12 w-12 text-white"
                strokeWidth={1.8}
              />

            </div>

          </div>

        </div>

        {/* ===================================================
            BRAND
        =================================================== */}

        <div
          className={`mt-8 transition-all duration-1000 ease-out ${
            showBrand
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
        >

          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">

            Interview
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI
            </span>

          </h1>

        </div>

        {/* ===================================================
            TAGLINE
        =================================================== */}

        <div
          className={`mt-4 transition-all duration-1000 ease-out ${
            showTagline
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >

          <div className="flex items-center justify-center gap-2">

            <Sparkles className="h-4 w-4 text-blue-400" />

            <p className="text-sm font-medium tracking-[0.18em] text-slate-400 uppercase">
              AI-Powered Interview Preparation
            </p>

            <Sparkles className="h-4 w-4 text-cyan-400" />

          </div>

        </div>

        {/* ===================================================
            LOADING INDICATOR
        =================================================== */}

        <div
          className={`mt-10 transition-all duration-700 ${
            showTagline
              ? "opacity-100"
              : "opacity-0"
          }`}
        >

          <div className="flex items-center gap-2">

            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" />

            <div
              className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />

            <div
              className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          BOTTOM TEXT
      ===================================================== */}

      <div className="absolute bottom-8 left-0 right-0 text-center">

        <p className="text-xs tracking-wide text-slate-600">
          Prepare smarter. Interview better.
        </p>

      </div>

      {/* =====================================================
          ANIMATION
      ===================================================== */}

      <style jsx>{`
        @keyframes logoGlow {
          0%,
          100% {
            box-shadow:
              0 0 30px rgba(59, 130, 246, 0.2);
          }

          50% {
            box-shadow:
              0 0 60px rgba(59, 130, 246, 0.4);
          }
        }
      `}</style>

    </main>
  );
}