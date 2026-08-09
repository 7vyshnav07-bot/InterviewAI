import api from "@/lib/api";

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/types/auth";


export type RegisterResponse = {
  id: number;
  name: string;
  email: string;
};


// ============================================================
// LOGIN
// ============================================================

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {

  const formData = new URLSearchParams();

  formData.append(
    "username",
    data.email
  );

  formData.append(
    "password",
    data.password
  );

  const response = await api.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};


// ============================================================
// REGISTER
// ============================================================

export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {

  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};