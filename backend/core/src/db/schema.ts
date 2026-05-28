import type { ColumnType, Generated } from "kysely";

/**
 * Full database schema for the my-olx SQLite database, typed for Kysely.
 *
 * Conventions:
 * - `Generated<string>` for TEXT columns with DB defaults (id, created_at, ...).
 * - `ColumnType<Select, Insert, Update>` where insert/update differ from select.
 * - Timestamps are stored as TEXT (ISO 8601) in SQLite.
 * - Booleans are stored as INTEGER (0/1) in SQLite.
 *
 * Digital-asset columns (asset_type, file_format, file_size_bytes, license_type,
 * download_count) and the listing_assets / downloads tables are added in Wave 3.
 */

export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: ColumnType<number, number | undefined, number>;
  email_verified: ColumnType<number, number | undefined, number>;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface ListingsTable {
  id: Generated<string>;
  user_id: string;
  title: string;
  description: string;
  price_ron: number | null;
  is_negotiable: ColumnType<number, number | undefined, number>;
  category: string;
  city: ColumnType<string, string | undefined, string>;
  active: ColumnType<number, number | undefined, number>;
  view_count: ColumnType<number, number | undefined, number>;
  expires_at: string;
  created_at: Generated<string>;
  updated_at: Generated<string>;
  // Digital-asset columns (added in 20260601000000_digital_assets.sql)
  asset_type: ColumnType<string, string | undefined, string>;
  file_format: string | null;
  file_size_bytes: number | null;
  license_type: ColumnType<string, string | undefined, string>;
  download_count: ColumnType<number, number | undefined, number>;
}

export interface ListingAssetsTable {
  id: Generated<string>;
  listing_id: string;
  s3_key: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  checksum_sha256: string | null;
  position: number;
  created_at: Generated<string>;
}

export interface DownloadsTable {
  id: Generated<string>;
  listing_id: string;
  user_id: string;
  asset_id: string | null;
  downloaded_at: Generated<string>;
}

export interface ListingImagesTable {
  id: Generated<string>;
  listing_id: string;
  s3_key: string;
  position: number;
  width: number | null;
  height: number | null;
  bytes: number | null;
  created_at: Generated<string>;
}

export interface EmailVerificationTokensTable {
  token: string;
  user_id: string;
  expires_at: string;
  used_at: string | null;
  created_at: Generated<string>;
}

export interface PasswordResetTokensTable {
  token: string;
  user_id: string;
  expires_at: string;
  used_at: string | null;
  created_at: Generated<string>;
}

export interface PhoneVerificationCodesTable {
  id: Generated<string>;
  user_id: string;
  phone: string;
  code_hash: string;
  attempts: ColumnType<number, number | undefined, number>;
  expires_at: string;
  consumed_at: string | null;
  created_at: Generated<string>;
}

export interface FavoritesTable {
  user_id: string;
  listing_id: string;
  created_at: Generated<string>;
}

export interface ConversationsTable {
  id: Generated<string>;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: Generated<string>;
  last_message_at: ColumnType<string, string | undefined, string>;
}

export interface MessagesTable {
  id: Generated<string>;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: Generated<string>;
}

/** Tracks applied SQL migrations (managed by the core migrator). */
export interface MigrationsTable {
  name: string;
  applied_at: Generated<string>;
}

export interface Database {
  users: UsersTable;
  listings: ListingsTable;
  listing_assets: ListingAssetsTable;
  downloads: DownloadsTable;
  listing_images: ListingImagesTable;
  email_verification_tokens: EmailVerificationTokensTable;
  password_reset_tokens: PasswordResetTokensTable;
  phone_verification_codes: PhoneVerificationCodesTable;
  favorites: FavoritesTable;
  conversations: ConversationsTable;
  messages: MessagesTable;
  _migrations: MigrationsTable;
}
