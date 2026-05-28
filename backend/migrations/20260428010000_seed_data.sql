-- Seed data for demo purposes.
-- Password is '12345678' hashed with Argon2id.

INSERT OR IGNORE INTO users (id, email, password_hash, display_name, phone, phone_verified, email_verified)
VALUES
    ('00000000000000000000000000000001', 'demo@example.com', '$argon2id$v=19$m=19456,t=2,p=1$gZaUUCmO8PXoFiBzyvCJgA$aF1EoN1LsSwC9vSWFhAxdl6ylh8QNL3a61qIBxy5uA8', 'Andrei Popescu', '+40722111222', 1, 1),
    ('00000000000000000000000000000002', 'seller@example.com', '$argon2id$v=19$m=19456,t=2,p=1$gZaUUCmO8PXoFiBzyvCJgA$aF1EoN1LsSwC9vSWFhAxdl6ylh8QNL3a61qIBxy5uA8', 'Maria Ionescu', '+40733444555', 1, 1),
    ('00000000000000000000000000000003', 'jane.doe@example.com', '$argon2id$v=19$m=19456,t=2,p=1$gZaUUCmO8PXoFiBzyvCJgA$aF1EoN1LsSwC9vSWFhAxdl6ylh8QNL3a61qIBxy5uA8', 'Jane Doe', '+40755666777', 1, 1);

INSERT OR IGNORE INTO listings (id, user_id, title, description, price_ron, is_negotiable, category, city, expires_at)
VALUES
    ('10000000000000000000000000000001', '00000000000000000000000000000002', 'iPhone 15 Pro 256GB Titanium', 'Vând iPhone 15 Pro, stare impecabilă, garanție 1 an. Pachet complet.', 5400, 1, 'electronice', 'bucuresti', datetime('now', '+30 days')),
    ('10000000000000000000000000000002', '00000000000000000000000000000002', 'BMW Seria 3 2020 M-Sport', 'BMW 320d G20, pachet M de fabrică, 60.000km reali, revizii doar la reprezentanță.', 145000, 0, 'auto', 'cluj-napoca', datetime('now', '+30 days')),
    ('10000000000000000000000000000003', '00000000000000000000000000000001', 'Apartament 2 camere Ultracentral', 'Apartament spațios în zona Piața Victoriei, mobilat modern, proaspăt renovat.', 450000, 1, 'imobiliare', 'bucuresti', datetime('now', '+30 days')),
    ('10000000000000000000000000000004', '00000000000000000000000000000002', 'Canapea Extensibilă IKEA', 'Vând canapea IKEA 3 locuri, stare foarte bună, utilizată puțin.', 850, 0, 'casa-gradina', 'brasov', datetime('now', '+30 days')),
    ('10000000000000000000000000000005', '00000000000000000000000000000001', 'Geacă de piele Zara M', 'Vând geacă de piele naturală, mărimea M, purtată de câteva ori.', 250, 0, 'moda', 'iasi', datetime('now', '+30 days'));

INSERT OR IGNORE INTO listing_images (listing_id, s3_key, position)
VALUES
    ('10000000000000000000000000000001', 'iphone1.jpg', 0),
    ('10000000000000000000000000000001', 'iphone2.jpg', 1),
    ('10000000000000000000000000000002', 'bmw1.jpg', 0),
    ('10000000000000000000000000000003', 'apart1.jpg', 0),
    ('10000000000000000000000000000004', 'sofa1.jpg', 0),
    ('10000000000000000000000000000005', 'jacket1.jpg', 0);

INSERT OR IGNORE INTO favorites (user_id, listing_id)
VALUES
    ('00000000000000000000000000000001', '10000000000000000000000000000001'),
    ('00000000000000000000000000000001', '10000000000000000000000000000002');
