import type { ComponentType, LazyExoticComponent } from "react";

type UnknownRecord = Record<string, unknown>;

export type RouteComponent =
  | ComponentType<UnknownRecord>
  | LazyExoticComponent<ComponentType<UnknownRecord>>;

export interface ModuleRoute {
  path: string;
  component?: RouteComponent;
  children?: ModuleRoute[];
  id?: string;
  index?: boolean;
  caseSensitive?: boolean;
  validateSearch?: (search: UnknownRecord) => UnknownRecord;
  loader?: (opts: unknown) => unknown | Promise<unknown>;
  beforeLoad?: (opts: unknown) => unknown | Promise<unknown>;
}
