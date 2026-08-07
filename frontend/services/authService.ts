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

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};