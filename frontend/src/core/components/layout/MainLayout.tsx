import { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CardSkeleton } from "@core/components/ui/Skeleton";
import { GlobalLoadingIndicator } from "@core/components/ui/GlobalLoadingIndicator";
import { CookieConsent } from "@core/components/ui/CookieConsent";

function PageLoader() {
  return (
    <main className="flex-1 pt-24">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 px-8 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalLoadingIndicator />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer />
      <CookieConsent />
    </div>
  );
}
