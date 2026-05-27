import { useState } from "react";
import { useSearchParams } from "@core/lib/router";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { useCategoryListings } from "@app/modules/categories/hooks/useCategoryListings";
import { FilterSidebar } from "@app/modules/categories/components/FilterSidebar";
import { SortBar } from "@app/modules/categories/components/SortBar";
import { ListingGrid } from "@app/modules/categories/components/ListingGrid";
import { Pagination } from "@app/modules/categories/components/Pagination";
import type { FilterState } from "@app/modules/categories/types";

function parseFilters(params: URLSearchParams): FilterState {
  return {
    licenta: params.get("licenta"),
    format: params.get("format"),
    pret_min: params.get("pret_min") ? Number(params.get("pret_min")) : null,
    pret_max: params.get("pret_max") ? Number(params.get("pret_max")) : null,
    data: (params.get("data") as FilterState["data"]) ?? "oricand",
    verificat: params.get("verificat") === "1",
    sortare: (params.get("sortare") as FilterState["sortare"]) ?? "noi",
    pagina: params.get("pagina") ? Number(params.get("pagina")) : 1,
  };
}

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const q = searchParams.get("q") || "";
  const filters = parseFilters(searchParams);

  const { data, isFetching, isError, refetch } = useCategoryListings(
    undefined,
    filters,
    q,
  );

  function setFilter(
    key: keyof FilterState,
    value: FilterState[keyof FilterState],
  ) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (
        value === null ||
        value === false ||
        value === "" ||
        value === "oricand" ||
        value === "noi"
      ) {
        next.delete(key);
      } else {
        next.set(key, String(value === true ? "1" : value));
      }
      if (key !== "pagina") next.delete("pagina");
      return next;
    });
  }

  function resetFilters() {
    setSearchParams(q ? { q } : {});
  }

  function handlePageChange(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("pagina", String(page));
      return next;
    });
  }

  return (
    <main className="mt-24 flex-grow max-w-screen-2xl mx-auto w-full px-8 pb-16 flex gap-8">
      <FilterSidebar
        filters={filters}
        onChange={setFilter}
        onReset={resetFilters}
      />

      <section className="flex-grow min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1
              className="text-2xl font-black text-on-surface"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {q ? `Rezultate pentru "${q}"` : "Toate anunțurile"}
            </h1>
            <p className="text-on-surface-variant text-sm">
              {isFetching
                ? "Se încarcă..."
                : `${data?.totalCount || 0} anunțuri găsite`}
            </p>
          </div>
          <SortBar
            sortare={filters.sortare}
            viewMode={viewMode}
            onSortChange={(v) => setFilter("sortare", v)}
            onViewModeChange={setViewMode}
          />
        </div>

        {isError ? (
          <ErrorCard
            message="Nu am putut încărca anunțurile."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <ListingGrid
              listings={data?.listings ?? []}
              isLoading={isFetching}
              viewMode={viewMode}
              onReset={resetFilters}
            />
            <Pagination
              currentPage={filters.pagina}
              totalPages={data?.totalPages ?? 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </main>
  );
}
