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
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-md mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-extrabold tracking-tight text-on-surface"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {t("orders.list.title")}
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center py-16 space-y-4 text-center">
          <span className="material-symbols-outlined text-outline text-[64px]">receipt_long</span>
          <p className="text-on-surface-variant">{t("orders.list.empty")}</p>
          <Link
            to="/"
            className="bg-primary text-on-primary px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            {t("orders.list.browse")}
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="bg-surface-container rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <Link
                    to={`/anunturi/${order.listing_id}`}
                    className="text-sm font-semibold text-primary hover:underline font-mono truncate block"
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
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[order.status] ?? STATUS_STYLES.cancelled}`}
                >
                  {t(`orders.status.${order.status}` as any)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-primary text-lg">
                  {order.amount_ron.toLocaleString("ro-RO")} {order.currency}
                </span>
                {order.status === "paid" && (
                  <Link
                    to={`/anunturi/${order.listing_id}`}
                    className="flex items-center gap-1 text-primary font-medium hover:underline text-sm"
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
