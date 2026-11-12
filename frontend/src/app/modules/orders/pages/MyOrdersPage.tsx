import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@core/lib/router";
import { useAuth } from "@core/lib/auth";
import { useNavigate } from "@core/lib/router";
import { ordersService, type Order } from "../services/orders.service";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-primary/10 text-primary",
  pending: "bg-tertiary/10 text-tertiary",
  failed: "bg-error-container text-on-error-container",
  cancelled: "bg-surface-container-highest text-on-surface-variant",
};

export function MyOrdersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/autentificare");
      return;
    }
    let cancelled = false;
    ordersService
      .listOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("orders.list.loadError"));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, navigate, t]);

  return (
    <main className="mx-auto max-w-screen-md space-y-8 px-4 pt-28 pb-20 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          {t("orders.list.title")}
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {error && <div className="rounded-xl bg-error-container px-4 py-3 text-on-error-container">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center space-y-4 py-16 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline">receipt_long</span>
          <p className="text-on-surface-variant">{t("orders.list.empty")}</p>
          <Link
            to="/"
            className="rounded-full bg-primary px-6 py-2 font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            {t("orders.list.browse")}
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="space-y-3 rounded-2xl bg-surface-container p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    to={`/anunturi/${order.listing_id}`}
                    className="block truncate font-mono text-sm font-semibold text-primary hover:underline"
                  >
                    {t("orders.list.listingLink")} {order.listing_id}
                  </Link>
                  <p className="text-xs text-outline">
                    {new Date(order.created_at).toLocaleDateString("ro-RO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[order.status] ?? STATUS_STYLES.cancelled}`}
                >
                  {t(`orders.status.${order.status}`)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-lg font-bold text-primary">
                  {order.amount_ron.toLocaleString("ro-RO")} {order.currency}
                </span>
                {order.status === "paid" && (
                  <Link
                    to={`/anunturi/${order.listing_id}`}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    {t("orders.list.downloadAction")}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
