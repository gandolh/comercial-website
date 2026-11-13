import { useNavigate } from "@core/lib/router";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
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

export function CategoryIndexPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen pt-8">
      <section className="bg-surface-container-low px-8 py-16 md:py-24">
        <div className="mx-auto max-w-screen-xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
            {t("categories.browseTitle", "Răsfoiește toate categoriile")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">
            {t("categories.browseSubtitle", "Găsește exact ceea ce cauți printre mii de anunțuri verificate.")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-8 py-20">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CATEGORIES.map(({ icon, label, slug }) => (
            <button
              key={slug}
              onClick={() => navigate(`/categorii/${slug}`)}
              className="group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center transition-all hover:border-primary hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
                  {icon}
                </span>
              </div>
              <span className="leading-tight font-bold text-on-surface">{label}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
