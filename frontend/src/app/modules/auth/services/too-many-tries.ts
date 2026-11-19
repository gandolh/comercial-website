import { isAxiosError } from "axios";

/**
 * The message for a 429 from a password check (sign-in, change password, Ward link), or null for any other
 * error. N comes from the `Retry-After` header in seconds, rounded up to minutes.
 */
export function tooManyTriesMessage(err: unknown): string | null {
  if (!isAxiosError(err) || err.response?.status !== 429) return null;
  const seconds = Number(err.response.headers["retry-after"]);
  const when = !Number.isFinite(seconds)
    ? "peste câteva minute"
    : seconds <= 60
      ? "peste un minut"
      : `peste ${Math.ceil(seconds / 60)} minute`;
  return `Prea multe încercări. Încearcă din nou ${when}.`;
}
