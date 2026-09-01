# Architecture

```
                     ┌────────────────────────────┐
                     │        Render (cloud)       │
                     │                              │
   Browser  ───────▶ │  FastAPI (Docker web service)│ ───▶ PostgreSQL
   (existing UI      │   - serves frontend/ static   │      (Render managed DB)
    served at "/")   │   - /api/* endpoints          │
                     │   - /health                   │
                     └────────────────────────────┘
```

## Why this shape

The existing `frontend/` is a complete, working, no-build vanilla JS SPA
(`index.html` + `app.js` + `data.js` + `styles.css`). Per the project brief,
that UI is the visual source of truth and must not be redesigned or rebuilt.

Rather than introduce a second framework or a separate frontend deploy, the
FastAPI backend mounts `frontend/` as static files at `/`, so the whole
application — UI and API — is **one Render web service, one public URL**
(Phase 17, Option A). The database is a separate managed Render PostgreSQL
instance, connected via `DATABASE_URL`.

## Data flow

1. `backend/app/services/generate_dataset.py` — deterministic, seeded
   synthetic-data generator (ports the logic already in `frontend/data.js`
   into Python) → writes `demo/demo_case.json`.
2. `backend/app/services/generate_seed_sql.py` — turns that JSON into
   `database/seed.sql`.
3. `backend/app/database.py` — on startup, creates tables from
   `database/schema.sql` and loads `database/seed.sql` if the tables are
   empty. Works against SQLite (local, zero-setup) or PostgreSQL
   (`DATABASE_URL` set) with the same schema/seed files.
4. `backend/app/main.py` — FastAPI routes read from the database and return
   JSON in the same shape `frontend/data.js` already produces client-side.

## Frontend/backend relationship (important)

**The shipped `frontend/` files are unmodified from the original prototype**
and continue to work completely standalone (generating their own demo data
client-side), exactly as before. `frontend/api-client.js` is an **optional,
not-wired-in-by-default** integration layer: adding one `<script>` tag to
`index.html` makes the UI fetch live data from `/api/demo/load` instead of
generating it client-side, with the same data shape either way. This keeps
the "existing UI is FINAL" requirement intact while still shipping a real,
independently-functional backend and database behind it.

## Graph engine

No Neo4j — the relationship graph is a small, well-indexed
`relationships(source_id, target_id, type, confidence)` table plus
`GET /api/graph`, which is sufficient for this entity count and avoids an
unnecessary second database (Phase 20 explicitly allows this fallback).

## Correlation Sweep

`scan_history` table + `POST /api/scans` records a demonstration
correlation sweep (counters, status). Counts are **deterministic** —
derived from row counts already in the database (e.g. `new_actors =
count(actors) // 12`), not `random.random()`, so the same seeded database
always reports the same numbers. No live scanning of real Tor services or
infrastructure is performed — see `docs/sih-coverage.md` and the Ethical
Operation section of the top-level README.
