import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const listingsRoutes: ModuleRoute[] = [
  {
    path: "/anunturi/:id",
    component: lazy(() =>
      import("../pages/ListingDetailPage").then((m) => ({
        default: m.ListingDetailPage,
      })),
    ),
  },
  {
    path: "/anunturi/:id/editeaza",
    component: lazy(() =>
      import("../pages/EditListingPage").then((m) => ({
        default: m.EditListingPage,
      })),
    ),
  },
];
