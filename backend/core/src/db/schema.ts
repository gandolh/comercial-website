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
  /** Whether the user has opted in to transactional email notifications (default: 1 / true). */
  email_notifications: ColumnType<number, number | undefined, number>;
  /** Seller profile fields (added in 20260615010000_user_profile_fields.sql). */
  bio: string | null;
  website: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_github: string | null;
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
  // Expiry-reminder tracking (added in 20260621010000_expiry_reminders.sql)
  reminder_3day_sent_at: string | null;
  reminder_expiry_sent_at: string | null;
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

/** Invoice issuer profile saved per user (added in 20260620010000_invoices.sql). */
export interface UserInvoiceProfilesTable {
  user_id: string;
  company_name: string | null;
  cui: string | null;
  reg_com: string | null;
  address: string | null;
  iban: string | null;
  bank_name: string | null;
  email: string | null;
  phone: string | null;
  updated_at: Generated<string>;
}

/** Generated invoices (added in 20260620010000_invoices.sql). */
export interface InvoicesTable {
  id: Generated<string>;
  user_id: string;
  series: ColumnType<string, string | undefined, string>;
  number: number;
  issue_date: string;
  due_date: string | null;
  // Seller / issuer snapshot
  seller_name: string;
  seller_cui: string | null;
  seller_reg_com: string | null;
  seller_address: string | null;
  seller_iban: string | null;
  seller_bank: string | null;
  seller_email: string | null;
  // Buyer / client
  buyer_name: string;
  buyer_cui: string | null;
  buyer_address: string | null;
  /** JSON array of line items: [{description, qty, unit_price, vat_rate}] */
  line_items: string;
  currency: ColumnType<string, string | undefined, string>;
  subtotal: number;
  vat_amount: number;
  total: number;
  /** Optional reference to a future orders table — no FK, orders table not yet created. */
  order_id: number | null;
  created_at: Generated<string>;
}

/** Orders table: tracks purchase orders for paid digital-asset listings (added in 20260620020000_orders.sql). */
export interface OrdersTable {
  id: Generated<string>;
  buyer_user_id: string;
  listing_id: string;
  seller_user_id: string;
  amount_ron: number;
  currency: ColumnType<string, string | undefined, string>;
  /** 'pending' | 'paid' | 'failed' | 'cancelled' */
  status: ColumnType<string, string | undefined, string>;
  provider: ColumnType<string, string | undefined, string>;
  provider_ref: string | null;
  created_at: Generated<string>;
  paid_at: string | null;
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
  user_invoice_profiles: UserInvoiceProfilesTable;
  invoices: InvoicesTable;
  orders: OrdersTable;
  _migrations: MigrationsTable;
}
