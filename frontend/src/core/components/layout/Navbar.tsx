import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import { useLogoutMutation } from "@app/modules/auth/hooks/useLogoutMutation";
import { useFavoriteIds } from "@app/modules/favorites/hooks/useFavoriteIds";
import { useUnreadCount } from "@app/modules/messaging/hooks/useUnreadCount";
import { useNavigate } from "@core/lib/router";
import { Dropdown, dropdownSeparator } from "@core/components/ui";
import type { DropdownItem } from "@core/components/ui";

/** The wordmark: the second half takes the band's accent colour (the footer sets its own). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="PiațăRo, acasă"
      className={`inline-flex rounded-md text-price font-extrabold tracking-tight whitespace-nowrap no-underline ${className ?? ""}`}
    >
      Piață<b className="font-extrabold text-(--wordmark-accent)">Ro</b>
    </Link>
  );
}

const placeClass =
  "relative flex h-full items-center gap-2 px-4 text-body text-on-nav-band no-underline transition-colors hover:text-on-nav-band-variant data-[status=active]:font-semibold data-[status=active]:after:absolute data-[status=active]:after:right-3 data-[status=active]:after:bottom-0 data-[status=active]:after:left-3 data-[status=active]:after:h-[3px] data-[status=active]:after:rounded-t-[3px] data-[status=active]:after:bg-on-nav-band";

const navButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control border border-on-nav-band-variant bg-transparent px-4.5 text-body whitespace-nowrap text-on-nav-band no-underline transition-colors hover:bg-on-nav-band/10 active:brightness-90";

export function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogoutMutation();
  const favoriteIds = useFavoriteIds();
  const unreadCount = useUnreadCount(isAuthenticated);
  const navigate = useNavigate();

  const userMenuItems: DropdownItem[] = [
    {
      key: "dashboard",
      label: "Contul meu",
      icon: "dashboard",
      onClick: () => navigate("/cont"),
    },
    {
      key: "listings",
      label: "Anunțurile mele",
      icon: "inventory_2",
      onClick: () => navigate("/cont/anunturi"),
    },
    {
      key: "settings",
      label: "Setări",
      icon: "settings",
      onClick: () => navigate("/cont/setari"),
    },
    dropdownSeparator(),
    {
      key: "logout",
      label: "Deconectare",
      icon: "logout",
      variant: "danger",
      onClick: () => logoutMutation.mutate(),
    },
  ];

  const favoriteCount = isAuthenticated ? (favoriteIds.data?.length ?? 0) : 0;
  const unread = isAuthenticated ? (unreadCount.data ?? 0) : 0;

  return (
    <header className="sticky top-0 z-nav h-14 bg-nav-band text-on-nav-band md:h-16">
      <div className="mx-auto flex h-full w-full max-w-310 items-center gap-3 px-4 min-[1101px]:gap-10 md:gap-6 md:px-6">
        <Wordmark className="text-on-nav-band [--wordmark-accent:var(--color-on-nav-band-variant)]" />

        <nav aria-label="Principal" className="hidden h-full flex-1 gap-1 md:flex">
          <Link to="/categorii" className={placeClass}>
            {t("nav.categories")}
          </Link>
          <Link to="/favorite" className={placeClass}>
            {t("nav.favorites")}
            {favoriteCount > 0 && (
              <span className="inline-grid h-6 min-w-6 place-items-center rounded-xl bg-on-nav-band px-1.5 text-control font-semibold text-nav-band">
                {favoriteCount}
              </span>
            )}
          </Link>
          <Link to="/mesaje" className={placeClass}>
            {t("nav.messages")}
            {unread > 0 && (
              <span className="inline-grid h-6 min-w-6 place-items-center rounded-xl bg-on-nav-band px-1.5 text-control font-semibold text-nav-band">
                {unread}
              </span>
            )}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className={`${navButton} hidden w-11 border-transparent px-0 min-[360px]:inline-flex`}
                aria-label="Notificări"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  notifications
                </span>
              </button>
              <span className="hidden md:inline-flex">
                <Dropdown
                  trigger={
                    <button
                      type="button"
                      className={`${navButton} max-[1100px]:w-11 max-[1100px]:border-transparent max-[1100px]:px-0`}
                      aria-label="Profil"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        person
                      </span>
                      {user?.email && (
                        <span className="hidden min-[1101px]:inline">
                          {user.display_name || user.email.split("@")[0]}
                        </span>
                      )}
                    </button>
                  }
                  items={userMenuItems}
                  align="end"
                />
              </span>
              <Link
                to="/adauga-anunt"
                className={`${navButton} border-on-nav-band bg-on-nav-band px-3.5 font-semibold text-nav-band hover:bg-on-nav-band/90 md:px-4.5`}
              >
                {t("nav.addListing")}
              </Link>
            </>
          ) : (
            <Link to="/autentificare" className={`${navButton} hidden md:inline-flex`}>
              Conectare
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
