import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@core/lib/router";
import { ordersService, type Order } from "../services/orders.service";

function useOrderIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("order_id");
}

function useStatusFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("status");
}

export function OrderConfirmationPage() {
  const { t } = useTranslation();
  const orderId = useOrderIdFromUrl();
  const statusFromUrl = useStatusFromUrl();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [loadError, setError] = useState<string | null>(null);
  const error = orderId ? loadError : t("orders.confirmation.noOrderId");

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    const fetchOrder = async () => {
      try {
        // If provider=fake and status=paid in URL, call mark-paid first
        const params = new URLSearchParams(window.location.search);
        const provider = params.get("provider");
        if (provider === "fake" && statusFromUrl === "paid") {
          try {
            await ordersService.markPaid(orderId);
          } catch {
            // might already be paid, that's fine
          }
        }

        const fetched = await ordersService.getOrder(orderId);
        if (!cancelled) {
          setOrder(fetched);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(t("orders.confirmation.loadError"));
          setLoading(false);
        }
      }
    };

    void fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId, statusFromUrl, t]);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 pt-28 pb-20">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-on-surface-variant">{t("orders.confirmation.loading")}</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 px-4 pt-28 pb-20">
        <span className="material-symbols-outlined text-[64px] text-error">error</span>
        <h1 className="text-2xl font-bold text-on-surface">{t("orders.confirmation.errorTitle")}</h1>
        <p className="text-on-surface-variant">{error ?? t("orders.confirmation.loadError")}</p>
        <Link to="/" className="font-bold text-primary hover:underline">
          {t("orders.confirmation.backHome")}
        </Link>
      </main>
    );
  }

  const isPaid = order.status === "paid";
  const listingHref = `/anunturi/${order.listing_id}`;

  return (
    <main className="mx-auto max-w-lg space-y-8 px-4 pt-28 pb-20">
      {isPaid ? (
        <div className="flex flex-col items-center space-y-4 text-center">
          <span className="material-symbols-outlined text-[72px] text-primary">check_circle</span>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">
            {t("orders.confirmation.successTitle")}
          </h1>
          <p className="text-on-surface-variant">{t("orders.confirmation.successBody")}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 text-center">
          <span className="material-symbols-outlined text-[72px] text-error">cancel</span>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">
            {t("orders.confirmation.pendingTitle")}
          </h1>
          <p className="text-on-surface-variant">{t("orders.confirmation.pendingBody")}</p>
        </div>
      )}

      <div className="space-y-3 rounded-2xl bg-surface-container p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">{t("orders.confirmation.orderId")}</span>
          <span className="font-mono text-xs text-on-surface">{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">{t("orders.confirmation.amount")}</span>
          <span className="font-bold text-primary">
            {order.amount_ron.toLocaleString("ro-RO")} {order.currency}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">{t("orders.confirmation.status")}</span>
          <span className={`font-semibold ${isPaid ? "text-primary" : "text-outline"}`}>
            {t(`orders.status.${order.status}`)}
          </span>
        </div>
        {order.paid_at && (
          <div className="flex justify-between">
            <span className="text-on-surface-variant">{t("orders.confirmation.paidAt")}</span>
            <span className="text-on-surface">{new Date(order.paid_at).toLocaleString("ro-RO")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isPaid && (
          <Link
            to={listingHref}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            {t("orders.confirmation.goDownload")}
          </Link>
        )}
        <Link
          to="/comenzi"
          className="flex items-center justify-center gap-2 rounded-full border border-outline-variant px-6 py-3 font-semibold text-on-surface transition-colors hover:bg-surface-container"
        >
          {t("orders.confirmation.viewOrders")}
        </Link>
        <Link to="/" className="text-center text-sm text-outline transition-colors hover:text-primary">
          {t("orders.confirmation.backHome")}
        </Link>
      </div>
    </main>
  );
}
