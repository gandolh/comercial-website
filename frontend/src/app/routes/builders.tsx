import { createElement } from "react";
import type { RouteComponent, ModuleRoute } from "@app/routes/types";
import {
  Router,
  createRoute,
  createRootRoute,
  type AnyRoute,
} from "@tanstack/react-router";

function resolveComponent(component: RouteComponent | undefined) {
  if (!component) return undefined;
  return () => createElement(component);
}

function normalizePath(path: string, index?: boolean): string {
  if (index) return "";
  if (!path) return "/";
  if (path === "*" || path === "/") return path;

  const trimmed = path.replace(/^\/+/u, "");

  const segments = trimmed
    .split("/")
    .map((segment) =>
      segment.startsWith(":") ? `$${segment.slice(1)}` : segment,
    );

  return segments.join("/") || "/";
}

function buildRoute(
  parent: AnyRoute,
  { component, children, index, path, ...rest }: ModuleRoute,
): AnyRoute {
  const route = createRoute({
    ...rest,
    getParentRoute: () => parent,
    path: normalizePath(path, index),
    component: resolveComponent(component),
  });

  if (children?.length) {
    route.addChildren(children.map((child) => buildRoute(route, child)));
  }

  return route;
}

export function buildRouter(routes: ModuleRoute[]) {
  const rootRoute = createRootRoute({ component: () => null });
  const tanstackRoutes = routes.map((route) => buildRoute(rootRoute, route));

  return new Router({
    routeTree: rootRoute.addChildren(tanstackRoutes),
  });
}
