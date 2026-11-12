import { createWardClient } from "../../../vendor/ward/ward-auth.js";
import type { WardClient, WardClientOptions } from "../../../vendor/ward/ward-auth.js";

/** The Ward client from the config's `ward` block, or undefined when it has none (local login only). */
export async function wardClientFrom(options: WardClientOptions | undefined): Promise<WardClient | undefined> {
  return options ? createWardClient(options) : undefined;
}
