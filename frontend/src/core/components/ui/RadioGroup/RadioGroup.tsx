import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@core/lib/cn";

interface RadioGroupProps extends Omit<ComponentProps<typeof BaseRadioGroup>, "className"> {
  className?: string;
}

/** A group of radios, always one chosen once a value is set. The arrow keys move and choose (a filter, or a device-only setting). */
export function RadioGroup({ className, ...props }: RadioGroupProps) {
  return <BaseRadioGroup {...props} className={cn("outline-none", className)} />;
}

interface RadioProps extends Omit<ComponentProps<typeof BaseRadio.Root>, "className" | "children"> {
  className?: string;
  children?: ReactNode;
}

/** A radio with a look of its own (a star, a segment). It carries `data-checked` for the look to key on. */
export function Radio({ className, children, ...props }: RadioProps) {
  return (
    <BaseRadio.Root
      {...props}
      className={cn("cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary", className)}
    >
      {children}
    </BaseRadio.Root>
  );
}

interface RadioOptionProps extends Omit<RadioProps, "children"> {
  label: ReactNode;
  /** On the label that wraps the circle and the text. */
  labelClassName?: string;
}

/** A round radio with its label: the whole row is the click target. */
export function RadioOption({ label, labelClassName, className, ...props }: RadioOptionProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3", labelClassName)}>
      <BaseRadio.Root
        {...props}
        className={cn(
          "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-outline bg-surface-container-lowest outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "data-checked:border-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className,
        )}
      >
        <BaseRadio.Indicator className="size-2 rounded-full bg-primary" />
      </BaseRadio.Root>
      {label}
    </label>
  );
}
