/**
 * `npm run seed:samples`: the public demo's sample listings (corpus decisions.md → *Sample listings
 * never expire*). Three seller profiles that cannot sign in (no usable password, no Ward link), nine
 * listings with a preview image and a small ZIP each, and two reviews behind paid (simulated) orders.
 *
 * Samples carry `is_sample = 1` and an expiry date at the end of time, so the 30-day rule and the
 * reminder job never reach them. Everything has a fixed id and is inserted with INSERT OR IGNORE, and a
 * file is written only when missing: a rerun changes nothing. Runs in production; brief 09's deploy
 * calls it once after the first start.
 */
import Database from "better-sqlite3";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crc32 } from "node:zlib";
import { runMigrations } from "@my-olx/core";
import { splitOrderAmount } from "./payout-fee.js";

const here = path.dirname(fileURLToPath(import.meta.url));
/** backend/seed/samples/previews, from app/src (tsx) and app/dist (a build) alike. */
export const PREVIEWS_DIR = path.resolve(here, "../../seed/samples/previews");

/** Never: the samples stay listed. */
export const SAMPLE_EXPIRES_AT = "9999-12-31T23:59:59.000Z";

/** Not an Argon2 hash, so no password ever matches it: sample sellers cannot sign in. */
const NO_PASSWORD = "!sample-seller-no-sign-in";

const SELLERS = [
  { id: "sample-seller-studio", email: "studio@sample.piataro.invalid", name: "Studio Carpatic" },
  { id: "sample-seller-ioana", email: "ioana@sample.piataro.invalid", name: "Ioana Dumitrescu" },
  { id: "sample-seller-andrei", email: "andrei@sample.piataro.invalid", name: "Andrei Popescu" },
] as const;

interface Sample {
  id: string;
  seller: (typeof SELLERS)[number]["id"];
  preview: string;
  file: string;
  title: string;
  description: string;
  category: string;
  price: number;
  license: "personal" | "commercial" | "extended";
}

const SAMPLES: readonly Sample[] = [
  { id: "sample-icons", seller: "sample-seller-studio", preview: "icons", file: "iconite-svg.zip", title: "Pachet 500 Iconițe SVG", description: "Colecție de 500 de pictograme vectoriale SVG, optimizate pentru web și aplicații. Format editabil, scalabil fără pierderi.", category: "grafica", price: 49, license: "commercial" },
  { id: "sample-dashboard", seller: "sample-seller-studio", preview: "dashboard", file: "dashboard-react.zip", title: "Șablon Dashboard React + Tailwind", description: "Temă completă de panou de administrare în React 19 și Tailwind CSS v4. Cod sursă inclus, componente reutilizabile.", category: "sabloane", price: 129, license: "extended" },
  { id: "sample-loops", seller: "sample-seller-studio", preview: "loops", file: "loopuri-lofi.zip", title: "Pachet 30 Loop-uri Audio Lo-Fi", description: "Treizeci de bucle audio lo-fi fără drepturi de autor, format WAV de înaltă calitate. Perfecte pentru video și podcasturi.", category: "audio", price: 59, license: "commercial" },
  { id: "sample-invite", seller: "sample-seller-ioana", preview: "invite", file: "invitatii-nunta.zip", title: "Invitații digitale de nuntă — 6 modele editabile", description: "Șase modele de invitații pentru nuntă, editabile în orice program de prezentări. Text, culori și fonturi ușor de schimbat, export pentru telefon și pentru tipar.", category: "invitatii", price: 45, license: "personal" },
  { id: "sample-gdpr", seller: "sample-seller-ioana", preview: "gdpr", file: "kit-gdpr.zip", title: "Kit GDPR pentru magazine online", description: "Politică de confidențialitate, politică de cookie-uri, formular de retragere și registru de prelucrări, redactate în română și ușor de adaptat la un magazin mic.", category: "documente", price: 99, license: "commercial" },
  { id: "sample-social", seller: "sample-seller-ioana", preview: "social", file: "postari-cafenea.zip", title: "30 de șabloane de postări pentru cafenele", description: "Treizeci de șabloane pătrate și verticale pentru rețele sociale: oferte, program, produse noi și rețete. Fișiere editabile, cu instrucțiuni în română.", category: "sabloane", price: 39, license: "commercial" },
  { id: "sample-ebook", seller: "sample-seller-andrei", preview: "ebook", file: "ghid-marketing.zip", title: "Ebook: Ghid Complet de Marketing Digital", description: "Ghid de 220 de pagini despre marketing digital, SEO și social media, cu exemple practice în limba română.", category: "ebook", price: 35, license: "personal" },
  { id: "sample-fonts", seller: "sample-seller-andrei", preview: "fonts", file: "fonturi-display.zip", title: "Set 12 Fonturi Display", description: "Doisprezece fonturi display moderne în format OTF și TTF, ideale pentru titluri și branding. Licență comercială inclusă.", category: "fonturi", price: 59, license: "commercial" },
  { id: "sample-code", seller: "sample-seller-andrei", preview: "code", file: "starter-api.zip", title: "Starter API REST în Node.js cu autentificare JWT", description: "Proiect de pornire pentru un API REST în Node.js și TypeScript: autentificare JWT, bază de date SQLite, teste și documentație. Gata de extins.", category: "cod-sursa", price: 79, license: "commercial" },
];

/** Two sample sellers buy the icon pack (simulated) and review it. */
const REVIEWS = [
  { buyer: "sample-seller-ioana", rating: 5, body: "Exact ce aveam nevoie pentru un site de prezentare. Iconițele arată bine și la dimensiuni mici." },
  { buyer: "sample-seller-andrei", rating: 4, body: "Set bogat și consecvent. Aș fi vrut și câteva variante pline, dar merită prețul." },
] as const;

/** A ZIP holding one stored text file that says it is a demo file (about 64 KB). */
export function sampleZip(title: string): Buffer {
  const line = Buffer.from(`Fișier demonstrativ PiațăRo pentru „${title}”. Nu conține un produs real.\n`);
  const data = Buffer.alloc(64 * 1024);
  for (let at = 0; at < data.length; at += line.length) line.copy(data, at);
  const name = Buffer.from("CITESTE.txt");
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(0x21, 12); // 1980-01-01
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(0x21, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + name.length, 12);
  end.writeUInt32LE(local.length + name.length + data.length, 16);
  return Buffer.concat([local, name, data, central, name, end]);
}

async function writeIfMissing(file: string, data: Buffer): Promise<void> {
  if (existsSync(file)) return;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

/** Seed the samples into an already migrated database; returns how many listings it added. */
export async function seedSamples(
  db: Database.Database,
  dirs: { uploadsDir: string; assetsDir: string; previewsDir?: string },
): Promise<number> {
  const previewsDir = dirs.previewsDir ?? PREVIEWS_DIR;
  const files: { file: string; data: Buffer }[] = [];
  const added = db.transaction(() => {
    const user = db.prepare(
      "INSERT OR IGNORE INTO users (id, email, password_hash, display_name, email_verified, email_notifications) VALUES (?, ?, ?, ?, 1, 0)",
    );
    for (const s of SELLERS) user.run(s.id, s.email, NO_PASSWORD, s.name);

    const listing = db.prepare(`INSERT OR IGNORE INTO listings
      (id, user_id, title, description, price_ron, category, expires_at, active, is_sample, file_format, file_size_bytes, license_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 'zip', ?, ?)`);
    const image = db.prepare("INSERT OR IGNORE INTO listing_images (id, listing_id, s3_key, position) VALUES (?, ?, ?, 0)");
    const asset = db.prepare(`INSERT OR IGNORE INTO listing_assets
      (id, listing_id, s3_key, original_filename, file_size_bytes, content_type, position) VALUES (?, ?, ?, ?, ?, 'application/zip', 0)`);
    let count = 0;
    for (const s of SAMPLES) {
      const zip = sampleZip(s.title);
      const imageKey = `samples/${s.preview}.png`;
      const assetKey = `samples/${s.id}/${s.file}`;
      count += listing.run(s.id, s.seller, s.title, s.description, s.price, s.category, SAMPLE_EXPIRES_AT, zip.length, s.license).changes;
      image.run(`${s.id}-image`, s.id, imageKey);
      asset.run(`${s.id}-asset`, s.id, assetKey, s.file, zip.length);
      files.push({ file: path.join(dirs.uploadsDir, imageKey), data: readFileSync(path.join(previewsDir, `${s.preview}.png`)) });
      files.push({ file: path.join(dirs.assetsDir, assetKey), data: zip });
    }

    const icons = SAMPLES[0]!;
    const { feeRon, netRon } = splitOrderAmount(icons.price);
    const order = db.prepare(`INSERT OR IGNORE INTO orders
      (id, buyer_user_id, listing_id, seller_user_id, amount_ron, status, provider, provider_ref, paid_at, platform_fee_ron, seller_net_ron)
      VALUES (?, ?, ?, ?, ?, 'paid', 'fake', 'sample', datetime('now'), ?, ?)`);
    const review = db.prepare("INSERT OR IGNORE INTO reviews (id, listing_id, buyer_user_id, rating, body) VALUES (?, ?, ?, ?, ?)");
    for (const r of REVIEWS) {
      order.run(`sample-order-${r.buyer}`, r.buyer, icons.id, icons.seller, icons.price, feeRon, netRon);
      review.run(`sample-review-${r.buyer}`, icons.id, r.buyer, r.rating, r.body);
    }
    return count;
  })();
  for (const f of files) await writeIfMissing(f.file, f.data);
  return added;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const envFile = path.resolve(here, "../../.env");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const databasePath = process.env.DATABASE_PATH ?? path.resolve("data/my-olx.db");
  const uploadsDir = process.env.UPLOADS_DIR ?? path.resolve("data/uploads");
  const assetsDir = process.env.ASSETS_DIR ?? path.resolve("data/assets");
  await mkdir(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  runMigrations(db, path.resolve(here, "../../migrations"));
  const added = await seedSamples(db, { uploadsDir, assetsDir });
  db.close();
  console.log(`seed:samples: ${added} sample listing(s) added (${SAMPLES.length} in the set)`);
}
