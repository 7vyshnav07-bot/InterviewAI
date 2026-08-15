"use client";

import InterviewAILogo from "@/components/InterviewAILogo";

import { useState } from "react";
import { toast } from "sonner";
import { login } from "@/services/authService";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  // ============================================================
  // PASSWORD VISIBILITY
  // ============================================================

  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // UNVERIFIED EMAIL
  // ============================================================

  const [unverifiedEmail, setUnverifiedEmail] =
    useState<string | null>(null);

  // ============================================================
  // FORM
  // ============================================================

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  // ============================================================
  // LOGIN
  // ============================================================

  const onSubmit = async (data: LoginForm) => {
    try {
      setUnverifiedEmail(null);

    const response = await login({
  email: data.email.trim(),
  password: data.password,
});

console.log("LOGIN RESPONSE:", response);
console.log("ACCESS TOKEN:", response.access_token);
      // --------------------------------------------------------
      // STORE TOKEN
      // --------------------------------------------------------

      localStorage.setItem(
        "token",
        response.access_token
      );

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      toast.success("Login successful!");

      router.push("/dashboard");

    } catch (error: unknown) {
      console.error(
        "Login error:",
        error
      );

      let message =
        "Invalid email or password.";

      let statusCode: number | undefined;

      // --------------------------------------------------------
      // AXIOS ERROR
      // --------------------------------------------------------

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (
          error as {
            response?: {
              status?: number;
              data?: {
                detail?: string;
              };
            };
          }
        ).response;

        statusCode = response?.status;

        if (response?.data?.detail) {
          message = response.data.detail;
        }
      }

      // --------------------------------------------------------
      // UNVERIFIED EMAIL
      // --------------------------------------------------------

      if (statusCode === 403) {
        setUnverifiedEmail(
          data.email.trim()
        );

        toast.error(
          "Please verify your email before logging in."
        );

        return;
      }

      // --------------------------------------------------------
      // NORMAL LOGIN ERROR
      // --------------------------------------------------------

      toast.error(message);
    }
  };

  // ============================================================
  // GO TO VERIFICATION
  // ============================================================

  const handleVerifyEmail = () => {
    if (!unverifiedEmail) {
      return;
    }

    sessionStorage.setItem(
      "verification_email",
      unverifiedEmail
    );

    router.push("/verify-email");
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* ======================================================
          BACKGROUND EFFECTS
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        {/* Blue glow */}

        <div className="absolute left-[-10%] top-[-10%] h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[120px]" />

        {/* Purple glow */}

        <div className="absolute bottom-[-10%] right-[-10%] h-[450px] w-[450px] rounded-full bg-purple-600/20 blur-[140px]" />

        {/* Cyan center glow */}

        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl lg:grid-cols-2">

          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20 p-10 lg:flex">

            <div>

              {/* =================================================
                  LOGO
              ================================================= */}

              <InterviewAILogo size="md" />

              {/* =================================================
                  HERO
              ================================================= */}

              <div className="mt-24">

                {/* BADGE */}

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-300">

                  <Sparkles className="h-4 w-4" />

                  AI-powered interview preparation

                </div>

                {/* HEADING */}

                <h1 className="max-w-md text-4xl font-bold leading-tight text-white">

                  Prepare smarter.

                  <br />

                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">

                    Interview better.

                  </span>

                </h1>

                {/* DESCRIPTION */}

                <p className="mt-5 max-w-md text-base leading-7 text-slate-400">

                  Practice realistic interviews, improve
                  your answers, and build the confidence
                  you need to land your next opportunity.

                </p>

              </div>

            </div>

            {/* =================================================
                BOTTOM
            ================================================= */}

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <div className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />

              AI Interview Platform

            </div>

          </div>

          {/* ==================================================
              RIGHT SIDE — LOGIN
          ================================================== */}

          <div className="p-7 sm:p-10">

            {/* =================================================
                MOBILE LOGO
            ================================================= */}

            <div className="mb-10 flex justify-center lg:hidden">

              <InterviewAILogo size="sm" />

            </div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-8">

              <p className="mb-2 text-sm font-medium text-blue-400">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold text-white">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Continue your interview preparation.
              </p>

            </div>

            {/* =================================================
                UNVERIFIED EMAIL MESSAGE
            ================================================= */}

            {unverifiedEmail && (

              <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">

                <div className="flex gap-3">

                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />

                  <div className="flex-1">

                    <p className="text-sm font-semibold text-yellow-300">
                      Email verification required
                    </p>

                    <p className="mt-1 text-xs leading-5 text-yellow-200/70">
                      Please verify your email before
                      signing in to InterviewAI.
                    </p>

                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      className="mt-3 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                    >
                      Verify email →
                    </button>

                  </div>

                </div>

              </div>

            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >

              {/* =================================================
                  EMAIL
              ================================================= */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  {...register("email", {
                    required:
                      "Email is required",

                    pattern: {
                      value:
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                      message:
                        "Please enter a valid email address",
                    },
                  })}
                  className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                    errors.email
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  }`}
                />

                {errors.email && (

                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.email.message}
                  </p>

                )}

              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>

                </div>

                {/* PASSWORD INPUT */}

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    {...register("password", {
                      required:
                        "Password is required",
                    })}
                    className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                      errors.password
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                  />

                  {/* SHOW / HIDE */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={isSubmitting}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
                  >

                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}

                  </button>

                </div>

                {errors.password && (

                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.password.message}
                  </p>

                )}

              </div>

              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isSubmitting ? (

                  <>

                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Signing in...

                  </>

                ) : (

                  <>

                    Sign in

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                  </>

                )}

              </button>

            </form>

            {/* =================================================
                REGISTER
            ================================================= */}

            <div className="my-8 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-slate-600">
                OR
              </span>

              <div className="h-px flex-1 bg-white/10" />

            </div>

            <p className="text-center text-sm text-slate-400">

              Dont have an account?{" "}

              <Link
                href="/register"
                className="font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Create one
              </Link>

            </p>

            {/* =================================================
                FOOTER
            ================================================= */}

            <p className="mt-10 text-center text-xs text-slate-600">
              © {new Date().getFullYear()} InterviewAI
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}