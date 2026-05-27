import { Link, Navigate, useSearchParams } from "@core/lib/router";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { Pagination } from "@app/modules/categories/components/Pagination";
import { ListingGrid } from "@app/modules/categories/components/ListingGrid";
import { useAuth } from "@core/lib/auth";
import { useFavoritesPage } from "../hooks/useFavoritesPage";

export function FavoritesPage() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("pagina") ?? "1");
  const { data, isFetching, isError, refetch } = useFavoritesPage(page);

  if (!isAuthenticated) {
    return <Navigate to="/autentificare?next=%2Ffavorite" replace />;
  }

  if (!isFetching && data && data.listings.length === 0) {
    return (
      <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="max-w-2xl mx-auto text-center py-20 space-y-5">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: "56px" }}
          >
            favorite
          </span>
          <h1
            className="text-4xl font-black text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Nu ai încă anunțuri salvate
          </h1>
          <p className="text-on-surface-variant">
            Când salvezi anunțuri, le vei găsi aici pentru a reveni rapid la
            ele.
          </p>
          <Link
            to="/categorii"
            className="inline-flex items-center justify-center bg-primary text-on-primary px-8 py-3 rounded-full font-bold no-underline"
          >
            Explorează categoriile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      <div>
        <h1
          className="text-4xl font-black text-on-surface"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Favoritele mele
        </h1>
        <p className="text-on-surface-variant mt-2">
          {data?.totalCount ?? 0} anunțuri salvate
        </p>
      </div>

      {isError ? (
        <ErrorCard
          message="Nu am putut încărca favoritele."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <ListingGrid
            listings={data?.listings ?? []}
            isLoading={isFetching}
            viewMode="grid"
            onReset={() => undefined}
          />
          <Pagination
            currentPage={page}
            totalPages={data?.totalPages ?? 1}
            onPageChange={(nextPage) => {
              const next = new URLSearchParams(searchParams);
              next.set("pagina", String(nextPage));
              setSearchParams(next);
            }}
          />
        </>
      )}
    </main>
  );
}
