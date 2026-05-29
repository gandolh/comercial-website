import { useState } from "react";
import { useParams, useSearchParams, Navigate } from "@core/lib/router";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { useCategoryListings } from "../hooks/useCategoryListings";
import { FilterSidebar } from "../components/FilterSidebar";
import { CategoryHeader } from "../components/CategoryHeader";
import { SortBar } from "../components/SortBar";
import { ListingGrid } from "../components/ListingGrid";
import { Pagination } from "../components/Pagination";
import { CATEGORY_LABELS } from "../types";
import type { FilterState } from "../types";

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

export function CategoryPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const isKnownSlug = Boolean(CATEGORY_LABELS[slug]);
  const filters = parseFilters(searchParams);

  const { data, isFetching, isError, refetch } = useCategoryListings(
    slug,
    filters,
    undefined,
    isKnownSlug,
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
    setSearchParams({});
  }

  function handlePageChange(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("pagina", String(page));
      return next;
    });
  }

  if (!isKnownSlug) {
    return <Navigate to="/categorii" replace />;
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
          <CategoryHeader
            slug={slug}
            totalCount={data?.totalCount}
            isLoading={isFetching}
          />
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
