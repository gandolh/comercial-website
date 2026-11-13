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
      <main className="mx-auto max-w-screen-2xl px-4 pt-10 pb-20 md:px-8">
        <div className="mx-auto max-w-2xl space-y-5 py-20 text-center">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "56px" }}>
            favorite
          </span>
          <h1 className="font-headline text-4xl font-black text-on-surface">Nu ai încă anunțuri salvate</h1>
          <p className="text-on-surface-variant">
            Când salvezi anunțuri, le vei găsi aici pentru a reveni rapid la ele.
          </p>
          <Link
            to="/categorii"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 font-bold text-on-primary no-underline"
          >
            Explorează categoriile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-2xl space-y-8 px-4 pt-10 pb-20 md:px-8">
      <div>
        <h1 className="font-headline text-4xl font-black text-on-surface">Favoritele mele</h1>
        <p className="mt-2 text-on-surface-variant">{data?.totalCount ?? 0} anunțuri salvate</p>
      </div>

      {isError ? (
        <ErrorCard message="Nu am putut încărca favoritele." onRetry={() => refetch()} />
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
