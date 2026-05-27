import type { ReactNode } from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(page, totalPages)

  return (
    <nav
      role="navigation"
      aria-label="Paginare"
      className={['flex items-center justify-center gap-1', className].join(' ')}
    >
      <PaginationButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Pagina anterioară"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          chevron_left
        </span>
      </PaginationButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-3 py-2 text-on-surface-variant text-sm select-none"
          >
            …
          </span>
        ) : (
          <PaginationButton
            key={p}
            onClick={() => onPageChange(p as number)}
            active={p === page}
            aria-label={`Pagina ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </PaginationButton>
        )
      )}

      <PaginationButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Pagina următoare"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          chevron_right
        </span>
      </PaginationButton>
    </nav>
  )
}

interface PaginationButtonProps {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  'aria-label'?: string
  'aria-current'?: 'page' | undefined
}

function PaginationButton({ children, onClick, disabled, active, ...props }: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...props}
      className={[
        'min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-primary text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container-high',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}
