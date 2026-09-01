# DARKTRACE AI — Database

`schema.sql` — PostgreSQL DDL for all entities: `investigations`, `actors`,
`aliases`, `pgp_keys`, `wallets`, `marketplaces`, `forums`, `onion_services`,
`certificates`, `infrastructure`, `relationships`, `sources`, `evidence`,
`persona_profiles`, `persona_matches`, `timeline_events`, `reports`,
`analyst_notes`, `scan_history`.

`seed.sql` — synthetic/demonstration data generated from
`backend/app/services/generate_dataset.py` (deterministic, seeded RNG — same
data every regeneration). Includes the curated demo case `CASE-26151-07`
(actor `ShadowFox`) referenced throughout the frontend and docs.

No real individuals, credentials, wallets, or infrastructure are represented
anywhere in this data.

## Local setup (PostgreSQL)

```bash
createdb darktrace_ai
psql darktrace_ai -f schema.sql
psql darktrace_ai -f seed.sql
```

## Local setup (SQLite — default, zero setup)

Nothing to do — `backend/app/database.py` creates and seeds
`database/darktrace.db` automatically on first backend startup.

## Regenerating seed data

```bash
cd ../backend
python -m app.services.generate_dataset
python -m app.services.generate_seed_sql
```
