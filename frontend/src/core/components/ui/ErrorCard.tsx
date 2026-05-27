interface ErrorCardProps {
  message?: string
  onRetry?: () => void
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <span className="material-symbols-outlined text-error" style={{ fontSize: '48px' }}>
        error
      </span>
      <p className="text-on-surface font-medium">{message ?? 'A apărut o eroare. Încearcă din nou.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold hover:bg-primary-container transition-colors"
        >
          Încearcă din nou
        </button>
      )}
    </div>
  )
}
