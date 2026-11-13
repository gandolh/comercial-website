import { Toast } from "@base-ui/react/toast";
import { cn } from "@core/lib/cn";
import { toastManager } from "./toast";

const VARIANTS: Record<string, { icon: string; classes: string }> = {
  info: { icon: "info", classes: "bg-inverse-surface text-inverse-on-surface" },
  success: { icon: "check_circle", classes: "bg-tertiary-container text-on-tertiary-container" },
  error: { icon: "error", classes: "bg-error-container text-on-error-container" },
  warning: { icon: "warning", classes: "bg-secondary-container text-on-secondary-container" },
};

/**
 * Mounts the toast list once, near the root. The viewport is a live region that exists before the first toast,
 * so a screen reader announces it when it arrives. One toast is shown at a time. It sits below the navbar, so a
 * toast that stays (an error) never covers the navbar's controls.
 */
export function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager} limit={1}>
      <Toast.Portal>
        <Toast.Viewport className="fixed top-20 left-1/2 z-toast flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2 outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager<{ render?: () => React.ReactNode }>();
  return toasts.map((item) => {
    const variant = VARIANTS[item.type ?? "info"];
    return (
      <Toast.Root
        key={item.id}
        toast={item}
        className="w-full translate-x-(--toast-swipe-movement-x) translate-y-(--toast-swipe-movement-y) outline-none data-ending-style:opacity-0 data-limited:hidden data-starting-style:opacity-0 data-swiping:duration-0 motion-safe:transition-[opacity,translate] motion-safe:duration-200"
      >
        {item.data?.render ? (
          <Toast.Content>{item.data.render()}</Toast.Content>
        ) : (
          <Toast.Content
            className={cn("flex min-h-14 items-center gap-3 rounded-control px-4 py-2 shadow-popup", variant?.classes)}
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: "20px" }} aria-hidden="true">
              {variant?.icon}
            </span>
            <div className="min-w-0 flex-1">
              <Toast.Title className="text-sm font-medium" />
              <Toast.Description className="text-sm opacity-80" />
            </div>
            <Toast.Close
              aria-label="Închide notificarea"
              className="flex shrink-0 rounded-full p-0.5 transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }} aria-hidden="true">
                close
              </span>
            </Toast.Close>
          </Toast.Content>
        )}
      </Toast.Root>
    );
  });
}
