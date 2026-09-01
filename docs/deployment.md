# Deployment Guide

## A. Render (primary target — one public URL)

1. **Create a GitHub repository** and push this project to it.
2. Go to **render.com → New → Blueprint**, point it at the repo. Render
   reads `render.yaml` automatically and proposes:
   - a Docker web service (`darktrace-ai`) built from the root `Dockerfile`
   - a managed PostgreSQL database (`darktrace-ai-db`)
3. Confirm and click **Apply** — Render provisions both and wires
   `DATABASE_URL` into the web service automatically.
4. **Environment variables** are mostly pre-filled by `render.yaml`
   (`DATABASE_URL`, `SECRET_KEY` auto-generated, `CORS_ORIGINS=*`,
   `ENVIRONMENT=production`). Adjust `CORS_ORIGINS` if you want to restrict it.
5. **Database initialization** happens automatically: the FastAPI app runs
   `init_db()` on startup, which creates tables from `database/schema.sql`
   and loads `database/seed.sql` if empty. No manual `psql` step is required
   on Render, though you can run one from the Render shell if you prefer.
6. **Deploy** — Render builds the Docker image and starts the service.
7. **Open the public URL**, e.g. `https://darktrace-ai.onrender.com` — this
   serves the existing DARKTRACE UI directly (FastAPI's static mount), with
   the API live at the same origin under `/api/*`.
8. **Load the demo case**: use the UI's existing "LOAD DEMO INVESTIGATION"
   control, or `GET /api/demo/load`, to pull up `CASE-26151-07`.
9. **Test the flow**: Actor Dossier → Relationship Graph → Infrastructure →
   Blockchain → Persona → Timeline → Evidence → Attribution → Report, per
   `docs/JUDGE-DEMO.md`.

> Render's free-tier web services spin down after inactivity and take ~30–60s
> to wake on the next request — mention this if demoing live to judges, or
> visit the URL a minute before presenting.

## B. Docker (local, full stack incl. PostgreSQL)

```bash
docker-compose up --build
```

This starts PostgreSQL and the FastAPI app together; the app waits for the
database health check before starting. Open http://localhost:8000.

To stop and remove containers (keeping the DB volume): `docker-compose down`.
To also wipe the database: `docker-compose down -v`.

## C. Local hosting without Docker

### Windows (PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Linux / macOS

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Either way, open http://localhost:8000. No database setup is required — a
local SQLite file is created and seeded automatically on first run (see
`database/README.md` if you'd rather use PostgreSQL locally).

### Frontend only (static, no backend)

The existing frontend also still runs completely standalone, exactly as
before this backend was added:

```bash
cd frontend
python3 -m http.server 8080
# open http://localhost:8080
```

## Health check

`GET /health` → `{"status": "ok", "service": "darktrace-ai"}`. This is the
path configured in `render.yaml`'s `healthCheckPath`.
