import { FavoriteToggle } from "@app/modules/favorites/components/FavoriteToggle";
import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import { useNavigate } from "@core/lib/router";
import { useState } from "react";
import { downloadAsset } from "@app/modules/listings/services/listings";
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
  const formattedPrice =
    priceRon != null ? `${priceRon.toLocaleString("ro-RO")} RON` : "Gratuit";

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
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.04)] space-y-8">
      <div className="flex justify-end">
        <FavoriteToggle listingId={listingId} />
      </div>
      <div className="hidden lg:block">
        <h1
          className="text-2xl font-extrabold tracking-tight text-on-surface mb-2"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {title}
        </h1>
        <div className="text-4xl font-black text-primary">{formattedPrice}</div>
      </div>

      <div className="space-y-4">
        {isOwner ? (
          <Link
            to={`/anunturi/${listingId}/editeaza`}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all no-underline"
          >
            <span className="material-symbols-outlined">edit</span>
            {t("listing.actions.edit")}
          </Link>
        ) : isDigitalAsset ? (
          <>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
            >
              <span className="material-symbols-outlined">download</span>
              {isDownloading ? "Se descarcă..." : t("listing.download.button")}
            </button>
            <button
              onClick={() => {
                if (!user) { navigate("/autentificare"); return; }
                setIsContactModalOpen(true);
              }}
              className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">mail</span>
              {t("listing.download.contactAuthor")}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (!user) { navigate("/autentificare"); return; }
                setIsContactModalOpen(true);
              }}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">chat</span>
              Trimite Mesaj
            </button>
          </>
        )}
      </div>

      <ContactSellerModal
        listingId={listingId}
        sellerName={sellerName}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
        {isDigitalAsset && (
          <div className="flex items-center gap-2 text-outline text-sm">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            {t("listing.specs.downloads", { count: downloadCount })}
          </div>
        )}
        <div className="flex items-center gap-2 text-outline text-sm ml-auto">
          <span className="material-symbols-outlined text-[18px]">
            visibility
          </span>
          {viewCount} vizualizări
        </div>
      </div>
    </div>
  );
}
