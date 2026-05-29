import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useBundleItems } from "../hooks/useBundleItems";
import type { BundleChildCard } from "../types/bundle";

interface BundleChildRowProps {
  child: BundleChildCard;
}

function BundleChildRow({ child }: BundleChildRowProps) {
  const { t } = useTranslation();
  const formattedPrice =
    child.price_ron != null
      ? `${child.price_ron.toLocaleString("ro-RO")} RON`
      : t("bundles.free");

  return (
    <li className="flex items-center gap-4 px-5 py-4 bg-surface-container-lowest hover:bg-surface-container transition-colors">
      {child.cover_url ? (
        <img
          src={child.cover_url}
          alt={child.title}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-outline text-[20px]">draft</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{child.title}</p>
        <p className="text-xs text-outline mt-0.5 capitalize">{child.category}</p>
      </div>
      <span className="text-sm font-bold text-primary whitespace-nowrap">{formattedPrice}</span>
      <Link
        to={`/anunturi/${child.id}`}
        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline whitespace-nowrap"
        aria-label={`${t("bundles.viewListing")} ${child.title}`}
      >
        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        {t("bundles.viewListing")}
      </Link>
    </li>
  );
}

interface BundleContentsProps {
  listingId: string;
}

/**
 * BundleContents — rendered inside ListingDetailPage when `is_bundle` is true.
 * Fetches and displays the child listings that belong to this bundle.
 */
export function BundleContents({ listingId }: BundleContentsProps) {
  const { t } = useTranslation();
  const { data: children, isLoading, isError } = useBundleItems(listingId, true);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2
          className="text-lg font-bold text-on-surface"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {t("bundles.title")}
        </h2>
        <div className="rounded-xl border border-surface-container-high overflow-hidden divide-y divide-surface-container-high">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-container animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !children) {
    return (
      <section className="space-y-4">
        <h2
          className="text-lg font-bold text-on-surface"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {t("bundles.title")}
        </h2>
        <p className="text-sm text-outline">{t("bundles.loadError")}</p>
      </section>
    );
  }

  if (children.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-bold text-on-surface"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {t("bundles.title")}
        </h2>
        <span className="text-sm text-outline">
          {t("bundles.count", { count: children.length })}
        </span>
      </div>
      <ul className="divide-y divide-surface-container-high rounded-xl border border-surface-container-high overflow-hidden">
        {children.map((child) => (
          <BundleChildRow key={child.id} child={child} />
        ))}
      </ul>
      <p className="text-xs text-outline">{t("bundles.accessNote")}</p>
    </section>
  );
}
