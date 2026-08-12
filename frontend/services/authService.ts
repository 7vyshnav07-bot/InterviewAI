import api from "@/lib/api";

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/types/auth";


// ============================================================
// REGISTER RESPONSE
// ============================================================

export type RegisterResponse = {
  id: number;
  name: string;
  email: string;
};


// ============================================================
// FORGOT PASSWORD RESPONSE
// ============================================================

export type ForgotPasswordResponse = {
  message: string;
};


// ============================================================
// VERIFY RESET OTP RESPONSE
// ============================================================

export type VerifyResetOTPResponse = {
  message: string;
};


// ============================================================
// RESET PASSWORD REQUEST
// ============================================================

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
};


// ============================================================
// RESET PASSWORD RESPONSE
// ============================================================

export type ResetPasswordResponse = {
  message: string;
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


// ============================================================
// FORGOT PASSWORD
// ============================================================

export const forgotPassword = async (
  data: {
    email: string;
  }
): Promise<ForgotPasswordResponse> => {
  const response = await api.post(
    "/auth/forgot-password",
    data
  );

  return response.data;
};


// ============================================================
// VERIFY RESET OTP
// ============================================================

export const verifyResetOTP = async (
  data: {
    email: string;
    otp: string;
  }
): Promise<VerifyResetOTPResponse> => {
  const response = await api.post(
    "/auth/verify-reset-otp",
    data
  );

  return response.data;
};


// ============================================================
// RESET PASSWORD
// ============================================================

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await api.post(
    "/auth/reset-password",
    data
  );

  return response.data;
};
export type VerifyEmailResponse = {
  message: string;
};

export const verifyEmail = async (
  data: {
    email: string;
    otp: string;
  }
): Promise<VerifyEmailResponse> => {
  const response = await api.post(
    "/auth/verify-email",
    data
  );

  return response.data;
};
// ============================================================
// RESEND VERIFICATION OTP
// ============================================================

export type ResendVerificationOTPResponse = {
  message: string;
};

export const resendVerificationOTP = async (
  data: {
    email: string;
  }
): Promise<ResendVerificationOTPResponse> => {
  const response = await api.post(
    "/auth/resend-verification-otp",
    data
  );

  return response.data;
};