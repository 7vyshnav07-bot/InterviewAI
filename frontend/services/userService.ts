import api from "@/lib/api";

// ============================================================
// GET CURRENT USER
// ============================================================

export const getCurrentUser = async () => {
  const response = await api.get(
    "/users/me"
  );

  return response.data;
};

// ============================================================
// UPDATE PROFILE
// ============================================================

export const updateProfile = async (data: {
  name: string;
  email: string;
}) => {
  const response = await api.put(
    "/users/me",
    data
  );

  return response.data;
};
// ============================================================
// CHANGE PASSWORD
// ============================================================

export const changePassword = async (data: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) => {
  const response = await api.put(
    "/users/me/password",
    data
  );

  return response.data;
};
// ============================================================
// DELETE ACCOUNT
// ============================================================

export const deleteAccount = async () => {
  const response = await api.delete("/users/me");

  return response.data;
};
// ============================================================
// UPLOAD PROFILE PICTURE
// ============================================================

export const uploadProfilePicture = async (
  file: File
) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/users/me/profile-picture",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
// ============================================================
// REMOVE PROFILE PICTURE
// ============================================================

export const removeProfilePicture = async () => {
  const response = await api.delete(
    "/users/me/profile-picture"
  );

  return response.data;
};