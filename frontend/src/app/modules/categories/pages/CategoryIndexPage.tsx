import { useNavigate } from "@core/lib/router";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
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

export function CategoryIndexPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="pt-24 min-h-screen">
      <section className="px-8 py-16 md:py-24 bg-surface-container-low">
        <div className="max-w-screen-xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            {t("categories.browseTitle", "Răsfoiește toate categoriile")}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            {t(
              "categories.browseSubtitle",
              "Găsește exact ceea ce cauți printre mii de anunțuri verificate.",
            )}
          </p>
        </div>
      </section>

      <section className="px-8 py-20 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {CATEGORIES.map(({ icon, label, slug }) => (
            <button
              key={slug}
              onClick={() => navigate(`/categorii/${slug}`)}
              className="bg-surface-container-lowest p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl transition-all group cursor-pointer border border-outline-variant hover:border-primary"
            >
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "32px" }}
                >
                  {icon}
                </span>
              </div>
              <span className="font-bold text-on-surface leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
