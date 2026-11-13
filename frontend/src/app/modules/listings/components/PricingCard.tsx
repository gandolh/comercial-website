import { FavoriteToggle } from "@app/modules/favorites/components/FavoriteToggle";
import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import { useNavigate } from "@core/lib/router";
import { useState } from "react";
import { downloadAsset } from "@app/modules/listings/services/listings";
import { Button } from "@core/components/ui";
import { Panel } from "./Panel";
import { ContactSellerModal } from "@app/modules/messaging/components/ContactSellerModal";

interface PricingCardProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  priceRon: number | null;
  viewCount: number;
  downloadCount?: number;
  isDigitalAsset?: boolean;
}

export function PricingCard({
  listingId,
  sellerId,
  sellerName,
  title,
  priceRon,
  viewCount,
  downloadCount = 0,
  isDigitalAsset = false,
}: PricingCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOwner = user?.id === sellerId;
  const formattedPrice = priceRon != null ? `${priceRon.toLocaleString("ro-RO")} RON` : "Gratuit";

  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleDownload = async () => {
    if (!user) {
      navigate("/autentificare");
      return;
    }
    setIsDownloading(true);
    try {
      const result = await downloadAsset(listingId);
      const link = document.createElement("a");
      link.href = result.download_url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // eslint-disable-next-line no-console -- a developer diagnostic; the user is told through the UI
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const contact = () => {
    if (!user) {
      navigate("/autentificare");
      return;
    }
    setIsContactModalOpen(true);
  };

  return (
    <Panel aria-label="Preț" className="gap-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-headline font-extrabold tracking-[-0.01em] text-on-surface max-md:text-2xl max-md:leading-[1.875rem] md:text-title">
          {title}
        </h1>
        <FavoriteToggle listingId={listingId} className="size-11 flex-none bg-surface-container-low shadow-none" />
      </div>
      <p className="text-3xl leading-9 font-extrabold text-primary tabular-nums">{formattedPrice}</p>

      <div className="flex flex-col gap-3">
        {isOwner ? (
          <Link
            to={`/anunturi/${listingId}/editeaza`}
            className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-control bg-primary px-5 text-body font-semibold text-on-primary no-underline transition-colors hover:bg-primary-container active:brightness-90"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              edit
            </span>
            {t("listing.actions.edit")}
          </Link>
        ) : isDigitalAsset ? (
          <>
            <Button onClick={handleDownload} disabled={isDownloading} iconLeft="download" className="w-full">
              {isDownloading ? "Se descarcă..." : t("listing.download.button")}
            </Button>
            <Button variant="secondary" onClick={contact} iconLeft="mail" className="w-full">
              {t("listing.download.contactAuthor")}
            </Button>
          </>
        ) : (
          <Button onClick={contact} iconLeft="chat" className="w-full">
            Trimite Mesaj
          </Button>
        )}
      </div>

      <ContactSellerModal
        listingId={listingId}
        sellerName={sellerName}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <div className="flex justify-between gap-3 border-t border-outline-variant pt-4 text-control text-on-surface-variant">
        {isDigitalAsset && (
          <span className="inline-flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">
              download
            </span>
            {t("listing.specs.downloads", { count: downloadCount })}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">
            visibility
          </span>
          {viewCount} vizualizări
        </span>
      </div>
    </Panel>
  );
}
