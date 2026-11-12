interface AuthRequiredToastProps {
  message?: string;
  loginLabel?: string;
  next?: string;
}

export function AuthRequiredToast({
  message = "Trebuie să fii autentificat pentru a efectua această acțiune.",
  loginLabel = "Autentifică-te",
  next,
}: AuthRequiredToastProps) {
  const loginHref = next ? `/autentificare?next=${encodeURIComponent(next)}` : "/autentificare";

  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-ambient">
      <span
        className="material-symbols-outlined shrink-0 text-inverse-primary"
        style={{ fontSize: "20px" }}
        aria-hidden="true"
      >
        lock
      </span>
      <span className="flex-1 text-sm leading-snug">{message}</span>
      <a
        href={loginHref}
        className="shrink-0 rounded-sm font-headline text-sm font-semibold whitespace-nowrap text-inverse-primary hover:underline focus-visible:outline-none"
      >
        {loginLabel}
      </a>
    </div>
  );
}
