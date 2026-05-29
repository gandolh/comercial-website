-- Seed data for demo purposes.
-- Password is '12345678' hashed with Argon2id.

INSERT OR IGNORE INTO users (id, email, password_hash, display_name, phone, phone_verified, email_verified)
VALUES
    ('00000000000000000000000000000001', 'demo@example.com', '$argon2id$v=19$m=19456,t=2,p=1$gZaUUCmO8PXoFiBzyvCJgA$aF1EoN1LsSwC9vSWFhAxdl6ylh8QNL3a61qIBxy5uA8', 'Andrei Popescu', '+40722111222', 1, 1),
    ('00000000000000000000000000000002', 'seller@example.com', '$argon2id$v=19$m=19456,t=2,p=1$gZaUUCmO8PXoFiBzyvCJgA$aF1EoN1LsSwC9vSWFhAxdl6ylh8QNL3a61qIBxy5uA8', 'Maria Ionescu', '+40733444555', 1, 1),
    ('00000000000000000000000000000003', 'jane.doe@example.com', '$argon2id$v=19$m=19456,t=2,p=1$gZaUUCmO8PXoFiBzyvCJgA$aF1EoN1LsSwC9vSWFhAxdl6ylh8QNL3a61qIBxy5uA8', 'Jane Doe', '+40755666777', 1, 1);

INSERT OR IGNORE INTO listings (id, user_id, title, description, price_ron, is_negotiable, category, city, expires_at)
VALUES
    ('10000000000000000000000000000001', '00000000000000000000000000000002', 'UI Kit Dashboar Pro — Figma', 'Kit complet de componente Figma pentru dashboard-uri moderne. Include 200+ componente, 20 de template-uri și documentație completă.', 149, 0, 'grafica', '', datetime('now', '+30 days')),
    ('10000000000000000000000000000002', '00000000000000000000000000000002', 'Pachet Fonturi Premium — 12 Familii', 'Colecție de 12 familii de fonturi cu licență comercială. Include serif, sans-serif și display fonts.', 89, 0, 'fonturi', '', datetime('now', '+30 days')),
    ('10000000000000000000000000000003', '00000000000000000000000000000001', 'Template CV Modern — Word & Google Docs', 'Template CV profesional, ușor de editat în Word și Google Docs. 3 variante de culori incluse.', 29, 0, 'sabloane', '', datetime('now', '+30 days')),
    ('10000000000000000000000000000004', '00000000000000000000000000000002', 'Cod Sursă — API REST Node.js cu autentificare JWT', 'Starter kit complet pentru un API REST în Node.js/TypeScript cu autentificare JWT, bază de date SQLite și documentație Swagger.', 199, 0, 'cod-sursa', '', datetime('now', '+30 days')),
    ('10000000000000000000000000000005', '00000000000000000000000000000001', 'Pack Muzică Ambient — 20 Track-uri Royalty Free', 'Colecție de 20 de track-uri muzicale ambient, royalty-free, ideale pentru videoclipuri și prezentări.', 59, 0, 'audio', '', datetime('now', '+30 days'));

INSERT OR IGNORE INTO listing_images (listing_id, s3_key, position)
VALUES
    ('10000000000000000000000000000001', 'uikit1.jpg', 0),
    ('10000000000000000000000000000001', 'uikit2.jpg', 1),
    ('10000000000000000000000000000002', 'fonts1.jpg', 0),
    ('10000000000000000000000000000003', 'cv1.jpg', 0),
    ('10000000000000000000000000000004', 'code1.jpg', 0),
    ('10000000000000000000000000000005', 'audio1.jpg', 0);

INSERT OR IGNORE INTO favorites (user_id, listing_id)
VALUES
    ('00000000000000000000000000000001', '10000000000000000000000000000001'),
    ('00000000000000000000000000000001', '10000000000000000000000000000002');
