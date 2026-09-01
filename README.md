# DARKTRACE AI
### Dark Web Threat Actor Intelligence Platform

**Smart India Hackathon 2026 — Problem Statement SIH26151**
**Theme:** Cybersecurity & Blockchain · **Team:** IT ROYALS

---

## Project overview

DARKTRACE AI is an investigation workbench for correlating dark-web threat
actor footprints — aliases, PGP identities, cryptocurrency wallets, hidden
services, infrastructure, and writing-style personas — into evidence-backed,
confidence-scored **candidate attribution**. It never claims guaranteed
deanonymization; every finding is framed as a candidate correlation with an
explainable confidence score, for a human analyst to review.

This build pairs the DARKTRACE frontend with a real FastAPI backend, a
PostgreSQL-compatible database, an expanded synthetic dataset, Docker
packaging, and Render deployment configuration. The frontend now actually
talks to that backend (see `CHANGELOG.md` — this was previously broken)
instead of always generating fresh random data on every page load.

**Read `PROJECT_MAP.md` first** if you're new to this codebase — it's a
plain-language map of what every file does and where to make common
changes.

## Features

- **Case Nexus** — investigation overview, headline metrics, evidence threads, analyst notes
- **Actor Dossiers** — per-actor aggregation of aliases, PGP, wallets, infrastructure, evidence, timeline
- **Relationship Constellation** — interactive node/edge graph
- **Infrastructure Scanner** — hidden service → candidate clearnet infrastructure correlation
- **Wallet Tracker** — synthetic Bitcoin/Ethereum wallet intelligence
- **Persona Analyzer** — stylometric/behavioural similarity, persona migration detection (demonstration model)
- **Timeline Reconstructor** — filterable cross-entity event timeline
- **Evidence Vault & Source Matrix** — provenance and reliability scoring
- **Attribution Matrix** — explainable, weighted confidence scoring
- **Correlation Sweep** — deterministic demonstration re-correlation of the dataset, persisted to `scan_history` when the backend is connected (no live scanning)
- **Export Center** — JSON, CSV, and print-to-PDF reporting

## Architecture

See `docs/architecture.md`. Short version: one Render web service (FastAPI,
serving both `/api/*` and the static frontend) + one Render PostgreSQL
database. Locally, the backend falls back to zero-setup SQLite.

## Tech stack

- **Frontend:** vanilla HTML/CSS/JS, hash-routed SPA (unmodified from the original prototype)
- **Backend:** Python, FastAPI, uvicorn
- **Database:** PostgreSQL (production) / SQLite (local dev), same schema for both
- **Deployment:** Docker, Render (Blueprint via `render.yaml`)

## Folder structure

```
darktrace-ai/
├── PROJECT_MAP.md   Plain-language map of the codebase — start here
├── CHANGELOG.md     What changed, phase by phase
├── frontend/        UI (index.html, api-client.js, data.js, app.js, styles.css)
├── backend/         FastAPI app, dataset generator, requirements.txt
├── database/        schema.sql, seed.sql, README.md
├── demo/            demo_case.json (curated CASE-26151-07), README.md
├── docs/            architecture, api, sih-coverage, deployment, JUDGE-DEMO
├── tests/           test_api.py (backend API tests)
├── Dockerfile, docker-compose.yml, render.yaml
├── .env.example, .gitignore
└── README.md (this file)
```

## Debugging guide

| Symptom | Look here |
|---|---|
| UI is broken / blank page | `frontend/index.html`, `frontend/app.js`, browser console |
| Frontend never shows real data (always "API ● OFFLINE") | `frontend/api-client.js` fetch call, is the backend actually running? CORS? |
| API returns errors | `backend/app/main.py` (all routes currently live in this one file) |
| Database errors / empty tables | `backend/app/database.py`, `database/schema.sql`, `database/seed.sql` |
| Data looks wrong / wrong field names | `demo/demo_case.json`, `backend/app/services/generate_dataset.py`, or frontend's `data.js` normalization |
| Analyst notes don't survive a refresh | Check `/api/notes` in `backend/app/main.py`, then `DarktraceAPI.notes` in `frontend/api-client.js` — is `DATA.source === "backend"`? |
| Correlation Sweep doesn't save history | `/api/scans` in `backend/app/main.py`, `DarktraceAPI.scans` in `frontend/api-client.js` |
| Frontend on Netlify can't reach backend on Render | Set `window.DARKTRACE_API_BASE = "https://your-backend.onrender.com"` in `frontend/index.html` before the `api-client.js` script tag, and set `CORS_ORIGINS` on the backend to your Netlify URL |

## Local installation

See `docs/deployment.md` section C for Windows/Linux/macOS commands. Quick version:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open http://localhost:8000. Database is created and seeded automatically.

## Docker

```bash
docker-compose up --build
```

## Demo mode

`GET /api/demo/load` or the UI's existing "LOAD DEMO INVESTIGATION" control
loads curated case `CASE-26151-07` (actor ShadowFox). See `demo/README.md`
and `docs/JUDGE-DEMO.md` for the full walkthrough.

## API documentation

See `docs/api.md`, or the auto-generated Swagger UI at `/docs` once the
backend is running.

## Environment variables

See `.env.example`. `DATABASE_URL` is the only one you need to set to switch
from local SQLite to PostgreSQL.

## Render deployment

See `docs/deployment.md` section A. One-command via Render Blueprint
(`render.yaml`), one public URL for the full application.

## SIH requirement coverage

See `docs/sih-coverage.md` for a per-requirement audit (IMPLEMENTED /
SIMULATED / PARTIAL, with an honesty note on what "AI persona analysis" and
"autonomous scan" actually are in this build).

## Security & ethical limitations

- All actor, wallet, PGP, and infrastructure data in this build is synthetic.
- No real Tor services, servers, or credentials are accessed, scanned, or exploited by this code.
- Findings are always framed as "candidate" correlations with "evidence-based confidence" — never as proof of identity or a "real attacker IP."
- No secrets are committed to this repository — see `.env.example`.
- Any production deployment beyond this hackathon prototype should add authentication/RBAC and audit logging before being used against real data, and must operate only against authorized environments or public metadata.

## Troubleshooting

- **Backend won't start / import errors** → `pip install -r backend/requirements.txt` inside an activated virtualenv.
- **Empty data after first run** → delete `database/darktrace.db` (SQLite) to force reseed, or check `DATABASE_URL` is reachable (Postgres).
- **CORS errors calling the API from a different origin** → set `CORS_ORIGINS` in `.env` / Render env vars.
- **Render service "sleeping"** → free-tier services spin down after inactivity; the first request after idle takes ~30–60s.

## Judge demonstration flow

See `docs/JUDGE-DEMO.md` for the full 5-minute script.
