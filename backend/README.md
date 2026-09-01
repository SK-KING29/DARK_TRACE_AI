# DARKTRACE AI — Backend

FastAPI service exposing the actor/alias/PGP/wallet/infrastructure/relationship/
persona/timeline/evidence/investigation/scan/report API described in the SIH26151
task brief, plus a `GET /health` check and a static mount that serves the
existing, unmodified `frontend/` at `/`.

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open http://localhost:8000 for the app, http://localhost:8000/docs for the
interactive Swagger API explorer, http://localhost:8000/health for the health
check.

On first startup the app auto-creates and seeds a local SQLite database at
`database/darktrace.db` — **no separate database setup is required for local
development.** Delete that file to reset to a fresh seed.

## Using PostgreSQL instead of SQLite

Set `DATABASE_URL` (standard `postgresql://user:pass@host:port/dbname` form)
before starting the app — `docker-compose.yml` and `render.yaml` already do
this for you. The same `database/schema.sql` and `database/seed.sql` files
are used for both backends; a small compatibility shim in `app/database.py`
adapts the small number of Postgres-only syntax bits (`SERIAL`, `TEXT[]`,
`JSONB`, `CHECK` constraints) when running on SQLite.

## Regenerating the demo dataset

```bash
cd backend
python -m app.services.generate_dataset      # writes demo/demo_case.json
python -m app.services.generate_seed_sql     # writes database/seed.sql
```

Both are deterministic (seeded RNG) so re-running produces the same dataset —
useful if you tweak the generator and want the SQL seed file to match.

## Endpoints

See `docs/api.md` for the full list with example responses.
