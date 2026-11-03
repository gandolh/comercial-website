-- Emptied on 2026-11-03: this migration used to insert demo accounts with a known password into
-- every database, production included. The rows now live in seed/dev/ and are created only by
-- `npm run seed:dev` (development only). The file stays so the migration name keeps its place;
-- databases that already ran it keep their rows.
SELECT 1;
