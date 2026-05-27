import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "@core/lib/router";
import { useAuth } from "@core/lib/auth";
import { CreateListingWizard } from "../components/CreateListingWizard";
import { useDraft } from "../hooks/useDraft";

function LoadingScreen() {
  return (
    <main className="mt-24 flex-1">
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
        <span
          className="material-symbols-outlined animate-spin text-primary"
          style={{ fontSize: "48px" }}
        >
          progress_activity
        </span>
        <p className="text-on-surface-variant">
          Se încarcă wizard-ul de creare...
        </p>
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
    return (
      <Navigate
        to={`/autentificare?next=/adauga-anunt${draftId ? `/${draftId}` : ""}`}
        replace
      />
    );
  }

  if (user && !user.email_verified) {
    return (
      <main className="mt-24 flex-1">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-6">
          <h1
            className="text-3xl font-black"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Verifică-ți emailul
          </h1>
          <p className="text-on-surface-variant">
            Pentru a posta un anunț trebuie să confirmi adresa de email.
            Verifică inbox-ul și apasă pe linkul de confirmare.
          </p>
          <button
            className="px-6 py-3 rounded-full bg-primary text-on-primary font-semibold"
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
      isDraftLoading={draftQuery.isPending}
      draftError={draftQuery.error}
    />
  );
}
