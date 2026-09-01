# DARKTRACE AI — Change Log

## Phase 2 — Database-Backed Runtime, Real Test Suite, Real Health Status

### 🔴 CRITICAL — Fixed
- **Test suite was failing (4 passed / 6 failed).** `tests/test_api.py`
  instantiated `client = TestClient(app)` without using it as a context
  manager, so FastAPI's startup/lifespan hook — where `init_db()` creates
  and seeds every table — never ran before requests were made, causing
  `sqlite3.OperationalError: no such table: actors/investigations/sources`.
  Fixed by entering `TestClient(app)` via `__enter__()`/`__exit__()`
  (equivalent to `with TestClient(app) as client:` for the whole module),
  which does trigger lifespan startup. All 10 tests now exercise a real,
  seeded database.
- **`GET /api/demo/load` read `demo/demo_case.json` off disk at request
  time**, not the database — so "database-backed demo" was cosmetic.
  Rewritten to assemble the entire response
  (`actors`, `aliases`, `pgpKeys`, `wallets`, `onionServices`,
  `infrastructure`, `relationships`, `evidence`, `timelineEvents`,
  `personaComparisons`, `sources`, `marketplaces`, `forums`,
  `demoCaseId`, `demoActorId`, `demoTimeline`, `attributionFactors`,
  `attributionMatrix`, `overallAttribution`) from live `SELECT`s against
  `investigations` / `actors` / ... tables, in the exact camelCase shape
  the frontend already expects. `demo/demo_case.json` is kept on disk only
  as curated reference/seed data (see `database/README.md`) — it is never
  read at runtime anymore.
- **`/health` always reported `{"status": "ok"}` regardless of database
  state.** Now runs a real `SELECT 1` against the live connection
  (`database.db_status()`) and returns
  `{"status", "api", "database", "database_type", "mode"}`, degrading
  honestly (`"database": "disconnected"`, `"mode": "synthetic-demo-db-unavailable"`)
  if the database is unreachable — it never fakes ONLINE/connected.

### 🟠 IMPORTANT — Changed
- `database/schema.sql`: added `attribution_factors` and
  `attribution_matrix` tables (previously only present as static JSON,
  with no database representation), plus `investigations.overall_attribution`,
  `investigations.is_demo_case`, `actors.is_demo_primary`, and
  `timeline_events.is_demo_highlight` — these mark *which* seeded case/actor/
  events `/api/demo/load` serves, instead of that being hard-coded as a
  literal string inside the endpoint.
- `database/seed.sql`: seeded the new tables/columns to match
  `demo/demo_case.json` 1:1 (CASE-26151-07 / ACT-001 / ShadowFox,
  attribution factors, attribution matrix rows, and the 6 curated
  `demoTimeline` highlight events, now IDs `TL-D01`–`TL-D06`).
- `backend/app/main.py`: replaced deprecated `@app.on_event("startup")`
  with the modern `lifespan` context manager (functionally identical —
  still calls `init_db(seed=True)` before the app accepts traffic — but
  this is what makes `with TestClient(app) as client:` reliable, and is
  no longer a deprecation warning).
- `backend/app/database.py`: added `db_status()` for real connectivity
  checks used by `/health`.
- `frontend/api-client.js` / `frontend/data.js` / `frontend/app.js`: the
  topbar status pill no longer infers "API ONLINE" merely from
  `/api/demo/load` having returned JSON. It now fetches `/health`
  separately and renders real `API ●` / `DB ●` / `MODE ●` status from that
  response (`ONLINE`/`CONNECTED`/`SYNTHETIC DEMO` vs.
  `OFFLINE`/`UNAVAILABLE`/`LOCAL FALLBACK`). No layout/visual changes —
  same pill style, one additional pill.
- `render.yaml` / comments: clarified that `CORS_ORIGINS=*` is safe by
  default only because this service serves the frontend itself
  (same-origin); a split Netlify+Render deployment must set `CORS_ORIGINS`
  to the frontend's real origin. `CORS_ORIGINS` was already environment-
  driven in `backend/app/main.py` (not hard-coded), so no code change was
  needed there — only the documentation/comments.

### 🟡 Known limitations (not addressed this phase — out of scope per spec)
- `backend/app/services/generate_dataset.py` and `generate_seed_sql.py`
  (the original JSON→SQL generator scripts) were **not** updated to emit
  `attribution_factors` / `attribution_matrix` / the new demo-marker
  columns. Re-running them would regenerate `database/seed.sql` without
  those additions. `database/seed.sql` was hand-authored for this phase
  instead; reconciling the generators is a follow-up.
- The 6 `demoTimeline` highlight events are also regular rows in
  `timeline_events` (so `timelineEvents` now returns 34 rows instead of
  28) — they're real events that happen to also be highlighted, not
  duplicated data, but this is a deliberate shape change from the original
  static JSON file worth knowing about.
- No authentication/RBAC was added (out of scope; flagged in `README.md`
  as required before any real deployment).

## Phase 1 — Frontend ↔ Backend Integration + Deterministic Demo Data

### 🔴 CRITICAL — Fixed
- **Frontend never talked to the backend.** `index.html` loaded only
  `data.js` + `app.js`; `frontend/api-client.js` existed but was never
  referenced by any `<script>` tag, so the fully-built FastAPI backend was
  completely disconnected from the UI.
- **Even if loaded, the old `api-client.js` was dead code.** It fetched
  `/api/demo/load` and set `window.__DARKTRACE_PRELOADED_DATA__`, but
  `data.js` never read that variable — the fetch result was discarded.
  Root cause: plain `<script>` tags execute synchronously in document
  order, so `data.js` had already finished running by the time the
  `fetch()` promise resolved. There was no mechanism forcing `data.js` to
  wait.
- **Demo data was not deterministic.** `frontend/data.js` called
  `Math.random()` with no seed for actor names, dates, wallet addresses,
  wallet volumes, etc. Every page refresh silently generated a different
  "ShadowFox" case, which contradicts the spec's core requirement that the
  same demo case produce the same result every time.

### 🟠 IMPORTANT — Changed
- `frontend/api-client.js` rewritten as the sole boot orchestrator: it is
  now the only `<script>` tag `index.html` loads. It fetches
  `/api/demo/load` (4s timeout via `AbortController`), then dynamically
  loads `data.js`, then `app.js`, in guaranteed order.
- `frontend/data.js` now checks `window.__DARKTRACE_PRELOADED_DATA__`
  first. If present (backend reachable), all entity arrays are taken
  directly from the backend response. If absent, it falls back to a local
  generator — but that generator now uses a fixed-seed PRNG (`mulberry32`,
  seed `0x26151007`) instead of `Math.random()`, so the offline fallback
  case is also deterministic across reloads.
- `frontend/app.js`: the `DOMContentLoaded` boot handler now also runs
  immediately if the document is already past the "loading" state, since
  `app.js` is now injected after the initial page parse (by which point
  `DOMContentLoaded` has typically already fired).
- Nav label and page title "Autonomous Scan" → "Correlation Sweep" /
  "Intelligence Correlation Sweep" (Section 18 of the spec — more
  technically honest naming; this feature does not perform live scanning).

### 🟡 MINOR — Added
- API status pill in the topbar (`API ● ONLINE` / `API ● OFFLINE — DEMO
  FALLBACK`), reflecting the *actual* result of the backend fetch, not a
  hardcoded value.
- "Data Collector" row in the System Terminal panel now reflects real
  connectivity instead of a hardcoded `ONLINE`.
- `index.html` documents `window.DARKTRACE_API_BASE` for split deployments
  (frontend on Netlify, backend on Render).

### Files Modified
- `frontend/index.html`
- `frontend/api-client.js`
- `frontend/data.js`
- `frontend/app.js`

---

## Phase 2 — Persistence, Deterministic Correlation Sweep, Full Project Package

### 🔴 CRITICAL — Fixed
- **Analyst notes did not persist.** The "Add analyst note" button only
  did `DATA.analystNotes.unshift(...)` — an in-memory array mutation.
  Refreshing the browser lost every note. There was no `/api/notes`
  endpoint at all, despite `analyst_notes` already existing in
  `database/schema.sql` and being read by the report builder.
- **Correlation Sweep used uncontrolled randomness and never
  persisted.** The old "Autonomous Scan" page incremented counters with
  `Math.random()` in a `setInterval` loop and never wrote to
  `scan_history`, despite that table already existing in the schema and a
  `POST /api/scans` route already inserting a row — but that route left
  the row stuck at `status = 'RUNNING'` forever with all counts at 0.

### 🟠 IMPORTANT — Added
- `GET /api/notes`, `POST /api/notes`, `DELETE /api/notes/{id}` in
  `backend/app/main.py` — full CRUD against the existing `analyst_notes`
  table.
- `POST /api/scans` now completes synchronously and writes deterministic,
  data-derived counts (e.g. `new_actors = count(actors) // 12`) instead of
  leaving a stuck `RUNNING` row — no `random.random()` involved, so the
  same seeded database always reports the same sweep numbers.
- `frontend/api-client.js` now exposes `window.DarktraceAPI` with
  `.notes.{list,create,remove}` and `.scans.{list,start}` helpers used by
  `app.js`.
- `frontend/app.js`: Analyst Notes panel now calls the real API when the
  backend is live (`DATA.source === "backend"`), reloads notes from
  `GET /api/notes` on page load, and — critically — tells the analyst
  explicitly when a note could **not** be persisted (backend offline),
  instead of silently pretending it was saved.
- `frontend/app.js`: Correlation Sweep page rewritten — removed the
  `setInterval`/`Math.random()` animation loop; a sweep now calls
  `POST /api/scans` (or a same-formula local fallback when offline),
  shows the real result, and renders persisted sweep history from
  `GET /api/scans`.
- `PROJECT_MAP.md` — plain-language file-by-file guide.
- `tests/test_api.py` — FastAPI `TestClient` tests covering `/health`,
  `/api/demo/load`, actor detail, and the new notes/scans CRUD flow
  (create → list → delete; sweep → history).

### 🟡 MINOR
- README updated: Correlation Sweep naming, debugging table, Netlify+Render
  split-deployment note, `PROJECT_MAP.md`/`CHANGELOG.md` cross-references.

### Files Modified
- `backend/app/main.py`
- `frontend/api-client.js`
- `frontend/app.js`
- `README.md`

### Files Added
- `PROJECT_MAP.md`
- `CHANGELOG.md`
- `tests/test_api.py`

### 🟢 OPTIONAL — Not done (documented, not silently skipped)
See "Known limitations" in `README.md` / final report: real backend process
was not started or load-tested in this environment (no outbound network
access available to `pip install` the backend's dependencies here), so the
end-to-end HTTP round trip (browser → api-client.js → FastAPI → Postgres/
SQLite → browser) has been verified by code inspection, direct unit-style
execution of the JS data logic against the real `demo/demo_case.json`, and
Python syntax compilation of `main.py` — but not by an actual running
server. Recommend running `pytest tests/` and the judge demo flow locally
before presenting.
