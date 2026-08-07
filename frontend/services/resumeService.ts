import api from "@/lib/api";

export const uploadResume = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/resume/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getLatestResume = async () => {
  const response = await api.get("/resume/latest");

  return response.data;
};
export const deleteResume = async () => {
  const response = await api.delete("/resume/delete");
  return response.data;
};