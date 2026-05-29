import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@core/components/ui";
import { ErrorCard } from "@core/components/ui";
import { useInvoiceProfile } from "../hooks/useInvoiceProfile";
import { useInvoices } from "../hooks/useInvoices";
import { InvoiceList } from "../components/InvoiceList";
import { CreateInvoiceForm } from "../components/CreateInvoiceForm";
import { InvoiceProfileForm } from "../components/InvoiceProfileForm";

type View = "list" | "create" | "profile";

export function InvoicesPage() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>("list");

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useInvoiceProfile();

  const {
    data: invoices,
    isLoading: invoicesLoading,
    isError: invoicesError,
    refetch: refetchInvoices,
  } = useInvoices();

  return (
    <main className="mt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-3xl font-black text-on-surface"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {t("invoices.page.title", "Facturi")}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              {t(
                "invoices.page.subtitle",
                "Generează și descarcă facturi PDF și e-Factura XML."
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={view === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              {t("invoices.page.tabList", "Istoricul meu")}
            </Button>
            <Button
              type="button"
              variant={view === "create" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setView("create")}
            >
              {t("invoices.page.tabCreate", "Factură nouă")}
            </Button>
            <Button
              type="button"
              variant={view === "profile" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setView("profile")}
            >
              {t("invoices.page.tabProfile", "Profil facturare")}
            </Button>
          </div>
        </div>

        {/* List view */}
        {view === "list" && (
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">
              {t("invoices.list.heading", "Facturi generate")}
            </h2>
            {invoicesLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-surface-container-low animate-pulse rounded-xl"
                  />
                ))}
              </div>
            )}
            {invoicesError && (
              <ErrorCard
                message={t(
                  "invoices.list.error",
                  "Nu am putut încărca facturile."
                )}
                onRetry={refetchInvoices}
              />
            )}
            {!invoicesLoading && !invoicesError && invoices && (
              <InvoiceList invoices={invoices} />
            )}
          </section>
        )}

        {/* Create view */}
        {view === "create" && (
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">
              {t("invoices.create.heading", "Factură nouă")}
            </h2>
            {!profileLoading && (
              <CreateInvoiceForm
                profile={profile}
                onCreated={() => setView("list")}
              />
            )}
            {profileLoading && (
              <div className="h-8 w-48 bg-surface-container-low animate-pulse rounded" />
            )}
          </section>
        )}

        {/* Profile view */}
        {view === "profile" && (
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-2">
              {t("invoices.profile.heading", "Profilul de facturare")}
            </h2>
            <p className="text-on-surface-variant text-sm mb-4">
              {t(
                "invoices.profile.description",
                "Datele salvate aici vor pre-completa automat câmpurile furnizorului la fiecare factură nouă."
              )}
            </p>
            {profileLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-surface-container-low animate-pulse rounded-xl"
                  />
                ))}
              </div>
            )}
            {profileError && (
              <ErrorCard
                message={t(
                  "invoices.profile.loadError",
                  "Nu am putut încărca profilul de facturare."
                )}
                onRetry={refetchProfile}
              />
            )}
            {!profileLoading && !profileError && (
              <InvoiceProfileForm
                initial={profile}
                onSaved={() => setView("create")}
              />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
