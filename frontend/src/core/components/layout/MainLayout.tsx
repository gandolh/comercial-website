import { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CardSkeleton } from "@core/components/ui/Skeleton";
import { GlobalLoadingIndicator } from "@core/components/ui/GlobalLoadingIndicator";

function PageLoader() {
  return (
    <main className="pt-24 flex-1">
      <div className="max-w-screen-2xl mx-auto px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
    </div>
  );
}
