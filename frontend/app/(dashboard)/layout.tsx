"use client";
import AuthGuard from "@/components/AuthGuard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <AuthGuard>
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <main className="p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  </AuthGuard>
);
}