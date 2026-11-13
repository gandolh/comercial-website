import { describe, it, expect } from "vitest";
import { signToken } from "../lib/tokens.js";
import { authenticationPreHandler } from "./auth.js";

describe("authenticationPreHandler behind the error handler", () => {
  async function appWithGuard() {
    const { default: Fastify } = await import("fastify");
    const { errors } = await import("./errors.js");
    const app = Fastify();
    await app.register(errors);
    app.get(
      "/secret",
      { preHandler: (req, reply) => authenticationPreHandler(req, reply, "test-secret") },
      async () => ({ ok: true }),
    );
    await app.ready();
    return app;
  }

  it("answers 401, not 500, with no token or a bad one", async () => {
    const app = await appWithGuard();
    for (const headers of [{}, { authorization: "Bearer not-a-token" }, { authorization: "Basic abc" }]) {
      const res = await app.inject({ method: "GET", url: "/secret", headers });
      expect(res.statusCode).toBe(401);
    }
    await app.close();
  });

  it("lets a valid token through", async () => {
    const app = await appWithGuard();
    const res = await app.inject({
      method: "GET",
      url: "/secret",
      headers: { authorization: `Bearer ${signToken("user-1", "test-secret", 3600)}` },
    });
    expect(res.statusCode).toBe(200);
    await app.close();
  });
});
