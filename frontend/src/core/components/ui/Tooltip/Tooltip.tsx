import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  /** The control the tooltip labels. It is passed through `render`, so it is the trigger and nothing nests in it. */
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({ content, children, side = "top", delay = 300 }: TooltipProps) {
  return (
    <BaseTooltip.Provider delay={delay}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={children} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} sideOffset={6} className="z-popup">
            <BaseTooltip.Popup className="max-w-xs rounded-lg bg-inverse-surface px-3 py-1.5 text-xs font-medium text-inverse-on-surface shadow-ambient motion-safe:transition-opacity motion-safe:duration-100 data-starting-style:opacity-0 data-ending-style:opacity-0">
              {content}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
