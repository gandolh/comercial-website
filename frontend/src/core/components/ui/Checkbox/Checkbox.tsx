import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@core/lib/cn";

const SIZES = { md: "size-4", lg: "size-5" } as const;

interface CheckboxProps extends Omit<ComponentProps<typeof BaseCheckbox.Root>, "className" | "children"> {
  /** The visible label. Without it, name the box with `aria-label`, or put it inside a `<label>`. */
  label?: ReactNode;
  size?: keyof typeof SIZES;
  /** On the label when there is one, else on the box. */
  className?: string;
  /** On the box, when there is a label too. */
  boxClassName?: string;
}

/** A tick box, with its label when it has one. */
export function Checkbox({ label, size = "md", className, boxClassName, ...props }: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root
      {...props}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center rounded border border-outline bg-surface-container-lowest text-on-primary outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "data-checked:border-primary data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
        SIZES[size],
        label ? boxClassName : className,
      )}
    >
      <BaseCheckbox.Indicator className="flex">
        <svg
          viewBox="0 0 12 12"
          className="size-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M2.5 6.5 5 9l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  if (!label) return box;
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2", className)}>
      {box}
      {label}
    </label>
  );
}
