import { createElement } from "react";
import {
  Outlet,
  Router,
  createRoute,
  createRootRoute,
  type AnyRoute,
} from "@tanstack/react-router";
import type { ModuleRoute } from "@app/routes/types";
import { MainLayout } from "@core/components/layout/MainLayout";
import { AuthLayout } from "@core/components/layout/AuthLayout";
import { ComingSoon } from "@core/components/ui/ComingSoon";

import { homeRoutes } from "@app/modules/home/routes";
import { categoryRoutes } from "@app/modules/categories/routes";
import { searchRoutes } from "@app/modules/search/routes";
import { listingsRoutes } from "@app/modules/listings/routes";
import { createListingRoutes } from "@app/modules/create-listing/routes";
import { authRoutes } from "@app/modules/auth/routes";
import { favoritesRoutes } from "@app/modules/favorites/routes";
import { dashboardRoutes } from "@app/modules/dashboard/routes";
import { settingsRoutes } from "@app/modules/settings/routes";
import { publicProfileRoutes } from "@app/modules/public-profile/routes";
import { messagingRoutes } from "@app/modules/messaging/routes";
import { legalRoutes } from "@app/modules/legal/routes";

const mainModuleRoutes: ModuleRoute[] = [
  ...homeRoutes,
  ...categoryRoutes,
  ...searchRoutes,
  ...listingsRoutes,
  ...createListingRoutes,
  ...dashboardRoutes,
  ...settingsRoutes,
  ...favoritesRoutes,
  ...publicProfileRoutes,
  ...messagingRoutes,
  ...legalRoutes,
];

const fallbackRoute: ModuleRoute = {
  path: "*",
  component: ComingSoon,
};

function normalizePath(path: string, index?: boolean): string {
  if (index) return "";
  if (!path) return "/";
  if (path === "*" || path === "/") return path;

  const trimmed = path.replace(/^\/+/, "");

  const segments = trimmed
    .split("/")
    .map((segment) =>
      segment.startsWith(":") ? `$${segment.slice(1)}` : segment,
    );

  return segments.join("/") || "/";
}

function resolveComponent(component?: ModuleRoute["component"]) {
  if (!component) return undefined;
  return () => createElement(component);
}

function createRoutes(parent: AnyRoute, routes: ModuleRoute[]): AnyRoute[] {
  return routes.map((route) => {
    const { component, children, index, path, ...rest } = route;
    const tanstackRoute = createRoute({
      ...rest,
      getParentRoute: () => parent,
      path: normalizePath(path, index),
      component: resolveComponent(component),
    });

    if (children?.length) {
      tanstackRoute.addChildren(createRoutes(tanstackRoute, children));
    }

    return tanstackRoute;
  });
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_main",
  component: MainLayout,
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_auth",
  component: AuthLayout,
});

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren(
    createRoutes(mainLayoutRoute, [...mainModuleRoutes, fallbackRoute]),
  ),
  authLayoutRoute.addChildren(createRoutes(authLayoutRoute, [...authRoutes])),
]);

export const router = new Router({
  routeTree,
});

export type AppRouter = typeof router;
