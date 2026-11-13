import { useId, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@core/components/ui";
import { useBundleItems, useSetBundleItems } from "../hooks/useBundleItems";
import { useMyListings } from "@app/modules/dashboard/hooks/useMyListings";
import type { ListingCard } from "@app/types/listing";
import { Checkbox, Switch } from "@core/components/ui";

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
export function BundleManagerSection({ listingId, isBundle, priceRon, onSaved }: BundleManagerSectionProps) {
  const { t } = useTranslation();
  const toggleLabelId = useId();

  const [localIsBundle, setLocalIsBundle] = useState(isBundle);
  // null = not yet touched by user; string[] = user has interacted
  const [localSelectedIds, setLocalSelectedIds] = useState<string[] | null>(null);

  // ---- existing children (pre-populate when bundle is on) ----
  const { data: existingChildren, isLoading: childrenLoading } = useBundleItems(listingId, localIsBundle);

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
    selectedListings.length === 0 || selectedListings.every((l) => l.priceRon == null || l.priceRon === 0);

  const sumPrices = selectedListings.reduce((acc, l) => acc + (l.priceRon ?? 0), 0);

  const discountPct =
    !allFreeOrNone && priceRon != null && priceRon > 0 && sumPrices > 0
      ? Math.round(((sumPrices - priceRon) / sumPrices) * 100)
      : null;

  const showPriceHelper = localIsBundle && !allFreeOrNone && selectedListings.length > 0;
  const bundlePriceAbove = showPriceHelper && priceRon != null && priceRon >= sumPrices;

  return (
    <section className="space-y-6 rounded-2xl border border-outline-variant bg-surface p-6">
      <h2 className="border-b pb-4 text-xl font-bold">{t("bundles.edit.sectionTitle")}</h2>

      {/* Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p id={toggleLabelId} className="font-semibold text-on-surface">
            {t("bundles.edit.toggleLabel")}
          </p>
          <p className="mt-0.5 text-sm text-on-surface-variant">{t("bundles.edit.toggleHint")}</p>
        </div>
        <Switch
          size="lg"
          aria-labelledby={toggleLabelId}
          checked={localIsBundle}
          onCheckedChange={() => {
            setLocalIsBundle((v) => !v);
            if (!localIsBundle) {
              // Toggling off — clear local selection
              setLocalSelectedIds([]);
            } else {
              // Toggling on — reset to server state
              setLocalSelectedIds(null);
            }
          }}
        />
      </div>

      {/* Child picker — only shown when bundle is enabled */}
      {localIsBundle && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-on-surface">{t("bundles.edit.childPickerLabel")}</p>

          {pickListLoading || childrenLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-surface-container-low motion-safe:animate-pulse" />
              ))}
            </div>
          ) : candidateListings.length === 0 ? (
            <p className="text-sm text-outline italic">{t("bundles.edit.noOtherListings")}</p>
          ) : (
            <ul className="max-h-80 divide-y divide-outline-variant overflow-hidden overflow-y-auto rounded-xl border border-outline-variant">
              {candidateListings.map((listing) => {
                const checked = selectedSet.has(listing.id);
                const priceLabel =
                  listing.priceRon != null ? `${listing.priceRon.toLocaleString("ro-RO")} RON` : t("bundles.free");

                return (
                  <li key={listing.id}>
                    <label
                      className={[
                        "flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors select-none",
                        checked ? "bg-primary-container/30" : "bg-surface-container-lowest hover:bg-surface-container",
                      ].join(" ")}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => handleToggleChild(listing.id)}
                        aria-label={listing.title}
                      />
                      {listing.coverUrl ? (
                        <img
                          src={listing.coverUrl}
                          alt={listing.title}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                          <span className="material-symbols-outlined text-[18px] text-outline">draft</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">{listing.title}</p>
                        <p className="mt-0.5 text-xs text-outline capitalize">{listing.category}</p>
                      </div>
                      <span className="text-sm font-bold whitespace-nowrap text-primary">{priceLabel}</span>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-on-surface-variant">{t("bundles.edit.sumLabel")}</span>
                <span className="font-bold text-on-surface">{sumPrices.toLocaleString("ro-RO")} RON</span>
              </div>
              {discountPct !== null && discountPct > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-on-surface-variant">{t("bundles.edit.discountLabel")}</span>
                  <span className="font-bold text-tertiary">-{discountPct}%</span>
                </div>
              )}
              {bundlePriceAbove && (
                <p className="pt-1 text-xs font-medium text-error">{t("bundles.edit.priceWarning")}</p>
              )}
            </div>
          )}

          <p className="text-xs text-outline">{t("bundles.edit.selectedCount", { count: selectedSet.size })}</p>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={setItems.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-base font-semibold text-on-primary transition-all outline-none hover:bg-primary-container focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {setItems.isPending && (
            <span className="material-symbols-outlined text-xl motion-safe:animate-spin" aria-hidden="true">
              progress_activity
            </span>
          )}
          {t("bundles.edit.saveButton")}
        </button>
      </div>
    </section>
  );
}
