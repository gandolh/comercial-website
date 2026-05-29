import React, { useState, useEffect } from "react";
import { useUpdateProfile } from "../hooks/useProfile";
import type { UpdateProfileRequest } from "../services/profile";
import { useAuth } from "@core/lib/auth";
import { Input, Button, Textarea } from "@core/components/ui";
import PhoneVerifyModal from "@app/modules/auth/components/PhoneVerifyModal";
import { useTranslation } from "react-i18next";

/** Extended request type with seller profile fields. */
interface ExtendedUpdateProfileRequest extends UpdateProfileRequest {
  bio?: string | null;
  website?: string | null;
  social_twitter?: string | null;
  social_instagram?: string | null;
  social_github?: string | null;
}

/** Extended User type with seller profile fields not yet in core auth.ts. */
interface ExtendedUser {
  display_name?: string | null;
  email?: string;
  phone?: string | null;
  phone_verified?: boolean;
  bio?: string | null;
  website?: string | null;
  social_twitter?: string | null;
  social_instagram?: string | null;
  social_github?: string | null;
}

export function ProfileSection() {
  const { user: _user } = useAuth();
  const user = _user as (typeof _user & ExtendedUser) | null;
  const { t } = useTranslation();

  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [bio, setBio] = useState<string>(user?.bio || "");
  const [website, setWebsite] = useState<string>(user?.website || "");
  const [socialTwitter, setSocialTwitter] = useState<string>(user?.social_twitter || "");
  const [socialInstagram, setSocialInstagram] = useState<string>(user?.social_instagram || "");
  const [socialGithub, setSocialGithub] = useState<string>(user?.social_github || "");
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const updateProfileMutation = useUpdateProfile();

  // Keep form in sync if user object updates (e.g. after hydration)
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setBio(user.bio || "");
      setWebsite(user.website || "");
      setSocialTwitter(user.social_twitter || "");
      setSocialInstagram(user.social_instagram || "");
      setSocialGithub(user.social_github || "");
    }
  }, [user?.display_name, user?.bio, user?.website, user?.social_twitter, user?.social_instagram, user?.social_github]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(false);
    try {
      const payload: ExtendedUpdateProfileRequest = {
        display_name: displayName || undefined,
        bio: bio.trim() || null,
        website: website.trim() || null,
        social_twitter: socialTwitter.trim() || null,
        social_instagram: socialInstagram.trim() || null,
        social_github: socialGithub.trim() || null,
      };
      await updateProfileMutation.mutateAsync(payload as UpdateProfileRequest);
      setSaveSuccess(true);
    } catch {
      setSaveError(true);
    }
  };

  return (
    <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
      <h3 className="text-xl font-semibold mb-6">{t("settings.profile.title")}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nume afișat"
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Cum să te vadă ceilalți?"
          fullWidth
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface">Email</label>
          <div className="p-3 bg-surface-container-high rounded-md text-on-surface-variant flex justify-between items-center">
            <span>{user?.email}</span>
            <span className="text-xs italic">
              Email-ul nu poate fi schimbat momentan
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface">Telefon</label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-surface-container-high rounded-md text-on-surface-variant">
              {user?.phone || "Niciun număr adăugat"}
            </div>
            {!user?.phone_verified && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsPhoneModalOpen(true)}
              >
                Verifică
              </Button>
            )}
            {user?.phone_verified && (
              <div className="px-4 py-2 bg-success/10 text-success rounded-md font-medium flex items-center gap-1">
                ✓ Verificat
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <Textarea
          label={t("settings.profile.bioLabel")}
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t("settings.profile.bioPlaceholder")}
          hint={t("settings.profile.bioHint")}
          maxLength={500}
          rows={4}
          fullWidth
        />

        {/* Website */}
        <Input
          label={t("settings.profile.websiteLabel")}
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder={t("settings.profile.websitePlaceholder")}
          fullWidth
        />

        {/* Social links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t("settings.profile.twitterLabel")}
            id="social_twitter"
            value={socialTwitter}
            onChange={(e) => setSocialTwitter(e.target.value)}
            placeholder={t("settings.profile.twitterPlaceholder")}
            fullWidth
          />
          <Input
            label={t("settings.profile.instagramLabel")}
            id="social_instagram"
            value={socialInstagram}
            onChange={(e) => setSocialInstagram(e.target.value)}
            placeholder={t("settings.profile.instagramPlaceholder")}
            fullWidth
          />
          <Input
            label={t("settings.profile.githubLabel")}
            id="social_github"
            value={socialGithub}
            onChange={(e) => setSocialGithub(e.target.value)}
            placeholder={t("settings.profile.githubPlaceholder")}
            fullWidth
          />
        </div>

        {saveSuccess && (
          <p className="text-sm text-success">{t("settings.profile.savedMessage")}</p>
        )}
        {saveError && (
          <p className="text-sm text-error">{t("settings.profile.errorMessage")}</p>
        )}

        <div className="pt-2">
          <Button type="submit" loading={updateProfileMutation.isPending}>
            {t("settings.profile.saveButton")}
          </Button>
        </div>
      </form>

      {isPhoneModalOpen && (
        <PhoneVerifyModal
          open={isPhoneModalOpen}
          onOpenChange={setIsPhoneModalOpen}
        />
      )}
    </section>
  );
}
