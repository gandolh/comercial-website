import { Skeleton } from "@core/components/ui/Skeleton";
import { CATEGORY_LABELS } from "../types";

interface CategoryHeaderProps {
  slug: string;
  totalCount: number | undefined;
  isLoading: boolean;
}

export function CategoryHeader({ slug, totalCount, isLoading }: CategoryHeaderProps) {
  const label = CATEGORY_LABELS[slug] ?? slug;

  return (
    <div>
      <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface">{label}</h1>
      {isLoading ? (
        <Skeleton className="mt-1 h-4 w-48" />
      ) : (
        <p className="mt-1 font-medium text-outline">{totalCount ?? 0} de anunțuri găsite</p>
      )}
    </div>
  );
}
