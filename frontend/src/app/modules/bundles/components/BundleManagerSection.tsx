import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useBundleItems, useSetBundleItems } from "../hooks/useBundleItems";
import { useMyListings } from "@app/modules/dashboard/hooks/useMyListings";
import type { ListingCard } from "@app/types/listing";

interface BundleManagerSectionProps {
  /** The listing being edited (the bundle parent). */
  listingId: string;
  /** Whether the listing is currently marked as a bundle by the server. */
  isBundle: boolean;
  /** The listing's own price (for the discount helper). */
  priceRon: number | null;
  /** Called when the user saves; parent should refetch the listing. */
  onSaved?: () => void;
}

/**
 * BundleManagerSection — lets the listing owner toggle is_bundle and pick
 * child listings. Rendered inside EditListingPage.
 *
 * Reuses:
 *  - useBundleItems / useSetBundleItems  (bundles/hooks/useBundleItems)
 *  - useMyListings                        (dashboard/hooks/useMyListings)
 *  - setBundleItems service               (indirectly via useSetBundleItems)
 *
 * State strategy:
 *  - `localIsBundle` is purely local UI (initialized from prop, driven by toggle).
 *  - `localSelectedIds` is `null` until the user interacts; while null we fall back
 *    to the server-fetched children IDs. This avoids init-from-async-data effects.
 */
export function BundleManagerSection({
  listingId,
  isBundle,
  priceRon,
  onSaved,
}: BundleManagerSectionProps) {
  const { t } = useTranslation();

  const [localIsBundle, setLocalIsBundle] = useState(isBundle);
  // null = not yet touched by user; string[] = user has interacted
  const [localSelectedIds, setLocalSelectedIds] = useState<string[] | null>(null);

  // ---- existing children (pre-populate when bundle is on) ----
  const { data: existingChildren, isLoading: childrenLoading } = useBundleItems(
    listingId,
    localIsBundle
  );

  // Effective selection: user-driven list OR server data, whichever is available.
  const effectiveSelectedIds: string[] = useMemo(() => {
    if (localSelectedIds !== null) return localSelectedIds;
    return existingChildren?.map((c) => c.id) ?? [];
  }, [localSelectedIds, existingChildren]);

  const selectedSet = useMemo(() => new Set(effectiveSelectedIds), [effectiveSelectedIds]);

  // ---- owner's own listings for the picker ----
  const { data: myListingsData, isLoading: pickListLoading } = useMyListings({
    active: true,
  });

  const candidateListings: ListingCard[] = useMemo(() => {
    const items: ListingCard[] = myListingsData?.listings ?? [];
    return items.filter((l) => l.id !== listingId);
  }, [myListingsData, listingId]);

  // ---- save mutation ----
  const setItems = useSetBundleItems(listingId);

  const handleToggleChild = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setLocalSelectedIds(Array.from(next));
  };

  const handleSave = async () => {
    try {
      await setItems.mutateAsync(localIsBundle ? effectiveSelectedIds : []);
      toast.success(t("bundles.edit.saved"));
      onSaved?.();
    } catch {
      toast.error(t("bundles.edit.saveError"));
    }
  };

  // ---- price comparison helper ----
  const selectedListings = candidateListings.filter((l) => selectedSet.has(l.id));
  const allFreeOrNone =
    selectedListings.length === 0 ||
    selectedListings.every((l) => l.priceRon == null || l.priceRon === 0);

  const sumPrices = selectedListings.reduce(
    (acc, l) => acc + (l.priceRon ?? 0),
    0
  );

  const discountPct =
    !allFreeOrNone && priceRon != null && priceRon > 0 && sumPrices > 0
      ? Math.round(((sumPrices - priceRon) / sumPrices) * 100)
      : null;

  const showPriceHelper = localIsBundle && !allFreeOrNone && selectedListings.length > 0;
  const bundlePriceAbove =
    showPriceHelper && priceRon != null && priceRon >= sumPrices;

  return (
    <section className="bg-surface p-6 rounded-2xl border border-outline-variant space-y-6">
      <h2 className="text-xl font-bold border-b pb-4">
        {t("bundles.edit.sectionTitle")}
      </h2>

      {/* Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-on-surface">
            {t("bundles.edit.toggleLabel")}
          </p>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {t("bundles.edit.toggleHint")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={localIsBundle}
          onClick={() => {
            setLocalIsBundle((v) => !v);
            if (!localIsBundle) {
              // Toggling off — clear local selection
              setLocalSelectedIds([]);
            } else {
              // Toggling on — reset to server state
              setLocalSelectedIds(null);
            }
          }}
          className={[
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
            localIsBundle ? "bg-primary" : "bg-outline",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-5 w-5 rounded-full bg-on-primary shadow transition-transform",
              localIsBundle ? "translate-x-6" : "translate-x-1",
            ].join(" ")}
          />
        </button>
      </div>

      {/* Child picker — only shown when bundle is enabled */}
      {localIsBundle && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-on-surface">
            {t("bundles.edit.childPickerLabel")}
          </p>

          {pickListLoading || childrenLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-surface-container-low animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : candidateListings.length === 0 ? (
            <p className="text-sm text-outline italic">
              {t("bundles.edit.noOtherListings")}
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant rounded-xl border border-outline-variant overflow-hidden max-h-80 overflow-y-auto">
              {candidateListings.map((listing) => {
                const checked = selectedSet.has(listing.id);
                const priceLabel =
                  listing.priceRon != null
                    ? `${listing.priceRon.toLocaleString("ro-RO")} RON`
                    : t("bundles.free");

                return (
                  <li key={listing.id}>
                    <label
                      className={[
                        "flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors select-none",
                        checked
                          ? "bg-primary-container/30"
                          : "bg-surface-container-lowest hover:bg-surface-container",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleChild(listing.id)}
                        className="h-4 w-4 rounded accent-primary"
                        aria-label={listing.title}
                      />
                      {listing.coverUrl ? (
                        <img
                          src={listing.coverUrl}
                          alt={listing.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-outline text-[18px]">
                            draft
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {listing.title}
                        </p>
                        <p className="text-xs text-outline mt-0.5 capitalize">
                          {listing.category}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">
                        {priceLabel}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Price comparison helper */}
          {showPriceHelper && (
            <div
              className={[
                "rounded-xl border px-4 py-3 text-sm space-y-1",
                bundlePriceAbove
                  ? "border-error/40 bg-error-container/10 text-on-surface"
                  : "border-tertiary/40 bg-tertiary-container/20 text-on-surface",
              ].join(" ")}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-on-surface-variant">
                  {t("bundles.edit.sumLabel")}
                </span>
                <span className="font-bold text-on-surface">
                  {sumPrices.toLocaleString("ro-RO")} RON
                </span>
              </div>
              {discountPct !== null && discountPct > 0 && (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-on-surface-variant">
                    {t("bundles.edit.discountLabel")}
                  </span>
                  <span className="font-bold text-tertiary">
                    -{discountPct}%
                  </span>
                </div>
              )}
              {bundlePriceAbove && (
                <p className="text-xs text-error font-medium pt-1">
                  {t("bundles.edit.priceWarning")}
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-outline">
            {t("bundles.edit.selectedCount", { count: selectedSet.size })}
          </p>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={setItems.isPending}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
        >
          {setItems.isPending && (
            <span
              className="material-symbols-outlined animate-spin text-xl"
              aria-hidden="true"
            >
              progress_activity
            </span>
          )}
          {t("bundles.edit.saveButton")}
        </button>
      </div>
    </section>
  );
}
