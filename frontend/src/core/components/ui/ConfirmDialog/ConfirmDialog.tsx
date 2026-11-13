import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useRef } from "react";
import { Button } from "../Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

/**
 * A confirm question. Cancel has focus when it opens; Esc, Cancel and the question's own close all go through
 * `onClose`, once. While `loading` the dialog cannot be dismissed. An alert dialog ignores an outside click.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmă",
  cancelLabel = "Anulează",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onClose();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-overlay bg-scrim/55 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:transition-opacity motion-safe:duration-150" />
        <AlertDialog.Popup
          initialFocus={cancelRef}
          className="fixed top-1/2 left-1/2 z-overlay w-full max-w-sm -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-popup outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-safe:transition-[opacity,scale] motion-safe:duration-150"
        >
          <AlertDialog.Title className="font-headline text-xl leading-tight font-bold text-on-surface">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm leading-relaxed text-on-surface-variant">
            {description}
          </AlertDialog.Description>
          <div className="flex justify-end gap-3 pt-2">
            <AlertDialog.Close ref={cancelRef} disabled={loading} render={<Button variant="ghost" size="sm" />}>
              {cancelLabel}
            </AlertDialog.Close>
            <Button variant={variant} size="sm" loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
