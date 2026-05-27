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
      console.error("Avatar upload failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high border-2 border-outline-variant flex items-center justify-center">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl font-bold text-on-surface-variant">
              {user?.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="text-white w-8 h-8" />
        </div>
        {uploadMutation.isPending && (
          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
      <p className="text-sm text-on-surface-variant">
        Apasă pe imagine pentru a schimba avatarul
      </p>
    </div>
  );
}
