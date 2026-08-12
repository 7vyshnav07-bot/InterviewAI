"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const hasToken =
    typeof window !== "undefined" &&
    !!localStorage.getItem("token");

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login");
    }
  }, [hasToken, router]);

  // ------------------------------------------------------------
  // NO TOKEN
  // ------------------------------------------------------------

  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Checking authentication...
          </p>

        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // TOKEN EXISTS
  // ------------------------------------------------------------

  return <>{children}</>;
}