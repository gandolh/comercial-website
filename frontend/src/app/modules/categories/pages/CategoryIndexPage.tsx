import { Link } from "@core/lib/router";
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
  const { t } = useTranslation();

  return (
    <main className="flex-1">
      <section className="relative z-raised border-b border-outline-variant bg-surface-container-lowest shadow-band">
        <div className="mx-auto w-full max-w-310 px-4 py-7 md:px-6 md:py-10">
          <h1 className="font-headline font-extrabold tracking-[-0.01em] text-on-surface max-md:text-3xl max-md:leading-9 md:text-hero">
            {t("categories.browseTitle", "Răsfoiește toate categoriile")}
          </h1>
          <p className="mt-3 max-w-[60ch] text-body text-on-surface-variant">
            {t("categories.browseSubtitle", "Găsește exact ceea ce cauți printre mii de anunțuri verificate.")}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-310 px-4 pt-8 pb-9 md:px-6 md:pt-12 md:pb-16">
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
        </ul>
      </section>
    </main>
  );
}
