import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const createListingRoutes: ModuleRoute[] = [
  {
    path: "/adauga-anunt",
    component: lazy(() =>
      import("../pages/CreateListingPage").then((m) => ({
        default: m.CreateListingPage,
      })),
    ),
  },
  {
    path: "/adauga-anunt/:draftId",
    component: lazy(() =>
      import("../pages/CreateListingPage").then((m) => ({
        default: m.CreateListingPage,
      })),
    ),
  },
];
