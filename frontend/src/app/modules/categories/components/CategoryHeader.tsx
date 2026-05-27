import { Skeleton } from '@core/components/ui/Skeleton'
import { CATEGORY_LABELS } from '../types'

interface CategoryHeaderProps {
  slug: string
  totalCount: number | undefined
  isLoading: boolean
}

export function CategoryHeader({ slug, totalCount, isLoading }: CategoryHeaderProps) {
  const label = CATEGORY_LABELS[slug] ?? slug

  return (
    <div>
      <h1 className="text-3xl font-black text-on-surface tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
        {label}
      </h1>
      {isLoading ? (
        <Skeleton className="h-4 w-48 mt-1" />
      ) : (
        <p className="text-outline font-medium mt-1">
          {totalCount ?? 0} de anunțuri găsite
        </p>
      )}
    </div>
  )
}
