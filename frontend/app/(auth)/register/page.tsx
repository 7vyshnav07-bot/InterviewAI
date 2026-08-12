"use client";

import { toast } from "sonner";
import { registerUser } from "@/services/authService";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const password = watch("password");

  // ============================================================
  // REGISTER
  // ============================================================
const onSubmit = async (data: RegisterForm) => {
  try {
    const email = data.email.trim();

    await registerUser({
      name: data.name.trim(),
      email,
      password: data.password,
    });

    // Save email so the verification page knows
    // which account is being verified.
    sessionStorage.setItem(
      "verification_email",
      email
    );

    toast.success(
      "Account created! Check your email for the verification OTP."
    );

    setTimeout(() => {
      router.push("/verify-email");
    }, 800);

  } catch (error: unknown) {
      console.error("Registration error:", error);

      let message =
        "Registration failed. Please try again.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (
          error as {
            response?: {
              data?: {
                detail?: string;
              };
            };
          }
        ).response;

        if (response?.data?.detail) {
          message = response.data.detail;
        }
      }

      toast.error(message);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        {/* Blue glow */}

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-700/20 blur-[120px]" />

        {/* Cyan glow */}

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-700/10 blur-[120px]" />

        {/* Center glow */}

        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      </div>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-2">

          {/* ==================================================
              LEFT PANEL
          ================================================== */}

          <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-10 lg:flex">

            <div>

              {/* LOGO */}

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">

                  <BrainCircuit className="h-6 w-6 text-white" />

                </div>

                <span className="text-xl font-bold text-white">
                  InterviewAI
                </span>

              </div>

              {/* HERO */}

              <div className="mt-24">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400">

                  <Sparkles className="h-4 w-4" />

                  Your interview journey starts here

                </div>

                <h1 className="max-w-md text-4xl font-bold leading-tight text-white">

                  Build confidence.
                  <br />

                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Land your dream job.
                  </span>

                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-slate-400">

                  Create your InterviewAI account and
                  start practicing smarter with
                  personalized AI-powered interviews.

                </p>

              </div>

              {/* FEATURES */}

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="h-5 w-5 text-blue-400" />

                  <span className="text-sm text-slate-300">
                    Practice AI-powered interviews
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="h-5 w-5 text-blue-400" />

                  <span className="text-sm text-slate-300">
                    Get personalized feedback
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="h-5 w-5 text-blue-400" />

                  <span className="text-sm text-slate-300">
                    Track your interview performance
                  </span>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <div className="h-2 w-2 rounded-full bg-green-400" />

              Your AI interview companion

            </div>

          </div>

          {/* ==================================================
              REGISTER PANEL
          ================================================== */}

          <div className="bg-slate-900 p-7 sm:p-10">

            {/* MOBILE LOGO */}

            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">

                <BrainCircuit className="h-5 w-5 text-white" />

              </div>

              <span className="text-xl font-bold text-white">
                InterviewAI
              </span>

            </div>

            {/* HEADER */}

            <div className="mb-7">

              <p className="mb-2 text-sm font-semibold text-blue-400">
                Get started ✨
              </p>

              <h2 className="text-3xl font-bold text-white">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Start preparing for your next interview.
              </p>

            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >

              {/* NAME */}

              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message:
                        "Name must be at least 2 characters",
                    },
                  })}
                  className={`w-full rounded-xl border bg-slate-800 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                    errors.name
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  }`}
                />

                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.name.message}
                  </p>
                )}

              </div>

              {/* EMAIL */}

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
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message:
                        "Please enter a valid email address",
                    },
                  })}
                  className={`w-full rounded-xl border bg-slate-800 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                    errors.email
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  }`}
                />

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  {...register("password", {
  required: "Password is required",

  minLength: {
    value: 8,
    message:
      "Password must be at least 8 characters",
  },

  validate: (value) => {
    if (!/[A-Z]/.test(value)) {
      return "Password must contain an uppercase letter";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain a lowercase letter";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain a number";
    }

    return true;
  },
})}
                  className={`w-full rounded-xl border bg-slate-800 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                    errors.password
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  }`}
                />

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}

                {!errors.password && (
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
  Use at least 8 characters with an uppercase letter,
  lowercase letter, and number.
</p>
                )}

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  {...register("confirmPassword", {
                    required:
                      "Please confirm your password",
                    validate: (value) =>
                      value === password ||
                      "Passwords do not match",
                  })}
                  className={`w-full rounded-xl border bg-slate-800 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                    errors.confirmPassword
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  }`}
                />

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}

              </div>

              {/* REGISTER BUTTON */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Creating account...
                  </>
                ) : (
                  <>
                    Create account

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}

              </button>

            </form>

            {/* DIVIDER */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-700" />

              <span className="text-xs text-slate-500">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-700" />

            </div>

            {/* LOGIN LINK */}

            <p className="text-center text-sm text-slate-400">

              Already have an account?{" "}

              <Link
                href="/login"
                className="font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Sign in
              </Link>

            </p>

            {/* FOOTER */}

            <p className="mt-8 text-center text-xs text-slate-500">
              By creating an account, you agree to use
              InterviewAI responsibly.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}