interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-surface-container-high ${className}`} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-lowest">
      <Skeleton className="h-64 rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
