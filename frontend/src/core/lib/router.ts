import { useCallback, useEffect, useMemo } from "react";
import {
  Link as RouterLink,
  useNavigate as useTanstackNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";

export type NavigateOptions = {
  replace?: boolean;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  hash?: string;
  state?: Record<string, unknown>;
};

export { RouterLink as Link };

export function useNavigate() {
  const navigate = useTanstackNavigate();

  return useCallback(
    (to: string, options: NavigateOptions = {}) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({
        to: to as never,
        replace: options.replace,
        params: options.params as never,
        search: options.search as never,
        hash: options.hash,
        state: options.state,
      } as any);
    },
    [navigate],
  );
}

export function useParams<T extends Record<string, string>>() {
  const state = useRouterState();
  const params = state.matches[state.matches.length - 1]?.params ?? {};
  return params as T;
}

export function useLocation() {
  const state = useRouterState();
  return state.location;
}

function entriesToSearchParams(search: Record<string, unknown> | undefined) {
  const urlSearchParams = new URLSearchParams();
  if (!search) {
    return urlSearchParams;
  }

  for (const [key, value] of Object.entries(search)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => urlSearchParams.append(key, String(item)));
    } else {
      urlSearchParams.set(key, String(value));
    }
  }

  return urlSearchParams;
}

export function useSearchParams(): [
  URLSearchParams,
  (
    args:
      | URLSearchParams
      | Record<string, unknown>
      | ((prev: URLSearchParams) => URLSearchParams),
  ) => void,
] {
  const router = useRouter();
  const state = useRouterState();

  const searchSnapshot = useMemo(
    () => state.location.search as Record<string, unknown>,
    [state.location.search],
  );
  const pathname = state.location.pathname;

  const currentParams = useMemo(
    () => entriesToSearchParams(searchSnapshot),
    [searchSnapshot],
  );

  const setSearchParams = useCallback(
    (
      args:
        | URLSearchParams
        | Record<string, unknown>
        | ((prev: URLSearchParams) => URLSearchParams),
    ) => {
      const base = new URLSearchParams(currentParams.toString());

      const nextParams = (() => {
        if (typeof args === "function") {
          return args(base);
        }

        if (args instanceof URLSearchParams) {
          return args;
        }

        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(args)) {
          if (value == null) continue;
          params.set(key, String(value));
        }
        return params;
      })();

      const searchObject: Record<string, string> = {};
      nextParams.forEach((value, key) => {
        searchObject[key] = value;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.navigate({
        to: pathname,
        search: searchObject,
        replace: true,
      } as any);
    },
    [currentParams, pathname, router],
  );

  return [currentParams, setSearchParams];
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}
