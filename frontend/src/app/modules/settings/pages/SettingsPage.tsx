import { useState } from "react";
import { useAuth } from "@core/lib/auth";
import { Button } from "@core/components/ui";
import PhoneVerifyModal from "../../auth/components/PhoneVerifyModal";
import { ProfileSection } from "../components/ProfileSection";

export function SettingsPage() {
  const { user } = useAuth();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  return (
    <main className="mt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1
          className="text-3xl font-black mb-8"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Setările contului
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Section: Profile */}
            <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">person</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">
                  Informații Profil
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    Nume afișat
                  </label>
                  <div className="bg-surface-container text-on-surface px-4 py-3 rounded-lg border border-outline-variant">
                    {user?.display_name || user?.email?.split("@")[0] || "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    Adresa de email
                  </label>
                  <div className="flex items-center gap-2 bg-surface-container text-on-surface px-4 py-3 rounded-lg border border-outline-variant">
                    <span className="material-symbols-outlined text-outline text-base" aria-hidden="true">mail</span>
                    <span>{user?.email}</span>
                    {user?.email_verified && (
                      <span className="ml-auto bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Verificat
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Seller Profile (bio, website, social) */}
            <ProfileSection />

            {/* Section: Phone Verification */}
            <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">phone</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">
                  Verificare Telefon
                </h2>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">
                      {user?.phone || "Niciun număr adăugat"}
                    </span>
                    {user?.phone_verified ? (
                      <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Verificat
                      </span>
                    ) : (
                      <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Neverificat
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Numărul tău de telefon este folosit pentru a confirma
                    autenticitatea contului și pentru a primi notificări
                    importante.
                  </p>
                </div>

                {!user?.phone_verified && (
                  <Button
                    size="sm"
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="whitespace-nowrap"
                  >
                    Verifică telefonul
                  </Button>
                )}
              </div>

              {user?.phone_verified && (
                <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
                  <span className="material-symbols-outlined text-primary shrink-0 mt-0.5" aria-hidden="true">shield</span>
                  <div className="text-sm text-on-surface-variant">
                    Contul tău are insigna de{" "}
                    <strong>Vânzător Verificat</strong>. Aceasta crește
                    încrederea cumpărătorilor în anunțurile tale.
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Suport</h3>
              <p className="text-sm text-on-surface-variant mb-4">
                Ai nevoie de ajutor cu setările contului tău?
              </p>
              <Button variant="ghost" className="w-full border-2 border-outline-variant">
                Contactează Echipa
              </Button>
            </section>
          </div>
        </div>
      </div>

      <PhoneVerifyModal
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
      />
    </main>
  );
}
