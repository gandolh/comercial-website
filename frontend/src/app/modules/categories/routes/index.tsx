import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const categoryRoutes: ModuleRoute[] = [
  {
    path: "/categorii",
    component: lazy(() =>
      import("../pages/CategoryIndexPage").then((m) => ({
        default: m.CategoryIndexPage,
      })),
    ),
  },
  {
    path: "/categorii/:slug",
    component: lazy(() =>
      import("../pages/CategoryPage").then((m) => ({
        default: m.CategoryPage,
      })),
    ),
  },
];
