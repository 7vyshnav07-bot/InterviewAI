"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
  uploadProfilePicture,
  removeProfilePicture,
} from "@/services/userService";

type User = {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
};

type ToastState = {
  message: string;
  type: "success" | "error";
};

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const router = useRouter();

  // ============================================================
  // USER
  // ============================================================

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  // ============================================================
  // PROFILE PICTURE
  // ============================================================

  const [uploadingPicture, setUploadingPicture] =
    useState(false);

  // ============================================================
  // EDIT PROFILE
  // ============================================================

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [savingProfile, setSavingProfile] =
    useState(false);

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [savingPassword, setSavingPassword] =
    useState(false);

  // ============================================================
  // TOAST
  // ============================================================

  const [toast, setToast] =
    useState<ToastState | null>(null);

  // ============================================================
  // THEME
  // ============================================================

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const savedTheme =
      localStorage.getItem("theme");

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      return savedTheme;
    }

    return "system";
  });

  // ============================================================
  // DELETE ACCOUNT
  // ============================================================

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [deletingAccount, setDeletingAccount] =
    useState(false);

  // ============================================================
  // LOAD USER
  // ============================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();

        setUser(data);

        setName(data.name || "");

        setEmail(data.email || "");
      } catch (error) {
        console.error(
          "Failed to load user:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ============================================================
  // TOAST AUTO HIDE
  // ============================================================

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  // ============================================================
  // ERROR MESSAGE HELPER
  // ============================================================

  const getErrorMessage = (
    error: unknown,
    fallback: string
  ): string => {
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
        return response.data.detail;
      }
    }

    return fallback;
  };

  // ============================================================
  // PROFILE PICTURE URL
  // ============================================================

  const getProfilePictureUrl = (
    profilePicture: string | null
  ): string | null => {
    if (!profilePicture) {
      return null;
    }

    // Backend already returned complete URL
    if (
      profilePicture.startsWith("http://") ||
      profilePicture.startsWith("https://")
    ) {
      return profilePicture;
    }

    // Backend normally returns:
    // /uploads/profile_pictures/example.png

    return `http://localhost:8000${
      profilePicture.startsWith("/")
        ? profilePicture
        : `/${profilePicture}`
    }`;
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    router.push("/login");
  };

  // ============================================================
  // PROFILE PICTURE UPLOAD
  // ============================================================

  const handleProfilePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE FILE TYPE
    // ----------------------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setToast({
        message:
          "Please select a JPG, PNG, or WEBP image.",
        type: "error",
      });

      event.target.value = "";

      return;
    }

    // ----------------------------------------------------------
    // VALIDATE FILE SIZE
    // ----------------------------------------------------------

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setToast({
        message:
          "Profile picture must be smaller than 5 MB.",
        type: "error",
      });

      event.target.value = "";

      return;
    }

    // ----------------------------------------------------------
    // UPLOAD
    // ----------------------------------------------------------

    try {
      setUploadingPicture(true);

      const updatedUser =
        await uploadProfilePicture(file);

      setUser(updatedUser);

      setToast({
        message:
          "Profile picture updated successfully.",
        type: "success",
      });
    } catch (error: unknown) {
      console.error(
        "Failed to upload profile picture:",
        error
      );

      setToast({
        message: getErrorMessage(
          error,
          "Failed to upload profile picture. Please try again."
        ),
        type: "error",
      });
    } finally {
      setUploadingPicture(false);

      // Allow selecting the same file again
      event.target.value = "";
    }
  };

  // ============================================================
  // REMOVE PROFILE PICTURE
  // ============================================================

  const handleRemoveProfilePicture =
    async () => {
      if (!user?.profile_picture) {
        return;
      }

      try {
        setUploadingPicture(true);

        const updatedUser =
          await removeProfilePicture();

        setUser(updatedUser);

        setToast({
          message:
            "Profile picture removed successfully.",
          type: "success",
        });
      } catch (error: unknown) {
        console.error(
          "Failed to remove profile picture:",
          error
        );

        setToast({
          message: getErrorMessage(
            error,
            "Failed to remove profile picture. Please try again."
          ),
          type: "error",
        });
      } finally {
        setUploadingPicture(false);
      }
    };

  // ============================================================
  // EDIT PROFILE
  // ============================================================

  const handleEditProfile = () => {
    if (!user) {
      return;
    }

    setName(user.name);

    setEmail(user.email);

    setEditingProfile(true);
  };

  // ============================================================
  // CANCEL PROFILE EDIT
  // ============================================================

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name);

      setEmail(user.email);
    }

    setEditingProfile(false);
  };

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const handleSaveProfile = async () => {
    const trimmedName =
      name.trim();

    const trimmedEmail =
      email.trim();

    if (!trimmedName) {
      setToast({
        message:
          "Name cannot be empty.",
        type: "error",
      });

      return;
    }

    if (!trimmedEmail) {
      setToast({
        message:
          "Email cannot be empty.",
        type: "error",
      });

      return;
    }

    try {
      setSavingProfile(true);

      const updatedUser =
        await updateProfile({
          name: trimmedName,
          email: trimmedEmail,
        });

      setUser(updatedUser);

      setName(
        updatedUser.name
      );

      setEmail(
        updatedUser.email
      );

      setEditingProfile(false);

      setToast({
        message:
          "Profile updated successfully.",
        type: "success",
      });
    } catch (error: unknown) {
      console.error(
        "Failed to update profile:",
        error
      );

      setToast({
        message: getErrorMessage(
          error,
          "Failed to update profile. Please try again."
        ),
        type: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleChangePassword =
    async () => {
      if (!currentPassword) {
        setToast({
          message:
            "Please enter your current password.",
          type: "error",
        });

        return;
      }

      if (!newPassword) {
        setToast({
          message:
            "Please enter a new password.",
          type: "error",
        });

        return;
      }

      if (newPassword.length < 8) {
        setToast({
          message:
            "New password must be at least 8 characters long.",
          type: "error",
        });

        return;
      }

      if (!confirmPassword) {
        setToast({
          message:
            "Please confirm your new password.",
          type: "error",
        });

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setToast({
          message:
            "New passwords do not match.",
          type: "error",
        });

        return;
      }

      try {
        setSavingPassword(true);

        await changePassword({
          current_password:
            currentPassword,

          new_password:
            newPassword,

          confirm_password:
            confirmPassword,
        });

        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");

        setChangingPassword(false);

        setToast({
          message:
            "Password changed successfully.",
          type: "success",
        });
      } catch (error: unknown) {
        console.error(
          "Failed to change password:",
          error
        );

        setToast({
          message: getErrorMessage(
            error,
            "Failed to change password. Please try again."
          ),
          type: "error",
        });
      } finally {
        setSavingPassword(false);
      }
    };

  // ============================================================
  // CANCEL PASSWORD CHANGE
  // ============================================================

  const handleCancelPasswordChange =
    () => {
      setChangingPassword(false);

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");
    };

  // ============================================================
  // DELETE ACCOUNT
  // ============================================================

  const handleDeleteAccount =
    async () => {
      try {
        setDeletingAccount(true);

        await deleteAccount();

        localStorage.removeItem(
          "token"
        );

        setShowDeleteConfirm(
          false
        );

        router.push("/login");
      } catch (error: unknown) {
        console.error(
          "Failed to delete account:",
          error
        );

        setToast({
          message: getErrorMessage(
            error,
            "Failed to delete account. Please try again."
          ),
          type: "error",
        });

        setDeletingAccount(false);
      }
    };

  // ============================================================
  // THEME
  // ============================================================

  const handleThemeChange = (
    value: Theme
  ) => {
    setTheme(value);

    localStorage.setItem(
      "theme",
      value
    );

    if (value === "dark") {
      document.documentElement.classList.add(
        "dark"
      );
    } else if (
      value === "light"
    ) {
      document.documentElement.classList.remove(
        "dark"
      );
    } else {
      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      document.documentElement.classList.toggle(
        "dark",
        prefersDark
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">

        <div>
          <h1 className="text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-2 text-muted-foreground">
            Loading your account settings...
          </p>
        </div>

        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />

        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />

        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />

      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="mx-auto max-w-4xl space-y-8">

      {/* ======================================================
          TOAST
      ====================================================== */}

      {toast && (
        <div
          className={`fixed right-6 top-6 z-[100] rounded-lg border px-5 py-4 shadow-lg ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-3">

            <span className="font-medium">
              {toast.message}
            </span>

            <button
              onClick={() =>
                setToast(null)
              }
              className="text-sm font-bold opacity-70 hover:opacity-100"
            >
              ×
            </button>

          </div>
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your InterviewAI account and preferences.
        </p>
      </div>

      {/* ======================================================
          PROFILE
      ====================================================== */}

      <section className="rounded-xl border bg-card p-6 shadow-sm">

        {/* PROFILE HEADER */}

        <div className="flex items-center gap-3">

          

          <div>
            <h2 className="text-xl font-bold">
              Profile
            </h2>

            <p className="text-sm text-muted-foreground">
              Your account information.
            </p>
          </div>

        </div>

        {/* ====================================================
            PROFILE PICTURE
        ==================================================== */}

        <div className="mt-6 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">

          {/* LARGE PROFILE PICTURE */}

          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-4xl">

            {getProfilePictureUrl(
              user?.profile_picture ??
                null
            ) ? (
              <img
                src={
                  getProfilePictureUrl(
                    user?.profile_picture ??
                      null
                  ) ?? ""
                }
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>👤</span>
            )}

          </div>

          {/* PICTURE CONTROLS */}

          <div className="flex-1">

            <p className="font-semibold">
              Profile Picture
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Upload a profile picture for your InterviewAI account.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WEBP • Maximum 5 MB
            </p>

            <div className="mt-3 flex flex-wrap gap-3">

              {/* CHOOSE PICTURE */}

              <label
                htmlFor="profile-picture"
                className={`inline-flex cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 ${
                  uploadingPicture
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
              >
                {uploadingPicture
                  ? "Uploading..."
                  : "Choose Picture"}

                <input
                  id="profile-picture"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={
                    handleProfilePictureChange
                  }
                  disabled={
                    uploadingPicture
                  }
                />
              </label>

              {/* REMOVE PICTURE */}

              {user?.profile_picture && (
                <button
                  type="button"
                  onClick={
                    handleRemoveProfilePicture
                  }
                  disabled={
                    uploadingPicture
                  }
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingPicture
                    ? "Removing..."
                    : "Remove Picture"}
                </button>
              )}

            </div>

          </div>

        </div>

        {/* ====================================================
            PROFILE INFORMATION
        ==================================================== */}

        {!editingProfile ? (

          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              {/* NAME */}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>

                <p className="mt-1 text-base font-semibold">
                  {user?.name ||
                    "Not available"}
                </p>
              </div>

              {/* EMAIL */}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>

                <p className="mt-1 text-base font-semibold">
                  {user?.email ||
                    "Not available"}
                </p>
              </div>

            </div>

            {/* EDIT PROFILE */}

            <button
              onClick={
                handleEditProfile
              }
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </>

        ) : (

          <div className="mt-6 space-y-5">

            {/* NAME */}

            <div>
              <label
                htmlFor="profile-name"
                className="text-sm font-medium"
              >
                Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter your name"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="profile-email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter your email"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                onClick={
                  handleSaveProfile
                }
                disabled={
                  savingProfile
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                onClick={
                  handleCancelEdit
                }
                disabled={
                  savingProfile
                }
                className="rounded-lg border px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </div>

        )}

      </section>

      {/* ======================================================
          APPEARANCE
      ====================================================== */}

      <section className="rounded-xl border bg-card p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-xl">
            🎨
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Appearance
            </h2>

            <p className="text-sm text-muted-foreground">
              Customize how InterviewAI looks.
            </p>
          </div>

        </div>

        <div className="mt-6 flex items-center gap-6">

          <label
            htmlFor="theme"
            className="shrink-0 text-sm font-medium"
          >
            Theme
          </label>

          <select
            id="theme"
            value={theme}
            onChange={(event) =>
              handleThemeChange(
                event.target.value as Theme
              )
            }
            className="w-full max-w-xs rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >

            <option value="system">
              System
            </option>

            <option value="light">
              Light
            </option>

            <option value="dark">
              Dark
            </option>

          </select>

        </div>

      </section>

      {/* ======================================================
          SECURITY
      ====================================================== */}

      <section className="rounded-xl border bg-card p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl">
            🔐
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Security
            </h2>

            <p className="text-sm text-muted-foreground">
              Manage your account security.
            </p>
          </div>

        </div>

        <div className="mt-6 space-y-4">

          {/* ==================================================
              PASSWORD
          ================================================== */}

          <div className="rounded-lg border p-4">

            {!changingPassword ? (

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="font-semibold">
                    Password
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Change your account password.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setChangingPassword(
                      true
                    )
                  }
                  className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
                >
                  Change Password
                </button>

              </div>

            ) : (

              <div>

                <div>

                  <p className="font-semibold">
                    Change Password
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your current password and choose a new one.
                  </p>

                </div>

                <div className="mt-5 space-y-4">

                  {/* CURRENT PASSWORD */}

                  <div>

                    <label
                      htmlFor="current-password"
                      className="text-sm font-medium"
                    >
                      Current Password
                    </label>

                    <input
                      id="current-password"
                      type="password"
                      value={
                        currentPassword
                      }
                      onChange={(event) =>
                        setCurrentPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter current password"
                      className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />

                  </div>

                  {/* NEW PASSWORD */}

                  <div>

                    <label
                      htmlFor="new-password"
                      className="text-sm font-medium"
                    >
                      New Password
                    </label>

                    <input
                      id="new-password"
                      type="password"
                      value={
                        newPassword
                      }
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter new password"
                      className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />

                    <p className="mt-1 text-xs text-muted-foreground">
                      Must be at least 8 characters.
                    </p>

                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium"
                    >
                      Confirm New Password
                    </label>

                    <input
                      id="confirm-password"
                      type="password"
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="mt-5 flex gap-3">

                  <button
                    onClick={
                      handleChangePassword
                    }
                    disabled={
                      savingPassword
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingPassword
                      ? "Changing..."
                      : "Change Password"}
                  </button>

                  <button
                    onClick={
                      handleCancelPasswordChange
                    }
                    disabled={
                      savingPassword
                    }
                    className="rounded-lg border px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                </div>

              </div>

            )}

          </div>

          {/* ==================================================
              LOGOUT
          ================================================== */}

          <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="font-semibold">
                Logout
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Sign out of your InterviewAI account.
              </p>

            </div>

            <button
              onClick={
                handleLogout
              }
              className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              Logout
            </button>

          </div>

          {/* ==================================================
              DELETE ACCOUNT
          ================================================== */}

          <div className="flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="font-semibold text-red-700">
                Delete Account
              </p>

              <p className="mt-1 text-sm text-red-600">
                Permanently delete your account and data.
              </p>

            </div>

            <button
              onClick={() =>
                setShowDeleteConfirm(
                  true
                )
              }
              disabled={
                deletingAccount
              }
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete Account
            </button>

          </div>

        </div>

      </section>

      {/* ======================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {showDeleteConfirm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl">

            <h2 className="text-xl font-bold">
              Delete Account?
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This action cannot be undone. Your InterviewAI
              account and associated data will be permanently
              deleted.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
                disabled={
                  deletingAccount
                }
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleDeleteAccount
                }
                disabled={
                  deletingAccount
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAccount
                  ? "Deleting..."
                  : "Yes, Delete Account"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}