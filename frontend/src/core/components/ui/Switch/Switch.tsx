import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@core/lib/cn";

const SIZES = {
  md: { track: "h-6.5 w-11", thumb: "size-3.5 data-checked:size-[18px] data-checked:translate-x-4" },
  lg: { track: "h-7 w-12", thumb: "size-4 data-checked:size-5 data-checked:translate-x-5" },
} as const;

const TONES = {
  primary: "data-checked:bg-primary data-checked:ring-primary",
  tertiary: "data-checked:bg-tertiary-container data-checked:ring-tertiary",
} as const;

interface SwitchProps extends Omit<ComponentProps<typeof BaseSwitch.Root>, "className" | "children"> {
  /** The visible label. Without it, name the switch with `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** The label before the track, with the two pushed apart. */
  labelFirst?: boolean;
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  className?: string;
}

/** An on/off setting that applies at once. With a `label`, the whole row is the click target. */
export function Switch({ label, labelFirst = false, size = "md", tone = "primary", className, ...props }: SwitchProps) {
  const control = (
    <BaseSwitch.Root
      {...props}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full bg-surface-container-low px-1.5 ring-2 ring-outline outline-none ring-inset motion-safe:transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        SIZES[size].track,
        TONES[tone],
      )}
    >
      <BaseSwitch.Thumb
        className={cn(
          "block rounded-full bg-outline data-checked:bg-on-fill motion-safe:transition-transform",
          SIZES[size].thumb,
        )}
      />
    </BaseSwitch.Root>
  );
  if (!label) return control;
  return (
    <label className={cn("flex cursor-pointer items-center gap-3", labelFirst && "justify-between", className)}>
      {labelFirst && label}
      {control}
      {!labelFirst && label}
    </label>
  );
}
