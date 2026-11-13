import { useState } from "react";
import { Link, useNavigate } from "@core/lib/router";
import { Button } from "@core/components/ui";
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
    <main className="flex-1">
      {/* Hero */}
      <section className="relative z-raised border-b border-outline-variant bg-surface-container-lowest shadow-band">
        <div className="mx-auto flex w-full max-w-310 flex-col items-start gap-4 px-4 py-7 md:px-6 md:py-10">
          <h1 className="font-headline font-extrabold tracking-[-0.01em] text-balance text-on-surface max-md:text-3xl max-md:leading-9 md:text-hero">
            {t("home.heroTitle")} {t("home.heroTitleHighlight")}
          </h1>
          <p className="max-w-[60ch] text-body text-on-surface-variant">{t("home.heroSubtitle")}</p>

          <form
            onSubmit={handleSearch}
            role="search"
            className="flex h-14 w-full items-center gap-2 rounded-[14px] bg-surface-container-lowest pr-1 pl-3 shadow-card ring-1 ring-outline ring-inset focus-within:ring-2 focus-within:ring-primary md:pl-4"
          >
            <SearchAutocomplete
              value={search}
              onChange={setSearch}
              onSelect={(val) => {
                const params = new URLSearchParams();
                if (val) params.set("q", val);
                navigate(`/anunturi?${params.toString()}`);
              }}
              placeholder={t("home.searchPlaceholder")}
              className="min-w-0 flex-1"
            />
            <Button type="submit" className="max-md:px-4">
              {t("home.searchButton")}
            </Button>
          </form>
        </div>
      </section>

      <div className="mx-auto w-full max-w-310 px-4 md:px-6">
        {/* Categories */}
        <section className="pt-8 md:pt-12" aria-labelledby="popular-categories">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="popular-categories" className="text-price font-extrabold text-on-surface">
              {t("home.popularCategories")}
            </h2>
            <Link
              to="/categorii"
              className="hidden py-3 text-control font-semibold text-primary underline underline-offset-3 sm:inline"
            >
              {t("home.viewAllCategories")}
            </Link>
          </div>

          <ul className="grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))]">
            {CATEGORIES.map(({ icon, label, slug }) => (
              <li key={slug}>
                <Link
                  to={`/categorii/${slug}`}
                  className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-2 py-3.5 text-center text-control font-semibold text-on-surface no-underline shadow-card transition-shadow hover:shadow-band md:min-h-16 md:flex-row md:justify-start md:gap-3 md:py-2 md:pr-3.5 md:pl-2.5 md:text-left"
                >
                  <span className="grid size-11 flex-none place-items-center rounded-full bg-primary-fixed text-on-primary-fixed">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {icon}
                    </span>
                  </span>
                  {label}
                </Link>
              </li>
            ))}
            <li className="col-span-2 md:col-span-1">
              <Link
                to="/categorii"
                className="flex min-h-16 items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant px-3.5 text-control font-semibold text-primary no-underline transition-colors hover:bg-primary-fixed md:justify-between"
              >
                {t("home.viewAllCategories")}
                <span className="material-symbols-outlined" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {/* Featured Listings */}
        <section className="pt-8 md:pt-12" aria-labelledby="featured-listings">
          <div className="mb-5">
            <h2 id="featured-listings" className="text-price font-extrabold text-on-surface">
              {t("home.featuredListings")}
            </h2>
            <p className="mt-1 text-control text-on-surface-variant">{t("home.featuredSubtitle")}</p>
          </div>

          {featuredListings.isError ? (
            <ErrorCard
              message="Nu am putut încărca anunțurile recomandate."
              onRetry={() => featuredListings.refetch()}
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4 md:gap-6">
              {featuredListings.isFetching
                ? Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)
                : featuredListings.data?.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}

          <div className="flex justify-center pt-7">
            <button
              type="button"
              onClick={() => navigate("/anunturi")}
              className="inline-flex h-12 items-center justify-center rounded-control border border-outline px-5 text-body font-semibold text-on-surface transition-colors hover:bg-surface-container-low active:brightness-90"
            >
              {t("home.loadMore")}
            </button>
          </div>
        </section>

        {/* CTA Banner */}
        <section
          aria-labelledby="cta-title"
          className="mt-10 mb-10 flex flex-col items-start gap-5 rounded-2xl bg-nav-band px-5 py-7 text-on-nav-band shadow-band md:mt-14 md:mb-16 md:px-8 md:py-12"
        >
          <h2
            id="cta-title"
            className="font-headline font-extrabold max-md:text-2xl max-md:leading-[1.875rem] md:text-title"
          >
            {t("home.ctaTitle")}
          </h2>
          <p className="max-w-[56ch] text-body">{t("home.ctaSubtitle")}</p>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <button
              type="button"
              onClick={() => navigate("/adauga-anunt")}
              className="inline-flex h-12 items-center justify-center rounded-control border border-on-nav-band bg-on-nav-band px-6 text-body font-semibold text-nav-band transition-colors hover:bg-on-nav-band/90 active:brightness-90"
            >
              {t("home.ctaButton")}
            </button>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-control border border-on-nav-band-variant px-6 text-body text-on-nav-band transition-colors hover:bg-on-nav-band/10 active:brightness-90"
            >
              {t("home.ctaHowItWorks")}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
