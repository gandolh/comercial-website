import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** A footer pinned under the scrolling body (the sheet's actions). */
  footer?: ReactNode;
}

/**
 * A bottom sheet for phones (base-ui rule 12): controlled, with the Escape guard, a title and a labelled X. An
 * outside tap closes it and drops the picks held inside, since a sheet applies them only from its footer.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details.reason === "escape-key" && details.event.defaultPrevented) return;
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-overlay bg-scrim/55 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:transition-opacity motion-safe:duration-150" />
        <Dialog.Popup className="fixed right-0 bottom-0 left-0 z-overlay flex max-h-[88svh] flex-col rounded-t-[20px] border-t border-outline-variant bg-surface-container-lowest shadow-popup outline-none data-ending-style:translate-y-full data-starting-style:translate-y-full motion-safe:transition-transform motion-safe:duration-200">
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-sm bg-outline-variant" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
            <Dialog.Title className="font-headline text-price font-extrabold text-on-surface">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Închide"
              className="grid size-11 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
          {footer && (
            <div className="flex gap-3 border-t border-outline-variant px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
