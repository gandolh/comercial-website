import { Link, useParams } from "@/lib/router";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useListingDetail } from "../hooks/useListingDetail";
import { useRelatedListings } from "../hooks/useRelatedListings";
import { ListingGallery } from "../components/ListingGallery";
import { ListingDescription } from "../components/ListingDescription";
import { PricingCard } from "../components/PricingCard";
import { SellerCard } from "../components/SellerCard";
import { RelatedListings } from "../components/RelatedListings";
import { useMemo } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { formatBytes } from "@/utils/formatBytes";
import { useTranslation } from "react-i18next";

function PageLoader() {
  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-[4/3] w-full bg-surface-container rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 bg-surface-container rounded-2xl animate-pulse" />
          <div className="h-48 bg-surface-container rounded-2xl animate-pulse" />
        </div>
      </div>
    </main>
  );
}

export function ListingDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data, isFetching, isError, refetch } = useListingDetail(id);
  const relatedListings = useRelatedListings(id);
  const { t } = useTranslation();

  const isExpired = useMemo(() => {
    if (!data?.expiresAt) return false;
    return new Date(data.expiresAt) < new Date();
  }, [data?.expiresAt]);

  const isDigitalAsset = useMemo(() => {
    return !!data?.fileFormat;
  }, [data?.fileFormat]);

  const licenseLabels: Record<string, string> = {
    personal: "Personală",
    commercial: "Comercială",
    extended: "Extinsă",
  };

  const digitalSpecs = useMemo(() => {
    if (!isDigitalAsset || !data) return [];
    const specs = [];
    if (data.fileFormat) {
      specs.push({
        icon: "description",
        label: t("listing.specs.format"),
        value: data.fileFormat.toUpperCase(),
      });
    }
    if (data.fileSizeBytes) {
      specs.push({
        icon: "storage",
        label: t("listing.specs.fileSize"),
        value: formatBytes(data.fileSizeBytes),
      });
    }
    if (data.licenseType) {
      specs.push({
        icon: "verified",
        label: t("listing.specs.license"),
        value: licenseLabels[data.licenseType] || data.licenseType,
      });
    }
    return specs;
  }, [isDigitalAsset, data, t]);

  if (isFetching) return <PageLoader />;

  if (isError || !data) {
    return (
      <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <ErrorCard
          message="Anunțul nu a fost găsit sau a fost dezactivat."
          onRetry={() => refetch()}
        />
        <Link
          to="/"
          className="text-primary font-bold hover:underline flex items-center gap-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Înapoi la pagina principală
        </Link>
      </main>
    );
  }

  const formattedPrice =
    data.priceRon != null
      ? `${data.priceRon.toLocaleString("ro-RO")} RON`
      : "Gratuit";

  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto">
      {(isExpired || !data.active) && (
        <div className="mb-6 flex gap-3">
          {isExpired && (
            <div className="bg-error-container text-on-error-container px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">timer_off</span>
              Anunț Expirat
            </div>
          )}
          {!data.active && (
            <div className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">visibility_off</span>
              Anunț Inactiv
            </div>
          )}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav
        className="flex items-center gap-2 mb-8 text-xs font-medium tracking-widest text-outline uppercase"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-primary transition-colors">
          Acasă
        </Link>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <Link
          to={`/categorii/${data.category}`}
          className="hover:text-primary transition-colors"
        >
          {data.categoryLabel}
        </Link>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-on-surface normal-case">{data.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-12">
          <ListingGallery images={data.images} title={data.title} fileFormat={data.fileFormat} />

          {/* Mobile-only title + price */}
          <div className="lg:hidden">
            <h1
              className="text-3xl font-extrabold tracking-tight text-on-surface mb-2"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {data.title}
            </h1>
            <div className="text-4xl font-black text-primary mb-6">
              {formattedPrice}
            </div>
          </div>

          <ListingDescription
            id={data.id}
            description={data.description}
            features={[]}
            digitalSpecs={digitalSpecs}
          />

          <div className="pt-8 border-t border-surface-container-high text-xs text-outline flex items-center gap-4">
            <span>
              Postat la:{" "}
              {format(new Date(data.postedAt), "d MMMM yyyy, HH:mm", {
                locale: ro,
              })}
            </span>
            <span>•</span>
            <span>ID: {data.id}</span>
          </div>
        </div>

        {/* Right column — sticky */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <PricingCard
            listingId={data.id}
            sellerId={data.seller.id}
            sellerName={data.seller.displayName ?? ""}
            title={data.title}
            priceRon={data.priceRon}
            location={data.city}
            viewCount={data.viewCount}
            downloadCount={data.downloadCount}
            isDigitalAsset={isDigitalAsset}
          />

          <SellerCard seller={data.seller} listingId={data.id} isDigitalAsset={isDigitalAsset} />

          {/* Safety tip */}
          <div className="flex items-start gap-4 px-4">
            <span className="material-symbols-outlined text-error mt-1">
              shield
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Sfaturi de siguranță:</strong> Evită plata în avans.
              Întâlnește-te cu vânzătorul într-un loc public și verifică
              produsul înainte de achiziție.
            </p>
          </div>

          {/* Report button */}
          <div className="flex justify-center pt-4">
            <button className="flex items-center gap-2 text-outline hover:text-error transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">
                report
              </span>
              Raportează Anunțul
            </button>
          </div>
        </div>
      </div>

      <RelatedListings listings={relatedListings.data ?? []} />
    </main>
  );
}
