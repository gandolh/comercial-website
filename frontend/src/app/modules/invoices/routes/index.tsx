import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const invoicesRoutes: ModuleRoute[] = [
  {
    path: "/facturi",
    component: lazy(() =>
      import("../pages/InvoicesPage").then((m) => ({
        default: m.InvoicesPage,
      }))
    ),
  },
];
