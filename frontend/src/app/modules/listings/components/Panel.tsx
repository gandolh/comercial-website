import type { ComponentProps } from "react";
import { cn } from "@core/lib/cn";

/** A raised white panel on the grey field: the detail page's unit (gallery, price, seller, description). */
export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      {...props}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card md:p-6",
        className,
      )}
    />
  );
}
