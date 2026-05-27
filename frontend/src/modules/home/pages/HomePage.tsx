import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { useTranslation } from "react-i18next";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { SearchAutocomplete } from "@/components/ui/SearchAutocomplete";
import { ListingCard } from "../components/ListingCard";
import { useFeaturedListings } from "../hooks/useFeaturedListings";
import type { HomeCategory } from "../types";

const CATEGORIES: HomeCategory[] = [
  { icon: "code", label: "Software și aplicații", slug: "software" },
  { icon: "palette", label: "Grafică și ilustrații", slug: "grafica" },
  { icon: "dashboard_customize", label: "Șabloane și teme", slug: "sabloane" },
  { icon: "music_note", label: "Audio și muzică", slug: "audio" },
  { icon: "movie", label: "Video și animație", slug: "video" },
  { icon: "menu_book", label: "Cărți electronice", slug: "ebook" },
  { icon: "font_download", label: "Fonturi", slug: "fonturi" },
  { icon: "terminal", label: "Cod sursă", slug: "cod-sursa" },
  { icon: "category", label: "Diverse", slug: "diverse" },
];

export function HomePage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const featuredListings = useFeaturedListings();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (location) params.set("city", location);
    navigate(`/anunturi?${params.toString()}`);
  };

  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="px-8 py-16 md:py-24 bg-surface-container-low">
        <div className="max-w-screen-xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface">
              {t("home.heroTitle")}{" "}
              <span className="text-primary">
                {t("home.heroTitleHighlight")}
              </span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              {t("home.heroSubtitle")}
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-surface-container-lowest p-2 rounded-full shadow-[0_20px_50px_rgba(0,64,161,0.08)] flex items-center gap-2"
          >
            <div className="flex-1 flex items-center px-6">
              <SearchAutocomplete
                value={search}
                onChange={setSearch}
                onSelect={(val) => {
                  const params = new URLSearchParams();
                  if (val) params.set("q", val);
                  if (location) params.set("city", location);
                  navigate(`/anunturi?${params.toString()}`);
                }}
                placeholder={t("home.searchPlaceholder")}
                className="w-full"
              />
            </div>
            <div
              className="hidden md:flex items-center px-4 gap-2"
              style={{
                borderLeft:
                  "1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)",
              }}
            >
              <CityAutocomplete
                value={location}
                onChange={setLocation}
                placeholder={t("home.locationPlaceholder")}
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-container transition-colors"
            >
              {t("home.searchButton")}
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="px-8 py-20 max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            {t("home.popularCategories")}
          </h2>
          <button
            onClick={() => navigate("/categorii")}
            className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
          >
            {t("home.viewAllCategories")}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {CATEGORIES.map(({ icon, label, slug }) => (
            <button
              key={slug}
              onClick={() => navigate(`/categorii/${slug}`)}
              className="bg-surface-container-lowest p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "28px" }}
                >
                  {icon}
                </span>
              </div>
              <span className="font-bold text-on-surface text-sm leading-tight">
                {label}
              </span>
            </button>
          ))}

          <button
            onClick={() => navigate("/categorii")}
            className="bg-surface-container-low p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-outline-variant group cursor-pointer hover:border-primary transition-colors"
          >
            <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center text-outline group-hover:text-primary transition-colors">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "28px" }}
              >
                grid_view
              </span>
            </div>
            <span className="font-bold text-on-surface text-sm">
              {t("home.viewAllCategories")}
            </span>
          </button>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="px-8 py-20 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                {t("home.featuredListings")}
              </h2>
              <p className="text-on-surface-variant">
                {t("home.featuredSubtitle")}
              </p>
            </div>
          </div>

          {featuredListings.isError ? (
            <ErrorCard
              message="Nu am putut încărca anunțurile recomandate."
              onRetry={() => featuredListings.refetch()}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredListings.isFetching
                ? Array.from({ length: 4 }).map((_, index) => (
                    <CardSkeleton key={index} />
                  ))
                : featuredListings.data?.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <button
              onClick={() => navigate("/anunturi")}
              className="bg-surface-container-lowest border border-outline-variant px-8 py-4 rounded-full font-bold hover:bg-surface transition-colors shadow-sm"
            >
              {t("home.loadMore")}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-8 py-24 max-w-screen-xl mx-auto">
        <div className="bg-primary-container rounded-[2rem] p-12 md:p-20 text-center space-y-8 overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-on-primary">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-on-primary-container text-lg max-w-xl mx-auto">
              {t("home.ctaSubtitle")}
            </p>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/adauga-anunt")}
              className="bg-surface-container-lowest text-primary px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
            >
              {t("home.ctaButton")}
            </button>
            <button className="text-on-primary border border-on-primary/30 px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              {t("home.ctaHowItWorks")}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
