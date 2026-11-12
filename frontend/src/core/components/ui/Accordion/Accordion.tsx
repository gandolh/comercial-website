import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@core/lib/cn";

interface AccordionProps extends Omit<
  ComponentProps<typeof BaseAccordion.Root>,
  "className" | "value" | "onValueChange" | "defaultValue"
> {
  className?: string;
  /** The values of the open items. With `multiple` off, at most one. */
  value?: string[];
  onValueChange?: (value: string[]) => void;
}

/** The items under one root open one at a time: pass `value` and `onValueChange` to control it. */
export function Accordion({ className, onValueChange, ...props }: AccordionProps) {
  return (
    <BaseAccordion.Root
      {...props}
      onValueChange={(value) => onValueChange?.(value.filter((v): v is string => typeof v === "string"))}
      className={cn(className)}
    />
  );
}

interface AccordionItemProps {
  value: string;
  question: ReactNode;
  children: ReactNode;
}

export function AccordionItem({ value, question, children }: AccordionItemProps) {
  return (
    <BaseAccordion.Item value={value} className="overflow-hidden rounded-xl bg-surface-container">
      <BaseAccordion.Header className="m-0">
        <BaseAccordion.Trigger className="group flex w-full items-center justify-between gap-4 p-4 text-left transition-colors outline-none hover:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
          <span className="font-medium text-on-surface">{question}</span>
          <span
            className="material-symbols-outlined shrink-0 text-on-surface-variant transition-transform group-data-panel-open:rotate-180"
            style={{ fontSize: "20px" }}
            aria-hidden="true"
          >
            expand_more
          </span>
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      <BaseAccordion.Panel className="px-4 pb-4 text-sm leading-relaxed text-on-surface-variant">
        {children}
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}
