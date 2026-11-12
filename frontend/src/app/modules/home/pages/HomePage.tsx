import { useState } from "react";
import { useNavigate } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { CardSkeleton } from "@core/components/ui/Skeleton";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { SearchAutocomplete } from "@core/components/ui/SearchAutocomplete";
import { ListingCard } from "../components/ListingCard";
import { useFeaturedListings } from "../hooks/useFeaturedListings";
import type { HomeCategory } from "../types";

const CATEGORIES: HomeCategory[] = [
  { icon: "palette", label: "Grafică & Ilustrații", slug: "grafica" },
  { icon: "dashboard_customize", label: "Șabloane & Template-uri", slug: "sabloane" },
  { icon: "apps", label: "Software & Aplicații", slug: "software" },
  { icon: "terminal", label: "Cod Sursă", slug: "cod-sursa" },
  { icon: "music_note", label: "Audio & Muzică", slug: "audio" },
  { icon: "movie", label: "Video & Motion", slug: "video" },
  { icon: "menu_book", label: "E-Bookuri & Cursuri", slug: "ebook" },
  { icon: "font_download", label: "Fonturi", slug: "fonturi" },
  { icon: "description", label: "Documente & Template-uri Legale", slug: "documente" },
  { icon: "view_in_ar", label: "Modele 3D & AR", slug: "3d" },
  { icon: "brush", label: "Artizanat Digital", slug: "mestesugart" },
  { icon: "celebration", label: "Invitații Digitale", slug: "invitatii" },
  { icon: "category", label: "Diverse", slug: "diverse" },
];

export function HomePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const featuredListings = useFeaturedListings();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    navigate(`/anunturi?${params.toString()}`);
  };

  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="bg-surface-container-low px-8 py-16 md:py-24">
        <div className="mx-auto max-w-screen-xl space-y-12 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-on-surface md:text-7xl">
              {t("home.heroTitle")} <span className="text-primary">{t("home.heroTitleHighlight")}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">{t("home.heroSubtitle")}</p>
          </div>

          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-4xl items-center gap-2 rounded-full bg-surface-container-lowest p-2 shadow-search"
          >
            <div className="flex flex-1 items-center px-6">
              <SearchAutocomplete
                value={search}
                onChange={setSearch}
                onSelect={(val) => {
                  const params = new URLSearchParams();
                  if (val) params.set("q", val);
                  navigate(`/anunturi?${params.toString()}`);
                }}
                placeholder={t("home.searchPlaceholder")}
                className="w-full"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-primary px-10 py-4 text-lg font-bold text-on-primary transition-colors hover:bg-primary-container"
            >
              {t("home.searchButton")}
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-screen-2xl px-8 py-20">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{t("home.popularCategories")}</h2>
          <button
            onClick={() => navigate("/categorii")}
            className="cursor-pointer border-none bg-transparent font-bold text-primary hover:underline"
          >
            {t("home.viewAllCategories")}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map(({ icon, label, slug }) => (
            <button
              key={slug}
              onClick={() => navigate(`/categorii/${slug}`)}
              className="group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl bg-surface-container-lowest p-8 text-center transition-all hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
                  {icon}
                </span>
              </div>
              <span className="text-sm leading-tight font-bold text-on-surface">{label}</span>
            </button>
          ))}

          <button
            onClick={() => navigate("/categorii")}
            className="group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-8 text-center transition-colors hover:border-primary"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest text-outline transition-colors group-hover:text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
                grid_view
              </span>
            </div>
            <span className="text-sm font-bold text-on-surface">{t("home.viewAllCategories")}</span>
          </button>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-surface-container-low px-8 py-20">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight">{t("home.featuredListings")}</h2>
              <p className="text-on-surface-variant">{t("home.featuredSubtitle")}</p>
            </div>
          </div>

          {featuredListings.isError ? (
            <ErrorCard
              message="Nu am putut încărca anunțurile recomandate."
              onRetry={() => featuredListings.refetch()}
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredListings.isFetching
                ? Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)
                : featuredListings.data?.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}

          <div className="mt-16 text-center">
            <button
              onClick={() => navigate("/anunturi")}
              className="rounded-full border border-outline-variant bg-surface-container-lowest px-8 py-4 font-bold shadow-sm transition-colors hover:bg-surface"
            >
              {t("home.loadMore")}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-screen-xl px-8 py-24">
        <div className="relative space-y-8 overflow-hidden rounded-[2rem] bg-primary-container p-12 text-center md:p-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,var(--color-on-primary)_1px,transparent_0)] bg-[length:40px_40px] opacity-10" />
          <div className="relative z-raised space-y-4">
            <h2 className="text-4xl font-black text-on-primary md:text-5xl">{t("home.ctaTitle")}</h2>
            <p className="mx-auto max-w-xl text-lg text-on-primary-container">{t("home.ctaSubtitle")}</p>
          </div>
          <div className="relative z-raised flex flex-col items-center justify-center gap-4 md:flex-row">
            <button
              onClick={() => navigate("/adauga-anunt")}
              className="rounded-full bg-surface-container-lowest px-10 py-4 text-lg font-bold text-primary shadow-xl transition-transform hover:scale-105"
            >
              {t("home.ctaButton")}
            </button>
            <button className="rounded-full border border-on-primary/30 px-10 py-4 text-lg font-bold text-on-primary transition-colors hover:bg-on-primary/10">
              {t("home.ctaHowItWorks")}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
