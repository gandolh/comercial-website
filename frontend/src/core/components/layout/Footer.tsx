import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { ThemeSwitch } from "@core/components/ui";
import { Frieze, Wordmark } from "@core/components/brand";
import { toRoman } from "@core/lib/roman";

/** The year in Roman numerals from the date (no yearly edit); screen readers hear the Arabic year. */
function RomanYear() {
  const year = new Date().getFullYear();
  return (
    <>
      <span aria-hidden="true">{toRoman(year)}</span>
      <span className="sr-only">{year}</span>
    </>
  );
}

const iconButton =
  "grid size-11 place-items-center rounded-control border border-outline bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container-low";

export function Footer() {
  const { t } = useTranslation();
  const links = [
    { key: "footer.terms", to: "/termeni" },
    { key: "footer.privacy", to: "/confidentialitate" },
    { key: "footer.cookies", to: "/politica-cookies" },
    { key: "footer.about", to: "/despre" },
    { key: "footer.help", to: "/ajutor" },
    { key: "footer.contact", to: "/contact" },
  ];
  return (
    <>
      <Frieze place="footer" className="mt-auto" />
      <footer className="bg-surface-container">
        <div className="mx-auto grid w-full max-w-310 gap-5 px-4 py-6 md:px-6 md:pt-7 md:pb-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Wordmark tone="ink" />
            <small className="text-control text-on-surface-variant">
              © <RomanYear /> {t("footer.copyright")}
            </small>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-1 p-0">
            {links.map(({ key, to }) => (
              <li key={to} className="list-none">
                <Link
                  to={to}
                  className="inline-flex min-h-8 items-center text-control text-on-surface-variant underline decoration-outline-variant underline-offset-3 transition-colors hover:text-primary"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-5">
            <ThemeSwitch />
            <div className="flex gap-2">
              <button type="button" className={iconButton} aria-label="Distribuie">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }} aria-hidden="true">
                  share
                </span>
              </button>
              <button type="button" className={iconButton} aria-label="Email">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }} aria-hidden="true">
                  mail
                </span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
