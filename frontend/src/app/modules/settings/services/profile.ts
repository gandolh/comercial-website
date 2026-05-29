import { axiosInstance } from "@core/lib/axios";

export interface UpdateProfileRequest {
  display_name?: string;
  avatar_s3_key?: string;
  email_notifications?: boolean;
  bio?: string | null;
  website?: string | null;
  social_twitter?: string | null;
  social_instagram?: string | null;
  social_github?: string | null;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AvatarUploadResponse {
  public_url: string;
  s3_key: string;
}

export interface UploadAvatarOptions {
  onUploadProgress?: (progress: number) => void;
}

/**
 * Update profile data.
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  await axiosInstance.patch("/users/me", data);
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await axiosInstance.patch("/users/me/password", data);
}

/**
 * Upload a new avatar image via multipart/form-data (single-step).
 * Backend: POST /users/me/avatar
 * Response: { public_url, s3_key }
 */
export async function uploadAvatar(
  file: File,
  options?: UploadAvatarOptions,
): Promise<AvatarUploadResponse> {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await axiosInstance.post<AvatarUploadResponse>(
    "/users/me/avatar",
    form,
    {
      onUploadProgress: (event) => {
        if (!options?.onUploadProgress || !event.total) return;
        const progress = Math.round((event.loaded * 100) / event.total);
        options.onUploadProgress(progress);
      },
    },
  );

  return res.data;
}
