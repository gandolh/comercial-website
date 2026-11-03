import { createWardClient, wardClientOptionsFromEnv } from "../vendor/ward/ward-auth.js";
import type { WardClient } from "../vendor/ward/ward-auth.js";

/**
 * The Ward client from the five `WARD_OIDC_*` settings, or undefined when `WARD_OIDC_ISSUER` is unset
 * (local login only). An incomplete set throws at start: always a deploy mistake.
 */
export async function wardClientFromEnv(env: NodeJS.ProcessEnv = process.env): Promise<WardClient | undefined> {
  const options = wardClientOptionsFromEnv(env);
  return options ? createWardClient(options) : undefined;
}
