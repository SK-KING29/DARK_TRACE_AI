# DARKTRACE AI — Project Map

A plain-language guide to what every file does, and where to make common
changes. Written for a beginner developer debugging or extending this
project.

```
DARKTRACE_AI_SIH26151/
│
├── PROJECT_MAP.md          → you are here
├── CHANGELOG.md            → what changed, and why
├── README.md               → overview, install, deploy
│
├── frontend/
│   ├── index.html
│   │   → Page shell. Loads ONE script: api-client.js.
│   │     Set window.DARKTRACE_API_BASE here for split deployments
│   │     (frontend on Netlify, backend on Render).
│   │
│   ├── api-client.js
│   │   → Boots the app. Fetches the live case from the backend
│   │     (GET /api/demo/load), then loads data.js and app.js in
│   │     order. Also exposes window.DarktraceAPI — the functions
│   │     app.js calls to save analyst notes and run correlation
│   │     sweeps against the real backend.
│   │
│   ├── data.js
│   │   → Builds the global DATA object the whole UI reads from.
│   │     Uses the real backend response if api-client.js got one;
│   │     otherwise falls back to a LOCAL, SEEDED (deterministic)
│   │     generator so the UI still works with no backend running.
│   │
│   ├── app.js
│   │   → Everything else: routing (hash-based SPA), all page
│   │     renderers (Case Nexus, Actor Dossier, Evidence Vault,
│   │     Relationship Graph, Timeline, Persona, Attribution,
│   │     Correlation Sweep, Reports), and UI event handlers.
│   │
│   └── styles.css
│       → All visual styling — dark SOC/cyberintel theme.
│
├── backend/
│   ├── requirements.txt    → Python dependencies (fastapi, uvicorn, psycopg2)
│   └── app/
│       ├── main.py
│       │   → The FastAPI application. ALL API routes currently live
│       │     in this one file (kept simple/flat on purpose — see
│       │     "why one file" below). Routes: /health, /api/actors,
│       │     /api/aliases, /api/pgp, /api/wallets, /api/infrastructure,
│       │     /api/onion-services, /api/relationships, /api/graph,
│       │     /api/persona, /api/timeline, /api/evidence, /api/sources,
│       │     /api/investigations, /api/notes, /api/scans,
│       │     /api/reports, /api/demo/load.
│       │
│       ├── database.py
│       │   → Opens a connection (SQLite locally by default, or
│       │     Postgres if DATABASE_URL is set). Runs database/schema.sql
│       │     and database/seed.sql on startup if the DB is empty.
│       │
│       ├── graph/, intelligence/, blockchain/, persona/, reports/,
│       │   services/
│       │   → Currently mostly placeholder packages (__init__.py) plus
│       │     services/generate_dataset.py and generate_seed_sql.py,
│       │     which is how database/seed.sql and demo/demo_case.json
│       │     were originally produced. Not required at runtime.
│       │
├── database/
│   ├── schema.sql          → Table definitions (actors, aliases, pgp_keys,
│   │                          wallets, infrastructure, relationships,
│   │                          evidence, timeline_events, attribution_factors,
│   │                          attribution_matrix, analyst_notes,
│   │                          scan_history, reports, investigations, ...).
│   │                          `investigations.is_demo_case`,
│   │                          `actors.is_demo_primary`, and
│   │                          `timeline_events.is_demo_highlight` mark
│   │                          which rows GET /api/demo/load serves.
│   └── seed.sql             → The full synthetic dataset, as INSERT statements —
│                               the RUNTIME SOURCE OF TRUTH for /api/demo/load
│                               and every other /api/* endpoint.
│
├── demo/
│   └── demo_case.json      → OFFLINE REFERENCE ONLY. The dataset
│                              `database/seed.sql` was authored to match.
│                              Also used by `frontend/data.js` as its
│                              OFFLINE DEMO FALLBACK when the backend is
│                              unreachable. GET /api/demo/load does NOT read
│                              this file — it queries the database.
│
├── tests/
│   └── test_api.py         → Backend API tests (FastAPI TestClient, entered
│                              as a context manager so lifespan/init_db runs).
│
├── docs/                   → Longer-form docs: architecture, api, deployment,
│                              sih-coverage, JUDGE-DEMO walkthrough.
│
├── Dockerfile, docker-compose.yml, render.yaml
│   → Container + deployment configuration.
│
└── .env.example            → Copy to .env; DATABASE_URL, CORS_ORIGINS, etc.
```

## Where to edit things

- **UI look/feel** → `frontend/styles.css`
- **UI structure/behaviour, navigation, any page** → `frontend/app.js`
- **What data the UI shows in demo/offline mode** → `frontend/data.js` (the
  `else` branch — the `if (PRELOADED)` branch just passes backend data
  through untouched)
- **API endpoints, request/response shape** → `backend/app/main.py`
- **Database tables/columns** → `database/schema.sql`, then update
  `backend/app/main.py` queries and `frontend/app.js`/`data.js` field usage
  to match
- **The curated demo case content (ShadowFox, CASE-26151-07)** →
  `database/seed.sql` is the runtime source of truth; update
  `demo/demo_case.json` and the `else` branch's "CURATED DEMO CASE" section
  in `frontend/data.js` (offline fallback) to match by hand, since
  `generate_seed_sql.py` has not been updated to regenerate `seed.sql`'s
  new tables from the JSON (see CHANGELOG "Known limitations")
- **Attribution scoring/weights** → `attribution_factors` /
  `attribution_matrix` tables in `database/seed.sql` (runtime), and
  `demo/demo_case.json` / `frontend/data.js` (offline fallback)
- **Report generation** → `_build_report()` in `backend/app/main.py`
- **Relationship graph** → `/api/graph` in `backend/app/main.py` (backend
  shape) and `drawConstellation()` in `frontend/app.js` (rendering)
- **Persona analysis** → `persona_matches` rows in `database/seed.sql` /
  `demo/demo_case.json`, served by `/api/persona`
- **API/DB status pills** → `GET /health` in `backend/app/main.py`
  (`database.db_status()` for real connectivity) and the topbar markup in
  `frontend/app.js` that reads `DATA.health`

## Why one `main.py` file for the backend?

The project brief asked for a beginner-debuggable structure over
unnecessary abstraction. 23 routes in one file is small enough to
read top-to-bottom, and every route is easy to find with Ctrl+F. If this
grows significantly, the natural next step is splitting `main.py` into
`backend/app/routes/actors.py`, `routes/notes.py`, etc. — not required yet.

## Data flow

```
Browser
  └─ index.html loads api-client.js
       └─ api-client.js: fetch /api/demo/load AND fetch /health (4s timeout each)
            ├─ /api/demo/load success → window.__DARKTRACE_PRELOADED_DATA__ = backend JSON
            │    (assembled live from the database — see
            │    _assemble_demo_case_from_db() in backend/app/main.py)
            ├─ /health success → window.__DARKTRACE_HEALTH__ = {api, database, database_type, mode}
            └─ either failure → leaves the corresponding variable unset
                 (data.js/app.js then show OFFLINE/UNAVAILABLE/LOCAL FALLBACK honestly)
       └─ then loads data.js
            ├─ if preloaded data exists → DATA built from it (real DB path)
            └─ else → DATA built from local seeded generator (offline fallback)
       └─ then loads app.js → renders the UI from DATA
  └─ Analyst notes / Correlation Sweep clicks call window.DarktraceAPI,
     which POSTs to the FastAPI backend → writes to the database →
     survives a refresh (when backend is reachable)
```
