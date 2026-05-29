import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfile,
  changePassword,
  uploadAvatar,
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
    }: {
      file: File;
      contentType: string;
    }) => {
      const result = await uploadAvatar(file);
      return { s3_key: result.s3_key, public_url: result.public_url };
    },
  });
}
