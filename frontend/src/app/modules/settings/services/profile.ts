import { axiosInstance } from "@core/lib/axios";

export interface UpdateProfileRequest {
  display_name?: string;
  avatar_s3_key?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UploadUrlRequest {
  content_type: string;
  filename: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  public_url: string;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  await axiosInstance.patch("/users/me", data);
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await axiosInstance.patch("/users/me/password", data);
}

export async function getAvatarUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
  const res = await axiosInstance.post("/users/me/avatar/upload-url", data);
  return res.data;
}
