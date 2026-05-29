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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError(t("orders.confirmation.noOrderId"));
      return;
    }

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

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId, statusFromUrl, t]);

  if (loading) {
    return (
      <main className="pt-28 pb-20 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-on-surface-variant">{t("orders.confirmation.loading")}</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="pt-28 pb-20 px-4 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <span className="material-symbols-outlined text-error text-[64px]">error</span>
        <h1 className="text-2xl font-bold text-on-surface">{t("orders.confirmation.errorTitle")}</h1>
        <p className="text-on-surface-variant">{error ?? t("orders.confirmation.loadError")}</p>
        <Link to="/" className="text-primary font-bold hover:underline">
          {t("orders.confirmation.backHome")}
        </Link>
      </main>
    );
  }

  const isPaid = order.status === "paid";
  const listingHref = `/anunturi/${order.listing_id}`;

  return (
    <main className="pt-28 pb-20 px-4 max-w-lg mx-auto space-y-8">
      {isPaid ? (
        <div className="flex flex-col items-center space-y-4 text-center">
          <span className="material-symbols-outlined text-primary text-[72px]">check_circle</span>
          <h1
            className="text-3xl font-extrabold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {t("orders.confirmation.successTitle")}
          </h1>
          <p className="text-on-surface-variant">
            {t("orders.confirmation.successBody")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 text-center">
          <span className="material-symbols-outlined text-error text-[72px]">cancel</span>
          <h1
            className="text-3xl font-extrabold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {t("orders.confirmation.pendingTitle")}
          </h1>
          <p className="text-on-surface-variant">
            {t("orders.confirmation.pendingBody")}
          </p>
        </div>
      )}

      <div className="bg-surface-container rounded-2xl p-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">{t("orders.confirmation.orderId")}</span>
          <span className="font-mono text-on-surface text-xs">{order.id}</span>
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
            {t(`orders.status.${order.status}` as any)}
          </span>
        </div>
        {order.paid_at && (
          <div className="flex justify-between">
            <span className="text-on-surface-variant">{t("orders.confirmation.paidAt")}</span>
            <span className="text-on-surface">
              {new Date(order.paid_at).toLocaleString("ro-RO")}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isPaid && (
          <Link
            to={listingHref}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            {t("orders.confirmation.goDownload")}
          </Link>
        )}
        <Link
          to="/comenzi"
          className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-6 py-3 rounded-full font-semibold hover:bg-surface-container transition-colors"
        >
          {t("orders.confirmation.viewOrders")}
        </Link>
        <Link
          to="/"
          className="text-center text-sm text-outline hover:text-primary transition-colors"
        >
          {t("orders.confirmation.backHome")}
        </Link>
      </div>
    </main>
  );
}
