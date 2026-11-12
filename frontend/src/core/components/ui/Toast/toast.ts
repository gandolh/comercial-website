import { Toast } from "@base-ui/react/toast";
import type { ReactNode } from "react";

/** What a toast carries beyond Base UI's own fields: a `custom` toast brings its own content. */
export interface ToastData {
  render?: () => ReactNode;
}

/** The app's one manager, so code outside React (a mutation's `onError`) can raise a toast. */
export const toastManager = Toast.createToastManager<ToastData>();

interface ToastOptions {
  description?: ReactNode;
  /** Milliseconds before it closes; 0 keeps it until dismissed. An error defaults to 0, the rest to 4 s. */
  timeout?: number;
}

type Variant = "info" | "success" | "error" | "warning";

const DEFAULT_TIMEOUT = 4000;

function show(type: Variant, message: ReactNode, { description, timeout }: ToastOptions = {}): string {
  return toastManager.add({
    title: message,
    description,
    type,
    // An error waits for its Dismiss button, so nobody who looked away misses it; it is announced at once.
    timeout: timeout ?? (type === "error" ? 0 : DEFAULT_TIMEOUT),
    priority: type === "error" ? "high" : "low",
  });
}

/**
 * The call shape the app used from sonner: `toast.success(message)`, `.error`, `.info`, `.warning`, and
 * `.custom(render)` for a toast with its own content. Each returns the toast's id.
 */
export const toast = Object.assign((message: ReactNode, options?: ToastOptions) => show("info", message, options), {
  success: (message: ReactNode, options?: ToastOptions) => show("success", message, options),
  error: (message: ReactNode, options?: ToastOptions) => show("error", message, options),
  info: (message: ReactNode, options?: ToastOptions) => show("info", message, options),
  warning: (message: ReactNode, options?: ToastOptions) => show("warning", message, options),
  custom: (render: () => ReactNode, options?: Pick<ToastOptions, "timeout">) =>
    toastManager.add({
      type: "custom",
      data: { render },
      timeout: options?.timeout ?? DEFAULT_TIMEOUT,
    }),
  /** Closes one toast by its id, or every toast. */
  dismiss: (id?: string) => {
    toastManager.close(id);
  },
});
