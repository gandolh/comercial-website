import { randomBytes } from "node:crypto";
import { createHash } from "node:crypto";
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
  phone_verified: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
};

export class UsersAuthRepository {
  constructor(private db: Db) {}

  async findByEmail(email: string): Promise<UserRow | undefined> {
    const user = await this.db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst();
    return user as UserRow | undefined;
  }

  async findById(id: string): Promise<UserRow | undefined> {
    const user = await this.db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
    return user as UserRow | undefined;
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
        phone_verified: false,
        email_verified: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      phone_verified: user.phone_verified,
      email_verified: user.email_verified,
      created_at: user.created_at instanceof Date ? user.created_at : new Date(String(user.created_at)),
      updated_at: user.updated_at instanceof Date ? user.updated_at : new Date(String(user.updated_at)),
    };
  }

  async createEmailVerificationToken(
    userId: string,
    expiresAtMs: number
  ): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(expiresAtMs);

    await this.db
      .insertInto("email_verification_tokens")
      .values({
        token,
        user_id: userId,
        expires_at: expiresAt,
        used_at: null,
      })
      .execute();

    return token;
  }

  async consumeEmailVerificationToken(token: string): Promise<string | null> {
    const row = await this.db
      .selectFrom("email_verification_tokens")
      .select("user_id")
      .where("token", "=", token)
      .where("used_at", "is", null)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();

    if (!row) return null;

    await this.db
      .updateTable("email_verification_tokens")
      .set({ used_at: new Date() })
      .where("token", "=", token)
      .execute();

    return row.user_id;
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.db
      .updateTable("users")
      .set({ email_verified: true })
      .where("id", "=", userId)
      .execute();
  }

  async createPasswordResetToken(
    userId: string,
    expiresAtMs: number
  ): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(expiresAtMs);

    await this.db
      .insertInto("password_reset_tokens")
      .values({
        token,
        user_id: userId,
        expires_at: expiresAt,
        used_at: null,
      })
      .execute();

    return token;
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    const row = await this.db
      .selectFrom("password_reset_tokens")
      .select("user_id")
      .where("token", "=", token)
      .where("used_at", "is", null)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();

    if (!row) return null;

    await this.db
      .updateTable("password_reset_tokens")
      .set({ used_at: new Date() })
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

  async storePhoneVerificationCode(
    userId: string,
    phone: string,
    expiresAtMs: number
  ): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(expiresAtMs);

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

  async verifyPhoneCode(
    userId: string,
    code: string
  ): Promise<{ phone: string; codeId: string } | null> {
    const codeHash = createHash("sha256").update(code).digest("hex");

    const row = await this.db
      .selectFrom("phone_verification_codes")
      .select(["id", "phone", "attempts"])
      .where("user_id", "=", userId)
      .where("code_hash", "=", codeHash)
      .where("consumed_at", "is", null)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();

    if (!row) return null;

    // Mark as consumed
    await this.db
      .updateTable("phone_verification_codes")
      .set({ consumed_at: new Date() })
      .where("id", "=", row.id)
      .execute();

    return { phone: row.phone, codeId: row.id };
  }

  async markPhoneVerified(userId: string, phone: string): Promise<void> {
    await this.db
      .updateTable("users")
      .set({ phone_verified: true, phone })
      .where("id", "=", userId)
      .execute();
  }
}
