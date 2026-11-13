interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="material-symbols-outlined text-error" style={{ fontSize: "48px" }}>
        error
      </span>
      <p className="font-medium text-on-surface">{message ?? "A apărut o eroare. Încearcă din nou."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-control bg-primary px-6 py-2 font-bold text-on-primary transition-colors hover:bg-primary-container"
        >
          Încearcă din nou
        </button>
      )}
    </div>
  );
}
