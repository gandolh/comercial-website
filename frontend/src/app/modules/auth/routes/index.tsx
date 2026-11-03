import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

// Sign-up and the email password reset are gone: only the owner signs in (corpus decisions.md).
export const authRoutes: ModuleRoute[] = [
  {
    path: "/autentificare",
    component: lazy(() =>
      import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })),
    ),
  },
  {
    path: "/autentificare/ward",
    component: lazy(() =>
      import("../pages/WardReturnPage").then((m) => ({ default: m.WardReturnPage })),
    ),
  },
  {
    path: "/verifica-email",
    component: lazy(() =>
      import("../pages/EmailVerifyPage").then((m) => ({
        default: m.EmailVerifyPage,
      })),
    ),
  },
];
