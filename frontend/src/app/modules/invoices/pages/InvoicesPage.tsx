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
    <main className="mt-8 pb-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">
              {t("invoices.page.title", "Facturi")}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {t("invoices.page.subtitle", "Generează și descarcă facturi PDF și e-Factura XML.")}
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
            <h2 className="mb-4 text-xl font-bold text-on-surface">{t("invoices.list.heading", "Facturi generate")}</h2>
            {invoicesLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-surface-container-low motion-safe:animate-pulse" />
                ))}
              </div>
            )}
            {invoicesError && (
              <ErrorCard
                message={t("invoices.list.error", "Nu am putut încărca facturile.")}
                onRetry={() => void refetchInvoices()}
              />
            )}
            {!invoicesLoading && !invoicesError && invoices && <InvoiceList invoices={invoices} />}
          </section>
        )}

        {/* Create view */}
        {view === "create" && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-on-surface">{t("invoices.create.heading", "Factură nouă")}</h2>
            {!profileLoading && <CreateInvoiceForm profile={profile} onCreated={() => setView("list")} />}
            {profileLoading && (
              <div className="h-8 w-48 rounded-sm bg-surface-container-low motion-safe:animate-pulse" />
            )}
          </section>
        )}

        {/* Profile view */}
        {view === "profile" && (
          <section>
            <h2 className="mb-2 text-xl font-bold text-on-surface">
              {t("invoices.profile.heading", "Profilul de facturare")}
            </h2>
            <p className="mb-4 text-sm text-on-surface-variant">
              {t(
                "invoices.profile.description",
                "Datele salvate aici vor pre-completa automat câmpurile furnizorului la fiecare factură nouă.",
              )}
            </p>
            {profileLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-surface-container-low motion-safe:animate-pulse" />
                ))}
              </div>
            )}
            {profileError && (
              <ErrorCard
                message={t("invoices.profile.loadError", "Nu am putut încărca profilul de facturare.")}
                onRetry={() => void refetchProfile()}
              />
            )}
            {!profileLoading && !profileError && (
              <InvoiceProfileForm initial={profile} onSaved={() => setView("create")} />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
