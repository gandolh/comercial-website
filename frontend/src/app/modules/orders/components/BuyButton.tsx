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
      <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
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
    } catch (err) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } } | null | undefined)?.response
        ?.data;
      const msg: string = data?.message ?? data?.error ?? t("orders.buyButton.error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => void handleBuy()}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-control bg-primary px-6 py-3 text-base font-bold text-on-primary transition-all hover:opacity-90 disabled:opacity-60"
        aria-label={t("orders.buyButton.ariaLabel", { price: priceRon })}
      >
        <span className="material-symbols-outlined text-[20px]">{loading ? "hourglass_empty" : "shopping_cart"}</span>
        {loading
          ? t("orders.buyButton.loading")
          : t("orders.buyButton.label", { price: priceRon.toLocaleString("ro-RO") })}
      </button>
      <p className="px-2 text-center text-xs text-on-surface-variant">{t("orders.buyButton.simulated")}</p>
      {error && <p className="px-2 text-center text-xs text-error">{error}</p>}
    </div>
  );
}
