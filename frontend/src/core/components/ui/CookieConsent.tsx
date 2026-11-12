import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@core/components/ui/Button";
import { Link } from "@core/lib/router";

const STORAGE_KEY = "cookie_consent";

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t("cookies.bannerLabel")}
      className="fixed right-0 bottom-0 left-0 z-overlay border-t border-outline-variant bg-surface shadow-lg"
    >
      <div className="mx-auto flex max-w-screen-2xl flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-8 sm:py-5">
        {/* Text */}
        <div className="flex-1 text-sm text-on-surface-variant">
          <p>
            {t("cookies.bannerText")}{" "}
            <Link
              to="/confidentialitate"
              className="text-primary underline underline-offset-2 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {t("cookies.policyLink")}
            </Link>
            .
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-row gap-3">
          <Button variant="secondary" size="sm" onClick={handleReject} aria-label={t("cookies.rejectAll")}>
            {t("cookies.rejectAll")}
          </Button>
          <Button variant="primary" size="sm" onClick={handleAccept} aria-label={t("cookies.acceptAll")}>
            {t("cookies.acceptAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
