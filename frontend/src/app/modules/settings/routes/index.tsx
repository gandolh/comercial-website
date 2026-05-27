import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const settingsRoutes: ModuleRoute[] = [
  {
    path: "/cont/setari",
    component: lazy(() =>
      import("../pages/SettingsPage").then((m) => ({
        default: m.SettingsPage,
      })),
    ),
  },
];
