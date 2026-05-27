import type { ColumnType, Generated } from "kysely";

/**
 * Full database schema for the my-olx PostgreSQL database, typed for Kysely.
 *
 * Conventions:
 * - `Generated<T>` for columns with DB defaults (id, created_at, ...).
 * - `ColumnType<Select, Insert, Update>` where insert/update differ from select.
 * - Timestamps are `Date` on read; inserts may omit them (DB default).
 *
 * Digital-asset columns (asset_type, file_format, file_size_bytes, license_type,
 * download_count) and the listing_assets / downloads tables are added in Wave 3.
 */

type Timestamp = ColumnType<Date, Date | string | undefined, Date | string>;

export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: ColumnType<boolean, boolean | undefined, boolean>;
  email_verified: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface ListingsTable {
  id: Generated<string>;
  user_id: string;
  title: string;
  description: string;
  price_ron: number | null;
  is_negotiable: ColumnType<boolean, boolean | undefined, boolean>;
  category: string;
  city: ColumnType<string, string | undefined, string>; // digital listings may omit (default '')
  active: ColumnType<boolean, boolean | undefined, boolean>;
  view_count: ColumnType<number, number | undefined, number>;
  expires_at: Timestamp;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  // Digital-asset columns (added in 20260601000000_digital_assets.sql)
  asset_type: ColumnType<string, string | undefined, string>;
  file_format: string | null;
  file_size_bytes: number | null;
  license_type: ColumnType<string, string | undefined, string>;
  download_count: ColumnType<number, number | undefined, number>;
  // search_tsv is maintained by a DB trigger; not selected/inserted directly.
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
  created_at: Generated<Timestamp>;
}

export interface DownloadsTable {
  id: Generated<string>;
  listing_id: string;
  user_id: string;
  asset_id: string | null;
  downloaded_at: Generated<Timestamp>;
}

export interface ListingImagesTable {
  id: Generated<string>;
  listing_id: string;
  s3_key: string;
  position: number;
  width: number | null;
  height: number | null;
  bytes: number | null;
  created_at: Generated<Timestamp>;
}

export interface EmailVerificationTokensTable {
  token: string;
  user_id: string;
  expires_at: Timestamp;
  used_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

export interface PasswordResetTokensTable {
  token: string;
  user_id: string;
  expires_at: Timestamp;
  used_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

export interface PhoneVerificationCodesTable {
  id: Generated<string>;
  user_id: string;
  phone: string;
  code_hash: string;
  attempts: ColumnType<number, number | undefined, number>;
  expires_at: Timestamp;
  consumed_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

export interface FavoritesTable {
  user_id: string;
  listing_id: string;
  created_at: Generated<Timestamp>;
}

export interface ConversationsTable {
  id: Generated<string>;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: Generated<Timestamp>;
  last_message_at: ColumnType<Date, Date | string | undefined, Date | string>;
}

export interface MessagesTable {
  id: Generated<string>;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

/** Tracks applied SQL migrations (managed by the core migrator). */
export interface MigrationsTable {
  name: string;
  applied_at: Generated<Timestamp>;
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
