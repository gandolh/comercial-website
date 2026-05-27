import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const homeRoutes: ModuleRoute[] = [
  {
    path: "/",
    component: lazy(() =>
      import("../pages/HomePage").then((m) => ({ default: m.HomePage })),
    ),
  },
];
