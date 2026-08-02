"use client";

import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <h1 className="text-xl font-bold">
          InterviewAI
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Search className="h-5 w-5 text-muted-foreground cursor-pointer" />

        <Bell className="h-5 w-5 text-muted-foreground cursor-pointer" />

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
          V
        </div>
      </div>
    </header>
  );
}