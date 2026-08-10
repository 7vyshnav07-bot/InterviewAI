"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Mic,
  History,
  Settings,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Resume",
    url: "/resume",
    icon: FileText,
  },
  {
    title: "Interview",
    url: "/interview",
    icon: Mic,
  },
  {
    title: "History",
    url: "/history",
    icon: History,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <Sidebar>

      {/* HEADER */}
      <SidebarHeader>
        <div className="px-2 py-4">
          <h1 className="text-xl font-bold">
            InterviewAI
          </h1>
        </div>
      </SidebarHeader>

      {/* NAVIGATION */}
      <SidebarContent>
        <SidebarMenu>

          {items.map((item) => {
            const isActive =
              pathname === item.url ||
              pathname.startsWith(`${item.url}/`);

            return (
              <SidebarMenuItem key={item.title}>

                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.title}
                  onClick={() => {
                    router.push(item.url);
                  }}
                >
                  <item.icon />

                  <span>
                    {item.title}
                  </span>

                </SidebarMenuButton>

              </SidebarMenuItem>
            );
          })}

        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarMenu>

          <SidebarMenuItem>

            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
            >
              <LogOut />

              <span>
                Logout
              </span>

            </SidebarMenuButton>

          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}