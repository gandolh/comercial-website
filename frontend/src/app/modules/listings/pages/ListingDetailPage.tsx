import { Link, useParams } from "@core/lib/router";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { CardSkeleton } from "@core/components/ui/Skeleton";
import { useListingDetail } from "../hooks/useListingDetail";
import { useRelatedListings } from "../hooks/useRelatedListings";
import { ListingGallery } from "../components/ListingGallery";
import { ListingDescription } from "../components/ListingDescription";
import { PricingCard } from "../components/PricingCard";
import { SellerCard } from "../components/SellerCard";
import { RelatedListings } from "../components/RelatedListings";
import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { formatBytes } from "@core/utils/formatBytes";
import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import { useNavigate } from "@core/lib/router";
import { getAssetDownloadUrl } from "../services/listings";
import type { ListingAsset } from "@app/types/listing";
import { BuyButton } from "@app/modules/orders/components/BuyButton";
import { ordersService } from "@app/modules/orders/services/orders.service";
import { ReviewsSection } from "@app/modules/reviews/components/ReviewsSection";
import { BundleContents } from "@app/modules/bundles/components/BundleContents";

interface AssetFileListProps {
  listingId: string;
  assets: ListingAsset[];
  /** If true, the listing is paid and the user must have an order to download. */
  isPaidListing?: boolean;
  /** If true, the current user has a paid order for this listing. */
  canDownload?: boolean;
}

function AssetFileList({ listingId, assets, isPaidListing = false, canDownload = true }: AssetFileListProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (assets.length === 0) return null;

  const totalBytes = assets.reduce((sum, a) => sum + a.fileSizeBytes, 0);

  const handleDownload = async (assetId: string, filename: string) => {
    if (!user) {
      navigate("/autentificare");
      return;
    }
    // For paid listings that the user hasn't purchased, block download
    if (isPaidListing && !canDownload) {
      return;
    }
    setDownloadingId(assetId);
    try {
      const url = getAssetDownloadUrl(listingId, assetId);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      // eslint-disable-next-line no-console -- a developer diagnostic; the user is told through the UI
      console.error("Asset download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold text-on-surface">{t("listing_files.title")}</h2>
        <span className="text-sm text-outline">
          {t("listing_files.count", { count: assets.length })}
          {" · "}
          {t("listing_files.totalSize", { size: formatBytes(totalBytes) })}
        </span>
      </div>
      <ul className="divide-y divide-surface-container-high overflow-hidden rounded-xl border border-surface-container-high">
        {assets.map((asset) => {
          const isDownloading = downloadingId === asset.id;
          const downloadBlocked = isPaidListing && !canDownload;
          return (
            <li
              key={asset.id}
              className="flex items-center gap-4 bg-surface-container-lowest px-5 py-4 transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[24px] text-primary">draft</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">{asset.originalFilename}</p>
                <p className="mt-0.5 text-xs text-outline">
                  {formatBytes(asset.fileSizeBytes)} · {asset.contentType}
                </p>
              </div>
              {downloadBlocked ? (
                <span className="flex items-center gap-1 rounded-full border border-outline-variant px-4 py-2 text-sm whitespace-nowrap text-outline">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  {t("orders.download.lockedButton")}
                </span>
              ) : (
                <button
                  onClick={() => handleDownload(asset.id, asset.originalFilename)}
                  disabled={isDownloading}
                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold whitespace-nowrap text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                  aria-label={`${t("listing_files.downloadButton")} ${asset.originalFilename}`}
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  {isDownloading ? t("listing_files.downloading") : t("listing_files.downloadButton")}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PageLoader() {
  return (
    <main className="mx-auto max-w-screen-2xl px-4 pt-28 pb-20 md:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-surface-container" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="space-y-6 lg:col-span-4">
          <div className="h-64 animate-pulse rounded-2xl bg-surface-container" />
          <div className="h-48 animate-pulse rounded-2xl bg-surface-container" />
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
  const { user } = useAuth();

  // Track whether the authenticated buyer has a paid order for this listing.
  const [hasPaidOrder, setHasPaidOrder] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    let cancelled = false;
    ordersService
      .listOrders()
      .then((orders) => {
        if (!cancelled) {
          const paid = orders.some((o) => o.listing_id === id && o.status === "paid");
          setHasPaidOrder(paid);
        }
      })
      .catch(() => {
        /* silent — not logged in or network error */
      });
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  const expiresAt = data?.expiresAt;
  const isExpired = useMemo(() => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }, [expiresAt]);

  const isDigitalAsset = useMemo(() => {
    return !!data?.fileFormat;
  }, [data?.fileFormat]);

  // A listing is "paid" if price_ron is set and > 0.
  const isPaidListing = useMemo(() => {
    return data?.priceRon != null && data.priceRon > 0;
  }, [data?.priceRon]);

  // Buyer can download if: listing is free, OR they own it, OR they have a paid order.
  const canDownload = useMemo(() => {
    if (!isPaidListing) return true; // free listing
    if (user?.id === data?.seller?.id) return true; // seller owns it
    return hasPaidOrder;
  }, [isPaidListing, user?.id, data?.seller?.id, hasPaidOrder]);

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
      <main className="mx-auto flex min-h-[50vh] max-w-screen-2xl flex-col items-center justify-center space-y-6 px-4 pt-28 pb-20 md:px-8">
        <ErrorCard message="Anunțul nu a fost găsit sau a fost dezactivat." onRetry={() => refetch()} />
        <Link to="/" className="flex items-center gap-2 font-bold text-primary hover:underline">
          <span className="material-symbols-outlined">arrow_back</span>
          Înapoi la pagina principală
        </Link>
      </main>
    );
  }

  const formattedPrice = data.priceRon != null ? `${data.priceRon.toLocaleString("ro-RO")} RON` : "Gratuit";

  return (
    <main className="mx-auto max-w-screen-2xl px-4 pt-28 pb-20 md:px-8">
      {(isExpired || !data.active) && (
        <div className="mb-6 flex gap-3">
          {isExpired && (
            <div className="flex items-center gap-2 rounded-lg bg-error-container px-4 py-2 font-bold text-on-error-container">
              <span className="material-symbols-outlined">timer_off</span>
              Anunț Expirat
            </div>
          )}
          {!data.active && (
            <div className="flex items-center gap-2 rounded-lg bg-surface-container-highest px-4 py-2 font-bold text-on-surface-variant">
              <span className="material-symbols-outlined">visibility_off</span>
              Anunț Inactiv
            </div>
          )}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav
        className="mb-8 flex items-center gap-2 text-xs font-medium tracking-widest text-outline uppercase"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="transition-colors hover:text-primary">
          Acasă
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to={`/categorii/${data.category}`} className="transition-colors hover:text-primary">
          {data.categoryLabel}
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface normal-case">{data.title}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        {/* Left column */}
        <div className="space-y-12 lg:col-span-8">
          <ListingGallery images={data.images} title={data.title} fileFormat={data.fileFormat} />

          {/* Mobile-only title + price */}
          <div className="lg:hidden">
            <h1 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface">{data.title}</h1>
            <div className="mb-6 text-4xl font-black text-primary">{formattedPrice}</div>
          </div>

          <ListingDescription id={data.id} description={data.description} features={[]} digitalSpecs={digitalSpecs} />

          {data.isBundle && <BundleContents listingId={data.id} />}

          {isDigitalAsset && isPaidListing && !canDownload && (
            <section className="space-y-3">
              <div className="space-y-4 rounded-2xl bg-surface-container p-6">
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  {t("orders.download.paywall.title")}
                </h2>
                <p className="text-sm text-on-surface-variant">{t("orders.download.paywall.body")}</p>
                <BuyButton
                  listingId={data.id}
                  priceRon={data.priceRon ?? 0}
                  hasPaidOrder={hasPaidOrder}
                  onAlreadyPaid={() => setHasPaidOrder(true)}
                />
              </div>
            </section>
          )}

          {isDigitalAsset && data.assets && data.assets.length > 0 && (
            <AssetFileList
              listingId={data.id}
              assets={data.assets}
              isPaidListing={isPaidListing}
              canDownload={canDownload}
            />
          )}

          <div className="flex items-center gap-4 border-t border-surface-container-high pt-8 text-xs text-outline">
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
        <div className="sticky top-28 space-y-6 lg:col-span-4">
          <PricingCard
            listingId={data.id}
            sellerId={data.seller.id}
            sellerName={data.seller.displayName ?? ""}
            title={data.title}
            priceRon={data.priceRon}
            viewCount={data.viewCount}
            downloadCount={data.downloadCount}
            isDigitalAsset={isDigitalAsset}
          />

          <SellerCard seller={data.seller} listingId={data.id} isDigitalAsset={isDigitalAsset} />

          <ReviewsSection listingId={data.id} canReview={hasPaidOrder && user?.id !== data.seller.id} />

          {/* Safety tip */}
          <div className="flex items-start gap-4 px-4">
            <span className="material-symbols-outlined mt-1 text-error">shield</span>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              <strong>Sfaturi de siguranță:</strong> Plătește doar prin platformă, nu prin transfer direct către
              vânzător. Verifică licența și formatul fișierelor înainte de cumpărare și scanează arhivele descărcate cu
              un antivirus înainte să le deschizi.
            </p>
          </div>

          {/* Report button */}
          <div className="flex justify-center pt-4">
            <button className="flex items-center gap-2 text-sm font-medium text-outline transition-colors hover:text-error">
              <span className="material-symbols-outlined text-[18px]">report</span>
              Raportează Anunțul
            </button>
          </div>
        </div>
      </div>

      <RelatedListings listings={relatedListings.data ?? []} />
    </main>
  );
}
