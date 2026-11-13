import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { ThemeSwitch } from "@core/components/ui";
import { Wordmark } from "./Navbar";

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
    <footer className="mt-auto border-t border-outline-variant bg-surface-container">
      <div className="mx-auto grid w-full max-w-310 gap-5 px-4 py-6 md:px-6 md:pt-7 md:pb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Wordmark className="text-on-surface [--wordmark-accent:var(--color-secondary)]" />
          <small className="text-control text-on-surface-variant">
            {t("footer.copyright", { year: new Date().getFullYear() })}
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
  );
}
