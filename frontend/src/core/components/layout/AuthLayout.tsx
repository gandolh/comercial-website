import { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { Wordmark } from "@core/components/brand";

function AuthPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent motion-safe:animate-spin" />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Wordmark tone="ink" />
          </div>
          <Suspense fallback={<AuthPageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
