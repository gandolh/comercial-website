import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const legalRoutes: ModuleRoute[] = [
  {
    path: "/termeni",
    component: lazy(() =>
      import("../pages/TermeniPage").then((m) => ({
        default: m.TermeniPage,
      })),
    ),
  },
  {
    path: "/confidentialitate",
    component: lazy(() =>
      import("../pages/ConfidentialitatePage").then((m) => ({
        default: m.ConfidentialitatePage,
      })),
    ),
  },
  {
    path: "/politica-cookies",
    component: lazy(() =>
      import("../pages/CookiesPage").then((m) => ({
        default: m.CookiesPage,
      })),
    ),
  },
  {
    path: "/cookies",
    component: lazy(() =>
      import("../pages/CookiesPage").then((m) => ({
        default: m.CookiesPage,
      })),
    ),
  },
  {
    path: "/despre",
    component: lazy(() =>
      import("../pages/DesprePage").then((m) => ({
        default: m.DesprePage,
      })),
    ),
  },
  {
    path: "/contact",
    component: lazy(() =>
      import("../pages/ContactPage").then((m) => ({
        default: m.ContactPage,
      })),
    ),
  },
  {
    path: "/ajutor",
    component: lazy(() =>
      import("../pages/AjutorPage").then((m) => ({
        default: m.AjutorPage,
      })),
    ),
  },
];
