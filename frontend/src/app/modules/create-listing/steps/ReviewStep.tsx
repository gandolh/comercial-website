import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import PhoneVerifyModal from "../../auth/components/PhoneVerifyModal";
import { reviewStepSchema, type ReviewStepInput } from "../schemas";
import type { ListingDraft } from "../services/drafts";
import { ListingGallery } from "../../listings/components/ListingGallery";
import { ListingDescription } from "../../listings/components/ListingDescription";
import { PricingCard } from "../../listings/components/PricingCard";
import { SellerCard } from "../../listings/components/SellerCard";

interface ReviewStepProps {
  draft: ListingDraft;
  onPublish: () => void;
  onBack: () => void;
  isPublishing: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReviewStep({
  draft,
  onPublish,
  onBack,
  isPublishing,
}: ReviewStepProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewStepInput>({
    resolver: zodResolver(reviewStepSchema),
  });

  const totalSizeBytes = draft.assets.reduce(
    (sum, a) => sum + a.fileSizeBytes,
    0,
  );
  const fileCount = draft.assets.length;

  const categoryLabel =
    draft.categoryLabel ||
    (draft.category ? t(`categories.${draft.category}`, draft.category) : "—");

  const licenseLabel = draft.licenseType
    ? t(`createListing.preview.license_${draft.licenseType}`, draft.licenseType)
    : null;

  const priceDisplay =
    draft.priceRon != null && draft.priceRon > 0
      ? `${draft.priceRon.toLocaleString("ro-RO")} RON`
      : t("createListing.preview.free");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page heading */}
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-black"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {t("createListing.preview.heading")}
        </h2>
        <p className="text-on-surface-variant">
          {t("createListing.preview.subheading")}
        </p>
      </div>

      {/* Preview mode banner */}
      <div className="flex items-center gap-3 bg-secondary-container/40 border border-secondary/20 rounded-2xl px-5 py-3">
        <span className="material-symbols-outlined text-secondary text-xl">
          visibility
        </span>
        <span className="text-sm font-semibold text-on-secondary-container">
          {t("createListing.preview.previewBanner")}
        </span>
      </div>

      {/* Summary strip: category · price · license · files */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-container rounded-xl p-4 space-y-1">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">
            {t("createListing.preview.summaryCategory")}
          </p>
          <p className="font-bold text-sm text-on-surface truncate">
            {categoryLabel}
          </p>
        </div>

        <div className="bg-surface-container rounded-xl p-4 space-y-1">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">
            {t("createListing.preview.summaryPrice")}
          </p>
          <p className="font-bold text-sm text-primary">{priceDisplay}</p>
        </div>

        <div className="bg-surface-container rounded-xl p-4 space-y-1">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">
            {t("createListing.preview.summaryLicense")}
          </p>
          <p className="font-bold text-sm text-on-surface">
            {licenseLabel ?? "—"}
          </p>
        </div>

        <div className="bg-surface-container rounded-xl p-4 space-y-1">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">
            {t("createListing.preview.summaryFiles")}
          </p>
          <p className="font-bold text-sm text-on-surface">
            {fileCount > 0
              ? t("createListing.preview.fileCountSize", {
                  count: fileCount,
                  size: formatFileSize(totalSizeBytes),
                })
              : "—"}
          </p>
        </div>
      </div>

      {/* Phone verification nudge */}
      {!user?.phone_verified && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h4 className="font-bold text-on-surface">
              {t("createListing.preview.verifySellerTitle")}
            </h4>
            <p className="text-sm text-on-surface-variant">
              {t("createListing.preview.verifySellerBody")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPhoneModalOpen(true)}
            className="px-6 py-2 rounded-full bg-white border border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-colors shadow-sm whitespace-nowrap"
          >
            {t("createListing.preview.verifySellerCta")}
          </button>
        </div>
      )}

      {/* Full listing preview card */}
      <div className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant shadow-sm">
        {/* Preview label overlay at top of card */}
        <div className="bg-secondary/10 border-b border-secondary/20 px-6 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-base">
            preview
          </span>
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">
            {t("createListing.preview.cardLabel")}
          </span>
        </div>

        <div className="p-4 md:p-8 space-y-8">
          {/* Mobile title + price */}
          <div className="block lg:hidden space-y-1">
            <h1
              className="text-xl font-extrabold tracking-tight text-on-surface"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {draft.title || t("createListing.preview.untitledPlaceholder")}
            </h1>
            <p className="text-2xl font-black text-primary">{priceDisplay}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ListingGallery
                images={draft.images}
                title={draft.title}
                fileFormat={draft.fileFormat}
              />
              <ListingDescription
                id={draft.id}
                description={draft.description}
                features={[]}
              />
              {draft.assets && draft.assets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">
                    {t("createListing.preview.downloadFilesHeading")}
                  </h3>
                  <div className="space-y-3">
                    {draft.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="bg-surface-container border border-outline-variant rounded-xl p-4 flex items-center gap-4"
                      >
                        <span className="material-symbols-outlined text-primary shrink-0">
                          file_present
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {asset.originalFilename}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {formatFileSize(asset.fileSizeBytes)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <PricingCard
                listingId={draft.id}
                sellerId={draft.seller.id}
                sellerName={draft.seller.displayName ?? ""}
                title={draft.title}
                priceRon={draft.priceRon}
                location={draft.city}
                viewCount={draft.viewCount}
              />
              <SellerCard seller={draft.seller} listingId={draft.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Terms + publish form */}
      <form onSubmit={handleSubmit(onPublish)} className="space-y-6">
        <div className="space-y-3 px-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("acceptsTerms")}
              className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low transition-colors"
            />
            <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
              {t("createListing.preview.termsConfirm")}
            </span>
          </label>
          {errors.acceptsTerms && (
            <p className="text-error text-xs px-8">
              {errors.acceptsTerms.message}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isPublishing}
            className="flex-1 px-8 py-4 rounded-full font-bold border-2 border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            {t("createListing.preview.backButton")}
          </button>
          <button
            type="submit"
            disabled={isPublishing}
            className="flex-[2] px-8 py-4 rounded-full font-bold bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                {t("createListing.preview.publishing")}
              </>
            ) : (
              t("createListing.preview.publishButton")
            )}
          </button>
        </div>
      </form>

      <PhoneVerifyModal
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
      />
    </div>
  );
}
