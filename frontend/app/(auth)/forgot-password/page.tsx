"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  forgotPassword,
  verifyResetOTP,
} from "@/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [otpSent, setOtpSent] = useState(false);

  // ============================================================
  // SEND OTP
  // ============================================================

  const handleSendOTP = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    // ----------------------------------------------------------
    // Validate email
    // ----------------------------------------------------------

    if (!trimmedEmail) {
      toast.error(
        "Please enter your email address."
      );
      return;
    }

    // Basic email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      toast.error(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({
        email: trimmedEmail,
      });

      // --------------------------------------------------------
      // OTP SENT
      // --------------------------------------------------------

      setOtpSent(true);

      toast.success(
        "If an account exists with this email, an OTP has been sent."
      );

    } catch (error: unknown) {
      console.error(
        "Forgot password error:",
        error
      );

      let message =
        "Unable to send OTP. Please try again.";

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
  // VERIFY OTP
  // ============================================================

  const handleVerifyOTP = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedOTP = otp.trim();
    const trimmedEmail = email.trim();

    // ----------------------------------------------------------
    // Validate OTP
    // ----------------------------------------------------------

    if (!trimmedOTP) {
      toast.error(
        "Please enter the OTP."
      );
      return;
    }

    if (!/^\d{6}$/.test(trimmedOTP)) {
      toast.error(
        "OTP must be exactly 6 digits."
      );
      return;
    }

    try {
      setVerifying(true);

      // --------------------------------------------------------
      // VERIFY OTP WITH BACKEND
      // --------------------------------------------------------

      await verifyResetOTP({
        email: trimmedEmail,
        otp: trimmedOTP,
      });

      // --------------------------------------------------------
      // SAVE VERIFIED RESET DATA
      // --------------------------------------------------------

      sessionStorage.setItem(
        "reset_email",
        trimmedEmail
      );

      sessionStorage.setItem(
        "reset_otp",
        trimmedOTP
      );

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      toast.success(
        "OTP verified successfully!"
      );

      router.push(
        "/reset-password"
      );

    } catch (error: unknown) {
      console.error(
        "OTP verification error:",
        error
      );

      let message =
        "Invalid or expired OTP.";

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
      setVerifying(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendOTP = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error(
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({
        email: trimmedEmail,
      });

      setOtp("");

      toast.success(
        "A new OTP has been sent to your email."
      );

    } catch (error: unknown) {
      console.error(
        "Resend OTP error:",
        error
      );

      toast.error(
        "Unable to resend OTP. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHANGE EMAIL
  // ============================================================

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp("");
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-8">

      <div className="w-full max-w-md">

        {/* ======================================================
            CARD
        ====================================================== */}

        <div className="rounded-2xl border border-blue-900/50 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">

          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/20 text-2xl">
              {otpSent ? "📩" : "🔐"}
            </div>

            <h1 className="text-3xl font-bold text-white">
              {otpSent
                ? "Verify OTP"
                : "Forgot Password?"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {otpSent
                ? "Enter the 6-digit verification code sent to your email."
                : "Enter your registered email address and we'll send you a verification code."}
            </p>

          </div>


          {/* ====================================================
              EMAIL FORM
          ==================================================== */}

          {!otpSent && (

            <form
              onSubmit={handleSendOTP}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>


              {/* SEND OTP */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}
              </button>

            </form>

          )}


          {/* ====================================================
              OTP FORM
          ==================================================== */}

          {otpSent && (

            <form
              onSubmit={handleVerifyOTP}
              className="space-y-5"
            >

              {/* EMAIL DISPLAY */}

              <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-3">

                <p className="text-xs text-slate-500">
                  OTP sent to
                </p>

                <p className="mt-1 truncate text-sm font-medium text-blue-300">
                  {email}
                </p>

              </div>


              {/* OTP */}

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
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="000000"
                  autoComplete="one-time-code"
                  disabled={verifying}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-center text-xs text-slate-500">
                  The OTP is valid for 10 minutes.
                </p>

              </div>


              {/* VERIFY */}

              <button
                type="submit"
                disabled={
                  verifying ||
                  otp.length !== 6
                }
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifying
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>


              {/* RESEND */}

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || verifying}
                className="w-full rounded-lg border border-blue-800 py-3 text-sm font-semibold text-blue-400 transition hover:bg-blue-950/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Sending..."
                  : "Resend OTP"}
              </button>


              {/* CHANGE EMAIL */}

              <button
                type="button"
                onClick={handleChangeEmail}
                disabled={verifying}
                className="w-full text-sm text-slate-400 transition hover:text-white disabled:opacity-50"
              >
                ← Use a different email
              </button>

            </form>

          )}


          {/* ====================================================
              BACK TO LOGIN
          ==================================================== */}

          <div className="mt-8 text-center">

            <Link
              href="/login"
              className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              ← Back to Login
            </Link>

          </div>

        </div>


        {/* ======================================================
            BRAND
        ====================================================== */}

        <p className="mt-6 text-center text-sm text-slate-500">
          InterviewAI
        </p>

      </div>

    </main>
  );
}