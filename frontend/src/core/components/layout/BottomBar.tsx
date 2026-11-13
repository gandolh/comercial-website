import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";

const tabClass =
  "group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-label whitespace-nowrap text-on-surface-variant no-underline data-[status=active]:font-semibold data-[status=active]:text-primary";
const pillClass =
  "grid h-7 w-14 place-items-center rounded-2xl group-data-[status=active]:bg-primary-fixed group-data-[status=active]:text-on-primary-fixed";

interface Tab {
  to: string;
  icon: string;
  label: string;
  exact?: boolean;
}

/** The phone's five places, in place of a menu drawer; Adaugă Anunț stays in the top bar. */
export function BottomBar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const tabs: Tab[] = [
    { to: "/", icon: "home", label: "Acasă", exact: true },
    { to: "/categorii", icon: "category", label: t("nav.categories") },
    { to: "/favorite", icon: "favorite", label: t("nav.favorites") },
    { to: "/mesaje", icon: "chat_bubble", label: t("nav.messages") },
    isAuthenticated
      ? { to: "/cont", icon: "person", label: "Contul meu" }
      : { to: "/autentificare", icon: "login", label: "Conectare" },
  ];

  return (
    <nav
      aria-label="Navigare"
      className="sticky bottom-0 z-nav flex h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-outline-variant bg-surface-container-lowest pb-[env(safe-area-inset-bottom)] shadow-bar md:hidden"
    >
      {tabs.map((tab) => (
        <Link key={tab.to} to={tab.to} activeOptions={{ exact: tab.exact ?? false }} className={tabClass}>
          <span className={pillClass}>
            <span className="material-symbols-outlined" aria-hidden="true">
              {tab.icon}
            </span>
          </span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
