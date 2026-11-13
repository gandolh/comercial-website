interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-xl bg-surface-container-high motion-safe:animate-pulse ${className}`} aria-hidden="true" />
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card">
      <Skeleton className="aspect-4/3 rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  );
}
