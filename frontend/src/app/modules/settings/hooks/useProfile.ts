import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfile,
  changePassword,
  getAvatarUploadUrl,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
} from "../services/profile";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
}

export function useAvatarUpload() {
  return useMutation({
    mutationFn: async ({
      file,
      contentType,
    }: {
      file: File;
      contentType: string;
    }) => {
      const { upload_url, s3_key, public_url } = await getAvatarUploadUrl({
        content_type: contentType,
        filename: file.name,
      });

      await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": contentType,
        },
      });

      return { s3_key, public_url };
    },
  });
}
