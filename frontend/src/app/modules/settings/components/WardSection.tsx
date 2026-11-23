import { PAGE_TITLE } from "@core/components/brand";
import { useRef, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@core/lib/auth";
import { useSearchParams } from "@core/lib/router";
import { Button, Input } from "@core/components/ui";
import { tooManyTriesMessage } from "@app/modules/auth/services/too-many-tries";
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
  const [password, setPassword] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  if (!ward.data?.enabled) return null;

  const justLinked = searchParams.get("ward") === "linked";
  const error = searchParams.get("ward_error");
  const link = async () => {
    setLinkError(null);
    setStarting(true);
    try {
      window.location.href = wardStartUrl(await fetchWardLinkTicket(password));
    } catch (err: unknown) {
      setStarting(false);
      const tooMany = tooManyTriesMessage(err);
      if (tooMany) {
        setLinkError(tooMany);
      } else if (isAxiosError(err) && err.response?.status === 403) {
        setLinkError("Parola actuală nu este corectă.");
        passwordRef.current?.focus();
      } else {
        setLinkError("Nu am putut începe legarea. Încearcă din nou.");
      }
    }
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void link();
  };

  return (
    <section className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
      <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <span className="material-symbols-outlined text-xl text-gold-ink" aria-hidden="true">
            key
          </span>
        </div>
        <h2 className={`${PAGE_TITLE} text-xl text-on-surface`}>Autentificare cu Ward</h2>
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
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Leagă contul Ward">
          <p className="text-sm text-on-surface-variant">
            Leagă contul tău Ward o singură dată, ca să poți intra și fără parolă. Scrie parola actuală ca să confirmi.
          </p>
          <Input
            ref={passwordRef}
            label="Parola actuală"
            id="ward_current_password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          {linkError && (
            <p role="alert" className="text-sm text-error">
              {linkError}
            </p>
          )}
          <Button type="submit" loading={starting}>
            Leagă contul Ward
          </Button>
        </form>
      )}
    </section>
  );
}
