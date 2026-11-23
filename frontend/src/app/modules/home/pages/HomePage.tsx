import { useState } from "react";
import { Link, useNavigate } from "@core/lib/router";
import { Button } from "@core/components/ui";
import { useTranslation } from "react-i18next";
import { CardSkeleton } from "@core/components/ui/Skeleton";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { SearchAutocomplete } from "@core/components/ui/SearchAutocomplete";
import { Column, Laurel, Tabula } from "@core/components/brand";
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

// The section heads (brief 23): Cinzel 600 at 26/32 (21/28 on phones) over a single 1px gold rule.
const sectionHead = "border-b border-gold pb-2 mb-4";
const sectionTitle =
  "font-cap text-[26px] leading-8 font-semibold tracking-[0.04em] text-on-surface max-md:text-[21px] max-md:leading-7";

// A control on the porphyry sell band takes the bar's gold ring.
const bandFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-nav-band-variant";

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
      {/* Hero: the search in an inscription tablet (tabula ansata) on the tufa band, between two fluted columns from
          1000px. The ornament gives way to the first screen, never the content (brief 23). */}
      <section className="relative z-raised border-b border-outline-variant bg-surface-container-low">
        <div className="relative mx-auto flex w-full max-w-310 flex-col items-center px-4 pt-5 max-md:pt-4 md:px-6">
          <Column className="absolute bottom-0 left-6 hidden h-[calc(100%-20px)] w-18 text-gold min-[1000px]:block" />
          <Column className="absolute right-6 bottom-0 hidden h-[calc(100%-20px)] w-18 text-gold min-[1000px]:block" />
          <Tabula className="mb-4 w-full min-[600px]:w-[calc(100%-40px)] min-[1000px]:w-[min(1080px,calc(100%-236px))] md:mb-5 md:w-[calc(100%-64px)]">
            <div className="flex flex-col items-center gap-2.5 px-10 pt-5 pb-5.5 text-center max-md:gap-2 max-md:px-3 max-md:py-4">
              <h1 className="font-cap text-[36px] leading-[42px] font-semibold tracking-[0.04em] text-balance text-on-surface max-md:text-[22px] max-md:leading-7 max-md:tracking-[0.01em]">
                {t("home.heroTitle")} {t("home.heroTitleHighlight")}
              </h1>
              <p className="max-w-[54ch] text-[17px] leading-[26px] text-on-surface-variant max-md:text-body">
                {t("home.heroSubtitle")}
              </p>

              <form
                onSubmit={handleSearch}
                role="search"
                className="mt-1 flex h-14 w-full items-center gap-2 rounded-control bg-surface-container-lowest pr-1 pl-3 text-left ring-1 ring-outline ring-inset focus-within:ring-2 focus-within:ring-primary md:pl-4"
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
                <Button type="submit" className="max-md:px-3.5">
                  {t("home.searchButton")}
                </Button>
              </form>
            </div>
          </Tabula>
        </div>
      </section>

      <div className="mx-auto w-full max-w-310 px-4 md:px-6">
        {/* Categories */}
        <section className="pt-8 md:pt-12" aria-labelledby="popular-categories">
          <div className={`${sectionHead} flex flex-wrap items-baseline justify-between gap-4`}>
            <h2 id="popular-categories" className={sectionTitle}>
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
                  className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-2 py-3.5 text-center text-body font-semibold text-balance text-on-surface no-underline shadow-card transition-shadow hover:shadow-band max-[599px]:min-h-26 max-[599px]:py-2.5 md:min-h-16 md:flex-row md:justify-start md:gap-3 md:py-2 md:pr-3.5 md:pl-2.5 md:text-left"
                >
                  {/* The arched niche: a round top over 3px corners, a gold ring, a bronze icon. */}
                  <span className="grid h-12 w-10 flex-none place-items-center rounded-t-[20px] rounded-b-[3px] bg-niche text-gold-ink ring-1 ring-gold ring-inset max-[599px]:h-11">
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
                className="flex min-h-16 items-center justify-center gap-3 rounded-xl border border-dashed border-gold px-3.5 text-body font-semibold text-primary no-underline transition-colors hover:bg-primary-fixed md:justify-between"
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
          <div className={sectionHead}>
            <h2 id="featured-listings" className={sectionTitle}>
              {t("home.featuredListings")}
            </h2>
            <p className="mt-1 text-control text-on-surface-variant">{t("home.featuredSubtitle")}</p>
          </div>

          {featuredListings.isError ? (
            <ErrorCard
              message="Nu am putut încărca anunțurile recomandate."
              onRetry={() => void featuredListings.refetch()}
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
              className="inline-flex h-12 items-center justify-center rounded-control border border-outline px-5 text-body font-bold tracking-wide text-on-surface transition-colors hover:bg-surface-container-low active:brightness-90"
            >
              {t("home.loadMore")}
            </button>
          </div>
        </section>

        {/* The sell band: porphyry with a 1px gold inset ring, a Cinzel title and a laurel wreath on the right, which
            phones drop. Postează is the marble fill, Cum funcționează? the gold outline: the page's one red fill is
            Caută. */}
        <section
          aria-labelledby="cta-title"
          className="relative mt-10 mb-10 flex flex-col items-start gap-5 overflow-hidden rounded-2xl bg-nav-band px-5 py-7 text-on-nav-band shadow-band ring-1 ring-on-nav-band-variant ring-inset md:mt-14 md:mb-16 md:px-8 md:py-12"
        >
          <Laurel className="absolute top-1/2 right-14 size-50 -translate-y-1/2 text-on-nav-band-variant opacity-90 max-md:hidden" />
          <h2
            id="cta-title"
            className="relative font-cap font-semibold tracking-[0.04em] max-md:text-2xl max-md:leading-[1.875rem] md:text-title"
          >
            {t("home.ctaTitle")}
          </h2>
          <p className="relative max-w-[56ch] text-body">{t("home.ctaSubtitle")}</p>
          <div className="relative flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <button
              type="button"
              onClick={() => navigate("/adauga-anunt")}
              className={`inline-flex h-12 items-center justify-center rounded-control border border-on-nav-band bg-on-nav-band px-6 text-body font-bold tracking-wide text-nav-band transition-colors hover:bg-on-nav-band/90 active:brightness-90 ${bandFocus}`}
            >
              {t("home.ctaButton")}
            </button>
            <button
              type="button"
              className={`inline-flex h-12 items-center justify-center rounded-control border border-on-nav-band-variant px-6 text-body font-bold tracking-wide text-on-nav-band transition-colors hover:bg-on-nav-band/10 active:brightness-90 ${bandFocus}`}
            >
              {t("home.ctaHowItWorks")}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
