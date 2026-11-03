import { axiosInstance } from "@core/lib/axios";
import type { User } from "@core/lib/auth";

export interface AuthResponse {
  token: string;
  user: User;
}


export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}

export async function verifyEmail(token: string): Promise<void> {
  await axiosInstance.post("/auth/email/verify", { token });
}

export async function resendVerification(): Promise<void> {
  await axiosInstance.post("/auth/email/resend");
}


