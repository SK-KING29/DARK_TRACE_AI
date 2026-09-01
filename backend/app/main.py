"""
DARKTRACE AI — backend API (FastAPI)

Serves the same entities the existing frontend/data.js already renders,
from a real database instead of client-side random generation. Designed to
sit behind the existing, unmodified frontend/ UI — see frontend/api-client.js
for the optional fetch-based loader that can replace the client-side
generator with calls to this API.

Run locally:
    pip install -r requirements.txt
    uvicorn app.main:app --reload
"""
import csv
import io
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

from .database import get_conn, dict_rows, init_db, db_status, IS_SQLITE, ROOT


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs before the app accepts any requests — and, importantly, before
    # TestClient(app) issues requests too, as long as it's used as a
    # context manager (`with TestClient(app) as client`). This replaces
    # the deprecated @app.on_event("startup") hook with the equivalent
    # modern FastAPI/Starlette lifespan API.
    init_db(seed=True)
    yield


app = FastAPI(
    title="DARKTRACE AI API",
    description="Dark Web Threat Actor Intelligence Platform — SIH26151. "
                 "All data is synthetic/demonstration data. No real deanonymization is performed or claimed.",
    version="1.0.0",
    lifespan=lifespan,
)

# Comma-separated allowed origins for the API, or "*" for any (local-dev /
# single-service-same-origin default). For a split deployment (frontend and
# backend on different domains), set CORS_ORIGINS in the environment to the
# frontend's exact origin(s) instead of relying on the "*" default — see
# .env.example and README.md.
ALLOWED_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ALLOWED_ORIGINS == "*" else ALLOWED_ORIGINS.split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


def q(sql: str, params: tuple = ()):
    """Run a SELECT and return list[dict]. Adapts placeholder style per backend."""
    if IS_SQLITE:
        sql = sql.replace("%s", "?")
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return dict_rows(cur)


def exec_write(sql: str, params: tuple = ()):
    if IS_SQLITE:
        sql = sql.replace("%s", "?")
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)


# ---------------------------------------------------------------- health ---
@app.get("/health")
def health():
    """Real backend + database health — never reports ONLINE/connected
    without actually checking. Frontend renders this as the
    API ●/DB ●/MODE ● status pills."""
    status = db_status()
    healthy = status["connected"]
    return {
        "status": "ok" if healthy else "degraded",
        "service": "darktrace-ai",
        "api": "online",
        "database": "connected" if healthy else "disconnected",
        "database_type": status["type"],
        "mode": "synthetic-demo" if healthy else "synthetic-demo-db-unavailable",
    }


# --------------------------------------------------------------- actors ---
@app.get("/api/actors")
def list_actors(q_search: str | None = Query(None, alias="q"), category: str | None = None,
                 status: str | None = None, limit: int = 500):
    sql = "SELECT * FROM actors WHERE 1=1"
    params = []
    if q_search:
        sql += " AND alias LIKE %s"
        params.append(f"%{q_search}%")
    if category:
        sql += " AND category = %s"
        params.append(category)
    if status:
        sql += " AND status = %s"
        params.append(status)
    sql += " LIMIT %s"
    params.append(limit)
    return q(sql, tuple(params))


@app.get("/api/actors/{actor_id}")
def get_actor(actor_id: str):
    rows = q("SELECT * FROM actors WHERE id = %s", (actor_id,))
    if not rows:
        raise HTTPException(404, "Actor not found")
    actor = rows[0]
    actor["aliases"] = q("SELECT * FROM aliases WHERE actor_id = %s", (actor_id,))
    actor["pgpKeys"] = q("SELECT * FROM pgp_keys WHERE actor_id = %s", (actor_id,))
    actor["wallets"] = q("SELECT * FROM wallets WHERE actor_id = %s", (actor_id,))
    actor["onionServices"] = q("SELECT * FROM onion_services WHERE actor_id = %s", (actor_id,))
    actor["infrastructure"] = q("SELECT * FROM infrastructure WHERE actor_id = %s", (actor_id,))
    actor["evidence"] = q("SELECT * FROM evidence WHERE actor_id = %s", (actor_id,))
    actor["timeline"] = q("SELECT * FROM timeline_events WHERE actor_id = %s ORDER BY date", (actor_id,))
    actor["relationships"] = q(
        "SELECT * FROM relationships WHERE source_id = %s OR target_id = %s", (actor_id, actor_id)
    )
    return actor


# -------------------------------------------------------------- aliases ---
@app.get("/api/aliases")
def list_aliases(actor_id: str | None = None, limit: int = 500):
    if actor_id:
        return q("SELECT * FROM aliases WHERE actor_id = %s LIMIT %s", (actor_id, limit))
    return q("SELECT * FROM aliases LIMIT %s", (limit,))


# ------------------------------------------------------------------ pgp ---
@app.get("/api/pgp")
def list_pgp(actor_id: str | None = None, limit: int = 500):
    if actor_id:
        return q("SELECT * FROM pgp_keys WHERE actor_id = %s LIMIT %s", (actor_id, limit))
    return q("SELECT * FROM pgp_keys LIMIT %s", (limit,))


@app.get("/api/pgp/reuse")
def pgp_reuse():
    """PGP fingerprints associated with more than one actor — reuse detection."""
    rows = q("SELECT fingerprint, COUNT(DISTINCT actor_id) as actor_count FROM pgp_keys "
             "GROUP BY fingerprint HAVING COUNT(DISTINCT actor_id) > 1")
    return rows


# -------------------------------------------------------------- wallets ---
@app.get("/api/wallets")
def list_wallets(actor_id: str | None = None, chain: str | None = None, limit: int = 500):
    sql = "SELECT * FROM wallets WHERE 1=1"
    params = []
    if actor_id:
        sql += " AND actor_id = %s"
        params.append(actor_id)
    if chain:
        sql += " AND chain = %s"
        params.append(chain)
    sql += " LIMIT %s"
    params.append(limit)
    return q(sql, tuple(params))


# -------------------------------------------------------- infrastructure ---
@app.get("/api/infrastructure")
def list_infrastructure(actor_id: str | None = None, limit: int = 500):
    if actor_id:
        return q("SELECT * FROM infrastructure WHERE actor_id = %s LIMIT %s", (actor_id, limit))
    return q("SELECT * FROM infrastructure LIMIT %s", (limit,))


@app.get("/api/onion-services")
def list_onion_services(actor_id: str | None = None, limit: int = 500):
    if actor_id:
        return q("SELECT * FROM onion_services WHERE actor_id = %s LIMIT %s", (actor_id, limit))
    return q("SELECT * FROM onion_services LIMIT %s", (limit,))


# ------------------------------------------------------------- relations ---
@app.get("/api/relationships")
def list_relationships(entity_id: str | None = None, type: str | None = None, limit: int = 1000):
    sql = "SELECT * FROM relationships WHERE 1=1"
    params = []
    if entity_id:
        sql += " AND (source_id = %s OR target_id = %s)"
        params += [entity_id, entity_id]
    if type:
        sql += " AND type = %s"
        params.append(type)
    sql += " LIMIT %s"
    params.append(limit)
    return q(sql, tuple(params))


@app.get("/api/graph")
def relationship_graph():
    """Full node/edge payload for the Relationship Constellation view."""
    actors = q("SELECT id, alias as label, 'actor' as node_type FROM actors")
    aliases = q("SELECT id, handle as label, 'alias' as node_type FROM aliases")
    wallets = q("SELECT id, address as label, 'wallet' as node_type FROM wallets")
    pgp = q("SELECT id, fingerprint as label, 'pgp' as node_type FROM pgp_keys")
    infra = q("SELECT id, candidate_domain as label, 'infrastructure' as node_type FROM infrastructure")
    edges = q("SELECT id, type, source_id as source, target_id as target, confidence FROM relationships")
    nodes = actors + aliases + wallets + pgp + infra
    return {"nodes": nodes, "edges": edges}


# --------------------------------------------------------------- persona ---
@app.get("/api/persona")
def list_persona(limit: int = 200):
    rows = q("SELECT * FROM persona_matches LIMIT %s", (limit,))
    for r in rows:
        r["modelType"] = r.get("model_type") or "DEMONSTRATION MODEL"
        r["disclaimer"] = "AI ANALYSIS — DEMONSTRATION MODEL. Deterministic scoring for demo purposes only."
    return rows


# -------------------------------------------------------------- timeline ---
@app.get("/api/timeline")
def list_timeline(actor_id: str | None = None, category: str | None = None,
                   start: str | None = None, end: str | None = None, limit: int = 500):
    sql = "SELECT * FROM timeline_events WHERE 1=1"
    params = []
    if actor_id:
        sql += " AND actor_id = %s"
        params.append(actor_id)
    if category:
        sql += " AND category = %s"
        params.append(category)
    if start:
        sql += " AND date >= %s"
        params.append(start)
    if end:
        sql += " AND date <= %s"
        params.append(end)
    sql += " ORDER BY date LIMIT %s"
    params.append(limit)
    return q(sql, tuple(params))


# -------------------------------------------------------------- evidence ---
@app.get("/api/evidence")
def list_evidence(actor_id: str | None = None, reliability: str | None = None, limit: int = 500):
    sql = "SELECT * FROM evidence WHERE 1=1"
    params = []
    if actor_id:
        sql += " AND actor_id = %s"
        params.append(actor_id)
    if reliability:
        sql += " AND reliability = %s"
        params.append(reliability)
    sql += " LIMIT %s"
    params.append(limit)
    return q(sql, tuple(params))


# --------------------------------------------------------------- sources ---
@app.get("/api/sources")
def list_sources():
    return q("SELECT * FROM sources")


# ---------------------------------------------------------- investigations ---
@app.get("/api/investigations")
def list_investigations():
    return q("SELECT * FROM investigations")


@app.post("/api/investigations")
def create_investigation(payload: dict):
    inv_id = payload.get("id") or f"CASE-{datetime.now().strftime('%y%m%d%H%M%S')}"
    exec_write(
        "INSERT INTO investigations (id, title, description, priority, status) VALUES (%s, %s, %s, %s, %s)",
        (inv_id, payload.get("title", "Untitled Investigation"), payload.get("description", ""),
         payload.get("priority", "MODERATE"), payload.get("status", "ACTIVE")),
    )
    return {"id": inv_id, "status": "created"}


# ----------------------------------------------------------------- notes ---
# Analyst notes — persisted to the database (Section: PERSISTENCE).
# Refreshing the browser must NOT lose notes; this is the real API path
# frontend/app.js now calls instead of pushing into the in-memory DATA array.
@app.get("/api/notes")
def list_notes(investigation_id: str | None = None, limit: int = 100):
    if investigation_id:
        return q("SELECT * FROM analyst_notes WHERE investigation_id = %s "
                  "ORDER BY pinned DESC, created_at DESC LIMIT %s", (investigation_id, limit))
    return q("SELECT * FROM analyst_notes ORDER BY pinned DESC, created_at DESC LIMIT %s", (limit,))


@app.post("/api/notes")
def create_note(payload: dict):
    investigation_id = payload.get("investigation_id") or payload.get("investigationId")
    author = payload.get("author") or "Analyst"
    body = (payload.get("body") or "").strip()
    if not investigation_id:
        raise HTTPException(400, "investigation_id is required")
    if not body:
        raise HTTPException(400, "body is required")
    sql = ("INSERT INTO analyst_notes (investigation_id, author, body, pinned) "
           "VALUES (%s, %s, %s, %s)")
    if IS_SQLITE:
        sql = sql.replace("%s", "?")
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, (investigation_id, author, body, bool(payload.get("pinned", False))))
        note_id = cur.lastrowid if IS_SQLITE else None
        conn.commit()
        if note_id is None:
            cur.execute("SELECT id FROM analyst_notes ORDER BY id DESC LIMIT 1")
            note_id = cur.fetchone()[0]
    rows = q("SELECT * FROM analyst_notes WHERE id = %s", (note_id,))
    return rows[0] if rows else {"id": note_id}


@app.delete("/api/notes/{note_id}")
def delete_note(note_id: int):
    exec_write("DELETE FROM analyst_notes WHERE id = %s", (note_id,))
    return {"id": note_id, "deleted": True}


# ----------------------------------------------------------------- scans ---
@app.get("/api/scans")
def list_scans():
    return q("SELECT * FROM scan_history ORDER BY started_at DESC LIMIT 50")


@app.post("/api/scans")
def start_scan(payload: dict | None = None):
    """
    Runs a simulated "Correlation Sweep" and persists the result to
    scan_history. This does NOT perform any live scanning of real
    infrastructure — see docs/architecture.md (Ethical Operation).

    The "new_*" counters are DETERMINISTIC: they are derived from actual
    row counts already in the database (not Math.random()/random.random()),
    so re-running the sweep against the same seeded database always
    produces the same demonstration numbers, per the spec's "deterministic
    correlation sweep" requirement.
    """
    action = (payload or {}).get("action", "start")
    if action != "start":
        return {"status": action}

    counts = {
        "sources_scanned": q("SELECT COUNT(*) as n FROM sources")[0]["n"],
        "new_actors": max(1, q("SELECT COUNT(*) as n FROM actors")[0]["n"] // 12),
        "new_relationships": max(1, q("SELECT COUNT(*) as n FROM relationships")[0]["n"] // 8),
        "new_infrastructure": max(1, q("SELECT COUNT(*) as n FROM infrastructure")[0]["n"] // 7),
        "new_wallet_links": max(1, q("SELECT COUNT(*) as n FROM wallets")[0]["n"] // 5),
        "persona_changes": max(1, q("SELECT COUNT(*) as n FROM persona_matches")[0]["n"] // 5),
    }

    sql = ("INSERT INTO scan_history (status, ended_at, sources_scanned, new_actors, "
           "new_relationships, new_infrastructure, new_wallet_links, persona_changes) "
           "VALUES (%s,%s,%s,%s,%s,%s,%s,%s)")
    if IS_SQLITE:
        sql = sql.replace("%s", "?")
    now = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, ("COMPLETED", now, counts["sources_scanned"], counts["new_actors"],
                           counts["new_relationships"], counts["new_infrastructure"],
                           counts["new_wallet_links"], counts["persona_changes"]))
        scan_id = cur.lastrowid if IS_SQLITE else None
        conn.commit()
        if scan_id is None:
            cur.execute("SELECT id FROM scan_history ORDER BY id DESC LIMIT 1")
            scan_id = cur.fetchone()[0]
    return {"id": scan_id, "status": "COMPLETED", **counts}


# --------------------------------------------------------------- reports ---
@app.get("/api/reports/{investigation_id}.json")
def report_json(investigation_id: str):
    return _build_report(investigation_id)


@app.get("/api/reports/{investigation_id}.csv")
def report_csv(investigation_id: str):
    report = _build_report(investigation_id)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Section", "Field", "Value"])
    for section, rows in report.items():
        if isinstance(rows, list):
            for row in rows:
                if isinstance(row, dict):
                    for k, v in row.items():
                        writer.writerow([section, k, v])
        else:
            writer.writerow([section, "", rows])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={investigation_id}-report.csv"},
    )


@app.post("/api/reports")
def generate_report(payload: dict):
    investigation_id = payload.get("investigation_id") or payload.get("investigationId")
    fmt = payload.get("format", "JSON").upper()
    if not investigation_id:
        raise HTTPException(400, "investigation_id is required")
    report = _build_report(investigation_id)
    exec_write(
        "INSERT INTO reports (investigation_id, format, file_path) VALUES (%s, %s, %s)",
        (investigation_id, fmt, f"/api/reports/{investigation_id}.{fmt.lower()}"),
    )
    return {"investigation_id": investigation_id, "format": fmt, "report": report}


def _build_report(investigation_id: str) -> dict:
    inv = q("SELECT * FROM investigations WHERE id = %s", (investigation_id,))
    if not inv:
        raise HTTPException(404, "Investigation not found")
    actors = q("SELECT * FROM actors WHERE investigation_id = %s", (investigation_id,))
    actor_ids = tuple(a["id"] for a in actors) or ("__none__",)
    placeholder = ",".join(["%s"] * len(actor_ids)) if not IS_SQLITE else ",".join(["?"] * len(actor_ids))

    def in_actor_ids(table):
        return q(f"SELECT * FROM {table} WHERE actor_id IN ({placeholder})", actor_ids)

    return {
        "case": inv[0],
        "actors": actors,
        "aliases": in_actor_ids("aliases"),
        "pgpKeys": in_actor_ids("pgp_keys"),
        "wallets": in_actor_ids("wallets"),
        "infrastructure": in_actor_ids("infrastructure"),
        "evidence": in_actor_ids("evidence"),
        "timeline": in_actor_ids("timeline_events"),
        "analystNotes": q("SELECT * FROM analyst_notes WHERE investigation_id = %s", (investigation_id,)),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "disclaimer": "Synthetic/demonstration data. Attribution shown as evidence-based confidence, not proof of identity.",
    }


# ------------------------------------------------------------------ demo ---
def _pg_array(raw) -> list:
    """SQLite stores Postgres array literals like '{Mixer Interaction,Foo}'
    as plain TEXT (see database._adapt_schema_for_sqlite) since sqlite has
    no native array type. Parse that back into a list for the API response.
    On Postgres, psycopg2 already returns a native Python list."""
    if raw is None:
        return []
    if isinstance(raw, list):
        return raw
    raw = raw.strip()
    if raw.startswith("{") and raw.endswith("}"):
        raw = raw[1:-1]
    return [item.strip() for item in raw.split(",") if item.strip()]


def _camel_actor(r):
    return {
        "id": r["id"], "alias": r["alias"], "confidence": r["confidence"],
        "category": r["category"], "firstSeen": r["first_seen"], "lastSeen": r["last_seen"],
        "status": r["status"], "riskLevel": r["risk_level"],
    }


def _camel_alias(r):
    return {"id": r["id"], "actorId": r["actor_id"], "handle": r["handle"],
            "platform": r["platform"], "firstSeen": r["first_seen"]}


def _camel_pgp(r):
    return {"id": r["id"], "actorId": r["actor_id"], "fingerprint": r["fingerprint"],
            "firstSeen": r["first_seen"], "reuseCount": r["reuse_count"]}


def _camel_wallet(r):
    return {
        "id": r["id"], "actorId": r["actor_id"], "chain": r["chain"], "address": r["address"],
        "txCount": r["tx_count"], "totalVolume": r["total_volume"],
        "firstSeen": r["first_seen"], "lastSeen": r["last_seen"],
        "riskIndicators": _pg_array(r["risk_indicators"]),
    }


def _camel_onion(r):
    return {"id": r["id"], "actorId": r["actor_id"], "address": r["address"], "status": r["status"],
            "banner": r["banner"], "descriptorConsistency": r["descriptor_consistency"]}


def _camel_infra(r):
    return {
        "id": r["id"], "onionId": r["onion_id"], "actorId": r["actor_id"],
        "candidateDomain": r["candidate_domain"], "candidateIP": r["candidate_ip"],
        "hostingProvider": r["hosting_provider"], "certRelationship": r["cert_relationship"],
        "serverFingerprint": r["server_fingerprint"], "fingerprint": r["fingerprint"],
        "confidence": r["confidence"],
    }


def _camel_relationship(r):
    return {"id": r["id"], "type": r["type"], "source": r["source_id"], "target": r["target_id"],
            "firstSeen": r["first_seen"], "lastSeen": r["last_seen"], "confidence": r["confidence"]}


def _camel_evidence(r):
    return {"id": r["id"], "actorId": r["actor_id"], "type": r["type"], "source": r["source"],
            "timestamp": r["timestamp"], "observation": r["observation"],
            "reliability": r["reliability"], "confidence": r["confidence"]}


def _camel_timeline(r):
    return {"id": r["id"], "actorId": r["actor_id"], "date": r["date"],
            "category": r["category"], "label": r["label"]}


def _camel_persona(r):
    return {"id": r["id"], "personaA": r["persona_a"], "personaB": r["persona_b"],
            "stylometric": r["stylometric"], "behaviour": r["behavioural"],
            "vocabulary": r["vocabulary"], "temporal": r["temporal"],
            "overall": r["overall"], "status": r["status"]}


def _camel_source(r):
    return {
        "id": r["id"], "name": r["name"], "reliability": r["reliability"],
        "factors": {
            "history": r["history_score"], "consistency": r["consistency_score"],
            "corroboration": r["corroboration_score"], "freshness": r["freshness_score"],
        },
    }


def _camel_attribution_factor(r):
    return {"label": r["label"], "weight": r["weight"]}


def _camel_attribution_matrix_row(r):
    return {"name": r["name"], "value": r["value"], "tag": r["tag"]}


def _assemble_demo_case_from_db() -> dict:
    """Assembles the full demo case payload from the DATABASE — the runtime
    source of truth. demo/demo_case.json is kept only as curated seed data
    (see database/seed.sql, generated from it) and as the frontend's
    OFFLINE DEMO FALLBACK if this endpoint is unreachable; it is never read
    here at request time."""
    inv_rows = q("SELECT * FROM investigations WHERE is_demo_case = %s LIMIT 1", (True,))
    if not inv_rows:
        raise HTTPException(404, "No demo case is marked in the database (investigations.is_demo_case)")
    inv = inv_rows[0]

    actor_rows = q("SELECT * FROM actors WHERE is_demo_primary = %s LIMIT 1", (True,))
    demo_actor_id = actor_rows[0]["id"] if actor_rows else None

    return {
        "demoCaseId": inv["id"],
        "demoActorId": demo_actor_id,
        "demoTimeline": [_camel_timeline(r) for r in
                          q("SELECT * FROM timeline_events WHERE is_demo_highlight = %s ORDER BY date", (True,))],
        "attributionFactors": [_camel_attribution_factor(r) for r in
                                q("SELECT * FROM attribution_factors WHERE investigation_id = %s ORDER BY sort_order",
                                  (inv["id"],))],
        "attributionMatrix": [_camel_attribution_matrix_row(r) for r in
                               q("SELECT * FROM attribution_matrix WHERE investigation_id = %s ORDER BY sort_order",
                                 (inv["id"],))],
        "overallAttribution": inv["overall_attribution"],
        "actors": [_camel_actor(r) for r in q("SELECT * FROM actors ORDER BY id")],
        "aliases": [_camel_alias(r) for r in q("SELECT * FROM aliases ORDER BY id")],
        "pgpKeys": [_camel_pgp(r) for r in q("SELECT * FROM pgp_keys ORDER BY id")],
        "wallets": [_camel_wallet(r) for r in q("SELECT * FROM wallets ORDER BY id")],
        "onionServices": [_camel_onion(r) for r in q("SELECT * FROM onion_services ORDER BY id")],
        "infrastructure": [_camel_infra(r) for r in q("SELECT * FROM infrastructure ORDER BY id")],
        "relationships": [_camel_relationship(r) for r in q("SELECT * FROM relationships ORDER BY id")],
        "evidence": [_camel_evidence(r) for r in q("SELECT * FROM evidence ORDER BY id")],
        "timelineEvents": [_camel_timeline(r) for r in q("SELECT * FROM timeline_events ORDER BY id")],
        "personaComparisons": [_camel_persona(r) for r in q("SELECT * FROM persona_matches ORDER BY id")],
        "sources": [_camel_source(r) for r in q("SELECT * FROM sources ORDER BY id")],
        "marketplaces": [r["name"] for r in q("SELECT name FROM marketplaces ORDER BY id")],
        "forums": [r["name"] for r in q("SELECT name FROM forums ORDER BY id")],
    }


@app.get("/api/demo/load")
def load_demo():
    """Returns the full curated demo case in the exact shape frontend/data.js
    already produces, so it's a drop-in for the existing UI (via
    frontend/api-client.js) — assembled from the DATABASE on every call, not
    from demo/demo_case.json (see _assemble_demo_case_from_db)."""
    return _assemble_demo_case_from_db()


# ------------------------------------------------------- static frontend ---
# Serves the untouched existing UI at "/" when the frontend/ folder is present.
# This keeps ONE public URL for the whole app on Render (Phase 17, Option A).
_frontend_dir = ROOT / "frontend"
if _frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(_frontend_dir), html=True), name="frontend")
