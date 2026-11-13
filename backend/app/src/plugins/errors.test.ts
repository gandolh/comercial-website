import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import { AppError, fixedValidationMessage } from "../lib/api-error.js";
import { errors } from "./errors.js";

const routes: FastifyPluginAsyncZod = async (app) => {
  app.get("/app-error", async () => {
    throw AppError.conflict("already taken");
  });
  app.get("/bug", async () => {
    throw new Error("secret detail: SELECT * FROM users");
  });
  app.get("/zod", async () => z.object({ a: z.string() }).parse({}));
  app.post("/body", { schema: { body: z.object({ title: z.string().min(5, "title is short") }) } }, async () => ({}));
  app.post(
    "/fixed",
    {
      schema: { body: z.object({ title: z.string() }) },
      schemaErrorFormatter: fixedValidationMessage("Invalid request body"),
    },
    async () => ({}),
  );
  app.get("/reply", { schema: { response: { 200: z.object({ n: z.number() }) } } }, async () => {
    return { n: "not a number" } as unknown as { n: number };
  });
};

async function errorApp() {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(errors);
  await app.register(routes);
  await app.ready();
  return app;
}

describe("the error plugin", () => {
  it("answers an AppError with its status and message", async () => {
    const app = await errorApp();
    const res = await app.inject({ method: "GET", url: "/app-error" });
    expect([res.statusCode, res.json()]).toEqual([409, { error: "already taken" }]);
    await app.close();
  });

  it("answers a schema failure 422 with the first issue's message, or the route's fixed one", async () => {
    const app = await errorApp();
    const short = await app.inject({ method: "POST", url: "/body", payload: { title: "abc" } });
    expect([short.statusCode, short.json()]).toEqual([422, { error: "title is short" }]);
    const fixed = await app.inject({ method: "POST", url: "/fixed", payload: { title: 5 } });
    expect([fixed.statusCode, fixed.json()]).toEqual([422, { error: "Invalid request body" }]);
    const zod = await app.inject({ method: "GET", url: "/zod" });
    expect([zod.statusCode, zod.json()]).toEqual([
      422,
      { error: "Invalid input: expected string, received undefined" },
    ]);
    await app.close();
  });

  it("keeps Fastify's own 4xx: bad JSON is a 400, not a 500", async () => {
    const app = await errorApp();
    const res = await app.inject({
      method: "POST",
      url: "/body",
      headers: { "content-type": "application/json" },
      payload: "{{{",
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: "Body is not valid JSON but content-type is set to 'application/json'" });
    const media = await app.inject({
      method: "POST",
      url: "/body",
      headers: { "content-type": "application/xml" },
      payload: "<a/>",
    });
    expect(media.statusCode).toBe(415);
    await app.close();
  });

  it("answers a thrown error and a reply that fails its schema 500 with no detail", async () => {
    const app = await errorApp();
    for (const url of ["/bug", "/reply"]) {
      const res = await app.inject({ method: "GET", url });
      expect([res.statusCode, res.json()]).toEqual([500, { error: "internal error" }]);
      expect(res.body).not.toContain("secret");
    }
    await app.close();
  });

  it("answers an unknown route 404 in the same body", async () => {
    const app = await errorApp();
    const res = await app.inject({ method: "GET", url: "/nothing" });
    expect([res.statusCode, res.json()]).toEqual([404, { error: "not found" }]);
    await app.close();
  });
});
