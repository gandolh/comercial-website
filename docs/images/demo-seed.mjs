// Demo data for the README images. Run it against a SCRATCH database only:
//
//   DEMO_PASSWORD=... node docs/images/demo-seed.mjs <previews dir> [api]
//
// The migrations already create three demo accounts (demo@, seller@ and
// jane.doe@example.com) and five demo listings, but those listings point at
// cover images that are not in the repo. This script, run once on a fresh
// database:
//
//   - signs in as the three demo accounts; DEMO_PASSWORD is the password in the
//     comment at the top of backend/migrations/20260428010000_seed_data.sql
//   - swaps each seeded listing's missing cover for a generated preview
//   - adds four listings, each with a small but valid ZIP file and a preview
//   - buys one listing twice through the fake payment provider and reviews it
//
// <previews dir> holds the PNGs rendered from demo-previews.html (shots.md has
// the loop). [api] is http://localhost:8080 by default. Every title, name and
// picture is invented.
/* global process, console, fetch, FormData, Blob, Buffer */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { crc32 } from "node:zlib";

const [previews, api = "http://localhost:8080"] = process.argv.slice(2);
const password = process.env.DEMO_PASSWORD;
if (!previews || !password) {
  console.error("Usage: DEMO_PASSWORD=... node docs/images/demo-seed.mjs <previews dir> [api]");
  process.exit(1);
}

async function call(token, method, path, body) {
  const headers = { authorization: `Bearer ${token}` };
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const response = await fetch(`${api}${path}`, { method, headers, body: payload });
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${await response.text()}`);
  return response.json();
}

async function signIn(email) {
  const response = await fetch(`${api}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Sign-in as ${email} failed: ${response.status}`);
  return (await response.json()).token;
}

function file(bytes, type, name) {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type }), name);
  return form;
}

async function uploadPreview(token, listingId, name) {
  const png = await readFile(join(previews, `${name}.png`));
  await call(token, "POST", `/listings/${listingId}/images`, file(png, "image/png", `${name}.png`));
}

/** A ZIP with one stored text file of about `size` bytes, so downloads open and sizes look real. */
function zip(inner, size) {
  const line = Buffer.from("Fișier demonstrativ pentru capturile din README. Nu conține un produs real.\n");
  const data = Buffer.alloc(size);
  for (let at = 0; at < size; at += line.length) line.copy(data, at);
  const name = Buffer.from(inner);
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(0x21, 12); // 1980-01-01
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(size, 18);
  local.writeUInt32LE(size, 22);
  local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(0x21, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(size, 20);
  central.writeUInt32LE(size, 24);
  central.writeUInt16LE(name.length, 28);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + name.length, 12);
  end.writeUInt32LE(local.length + name.length + size, 16);
  return Buffer.concat([local, name, data, central, name, end]);
}

const seller = await signIn("seller@example.com");
const demo = await signIn("demo@example.com");
const jane = await signIn("jane.doe@example.com");

// The five seeded listings, by the ids the migrations give them.
const seeded = [
  ["10000000000000000000000000000001", seller, "icons"],
  ["10000000000000000000000000000002", seller, "dashboard"],
  ["10000000000000000000000000000003", demo, "ebook"],
  ["10000000000000000000000000000004", seller, "loops"],
  ["10000000000000000000000000000005", demo, "fonts"],
];
for (const [id, token, preview] of seeded) {
  const listing = await call(token, "GET", `/listings/${id}`);
  for (const image of listing.images) await call(token, "DELETE", `/listings/${id}/images/${image.id}`);
  await uploadPreview(token, id, preview);
}

const added = [
  [jane, "invite", "invitatii-nunta.zip", 2_400_000, { title: "Invitații digitale de nuntă — 6 modele editabile", description: "Șase modele de invitații pentru nuntă, editabile în orice program de prezentări. Text, culori și fonturi ușor de schimbat, export pentru telefon și pentru tipar.", price_ron: 45, category: "invitatii" }],
  [jane, "gdpr", "kit-gdpr.zip", 1_100_000, { title: "Kit GDPR pentru magazine online", description: "Politică de confidențialitate, politică de cookie-uri, formular de retragere și registru de prelucrări, redactate în română și ușor de adaptat la un magazin mic.", price_ron: 99, category: "documente" }],
  [jane, "social", "postari-cafenea.zip", 6_300_000, { title: "30 de șabloane de postări pentru cafenele", description: "Treizeci de șabloane pătrate și verticale pentru rețele sociale: oferte, program, produse noi și rețete. Fișiere editabile, cu instrucțiuni în română.", price_ron: 39, category: "sabloane" }],
  [demo, "code", "starter-api.zip", 850_000, { title: "Starter API REST în Node.js cu autentificare JWT", description: "Proiect de pornire pentru un API REST în Node.js și TypeScript: autentificare JWT, bază de date SQLite, teste și documentație. Gata de extins.", price_ron: 79, category: "cod-sursa" }],
];
for (const [token, preview, filename, size, fields] of added) {
  const listing = await call(token, "POST", "/listings", { ...fields, active: false });
  await call(token, "POST", `/listings/${listing.id}/assets`, file(zip("CITESTE.txt", size), "application/zip", filename));
  await uploadPreview(token, listing.id, preview);
  await call(token, "POST", `/listings/${listing.id}/publish`);
}

// Two buyers pay for the icon pack through the fake provider, then review it.
const icons = "10000000000000000000000000000001";
for (const [token, rating, body] of [
  [jane, 5, "Exact ce aveam nevoie pentru un site de prezentare. Iconițele arată bine și la dimensiuni mici."],
  [demo, 4, "Set bogat și consecvent. Aș fi vrut și câteva variante pline, dar merită prețul."],
]) {
  const order = await call(token, "POST", "/orders", { listing_id: icons });
  await call(token, "POST", `/orders/${order.order?.id ?? order.id}/mark-paid`);
  await call(token, "POST", `/listings/${icons}/reviews`, { rating, body });
}

console.log(`Gave ${seeded.length} seeded listings a preview, added ${added.length} listings and 2 reviews.`);
