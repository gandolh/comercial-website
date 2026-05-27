import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const dashboardRoutes: ModuleRoute[] = [
  {
    path: "/cont",
    component: lazy(() =>
      import("../pages/DashboardPage").then((m) => ({
        default: m.DashboardPage,
      })),
    ),
  },
  {
    path: "/cont/anunturi",
    component: lazy(() =>
      import("../pages/MyListingsPage").then((m) => ({
        default: m.MyListingsPage,
      })),
    ),
  },
];
