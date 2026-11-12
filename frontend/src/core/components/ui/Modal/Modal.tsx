import { Dialog } from "@base-ui/react/dialog";
import { useRef, type ReactNode } from "react";
import { cn } from "@core/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

const FOCUSABLE =
  "input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), a[href]";

/**
 * A modal dialog (base-ui rule 12). Both callers hold a form, so an outside click does not close it: Cancel, the X
 * and Esc do (Q58). On open, focus goes to the first `[data-autofocus]` inside, else the body's first field or
 * button, never the X. Focus returns to the element that opened it.
 */
export function Modal({ open, onClose, title, children, size = "md", className }: ModalProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next, details) => {
        // The Escape guard: an Esc that a control inside already used is not the dialog's.
        if (!next && details.reason === "escape-key" && details.event.defaultPrevented) return;
        if (!next) onClose();
      }}
      disablePointerDismissal
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-overlay bg-scrim/40 backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:transition-opacity motion-safe:duration-150" />
        <Dialog.Popup
          ref={popupRef}
          initialFocus={() =>
            popupRef.current?.querySelector<HTMLElement>("[data-autofocus]") ??
            bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
            true
          }
          className={cn(
            "fixed top-1/2 left-1/2 z-overlay flex max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
            "rounded-2xl bg-surface-container-lowest/80 shadow-ambient backdrop-blur-xl outline-none",
            "motion-safe:transition-[opacity,scale] motion-safe:duration-150",
            "data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            sizeClasses[size],
            className,
          )}
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <Dialog.Title className="font-headline text-xl leading-tight font-bold text-on-surface">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Închide"
              className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                close
              </span>
            </Dialog.Close>
          </div>
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 pb-6">
            {children}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
