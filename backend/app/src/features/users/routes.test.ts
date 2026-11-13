import { describe, it, expect } from "vitest";
import { hashPassword } from "../../lib/tokens.js";
import { startTestApp } from "../../testing/test-app.js";

function multipart(filename: string, mime: string, content: string) {
  const boundary = "----piataro-test";
  const payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n${content}\r\n--${boundary}--\r\n`;
  return { payload, contentType: `multipart/form-data; boundary=${boundary}` };
}

describe("the password change's schema", () => {
  it("answers a malformed body 422 with the first issue's message, before it asks for a session", async () => {
    const t = await startTestApp();
    for (const headers of [{}, t.bearer("someone")]) {
      const res = await t.app.inject({
        method: "PATCH",
        url: "/users/me/password",
        headers,
        payload: { current_password: "anything", new_password: "short-pass" },
      });
      expect([res.statusCode, res.json()]).toEqual([
        422,
        { error: "Too small: expected string to have >=12 characters" },
      ]);
    }
    const signedOut = await t.app.inject({
      method: "PATCH",
      url: "/users/me/password",
      payload: { current_password: "long-enough", new_password: "long-enough-new" },
    });
    expect(signedOut.statusCode).toBe(401);
    await t.app.close();
  });
});

describe("the password change", () => {
  const oldPassword = "the-old-password";
  const newPassword = "the-new-password-1";

  async function withUser() {
    const t = await startTestApp();
    await t.ctx.db
      .insertInto("users")
      .values({ id: "u1", email: "u1@test.ro", password_hash: await hashPassword(oldPassword) })
      .execute();
    const change = (current_password: string, new_password: string) =>
      t.app.inject({
        method: "PATCH",
        url: "/users/me/password",
        headers: t.bearer("u1"),
        payload: { current_password, new_password },
      });
    const login = (password: string) =>
      t.app.inject({ method: "POST", url: "/auth/login", payload: { email: "u1@test.ro", password } });
    return { t, change, login };
  }

  it("answers 403 for a wrong current password and keeps the old one", async () => {
    const { t, change, login } = await withUser();
    const res = await change("not-the-password", newPassword);
    expect([res.statusCode, res.json()]).toEqual([403, { error: "current password is incorrect" }]);
    expect((await login(oldPassword)).statusCode).toBe(200);
    expect((await login(newPassword)).statusCode).toBe(401);
    await t.app.close();
  });

  it("answers 422 for a new password under 12 characters and changes nothing", async () => {
    const { t, change, login } = await withUser();
    const res = await change(oldPassword, "eleven-char");
    expect(res.statusCode).toBe(422);
    expect((await login(oldPassword)).statusCode).toBe(200);
    await t.app.close();
  });

  it("changes the password: the old one stops signing in and the new one signs in", async () => {
    const { t, change, login } = await withUser();
    const res = await change(oldPassword, newPassword);
    expect([res.statusCode, res.json()]).toEqual([200, {}]);
    expect((await login(oldPassword)).statusCode).toBe(401);
    expect((await login(newPassword)).statusCode).toBe(200);
    await t.app.close();
  });
});

describe("the avatar upload", () => {
  it("answers a public URL under /uploads/ that the app serves", async () => {
    const t = await startTestApp();
    await t.ctx.db.insertInto("users").values({ id: "u1", email: "u1@test.ro", password_hash: "x" }).execute();
    const { payload, contentType } = multipart("me.png", "image/png", "png-bytes");
    const res = await t.app.inject({
      method: "POST",
      url: "/users/me/avatar",
      headers: { ...t.bearer("u1"), "content-type": contentType },
      payload,
    });
    expect(res.statusCode).toBe(200);
    const { public_url, s3_key } = res.json();
    expect(public_url).toBe(`http://localhost:8080/uploads/${s3_key}`);
    expect(s3_key).toMatch(/^avatars\/u1\//);
    const file = await t.app.inject({ method: "GET", url: new URL(public_url).pathname });
    expect(file.statusCode).toBe(200);
    expect(file.body).toBe("png-bytes");
    await t.app.close();
  });
});
