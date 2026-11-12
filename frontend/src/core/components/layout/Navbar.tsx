import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import { useLogoutMutation } from "@app/modules/auth/hooks/useLogoutMutation";
import { useFavoriteIds } from "@app/modules/favorites/hooks/useFavoriteIds";
import { useUnreadCount } from "@app/modules/messaging/hooks/useUnreadCount";
import { useNavigate } from "@core/lib/router";
import { Dropdown, dropdownSeparator } from "@core/components/ui";
import type { DropdownItem } from "@core/components/ui";

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

  return (
    <nav className="fixed top-0 z-nav w-full bg-surface-container-lowest/80 shadow-ambient backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-8 py-4">
        <Link to="/" className="font-[Manrope] text-2xl font-black tracking-tight text-primary no-underline">
          Piață<span className="text-secondary">Ro</span>
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          <Link
            to="/categorii"
            className="font-medium text-on-surface-variant no-underline transition-colors hover:text-primary"
          >
            {t("nav.categories")}
          </Link>
          <Link
            to="/favorite"
            className="font-medium text-on-surface-variant no-underline transition-colors hover:text-primary"
          >
            {t("nav.favorites")}
            {isAuthenticated && (favoriteIds.data?.length ?? 0) > 0 && (
              <span className="ml-1 font-bold text-primary">({favoriteIds.data?.length})</span>
            )}
          </Link>
          <Link
            to="/mesaje"
            className="flex items-center gap-1 font-medium text-on-surface-variant no-underline transition-colors hover:text-primary"
          >
            {t("nav.messages")}
            {isAuthenticated && (unreadCount.data ?? 0) > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-on-primary">
                {unreadCount.data}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex gap-2">
                <button
                  className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  aria-label="Notificări"
                >
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <Dropdown
                  trigger={
                    <button
                      className="flex items-center gap-2 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                      aria-label="Profil"
                    >
                      <span className="material-symbols-outlined">person</span>
                      {user?.email && (
                        <span className="hidden text-sm font-medium text-on-surface md:inline">
                          {user.display_name || user.email.split("@")[0]}
                        </span>
                      )}
                    </button>
                  }
                  items={userMenuItems}
                  align="end"
                />
              </div>
              <Link
                to="/adauga-anunt"
                className="rounded-full bg-primary px-6 py-2.5 font-bold text-on-primary no-underline shadow-lg transition-all duration-150 hover:scale-105 active:scale-95"
              >
                {t("nav.addListing")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/autentificare"
                className="font-medium text-on-surface-variant no-underline transition-colors hover:text-primary"
              >
                Conectare
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
