import { useParams } from "@core/lib/router";
import { usePublicProfile, useUserListings } from "../hooks/usePublicProfile";
import type { PublicUserResponse } from "../services/profile";
import { ListingCard } from "@app/modules/home/components/ListingCard";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { ShieldCheck, Calendar, Package, Download, Globe, AtSign, Link2, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Extended profile type including seller profile fields added in migration 20260615010000. */
interface SellerProfile extends PublicUserResponse {
  bio: string | null;
  website: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_github: string | null;
  total_downloads: number;
}

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: _profileRaw, isLoading: isProfileLoading } = usePublicProfile(id);
  const profile = _profileRaw as SellerProfile | undefined;
  const { data: listingsPage, isLoading: isListingsLoading } = useUserListings(id);
  const { t } = useTranslation();

  if (isProfileLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12 rounded-3xl bg-surface-container-low p-8 motion-safe:animate-pulse">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="h-32 w-32 rounded-full bg-surface-container-high" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-48 rounded-sm bg-surface-container-high" />
              <div className="h-4 w-32 rounded-sm bg-surface-container-high" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="mb-4 text-4xl font-extrabold">{t("seller.notFound")}</h1>
        <p className="text-on-surface-variant">{t("seller.notFoundDesc")}</p>
      </div>
    );
  }

  const hasSocialLinks = profile.social_twitter || profile.social_instagram || profile.social_github;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Profile Header */}
      <div className="mb-12 rounded-3xl border border-outline-variant bg-surface-container-low p-8 shadow-sm">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-surface-container-lowest bg-surface-container-high shadow-md">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || "Seller"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-on-surface-variant">
                {profile.display_name?.[0] || "U"}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <h1 className="text-3xl font-extrabold">{profile.display_name || "Utilizator"}</h1>
              {profile.phone_verified && (
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{t("seller.verifiedSeller")}</span>
                </div>
              )}
            </div>

            <div className="mb-4 flex flex-wrap justify-center gap-6 text-on-surface-variant md:justify-start">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {t("seller.memberSince")}{" "}
                  {format(new Date(profile.member_since), "MMMM yyyy", {
                    locale: ro,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span>
                  {profile.active_listings_count} {t("seller.activeListings")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <span>
                  {profile.total_downloads ?? 0} {t("seller.totalDownloads")}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mb-4 max-w-xl text-center text-sm leading-relaxed text-on-surface-variant md:text-left">
                {profile.bio}
              </p>
            )}

            {/* Website + Social links */}
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  aria-label={t("seller.website")}
                >
                  <Globe className="h-4 w-4" />
                  <span>{profile.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {hasSocialLinks && (
                <div className="flex items-center gap-3">
                  {profile.social_twitter && (
                    <a
                      href={`https://twitter.com/${profile.social_twitter.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("seller.twitter")}
                      className="flex items-center gap-1 text-sm text-on-surface-variant transition-colors hover:text-primary"
                    >
                      <AtSign className="h-4 w-4" />
                      <span>{profile.social_twitter}</span>
                    </a>
                  )}
                  {profile.social_instagram && (
                    <a
                      href={`https://instagram.com/${profile.social_instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("seller.instagram")}
                      className="flex items-center gap-1 text-sm text-on-surface-variant transition-colors hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{t("seller.instagram")}</span>
                    </a>
                  )}
                  {profile.social_github && (
                    <a
                      href={`https://github.com/${profile.social_github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("seller.github")}
                      className="flex items-center gap-1 text-sm text-on-surface-variant transition-colors hover:text-primary"
                    >
                      <Link2 className="h-4 w-4" />
                      <span>{profile.social_github}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <h2 className="mb-8 text-2xl font-extrabold">{t("seller.listingsTitle")}</h2>

      {isListingsLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-surface-container-low motion-safe:animate-pulse" />
          ))}
        </div>
      ) : listingsPage?.items && listingsPage.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {listingsPage.items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
          <p className="text-on-surface-variant">{t("seller.noListings")}</p>
        </div>
      )}
    </div>
  );
}
