import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const favoritesRoutes: ModuleRoute[] = [
  {
    path: "/favorite",
    component: lazy(() =>
      import("../pages/FavoritesPage").then((m) => ({
        default: m.FavoritesPage,
      })),
    ),
  },
];
