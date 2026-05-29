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

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: _profileRaw, isLoading: isProfileLoading } = usePublicProfile(id!);
  const profile = _profileRaw as SellerProfile | undefined;
  const { data: listingsPage, isLoading: isListingsLoading } = useUserListings(
    id!,
  );
  const { t } = useTranslation();

  if (isProfileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-surface-container-low rounded-3xl p-8 mb-12 animate-pulse">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-surface-container-high" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-surface-container-high rounded w-48" />
              <div className="h-4 bg-surface-container-high rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-black mb-4">{t("seller.notFound")}</h1>
        <p className="text-on-surface-variant">
          {t("seller.notFoundDesc")}
        </p>
      </div>
    );
  }

  const hasSocialLinks =
    profile.social_twitter || profile.social_instagram || profile.social_github;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="bg-surface-container-low rounded-3xl p-8 mb-12 border border-outline-variant shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high border-4 border-white shadow-md shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || "Seller"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-on-surface-variant">
                {profile.display_name?.[0] || "U"}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-black">
                {profile.display_name || "Utilizator"}
              </h1>
              {profile.phone_verified && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t("seller.verifiedSeller")}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-on-surface-variant mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {t("seller.memberSince")}{" "}
                  {format(new Date(profile.member_since), "MMMM yyyy", {
                    locale: ro,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{profile.active_listings_count} {t("seller.activeListings")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>{(profile.total_downloads ?? 0)} {t("seller.totalDownloads")}</span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-on-surface-variant text-sm leading-relaxed mb-4 max-w-xl text-center md:text-left">
                {profile.bio}
              </p>
            )}

            {/* Website + Social links */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline text-sm font-medium"
                  aria-label={t("seller.website")}
                >
                  <Globe className="w-4 h-4" />
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
                      className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm"
                    >
                      <AtSign className="w-4 h-4" />
                      <span>{profile.social_twitter}</span>
                    </a>
                  )}
                  {profile.social_instagram && (
                    <a
                      href={`https://instagram.com/${profile.social_instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("seller.instagram")}
                      className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{t("seller.instagram")}</span>
                    </a>
                  )}
                  {profile.social_github && (
                    <a
                      href={`https://github.com/${profile.social_github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("seller.github")}
                      className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm"
                    >
                      <Link2 className="w-4 h-4" />
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
      <h2 className="text-2xl font-black mb-8">{t("seller.listingsTitle")}</h2>

      {isListingsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-surface-container-low rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : listingsPage?.items && listingsPage.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listingsPage.items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-2xl p-12 text-center border border-dashed border-outline-variant">
          <p className="text-on-surface-variant">
            {t("seller.noListings")}
          </p>
        </div>
      )}
    </div>
  );
}
