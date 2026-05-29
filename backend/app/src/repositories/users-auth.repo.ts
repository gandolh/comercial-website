import { randomBytes, createHash } from "node:crypto";
import { sql, type SqlBool } from "kysely";
import type { Db } from "@my-olx/core";

export interface CreateUserParams {
  email: string;
  passwordHash: string;
  displayName?: string;
  avatarUrl?: string;
}

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: number;
  email_verified: number;
  bio: string | null;
  website: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_github: string | null;
  created_at: string;
  updated_at: string;
};

export interface UpdateProfileParams {
  bio?: string | null;
  website?: string | null;
  social_twitter?: string | null;
  social_instagram?: string | null;
  social_github?: string | null;
}

function nowIso(): string {
  return new Date().toISOString();
}

export class UsersAuthRepository {
  constructor(private db: Db) {}

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return this.db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst() as Promise<UserRow | undefined>;
  }

  async findById(id: string): Promise<UserRow | undefined> {
    return this.db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst() as Promise<UserRow | undefined>;
  }

  async createUser(params: CreateUserParams): Promise<UserRow> {
    const user = await this.db
      .insertInto("users")
      .values({
        email: params.email,
        password_hash: params.passwordHash,
        display_name: params.displayName ?? null,
        avatar_url: params.avatarUrl ?? null,
        phone: null,
        phone_verified: 0,
        email_verified: 0,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return user as unknown as UserRow;
  }

  async createEmailVerificationToken(userId: string, expiresAtMs: number): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(expiresAtMs).toISOString();

    await this.db
      .insertInto("email_verification_tokens")
      .values({ token, user_id: userId, expires_at: expiresAt, used_at: null })
      .execute();

    return token;
  }

  async consumeEmailVerificationToken(token: string): Promise<string | null> {
    const now = nowIso();
    const row = await this.db
      .selectFrom("email_verification_tokens")
      .select("user_id")
      .where("token", "=", token)
      .where("used_at", "is", null)
      .where(sql<SqlBool>`expires_at > ${now}`)
      .executeTakeFirst();

    if (!row) return null;

    await this.db
      .updateTable("email_verification_tokens")
      .set({ used_at: now })
      .where("token", "=", token)
      .execute();

    return row.user_id;
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.db
      .updateTable("users")
      .set({ email_verified: 1 })
      .where("id", "=", userId)
      .execute();
  }

  async createPasswordResetToken(userId: string, expiresAtMs: number): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(expiresAtMs).toISOString();

    await this.db
      .insertInto("password_reset_tokens")
      .values({ token, user_id: userId, expires_at: expiresAt, used_at: null })
      .execute();

    return token;
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    const now = nowIso();
    const row = await this.db
      .selectFrom("password_reset_tokens")
      .select("user_id")
      .where("token", "=", token)
      .where("used_at", "is", null)
      .where(sql<SqlBool>`expires_at > ${now}`)
      .executeTakeFirst();

    if (!row) return null;

    await this.db
      .updateTable("password_reset_tokens")
      .set({ used_at: now })
      .where("token", "=", token)
      .execute();

    return row.user_id;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .updateTable("users")
      .set({ password_hash: passwordHash })
      .where("id", "=", userId)
      .execute();
  }

  async storePhoneVerificationCode(userId: string, phone: string, expiresAtMs: number): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(expiresAtMs).toISOString();

    await this.db
      .insertInto("phone_verification_codes")
      .values({
        user_id: userId,
        phone,
        code_hash: codeHash,
        attempts: 0,
        expires_at: expiresAt,
        consumed_at: null,
      })
      .execute();
  }

  async verifyPhoneCode(userId: string, code: string): Promise<{ phone: string; codeId: string } | null> {
    const codeHash = createHash("sha256").update(code).digest("hex");
    const now = nowIso();

    const row = await this.db
      .selectFrom("phone_verification_codes")
      .select(["id", "phone", "attempts"])
      .where("user_id", "=", userId)
      .where("code_hash", "=", codeHash)
      .where("consumed_at", "is", null)
      .where(sql<SqlBool>`expires_at > ${now}`)
      .executeTakeFirst();

    if (!row) return null;

    await this.db
      .updateTable("phone_verification_codes")
      .set({ consumed_at: now })
      .where("id", "=", row.id)
      .execute();

    return { phone: row.phone, codeId: row.id };
  }

  async markPhoneVerified(userId: string, phone: string): Promise<void> {
    await this.db
      .updateTable("users")
      .set({ phone_verified: 1, phone })
      .where("id", "=", userId)
      .execute();
  }

  async updateProfileFields(userId: string, params: UpdateProfileParams): Promise<UserRow | undefined> {
    const updates: Record<string, unknown> = {};
    if ("bio" in params) updates.bio = params.bio ?? null;
    if ("website" in params) updates.website = params.website ?? null;
    if ("social_twitter" in params) updates.social_twitter = params.social_twitter ?? null;
    if ("social_instagram" in params) updates.social_instagram = params.social_instagram ?? null;
    if ("social_github" in params) updates.social_github = params.social_github ?? null;

    if (Object.keys(updates).length === 0) {
      return this.findById(userId);
    }

    return this.db
      .updateTable("users")
      .set(updates)
      .where("id", "=", userId)
      .returningAll()
      .executeTakeFirst() as Promise<UserRow | undefined>;
  }
}
