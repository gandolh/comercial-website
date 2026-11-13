import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "@core/lib/router";
import { useAuth } from "@core/lib/auth";
import { CreateListingWizard } from "../components/CreateListingWizard";
import { useDraft } from "../hooks/useDraft";

function LoadingScreen() {
  return (
    <main className="mt-8 flex-1">
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-24 text-center">
        <span className="material-symbols-outlined text-primary motion-safe:animate-spin" style={{ fontSize: "48px" }}>
          progress_activity
        </span>
        <p className="text-on-surface-variant">Se încarcă wizard-ul de creare...</p>
      </div>
    </main>
  );
}

export function CreateListingPage() {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isHydrating } = useAuth();

  const draftQuery = useDraft(draftId ?? null);

  useEffect(() => {
    if (!draftId) {
      draftQuery.remove?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  if (isHydrating) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/autentificare?next=/adauga-anunt${draftId ? `/${draftId}` : ""}`} replace />;
  }

  if (user && !user.email_verified) {
    return (
      <main className="mt-8 flex-1">
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-16 text-center">
          <h1 className="font-headline text-3xl font-extrabold">Verifică-ți emailul</h1>
          <p className="text-on-surface-variant">
            Pentru a posta un anunț trebuie să confirmi adresa de email. Verifică inbox-ul și apasă pe linkul de
            confirmare.
          </p>
          <button
            className="rounded-control bg-primary px-6 py-3 font-semibold text-on-primary"
            onClick={() => navigate("/verifica-email")}
          >
            Retrimite emailul de confirmare
          </button>
        </div>
      </main>
    );
  }

  return (
    <CreateListingWizard
      draftId={draftId ?? null}
      draft={draftQuery.data}
      // A new listing has no draft to load: React Query v5 keeps a disabled query
      // `pending` forever, so only an existing draft id can be loading.
      isDraftLoading={!!draftId && draftQuery.isPending}
      draftError={draftQuery.error}
    />
  );
}
