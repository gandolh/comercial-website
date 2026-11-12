import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@core/lib/queryClient";
import { router } from "@app/routes";
import { useAuth } from "@core/lib/auth";
import { Toaster } from "@core/components/ui";

export function App() {
  const hydrate = useAuth((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
