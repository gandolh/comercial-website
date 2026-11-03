/**
 * Where the API is. `VITE_API_URL` wins when set at build time. Otherwise a production build calls
 * the deploy's same-origin route `/piataro-api` (Caddy strips the prefix, so the API keeps its bare
 * routes), and `npm run dev` calls the local API on port 8080.
 */
export const API_BASE: string = (
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "/piataro-api" : "http://localhost:8080")
).replace(/\/$/, "");

/** An absolute URL for an API path (`/listings/...`), for downloads and full-page navigations. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
