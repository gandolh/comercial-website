import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const authRoutes: ModuleRoute[] = [
  {
    path: "/autentificare",
    component: lazy(() =>
      import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })),
    ),
  },
  {
    path: "/inregistrare",
    component: lazy(() =>
      import("../pages/RegisterPage").then((m) => ({
        default: m.RegisterPage,
      })),
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
  {
    path: "/parola-uitata",
    component: lazy(() =>
      import("../pages/ForgotPasswordPage").then((m) => ({
        default: m.ForgotPasswordPage,
      })),
    ),
  },
  {
    path: "/reseteaza-parola",
    component: lazy(() =>
      import("../pages/ResetPasswordPage").then((m) => ({
        default: m.ResetPasswordPage,
      })),
    ),
  },
];
