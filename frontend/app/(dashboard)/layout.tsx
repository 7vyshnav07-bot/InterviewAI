"use client";

import { useEffect } from "react";

import AuthGuard from "@/components/AuthGuard";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.documentElement.classList.toggle(
        "dark",
        prefersDark
      );
    }
  }, []);

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <Navbar />

          <main className="p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}