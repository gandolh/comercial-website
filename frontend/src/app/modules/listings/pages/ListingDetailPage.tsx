import { Link, useParams } from "@core/lib/router";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { Skeleton } from "@core/components/ui/Skeleton";
import { Button } from "@core/components/ui";
import { Panel } from "../components/Panel";
import { useListingDetail } from "../hooks/useListingDetail";
import { useRelatedListings } from "../hooks/useRelatedListings";
import { ListingGallery } from "../components/ListingGallery";
import { ListingDescription } from "../components/ListingDescription";
import { PricingCard } from "../components/PricingCard";
import { SellerCard } from "../components/SellerCard";
import { RelatedListings } from "../components/RelatedListings";
import { useMemo, useState, useEffect } from "react";
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
    <Panel aria-labelledby="files-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="files-title" className="text-price font-extrabold text-on-surface">
          {t("listing_files.title")}
        </h2>
        <span className="text-control text-on-surface-variant">
          {t("listing_files.count", { count: assets.length })}
          {" · "}
          {t("listing_files.totalSize", { size: formatBytes(totalBytes) })}
        </span>
      </div>
      <ul className="divide-y divide-outline-variant overflow-hidden rounded-[10px] border border-outline-variant p-0">
        {assets.map((asset) => {
          const isDownloading = downloadingId === asset.id;
          const downloadBlocked = isPaidListing && !canDownload;
          return (
            <li
              key={asset.id}
              className="flex list-none items-center gap-4 bg-surface-container-lowest px-4 py-3 transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-primary" aria-hidden="true">
                draft
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-control font-semibold text-on-surface">{asset.originalFilename}</p>
                <p className="mt-0.5 text-label text-on-surface-variant">
                  {formatBytes(asset.fileSizeBytes)} · {asset.contentType}
                </p>
              </div>
              {downloadBlocked ? (
                <span className="inline-flex h-10 items-center gap-1 rounded-control border border-outline-variant px-4 text-control whitespace-nowrap text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }} aria-hidden="true">
                    lock
                  </span>
                  {t("orders.download.lockedButton")}
                </span>
              ) : (
                <Button
                  size="sm"
                  onClick={() => void handleDownload(asset.id, asset.originalFilename)}
                  disabled={isDownloading}
                  iconLeft="download"
                  className="whitespace-nowrap"
                  aria-label={`${t("listing_files.downloadButton")} ${asset.originalFilename}`}
                >
                  {isDownloading ? t("listing_files.downloading") : t("listing_files.downloadButton")}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function PageLoader() {
  return (
    <main className="mx-auto w-full max-w-310 grow px-4 pt-5 pb-9 md:px-6 md:pb-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Skeleton className="aspect-16/10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </main>
  );
}

const LICENSE_LABELS: Record<string, string> = {
  personal: "Personală",
  commercial: "Comercială",
  extended: "Extinsă",
};

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

  const isPaidListing = useMemo(() => {
    return data?.priceRon != null && data.priceRon > 0;
  }, [data?.priceRon]);

  // Buyer can download if: listing is free, OR they own it, OR they have a paid order.
  const canDownload = useMemo(() => {
    if (!isPaidListing) return true; // free listing
    if (user?.id === data?.seller?.id) return true; // seller owns it
    return hasPaidOrder;
  }, [isPaidListing, user?.id, data?.seller?.id, hasPaidOrder]);

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
        value: LICENSE_LABELS[data.licenseType] || data.licenseType,
      });
    }
    return specs;
  }, [isDigitalAsset, data, t]);

  if (isFetching) return <PageLoader />;

  if (isError || !data) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-310 grow flex-col items-center justify-center space-y-6 px-4 py-10 md:px-6">
        <ErrorCard message="Anunțul nu a fost găsit sau a fost dezactivat." onRetry={() => void refetch()} />
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary underline underline-offset-3">
          <span className="material-symbols-outlined">arrow_back</span>
          Înapoi la pagina principală
        </Link>
      </main>
    );
  }

  return (
    <>
      <nav
        className="mx-auto mt-5 flex w-full max-w-310 flex-wrap items-center gap-x-2 gap-y-1.5 px-4 text-control text-on-surface-variant md:px-6"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="underline decoration-outline-variant underline-offset-3 hover:text-primary">
          Acasă
        </Link>
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }} aria-hidden="true">
          chevron_right
        </span>
        <Link
          to={`/categorii/${data.category}`}
          className="underline decoration-outline-variant underline-offset-3 hover:text-primary"
        >
          {data.categoryLabel}
        </Link>
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }} aria-hidden="true">
          chevron_right
        </span>
        <b aria-current="page" className="font-semibold text-on-surface">
          {data.title}
        </b>
      </nav>

      <main className="mx-auto w-full max-w-310 grow px-4 pt-4 pb-9 md:px-6 md:pb-16">
        {(isExpired || !data.active) && (
          <div className="mb-4 flex flex-wrap gap-3">
            {isExpired && (
              <div className="flex items-center gap-2 rounded-control bg-error-container px-4 py-2 font-semibold text-on-error-container">
                <span className="material-symbols-outlined" aria-hidden="true">
                  timer_off
                </span>
                Anunț Expirat
              </div>
            )}
            {!data.active && (
              <div className="flex items-center gap-2 rounded-control bg-surface-container-high px-4 py-2 font-semibold text-on-surface-variant">
                <span className="material-symbols-outlined" aria-hidden="true">
                  visibility_off
                </span>
                Anunț Inactiv
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-4 min-[1001px]:grid-cols-[minmax(0,1fr)_380px] min-[1001px]:gap-6">
          <div className="flex min-w-0 flex-col gap-4 max-[1000px]:contents min-[1001px]:gap-6">
            <ListingGallery
              images={data.images}
              title={data.title}
              category={data.category}
              className="max-[1000px]:order-1"
            />

            <div className="flex min-w-0 flex-col gap-4 max-[1000px]:order-4 min-[1001px]:gap-6">
              <ListingDescription
                id={data.id}
                description={data.description}
                postedAt={data.postedAt}
                features={[]}
                digitalSpecs={digitalSpecs}
              />

              {data.isBundle && (
                <Panel>
                  <BundleContents listingId={data.id} />
                </Panel>
              )}

              {isDigitalAsset && isPaidListing && !canDownload && (
                <Panel aria-labelledby="paywall-title" className="bg-surface-container-low">
                  <h2 id="paywall-title" className="text-price font-extrabold text-on-surface">
                    {t("orders.download.paywall.title")}
                  </h2>
                  <p className="text-control text-on-surface-variant">{t("orders.download.paywall.body")}</p>
                  <BuyButton
                    listingId={data.id}
                    priceRon={data.priceRon ?? 0}
                    hasPaidOrder={hasPaidOrder}
                    onAlreadyPaid={() => setHasPaidOrder(true)}
                  />
                </Panel>
              )}

              {isDigitalAsset && data.assets && data.assets.length > 0 && (
                <AssetFileList
                  listingId={data.id}
                  assets={data.assets}
                  isPaidListing={isPaidListing}
                  canDownload={canDownload}
                />
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4 max-[1000px]:contents min-[1001px]:gap-6">
            <div className="min-w-0 max-[1000px]:order-2">
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
            </div>
            <div className="min-w-0 max-[1000px]:order-3">
              <SellerCard seller={data.seller} listingId={data.id} isDigitalAsset={isDigitalAsset} />
            </div>

            <div className="flex min-w-0 flex-col gap-4 max-[1000px]:order-5 min-[1001px]:gap-6">
              <Panel aria-label="Recenzii">
                <ReviewsSection listingId={data.id} canReview={hasPaidOrder && user?.id !== data.seller.id} />
              </Panel>

              <div className="flex items-start gap-4 px-2">
                <span className="material-symbols-outlined mt-0.5 text-error" aria-hidden="true">
                  shield
                </span>
                <p className="text-control text-on-surface-variant">
                  <strong>Sfaturi de siguranță:</strong> Plătește doar prin platformă, nu prin transfer direct către
                  vânzător. Verifică licența și formatul fișierelor înainte de cumpărare și scanează arhivele descărcate
                  cu un antivirus înainte să le deschizi.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 text-control text-on-surface-variant transition-colors hover:text-error"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">
                    report
                  </span>
                  Raportează Anunțul
                </button>
              </div>
            </div>
          </div>
        </div>

        <RelatedListings listings={relatedListings.data ?? []} />
      </main>
    </>
  );
}
