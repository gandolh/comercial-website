import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";

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
    <footer className="mt-auto bg-surface-container">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-8 px-12 py-16 md:flex-row">
        <div className="space-y-4 text-center md:text-left">
          <div className="font-[Manrope] text-2xl font-bold text-on-surface">
            Piață<span className="text-secondary">Ro</span>
          </div>
          <p className="text-sm tracking-wide text-on-surface-variant">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {links.map(({ key, to }) => (
            <Link
              key={to}
              to={to}
              className="font-medium text-on-surface-variant no-underline transition-colors hover:text-primary"
            >
              {t(key)}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-all hover:border-primary hover:text-primary"
            aria-label="Distribuie"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              share
            </span>
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-all hover:border-primary hover:text-primary"
            aria-label="Email"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              mail
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
