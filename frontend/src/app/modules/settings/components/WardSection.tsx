import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@core/lib/auth";
import { useSearchParams } from "@core/lib/router";
import { Button } from "@core/components/ui";
import { fetchWardLinkTicket, fetchWardStatus, wardErrorMessage, wardStartUrl } from "@app/modules/auth/services/ward";

/**
 * "Sign in with Ward": link it once here, signed in with the password; after that "Intră cu Ward"
 * on the sign-in page works. Hidden when the API has no Ward configured.
 */
export function WardSection() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const ward = useQuery({ queryKey: ["ward-status"], queryFn: fetchWardStatus, staleTime: 60_000 });
  const [starting, setStarting] = useState(false);
  if (!ward.data?.enabled) return null;

  const justLinked = searchParams.get("ward") === "linked";
  const error = searchParams.get("ward_error");
  const link = async () => {
    setStarting(true);
    try {
      window.location.href = wardStartUrl(await fetchWardLinkTicket());
    } catch {
      setStarting(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
      <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <span className="material-symbols-outlined text-xl text-primary" aria-hidden="true">
            key
          </span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">Autentificare cu Ward</h2>
      </div>
      {error && (
        <div className="rounded-lg bg-error-container p-3 text-sm text-on-error-container">
          {wardErrorMessage(error)}
        </div>
      )}
      {user?.ward_linked || justLinked ? (
        <p className="text-sm text-on-surface-variant">
          Contul tău Ward este legat: poți intra și cu „Intră cu Ward” din pagina de autentificare.
        </p>
      ) : (
        <>
          <p className="text-sm text-on-surface-variant">
            Leagă contul tău Ward o singură dată, ca să poți intra și fără parolă.
          </p>
          <Button onClick={() => void link()} loading={starting}>
            Leagă contul Ward
          </Button>
        </>
      )}
    </section>
  );
}
