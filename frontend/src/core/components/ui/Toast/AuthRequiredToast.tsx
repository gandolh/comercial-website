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
  const loginHref = next
    ? `/autentificare?next=${encodeURIComponent(next)}`
    : "/autentificare";

  return (
    <div
      style={{
        background: "var(--color-inverse-surface)",
        color: "var(--color-inverse-on-surface)",
        boxShadow: "var(--shadow-ambient)",
      }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full max-w-sm font-[Inter]"
    >
      <span
        className="material-symbols-outlined shrink-0"
        style={{ fontSize: "20px", color: "var(--color-inverse-primary)" }}
        aria-hidden="true"
      >
        lock
      </span>
      <span className="text-sm leading-snug flex-1">{message}</span>
      <a
        href={loginHref}
        style={{ color: "var(--color-inverse-primary)" }}
        className="font-[Manrope] text-sm font-semibold shrink-0 hover:underline focus-visible:outline-none rounded whitespace-nowrap"
      >
        {loginLabel}
      </a>
    </div>
  );
}
