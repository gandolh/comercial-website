import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '../Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmă',
  cancelLabel = 'Anulează',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-ambient p-6 space-y-4">
          <AlertDialog.Title className="font-headline font-bold text-on-surface text-xl leading-tight">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-on-surface-variant text-sm leading-relaxed">
            {description}
          </AlertDialog.Description>
          <div className="flex gap-3 justify-end pt-2">
            <AlertDialog.Close
              render={(props) => (
                <Button {...props} variant="ghost" size="sm" onClick={onClose}>
                  {cancelLabel}
                </Button>
              )}
            />
            <Button variant={variant} size="sm" loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
