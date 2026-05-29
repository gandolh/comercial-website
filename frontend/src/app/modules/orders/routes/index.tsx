import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const ordersRoutes: ModuleRoute[] = [
  {
    path: "/comenzi",
    component: lazy(() =>
      import("../pages/MyOrdersPage").then((m) => ({
        default: m.MyOrdersPage,
      }))
    ),
  },
  {
    path: "/comenzi/confirmare",
    component: lazy(() =>
      import("../pages/OrderConfirmationPage").then((m) => ({
        default: m.OrderConfirmationPage,
      }))
    ),
  },
];
