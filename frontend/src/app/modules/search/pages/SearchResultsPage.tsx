import { useState } from "react";
import { useSearchParams } from "@core/lib/router";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { useCategoryListings } from "@app/modules/categories/hooks/useCategoryListings";
import { ResultsBand } from "@app/modules/categories/components/ResultsBand";
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

  const { data, isFetching, isError, refetch } = useCategoryListings(undefined, filters, q);

  /** Sets the given filters in one change; any change but a page change goes back to the first page. */
  function setFilters(patch: Partial<FilterState>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === false || value === "" || value === "oricand" || value === "noi") {
          next.delete(key);
        } else {
          next.set(key, String(value === true ? "1" : value));
        }
        if (key !== "pagina") next.delete("pagina");
      }
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
    <>
      <ResultsBand
        title={q ? `Rezultate pentru "${q}"` : "Toate anunțurile"}
        count={isFetching ? "Se încarcă..." : `${data?.totalCount || 0} anunțuri găsite`}
        filters={filters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onChange={setFilters}
        onReset={resetFilters}
      />

      <main className="mx-auto w-full max-w-310 grow px-4 pt-5 pb-9 md:px-6 md:pt-6 md:pb-16">
        {isError ? (
          <ErrorCard message="Nu am putut încărca anunțurile." onRetry={() => refetch()} />
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
      </main>
    </>
  );
}
