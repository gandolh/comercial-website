import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "@core/lib/router";
import { AuthCardShell } from "../components/AuthCardShell";
import { useVerifyEmailMutation } from "../hooks/useVerifyEmailMutation";

export function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const verifyMutation = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token]);

  if (!token) {
    return (
      <AuthCardShell title="Link invalid">
        <div className="text-center">
          <p className="mb-4 text-on-surface-variant">Link-ul de verificare este invalid sau lipsește.</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-primary px-6 py-2 text-on-primary transition-colors hover:bg-primary-container"
          >
            Înapoi la pagina principală
          </Link>
        </div>
      </AuthCardShell>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <AuthCardShell title="Verificare email">
        <div className="py-8 text-center">
          <svg className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-on-surface-variant">Verificăm emailul tău...</p>
        </div>
      </AuthCardShell>
    );
  }

  if (verifyMutation.isError) {
    return (
      <AuthCardShell title="Eroare verificare">
        <div className="text-center">
          <span className="material-symbols-outlined mb-4 text-error" style={{ fontSize: "48px" }}>
            error
          </span>
          <p className="mb-2 font-medium text-on-surface">Link-ul de verificare a expirat sau a fost deja folosit.</p>
          <p className="mb-6 text-sm text-on-surface-variant">
            Te rugăm să soliciți un nou email de verificare din contul tău.
          </p>
          <Link
            to="/autentificare"
            className="inline-block rounded-lg bg-primary px-6 py-2 text-on-primary transition-colors hover:bg-primary-container"
          >
            Autentifică-te
          </Link>
        </div>
      </AuthCardShell>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <AuthCardShell title="Email verificat!">
        <div className="text-center">
          <span className="material-symbols-outlined mb-4 text-tertiary" style={{ fontSize: "48px" }}>
            check_circle
          </span>
          <p className="mb-2 font-medium text-on-surface">Emailul tău a fost verificat cu succes!</p>
          <p className="mb-6 text-sm text-on-surface-variant">
            Acum poți posta anunțuri și folosi toate funcționalitățile platformei.
          </p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-primary px-6 py-2 text-on-primary transition-colors hover:bg-primary-container"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </AuthCardShell>
    );
  }

  return null;
}
