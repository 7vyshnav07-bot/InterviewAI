"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { resetPassword } from "@/services/authService";

export default function ResetPasswordPage() {
  const router = useRouter();

  // ============================================================
  // RESET DATA
  // ============================================================

  const [email] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return sessionStorage.getItem("reset_email") || "";
  });

  const [otp] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return sessionStorage.getItem("reset_otp") || "";
  });

  // ============================================================
  // PASSWORD STATE
  // ============================================================

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (!email || !otp) {
    toast.error("Your password reset session is invalid.");
    return;
  }

  if (!newPassword) {
    toast.error("Please enter a new password.");
    return;
  }

  if (newPassword.length < 8) {
    toast.error(
      "Password must be at least 8 characters long."
    );
    return;
  }

  if (!confirmPassword) {
    toast.error("Please confirm your new password.");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  setLoading(true);

  try {
    console.log("RESET PASSWORD REQUEST:", {
      email,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    const response = await resetPassword({
      email: email,
      otp: otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    console.log(
      "RESET PASSWORD RESPONSE:",
      response
    );

    sessionStorage.removeItem("reset_email");
    sessionStorage.removeItem("reset_otp");

    toast.success(
      "Password reset successfully!"
    );

    setTimeout(() => {
      router.push("/login");
    }, 1500);

  } catch (error: unknown) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    let message =
      "Failed to reset password. Please try again.";

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
  // INVALID SESSION
  // ============================================================

  if (!email || !otp) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4">

        <div className="w-full max-w-md">

          <div className="rounded-2xl border border-blue-900/50 bg-slate-900/95 p-8 text-center shadow-2xl backdrop-blur">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-600/20 text-2xl">
              ⚠️
            </div>

            <h1 className="text-2xl font-bold text-white">
              Reset Session Expired
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Your password reset session is missing
              or has expired. Please request a new OTP.
            </p>

            <Link
              href="/forgot-password"
              className="mt-6 block w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Request New OTP
            </Link>

            <Link
              href="/login"
              className="mt-4 block text-sm font-medium text-blue-400 transition hover:text-blue-300"
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
              🔑
            </div>

            <h1 className="text-3xl font-bold text-white">
              Reset Password
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Create a new password for your
              InterviewAI account.
            </p>

          </div>


          {/* ====================================================
              VERIFIED EMAIL
          ==================================================== */}

          <div className="mb-5 rounded-lg border border-blue-900/50 bg-blue-950/30 p-3">

            <p className="text-xs text-slate-500">
              Account
            </p>

            <p className="mt-1 truncate text-sm font-medium text-blue-300">
              {email}
            </p>

            <p className="mt-1 text-xs text-green-400">
              ✓ Email verified
            </p>

          </div>


          {/* ====================================================
              FORM
          ==================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* ==================================================
                NEW PASSWORD
            ================================================== */}

            <div>

              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                New Password
              </label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-1 text-xs text-slate-500">
                Password must be at least 8 characters.
              </p>

            </div>


            {/* ==================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div>

              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirm New Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>


            {/* ==================================================
                RESET BUTTON
            ================================================== */}
<button
  type="submit"
  disabled={loading}
  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading
    ? "Resetting Password..."
    : "Reset Password"}
</button>

          </form>


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