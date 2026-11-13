import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import { Checkbox } from "@core/components/ui";
import { PhoneVerifyModal } from "../../auth/components/PhoneVerifyModal";
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

export function ReviewStep({ draft, onPublish, onBack, isPublishing }: ReviewStepProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewStepInput>({
    resolver: zodResolver(reviewStepSchema),
  });
  const acceptsTerms = watch("acceptsTerms");

  const totalSizeBytes = draft.assets.reduce((sum, a) => sum + a.fileSizeBytes, 0);
  const fileCount = draft.assets.length;

  const categoryLabel =
    draft.categoryLabel || (draft.category ? t(`categories.${draft.category}`, draft.category) : "—");

  const licenseLabel = draft.licenseType
    ? t(`createListing.preview.license_${draft.licenseType}`, draft.licenseType)
    : null;

  const priceDisplay =
    draft.priceRon != null && draft.priceRon > 0
      ? `${draft.priceRon.toLocaleString("ro-RO")} RON`
      : t("createListing.preview.free");

  return (
    <div className="space-y-8 duration-500">
      {/* Page heading */}
      <div className="space-y-2 text-center">
        <h2 className="font-headline text-2xl font-black">{t("createListing.preview.heading")}</h2>
        <p className="text-on-surface-variant">{t("createListing.preview.subheading")}</p>
      </div>

      {/* Preview mode banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-secondary-container/40 px-5 py-3">
        <span className="material-symbols-outlined text-xl text-primary">visibility</span>
        <span className="text-sm font-semibold text-on-secondary-container">
          {t("createListing.preview.previewBanner")}
        </span>
      </div>

      {/* Summary strip: category · price · license · files */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1 rounded-xl bg-surface-container p-4">
          <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
            {t("createListing.preview.summaryCategory")}
          </p>
          <p className="truncate text-sm font-bold text-on-surface">{categoryLabel}</p>
        </div>

        <div className="space-y-1 rounded-xl bg-surface-container p-4">
          <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
            {t("createListing.preview.summaryPrice")}
          </p>
          <p className="text-sm font-bold text-primary">{priceDisplay}</p>
        </div>

        <div className="space-y-1 rounded-xl bg-surface-container p-4">
          <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
            {t("createListing.preview.summaryLicense")}
          </p>
          <p className="text-sm font-bold text-on-surface">{licenseLabel ?? "—"}</p>
        </div>

        <div className="space-y-1 rounded-xl bg-surface-container p-4">
          <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
            {t("createListing.preview.summaryFiles")}
          </p>
          <p className="text-sm font-bold text-on-surface">
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
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-primary/10 bg-primary/5 p-6 delay-200 duration-700 md:flex-row">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1 text-center md:text-left">
            <h4 className="font-bold text-on-surface">{t("createListing.preview.verifySellerTitle")}</h4>
            <p className="text-sm text-on-surface-variant">{t("createListing.preview.verifySellerBody")}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPhoneModalOpen(true)}
            className="rounded-full border border-primary/20 bg-surface-container-lowest px-6 py-2 text-sm font-bold whitespace-nowrap text-primary shadow-sm transition-colors hover:bg-primary/5"
          >
            {t("createListing.preview.verifySellerCta")}
          </button>
        </div>
      )}

      {/* Full listing preview card */}
      <div className="overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-low shadow-sm">
        {/* Preview label overlay at top of card */}
        <div className="flex items-center gap-2 border-b border-primary/20 bg-primary-fixed px-6 py-2">
          <span className="material-symbols-outlined text-base text-primary">preview</span>
          <span className="text-xs font-bold tracking-widest text-primary uppercase">
            {t("createListing.preview.cardLabel")}
          </span>
        </div>

        <div className="space-y-8 p-4 md:p-8">
          {/* Mobile title + price */}
          <div className="block space-y-1 lg:hidden">
            <h1 className="font-headline text-xl font-extrabold tracking-tight text-on-surface">
              {draft.title || t("createListing.preview.untitledPlaceholder")}
            </h1>
            <p className="text-2xl font-black text-primary">{priceDisplay}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <ListingGallery images={draft.images} title={draft.title} fileFormat={draft.fileFormat} />
              <ListingDescription id={draft.id} description={draft.description} features={[]} />
              {draft.assets && draft.assets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">{t("createListing.preview.downloadFilesHeading")}</h3>
                  <div className="space-y-3">
                    {draft.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container p-4"
                      >
                        <span className="material-symbols-outlined shrink-0 text-primary">file_present</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{asset.originalFilename}</p>
                          <p className="text-xs text-on-surface-variant">{formatFileSize(asset.fileSizeBytes)}</p>
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
          <Checkbox
            size="lg"
            checked={acceptsTerms === true}
            // The schema's field is the literal `true`; an unticked box fails it with the schema's own message.
            onCheckedChange={(checked) => setValue("acceptsTerms", checked as true, { shouldValidate: true })}
            className="group items-start gap-3"
            boxClassName="mt-1"
            label={
              <span className="text-sm text-on-surface-variant transition-colors group-hover:text-on-surface">
                {t("createListing.preview.termsConfirm")}
              </span>
            }
          />
          {errors.acceptsTerms && <p className="px-8 text-xs text-error">{errors.acceptsTerms.message}</p>}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isPublishing}
            className="flex-1 rounded-full border-2 border-outline-variant px-8 py-4 font-bold transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            {t("createListing.preview.backButton")}
          </button>
          <button
            type="submit"
            disabled={isPublishing}
            className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-on-primary shadow-md transition-all hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                {t("createListing.preview.publishing")}
              </>
            ) : (
              t("createListing.preview.publishButton")
            )}
          </button>
        </div>
      </form>

      <PhoneVerifyModal open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen} />
    </div>
  );
}
