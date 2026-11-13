import { useEffect } from "react";
import { useParams, useNavigate } from "@core/lib/router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "@core/components/ui";
import { fetchListingDetail } from "@app/modules/listings/services/listings";
import { useListingMutations } from "@app/modules/listings/hooks/useListingMutations";
import { DetailsStep } from "@app/modules/create-listing/steps/DetailsStep";
import { LocationPriceStep } from "@app/modules/create-listing/steps/LocationPriceStep";
import { PhotosStep } from "@app/modules/create-listing/steps/PhotosStep";
import { RenewButton } from "@app/modules/listings/components/RenewButton";
import { BundleManagerSection } from "@app/modules/bundles/components/BundleManagerSection";
import { useAuth } from "@core/lib/auth";
import { ChevronLeft } from "lucide-react";

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { update, deactivate, activate } = useListingMutations();

  const {
    data: listing,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListingDetail(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (listing && user && listing.seller.id !== user.id) {
      toast.error("Nu ai permisiunea să editezi acest anunț");
      navigate(`/anunturi/${id}`);
    }
  }, [listing, user, id, navigate]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center">
        <span className="material-symbols-outlined text-5xl text-primary motion-safe:animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Anunțul nu a fost găsit.</h2>
        <button onClick={() => navigate("/")} className="font-bold text-primary hover:underline">
          Înapoi la prima pagină
        </button>
      </div>
    );
  }

  const handleUpdate = async (patch: Record<string, unknown>) => {
    try {
      await update.mutateAsync({ id: listing.id, patch });
      toast.success(t("edit.success"));
    } catch {
      toast.error("Nu am putut actualiza anunțul.");
    }
  };

  const toggleActive = async () => {
    try {
      if (listing.active) {
        await deactivate.mutateAsync(listing.id);
      } else {
        await activate.mutateAsync(listing.id);
      }
      toast.success(t("edit.success"));
    } catch {
      toast.error("Nu am putut schimba statusul anunțului.");
    }
  };

  return (
    <main className="mt-8 pb-24">
      <div className="mx-auto max-w-4xl space-y-12 px-6">
        <button
          onClick={() => navigate(`/anunturi/${listing.id}`)}
          className="flex items-center gap-2 font-medium text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <ChevronLeft className="h-4 w-4" />
          Înapoi la anunț
        </button>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-3xl font-bold">{t("edit.title")}</h1>
          <div className="flex items-center gap-3">
            <RenewButton listingId={listing.id} expiresAt={listing.expiresAt} />
            <button
              onClick={toggleActive}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-colors ${
                listing.active
                  ? "border-outline text-on-surface hover:bg-surface-container"
                  : "border-primary text-primary hover:bg-primary-container"
              }`}
            >
              {listing.active ? t("listing.actions.deactivate") : t("listing.actions.activate")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section className="space-y-6 rounded-2xl border border-outline-variant bg-surface p-6">
            <h2 className="border-b pb-4 text-xl font-bold">{t("edit.sections.details")}</h2>
            <DetailsStep
              initialData={{
                title: listing.title,
                description: listing.description,
              }}
              onNext={(data) =>
                handleUpdate({
                  title: data.title,
                  description: data.description,
                })
              }
              hideFooter
              submitLabel={t("edit.save")}
            />
          </section>

          <section className="space-y-6 rounded-2xl border border-outline-variant bg-surface p-6">
            <h2 className="border-b pb-4 text-xl font-bold">{t("edit.sections.photos")}</h2>
            <PhotosStep listingId={listing.id} images={listing.images} onImagesChange={refetch} hideFooter />
          </section>

          <section className="space-y-6 rounded-2xl border border-outline-variant bg-surface p-6">
            <h2 className="border-b pb-4 text-xl font-bold">{t("edit.sections.locationPrice")}</h2>
            <LocationPriceStep
              initialData={{
                priceRon: listing.priceRon,
                isFree: listing.priceRon === 0,
              }}
              onNext={(data) =>
                handleUpdate({
                  price_ron: data.isFree ? 0 : data.priceRon,
                })
              }
              hideFooter
              submitLabel={t("edit.save")}
            />
          </section>

          <BundleManagerSection
            listingId={listing.id}
            isBundle={listing.isBundle ?? false}
            priceRon={listing.priceRon}
            onSaved={refetch}
          />
        </div>
      </div>
    </main>
  );
}
