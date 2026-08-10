"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { getCurrentUser } from "@/services/userService";

type User = {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();

        setUser(data);
      } catch (error) {
        console.error(
          "Failed to load navbar user:",
          error
        );
      }
    };

    loadUser();
  }, []);

  // ============================================================
  // PROFILE PICTURE URL
  // ============================================================

  const getProfilePictureUrl = (
    profilePicture: string | null
  ): string | null => {
    if (!profilePicture) {
      return null;
    }

    // Backend already returned a complete URL
    if (
      profilePicture.startsWith("http://") ||
      profilePicture.startsWith("https://")
    ) {
      return profilePicture;
    }

    // Backend returns something like:
    // /uploads/profile_pictures/3_example.png

    return `http://localhost:8000${
      profilePicture.startsWith("/")
        ? profilePicture
        : `/${profilePicture}`
    }`;
  };

  // ============================================================
  // PROFILE PICTURE
  // ============================================================

  const profilePictureUrl =
    getProfilePictureUrl(
      user?.profile_picture ?? null
    );

  // ============================================================
  // DEFAULT INITIAL
  // ============================================================

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "V";

  // ============================================================
  // NAVBAR
  // ============================================================

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">

      {/* ======================================================
          LEFT SIDE
      ====================================================== */}

      <div className="flex items-center gap-4">

        <SidebarTrigger />

        <h1 className="text-xl font-bold">
          InterviewAI
        </h1>

      </div>

      {/* ======================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="flex items-center gap-4">

        {/* SEARCH */}

        

        {/* NOTIFICATIONS */}

        

        {/* ==================================================
            PROFILE
        ================================================== */}

        <div
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 font-semibold text-white"
          title={user?.name || "Profile"}
        >

          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span>
              {userInitial}
            </span>
          )}

        </div>

      </div>

    </header>
  );
}