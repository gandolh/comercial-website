import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useBundleItems } from "../hooks/useBundleItems";
import type { BundleChildCard } from "../types/bundle";

interface BundleChildRowProps {
  child: BundleChildCard;
}

function BundleChildRow({ child }: BundleChildRowProps) {
  const { t } = useTranslation();
  const formattedPrice = child.price_ron != null ? `${child.price_ron.toLocaleString("ro-RO")} RON` : t("bundles.free");

  return (
    <li className="flex items-center gap-4 bg-surface-container-lowest px-5 py-4 transition-colors hover:bg-surface-container">
      {child.cover_url ? (
        <img src={child.cover_url} alt={child.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container">
          <span className="material-symbols-outlined text-[20px] text-outline">draft</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-on-surface">{child.title}</p>
        <p className="mt-0.5 text-xs text-outline capitalize">{child.category}</p>
      </div>
      <span className="text-sm font-bold whitespace-nowrap text-primary">{formattedPrice}</span>
      <Link
        to={`/anunturi/${child.id}`}
        className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-primary hover:underline"
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
        <h2 className="font-headline text-lg font-bold text-on-surface">{t("bundles.title")}</h2>
        <div className="divide-y divide-surface-container-high overflow-hidden rounded-xl border border-surface-container-high">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-surface-container" />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !children) {
    return (
      <section className="space-y-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">{t("bundles.title")}</h2>
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
        <h2 className="font-headline text-lg font-bold text-on-surface">{t("bundles.title")}</h2>
        <span className="text-sm text-outline">{t("bundles.count", { count: children.length })}</span>
      </div>
      <ul className="divide-y divide-surface-container-high overflow-hidden rounded-xl border border-surface-container-high">
        {children.map((child) => (
          <BundleChildRow key={child.id} child={child} />
        ))}
      </ul>
      <p className="text-xs text-outline">{t("bundles.accessNote")}</p>
    </section>
  );
}
