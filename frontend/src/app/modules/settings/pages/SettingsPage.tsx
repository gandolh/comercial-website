import { useState } from "react";
import { useAuth } from "@core/lib/auth";
import { Button } from "@core/components/ui";
import { PhoneVerifyModal } from "../../auth/components/PhoneVerifyModal";
import { ProfileSection } from "../components/ProfileSection";
import { WardSection } from "../components/WardSection";

export function SettingsPage() {
  const { user } = useAuth();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  return (
    <main className="mt-8 pb-24">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="mb-8 font-headline text-3xl font-black">Setările contului</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Section: Profile */}
            <section className="space-y-6 rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-xl text-primary" aria-hidden="true">
                    person
                  </span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">Informații Profil</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">Nume afișat</label>
                  <div className="rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-on-surface">
                    {user?.display_name || user?.email?.split("@")[0] || "—"}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">Adresa de email</label>
                  <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-on-surface">
                    <span className="material-symbols-outlined text-base text-outline" aria-hidden="true">
                      mail
                    </span>
                    <span>{user?.email}</span>
                    {user?.email_verified && (
                      <span className="ml-auto rounded-full bg-tertiary-container px-2 py-0.5 text-[10px] font-bold text-on-tertiary-container uppercase">
                        Verificat
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <WardSection />

            {/* Section: Seller Profile (bio, website, social) */}
            <ProfileSection />

            {/* Section: Phone Verification */}
            <section className="space-y-6 rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-xl text-primary" aria-hidden="true">
                    phone
                  </span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">Verificare Telefon</h2>
              </div>

              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">{user?.phone || "Niciun număr adăugat"}</span>
                    {user?.phone_verified ? (
                      <span className="rounded-full bg-tertiary-container px-2 py-0.5 text-[10px] font-bold text-on-tertiary-container uppercase">
                        Verificat
                      </span>
                    ) : (
                      <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container uppercase">
                        Neverificat
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Numărul tău de telefon este folosit pentru a confirma autenticitatea contului și pentru a primi
                    notificări importante.
                  </p>
                </div>

                {!user?.phone_verified && (
                  <Button size="sm" onClick={() => setIsPhoneModalOpen(true)} className="whitespace-nowrap">
                    Verifică telefonul
                  </Button>
                )}
              </div>

              {user?.phone_verified && (
                <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-primary" aria-hidden="true">
                    shield
                  </span>
                  <div className="text-sm text-on-surface-variant">
                    Contul tău are insigna de <strong>Vânzător Verificat</strong>. Aceasta crește încrederea
                    cumpărătorilor în anunțurile tale.
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-on-surface">Suport</h3>
              <p className="mb-4 text-sm text-on-surface-variant">Ai nevoie de ajutor cu setările contului tău?</p>
              <Button variant="ghost" className="w-full border-2 border-outline-variant">
                Contactează Echipa
              </Button>
            </section>
          </div>
        </div>
      </div>

      <PhoneVerifyModal open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen} />
    </main>
  );
}
