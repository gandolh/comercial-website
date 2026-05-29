import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@core/lib/router";
import { useAuth } from "@core/lib/auth";
import { ordersService } from "../services/orders.service";

interface BuyButtonProps {
  listingId: string;
  priceRon: number;
  /** If the buyer already has a paid order for this listing. */
  hasPaidOrder?: boolean;
  /** Called when the order is already paid (e.g. to show download). */
  onAlreadyPaid?: () => void;
}

export function BuyButton({ listingId, priceRon, hasPaidOrder = false, onAlreadyPaid }: BuyButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hasPaidOrder) {
    return (
      <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-3 rounded-xl font-semibold text-sm">
        <span className="material-symbols-outlined text-[20px]">verified</span>
        {t("orders.buyButton.owned")}
      </div>
    );
  }

  const handleBuy = async () => {
    if (!user) {
      navigate("/autentificare");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base = window.location.origin;
      const returnUrl = `${base}/comenzi/confirmare`;
      const cancelUrl = `${base}/anunturi/${listingId}`;

      const result = await ordersService.createOrder(listingId, returnUrl, cancelUrl);

      if (result.already_paid) {
        onAlreadyPaid?.();
        return;
      }

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        t("orders.buyButton.error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
        aria-label={t("orders.buyButton.ariaLabel", { price: priceRon })}
      >
        <span className="material-symbols-outlined text-[20px]">
          {loading ? "hourglass_empty" : "shopping_cart"}
        </span>
        {loading
          ? t("orders.buyButton.loading")
          : t("orders.buyButton.label", { price: priceRon.toLocaleString("ro-RO") })}
      </button>
      {error && (
        <p className="text-error text-xs text-center px-2">{error}</p>
      )}
    </div>
  );
}
