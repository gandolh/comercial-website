import React, { useRef } from "react";
import { Camera } from "lucide-react";
import { useAvatarUpload, useUpdateProfile } from "../hooks/useProfile";
import { useAuth } from "@core/lib/auth";

export function AvatarUploader() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useAvatarUpload();
  const updateProfileMutation = useUpdateProfile();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { s3_key } = await uploadMutation.mutateAsync({
        file,
        contentType: file.type,
      });

      await updateProfileMutation.mutateAsync({
        avatar_s3_key: s3_key,
      });
    } catch (error) {
      // eslint-disable-next-line no-console -- a developer diagnostic; the user is told through the UI
      console.error("Avatar upload failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-outline-variant bg-surface-container-high">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.display_name || "User"} className="h-full w-full object-cover" />
          ) : (
            <div className="text-4xl font-bold text-on-surface-variant">
              {user?.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-scrim/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-8 w-8 text-on-scrim" />
        </div>
        {uploadMutation.isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-scrim/20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
      <p className="text-sm text-on-surface-variant">Apasă pe imagine pentru a schimba avatarul</p>
    </div>
  );
}
