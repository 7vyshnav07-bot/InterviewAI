"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  ArrowRight,
  MailCheck,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import {
  verifyEmail,
  resendVerificationOTP,
} from "@/services/authService";

export default function VerifyEmailPage() {
  const router = useRouter();

  // ============================================================
  // EMAIL
  // ============================================================

  const [email] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      sessionStorage.getItem(
        "verification_email"
      ) || ""
    );
  });

  // ============================================================
  // OTP
  // ============================================================

  const [otp, setOtp] = useState("");

  // ============================================================
  // LOADING STATES
  // ============================================================

  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  // ============================================================
  // RESEND COOLDOWN
  // ============================================================

  const [cooldown, setCooldown] = useState(0);

  // ============================================================
  // START COOLDOWN
  // ============================================================

  const startCooldown = () => {
    setCooldown(60);

    const interval = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  };

  // ============================================================
  // VERIFY EMAIL
  // ============================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // ----------------------------------------------------------
    // EMAIL CHECK
    // ----------------------------------------------------------

    if (!email) {
      toast.error(
        "Your verification session is invalid."
      );

      router.push("/register");
      return;
    }

    // ----------------------------------------------------------
    // OTP CHECK
    // ----------------------------------------------------------

    if (!otp) {
      toast.error(
        "Please enter the verification code."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error(
        "Verification code must be exactly 6 digits."
      );
      return;
    }

    // ----------------------------------------------------------
    // VERIFY
    // ----------------------------------------------------------

    try {
      setLoading(true);

      await verifyEmail({
        email,
        otp,
      });

      // --------------------------------------------------------
      // CLEAR VERIFICATION SESSION
      // --------------------------------------------------------

      sessionStorage.removeItem(
        "verification_email"
      );

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      toast.success(
        "Email verified successfully!"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1000);

    } catch (error: unknown) {
      console.error(
        "Email verification error:",
        error
      );

      let message =
        "Verification failed. Please try again.";

      // --------------------------------------------------------
      // FASTAPI ERROR
      // --------------------------------------------------------

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

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendOTP = async () => {
    // ----------------------------------------------------------
    // EMAIL CHECK
    // ----------------------------------------------------------

    if (!email) {
      toast.error(
        "Your verification session is invalid."
      );

      router.push("/register");
      return;
    }

    // ----------------------------------------------------------
    // COOLDOWN CHECK
    // ----------------------------------------------------------

    if (cooldown > 0) {
      toast.error(
        `Please wait ${cooldown} seconds before requesting another OTP.`
      );
      return;
    }

    // ----------------------------------------------------------
    // RESEND
    // ----------------------------------------------------------

    try {
      setResending(true);

      await resendVerificationOTP({
        email,
      });

      // --------------------------------------------------------
      // CLEAR OLD OTP
      // --------------------------------------------------------

      setOtp("");

      // --------------------------------------------------------
      // START 60 SECOND COOLDOWN
      // --------------------------------------------------------

      startCooldown();

      toast.success(
        "A new verification code has been sent to your email."
      );

    } catch (error: unknown) {
      console.error(
        "Resend OTP error:",
        error
      );

      let message =
        "Failed to resend OTP. Please try again.";

      // --------------------------------------------------------
      // FASTAPI ERROR
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

        if (response?.data?.detail) {
          message = response.data.detail;
        }
      }

      toast.error(message);

    } finally {
      setResending(false);
    }
  };

  // ============================================================
  // INVALID SESSION
  // ============================================================

  if (!email) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">

        {/* BACKGROUND */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-700/20 blur-[120px]" />

          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-700/10 blur-[120px]" />

        </div>

        {/* CARD */}

        <div className="relative z-10 w-full max-w-md">

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">

            {/* LOGO */}

            <div className="mb-6 flex items-center justify-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">

                <BrainCircuit className="h-6 w-6 text-white" />

              </div>

              <span className="text-xl font-bold text-white">
                InterviewAI
              </span>

            </div>

            {/* ICON */}

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">

              <MailCheck className="h-8 w-8 text-red-400" />

            </div>

            <h1 className="text-2xl font-bold text-white">
              Verification Session Expired
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Your verification session is missing.
              Please register again to receive a new
              verification code.
            </p>

            <Link
              href="/register"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-cyan-500"
            >
              Back to Registration

              <ArrowRight className="h-4 w-4" />

            </Link>

            <Link
              href="/login"
              className="mt-5 block text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              ← Back to Login
            </Link>

          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            InterviewAI
          </p>

        </div>

      </main>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-700/20 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-700/10 blur-[120px]" />

        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      </div>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* ==================================================
              CARD
          ================================================== */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">

            {/* ==================================================
                LOGO
            ================================================== */}

            <div className="mb-8 flex items-center justify-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">

                <BrainCircuit className="h-6 w-6 text-white" />

              </div>

              <span className="text-xl font-bold text-white">
                InterviewAI
              </span>

            </div>

            {/* ==================================================
                ICON
            ================================================== */}

            <div className="mb-6 flex justify-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20">

                <MailCheck className="h-8 w-8 text-blue-400" />

              </div>

            </div>

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-8 text-center">

              <p className="mb-2 text-sm font-semibold text-blue-400">
                Almost there ✨
              </p>

              <h1 className="text-3xl font-bold text-white">
                Verify your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                We've sent a 6-digit verification code
                to your email address.
              </p>

            </div>

            {/* ==================================================
                EMAIL
            ================================================== */}

            <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-center">

              <div className="mb-2 flex items-center justify-center gap-2">

                <ShieldCheck className="h-4 w-4 text-green-400" />

                <span className="text-xs text-slate-400">
                  Verification code sent to
                </span>

              </div>

              <p className="truncate text-sm font-semibold text-blue-300">
                {email}
              </p>

            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* ==================================================
                  OTP
              ================================================== */}

              <div>

                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Verification Code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    const value =
                      event.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setOtp(value);
                  }}
                  placeholder="000000"
                  disabled={loading || resending}
                  autoFocus
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-4 text-center font-mono text-2xl font-bold tracking-[0.5em] text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-center text-xs text-slate-500">
                  Your verification code expires after 10 minutes.
                </p>

              </div>

              {/* ==================================================
                  VERIFY BUTTON
              ================================================== */}

              <button
                type="submit"
                disabled={
                  loading ||
                  resending ||
                  otp.length !== 6
                }
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}

              </button>

            </form>

            {/* ==================================================
                RESEND OTP
            ================================================== */}

            <div className="mt-6 text-center">

              <p className="text-sm text-slate-500">
                Didn't receive the code?
              </p>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={
                  loading ||
                  resending ||
                  cooldown > 0
                }
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {resending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />

                    Sending new code...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw className="h-4 w-4" />

                    Resend available in {cooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />

                    Resend OTP
                  </>
                )}

              </button>

            </div>

            {/* ==================================================
                BACK TO REGISTER
            ================================================== */}

            <div className="mt-7 text-center">

              <Link
                href="/register"
                className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                ← Back to registration
              </Link>

            </div>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <p className="mt-6 text-center text-sm text-slate-500">
            InterviewAI
          </p>

        </div>

      </div>

    </main>
  );
}