// Shared application context: the wired dependencies every route module receives.
// app.ts builds this once and registers each feature plugin with it as the plugin's options.
import type { Db } from "@my-olx/core";
import type { EmailService, StorageService } from "@my-olx/core";
import type { Config } from "./config.js";

export interface AppContext {
  db: Db;
  config: Config;
  /** Listing images, under the publicly served uploads folder. */
  storage: StorageService;
  /** Files for sale, outside it (`config.assetsDir`). */
  assetStorage: StorageService;
  email: EmailService;
}
