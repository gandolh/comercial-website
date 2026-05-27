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
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[var(--shadow-ambient)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        <Link
          to="/"
          className="text-2xl font-black text-primary tracking-tight font-[Manrope] no-underline"
        >
          Piață<span className="text-secondary">Ro</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/categorii"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline"
          >
            {t("nav.categories")}
          </Link>
          <Link
            to="/favorite"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline"
          >
            {t("nav.favorites")}
            {isAuthenticated && (favoriteIds.data?.length ?? 0) > 0 && (
              <span className="ml-1 text-primary font-bold">
                ({favoriteIds.data?.length})
              </span>
            )}
          </Link>
          <Link
            to="/mesaje"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline flex items-center gap-1"
          >
            {t("nav.messages")}
            {isAuthenticated && (unreadCount.data ?? 0) > 0 && (
              <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
                  className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
                  aria-label="Notificări"
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                </button>
                <Dropdown
                  trigger={
                    <button
                      className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors flex items-center gap-2"
                      aria-label="Profil"
                    >
                      <span className="material-symbols-outlined">person</span>
                      {user?.email && (
                        <span className="hidden md:inline text-sm font-medium text-on-surface">
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
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-150 shadow-lg no-underline"
              >
                {t("nav.addListing")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/autentificare"
                className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline"
              >
                Conectare
              </Link>
              <Link
                to="/inregistrare"
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-150 shadow-lg no-underline"
              >
                Înregistrare
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
