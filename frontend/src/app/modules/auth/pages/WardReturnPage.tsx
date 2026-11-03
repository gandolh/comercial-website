import { useEffect } from "react";
import { useNavigate } from "@core/lib/router";
import { useAuth } from "@core/lib/auth";
import { AuthCardShell } from "../components/AuthCardShell";

/**
 * Where a Ward sign-in lands: the API puts the app's token in the URL fragment (never sent to a
 * server or written to a log). It is stored like a password sign-in's, then the fragment is cleared.
 */
export function WardReturnPage() {
  const navigate = useNavigate();
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", window.location.pathname);
    if (!token) {
      navigate("/autentificare", { replace: true, search: { ward_error: "invalid_response" } });
      return;
    }
    localStorage.setItem("auth_token", token);
    void hydrate().then(() => navigate("/", { replace: true }));
  }, [hydrate, navigate]);

  return (
    <AuthCardShell title="Se finalizează autentificarea" description="Intri cu Ward...">
      <p className="text-center text-sm text-on-surface-variant">Un moment.</p>
    </AuthCardShell>
  );
}
