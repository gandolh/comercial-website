/**
 * "Sign in with Ward" beside the app's own login (corpus decisions.md → *Two ways in*).
 *
 * Ward's verified ID token names a stable subject and no email, so a Ward sign-in finds its user by
 * `users.ward_subject` only, never by name or email (the vendored library's rule: anything else is
 * account takeover on a shared origin). The owner links it once from Settings while signed in with
 * their password; an unlinked Ward account is refused, and nothing here creates accounts.
 *
 * Routes, under the API prefix (Caddy strips `/piataro-api`):
 * - GET  /auth/ward/status          { enabled }
 * - POST /auth/ward/link-ticket     (signed in) { ticket }: single use, two minutes, for the link start
 * - GET  /auth/ward/start[?link=T]  sets the flow cookie and redirects to Ward
 * - GET  /auth/ward/callback        finishes; a sign-in lands on the app's /autentificare/ward with the
 *                                   token in the URL fragment, a link on /cont/setari
 *
 * The flows and tickets live in memory: the API is one process, and a restart only makes an
 * in-flight sign-in start again.
 */
import { randomBytes } from "node:crypto";
import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import { AppError, signToken } from "@my-olx/core";
import type { AppContext } from "../../context.js";
import type { WardClient } from "../../../vendor/ward/ward-auth.js";
import { requireUserId } from "@my-olx/core";

type Flow = Awaited<ReturnType<WardClient["startAuthorization"]>>["flow"];

const FLOW_COOKIE = "piataro_ward_flow";
const FLOW_TTL_MS = 10 * 60_000;
const TICKET_TTL_MS = 2 * 60_000;

function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/** The context, and the Ward client app.ts chose (undefined: local login only). */
export type WardRoutesOptions = AppContext & { ward: WardClient | undefined };

// GET /auth/ward/start: `link` is a string, or a list when repeated (which no ticket matches).
const startQuerySchema = z.object({ link: z.union([z.string(), z.array(z.string())]).optional() });
// GET /auth/ward/callback takes whatever Ward sends (code, state, error, …): the handler hands the
// raw query string to the client, so the schema reads nothing and refuses nothing.
const callbackQuerySchema = z.looseObject({});

const statusSchema = z.object({
  enabled: z.boolean(),
});
const linkTicketSchema = z.object({
  ticket: z.string(),
});

export const wardRoutes: FastifyPluginAsyncZod<WardRoutesOptions> = async (app, options) => {
  const { ward: client, ...ctx } = options;
  const flows = new Map<string, { flow: Flow; userId?: string; expires: number }>();
  const tickets = new Map<string, { userId: string; expires: number }>();
  const appUrl = (pathAndQuery: string) => `${ctx.config.frontendBaseUrl.replace(/\/$/, "")}${pathAndQuery}`;
  const secure = client?.redirectUri.startsWith("https:") ?? false;
  const sweep = (now: number) => {
    for (const [k, v] of flows) if (v.expires < now) flows.delete(k);
    for (const [k, v] of tickets) if (v.expires < now) tickets.delete(k);
  };

  app.get("/auth/ward/status", { schema: { response: { 200: statusSchema } } }, async () => ({
    enabled: client !== undefined,
  }));

  app.post(
    "/auth/ward/link-ticket",
    { preHandler: app.authenticate, schema: { response: { 200: linkTicketSchema } } },
    async (request) => {
      if (!client) throw AppError.notFound();
      const ticket = randomBytes(24).toString("base64url");
      tickets.set(ticket, { userId: requireUserId(request), expires: Date.now() + TICKET_TTL_MS });
      return { ticket };
    },
  );

  // Redirects: their inputs only, no response schema.
  app.get("/auth/ward/start", { schema: { querystring: startQuerySchema } }, async (request, reply) => {
    if (!client) throw AppError.notFound();
    const now = Date.now();
    sweep(now);
    const { link } = request.query;
    let userId: string | undefined;
    if (link !== undefined) {
      const t = typeof link === "string" ? tickets.get(link) : undefined;
      if (typeof link === "string") tickets.delete(link);
      if (!t || t.expires < now) return reply.redirect(appUrl("/cont/setari?ward_error=expired_link"));
      userId = t.userId;
    }
    const { url, flow } = await client.startAuthorization();
    const flowId = randomBytes(24).toString("base64url");
    flows.set(flowId, { flow, ...(userId !== undefined ? { userId } : {}), expires: now + FLOW_TTL_MS });
    reply.header(
      "set-cookie",
      `${FLOW_COOKIE}=${flowId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${FLOW_TTL_MS / 1000}${secure ? "; Secure" : ""}`,
    );
    return reply.redirect(url);
  });

  app.get("/auth/ward/callback", { schema: { querystring: callbackQuerySchema } }, async (request, reply) => {
    if (!client) throw AppError.notFound();
    const flowId = readCookie(request.headers.cookie, FLOW_COOKIE);
    const entry = flowId ? flows.get(flowId) : undefined;
    if (flowId) flows.delete(flowId);
    reply.header("set-cookie", `${FLOW_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
    const linking = entry?.userId !== undefined;
    const fail = (code: string) =>
      reply.redirect(appUrl(`${linking ? "/cont/setari" : "/autentificare"}?ward_error=${encodeURIComponent(code)}`));
    if (!entry || entry.expires < Date.now()) return fail("expired");

    let subject: string;
    try {
      const search = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
      subject = (await client.finishAuthorization(search, entry.flow)).subject;
    } catch (err) {
      return fail((err as { code?: string }).code ?? "ward_unavailable");
    }

    const owner = await ctx.db
      .selectFrom("users")
      .select(["id"])
      .where("ward_subject", "=", subject)
      .executeTakeFirst();
    if (entry.userId !== undefined) {
      if (owner && owner.id !== entry.userId) return fail("already_linked");
      await ctx.db.updateTable("users").set({ ward_subject: subject }).where("id", "=", entry.userId).execute();
      return reply.redirect(appUrl("/cont/setari?ward=linked"));
    }
    if (!owner) return fail("not_linked");
    const token = signToken(owner.id, ctx.config.jwtSecret, ctx.config.jwtExpirySeconds);
    return reply.redirect(appUrl(`/autentificare/ward#token=${encodeURIComponent(token)}`));
  });
};
