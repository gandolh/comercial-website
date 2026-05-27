-- Re-theme the seed listings as digital assets and attach downloadable files.
-- Digital categories: software, grafica, sabloane, audio, video, ebook, fonturi, cod-sursa, diverse.

UPDATE listings SET
    title = 'Pachet 500 Iconițe SVG',
    description = 'Colecție de 500 de pictograme vectoriale SVG, optimizate pentru web și aplicații. Format editabil, scalabil fără pierderi.',
    category = 'grafica', file_format = 'zip', file_size_bytes = 14680064,
    license_type = 'commercial', price_ron = 49, is_negotiable = FALSE
WHERE id = '10000000-0000-0000-0000-000000000001';

UPDATE listings SET
    title = 'Șablon Dashboard React + Tailwind',
    description = 'Temă completă de panou de administrare în React 19 și Tailwind CSS v4. Cod sursă inclus, componente reutilizabile.',
    category = 'sabloane', file_format = 'zip', file_size_bytes = 5242880,
    license_type = 'extended', price_ron = 129, is_negotiable = FALSE
WHERE id = '10000000-0000-0000-0000-000000000002';

UPDATE listings SET
    title = 'Ebook: Ghid Complet de Marketing Digital',
    description = 'Ghid PDF de 220 de pagini despre marketing digital, SEO și social media, cu exemple practice în limba română.',
    category = 'ebook', file_format = 'pdf', file_size_bytes = 8388608,
    license_type = 'personal', price_ron = 35, is_negotiable = FALSE
WHERE id = '10000000-0000-0000-0000-000000000003';

UPDATE listings SET
    title = 'Pachet 30 Loop-uri Audio Lo-Fi',
    description = 'Treizeci de bucle audio lo-fi fără drepturi de autor, format WAV de înaltă calitate. Perfecte pentru video și podcasturi.',
    category = 'audio', file_format = 'zip', file_size_bytes = 104857600,
    license_type = 'commercial', price_ron = 0, is_negotiable = FALSE
WHERE id = '10000000-0000-0000-0000-000000000004';

UPDATE listings SET
    title = 'Set 12 Fonturi Display',
    description = 'Doisprezece fonturi display moderne în format OTF și TTF, ideale pentru titluri și branding. Licență comercială inclusă.',
    category = 'fonturi', file_format = 'zip', file_size_bytes = 3145728,
    license_type = 'commercial', price_ron = 59, is_negotiable = FALSE
WHERE id = '10000000-0000-0000-0000-000000000005';

-- Attach a primary downloadable asset to each seeded listing.
INSERT INTO listing_assets (listing_id, s3_key, original_filename, file_size_bytes, content_type, position)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'listings/10000000-0000-0000-0000-000000000001/assets/icons.zip', 'icons-pack.zip', 14680064, 'application/zip', 0),
    ('10000000-0000-0000-0000-000000000002', 'listings/10000000-0000-0000-0000-000000000002/assets/dashboard.zip', 'react-dashboard.zip', 5242880, 'application/zip', 0),
    ('10000000-0000-0000-0000-000000000003', 'listings/10000000-0000-0000-0000-000000000003/assets/ghid.pdf', 'ghid-marketing.pdf', 8388608, 'application/pdf', 0),
    ('10000000-0000-0000-0000-000000000004', 'listings/10000000-0000-0000-0000-000000000004/assets/loops.zip', 'lofi-loops.zip', 104857600, 'application/zip', 0),
    ('10000000-0000-0000-0000-000000000005', 'listings/10000000-0000-0000-0000-000000000005/assets/fonts.zip', 'display-fonts.zip', 3145728, 'application/zip', 0)
ON CONFLICT (listing_id, position) DO NOTHING;
