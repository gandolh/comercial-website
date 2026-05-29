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
    <footer className="bg-surface-container mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 gap-8 max-w-screen-2xl mx-auto">
        <div className="space-y-4 text-center md:text-left">
          <div className="font-[Manrope] font-bold text-2xl text-on-surface">
            Piață<span className="text-secondary">Ro</span>
          </div>
          <p className="text-on-surface-variant text-sm tracking-wide">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {links.map(({ key, to }) => (
            <Link
              key={to}
              to={to}
              className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline"
            >
              {t(key)}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all"
            aria-label="Distribuie"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              share
            </span>
          </button>
          <button
            className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all"
            aria-label="Email"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              mail
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
