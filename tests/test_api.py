"""
DARKTRACE AI — backend API tests.

Run with:
    cd backend
    pip install -r requirements.txt
    pip install pytest
    pytest ../tests/test_api.py -v

Uses FastAPI's TestClient (sync, backed by httpx) against an in-process
app instance. Each test session gets a fresh SQLite DB at
database/darktrace.db (deleted before the run so seed data is
deterministic) — do not point DATABASE_URL at a production database
when running these tests.
"""
import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

# Force a clean local SQLite DB for the test run so seeding is predictable.
_TEST_DB = ROOT / "database" / "darktrace_test.db"
if _TEST_DB.exists():
    _TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB}"

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402

# Entering TestClient as a context manager is what actually runs the app's
# lifespan startup (init_db) before any request is made — plain
# `TestClient(app)` without `with` does NOT trigger it, which was why every
# test that touched a table (actors, investigations, sources, ...) failed
# with "no such table". `__enter__` here at module scope is equivalent to
# `with TestClient(app) as client:` wrapping the whole test file; `__exit__`
# is registered with atexit so shutdown still runs once, after every test
# below (which all just reference the plain `client` name, unchanged).
import atexit  # noqa: E402

_client_ctx = TestClient(app)
client = _client_ctx.__enter__()
atexit.register(_client_ctx.__exit__, None, None, None)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_demo_load_shape():
    r = client.get("/api/demo/load")
    assert r.status_code == 200
    data = r.json()
    for key in ["actors", "aliases", "pgpKeys", "wallets", "infrastructure",
                "relationships", "evidence", "timelineEvents", "demoActorId",
                "demoCaseId", "attributionMatrix", "overallAttribution"]:
        assert key in data, f"demo_case.json missing expected key: {key}"
    assert data["demoCaseId"] == "CASE-26151-07"
    assert len(data["actors"]) > 0


def test_demo_load_is_deterministic_across_calls():
    r1 = client.get("/api/demo/load").json()
    r2 = client.get("/api/demo/load").json()
    assert r1 == r2, "GET /api/demo/load must return the same fixed case every time"


def test_list_actors():
    r = client.get("/api/actors")
    assert r.status_code == 200
    actors = r.json()
    assert isinstance(actors, list)
    assert len(actors) > 0


def test_get_actor_detail_includes_related_entities():
    actors = client.get("/api/actors").json()
    assert actors, "seed data should include at least one actor"
    actor_id = actors[0]["id"]
    r = client.get(f"/api/actors/{actor_id}")
    assert r.status_code == 200
    detail = r.json()
    for key in ["aliases", "pgpKeys", "wallets", "onionServices",
                "infrastructure", "evidence", "timeline", "relationships"]:
        assert key in detail


def test_get_actor_404_for_unknown_id():
    r = client.get("/api/actors/NOT-A-REAL-ID")
    assert r.status_code == 404


def test_notes_crud_and_persistence():
    """Notes must survive being re-fetched (this is what 'persistence' means)."""
    # Need an investigation row to attach a note to (FK constraint on Postgres;
    # SQLite is lenient but we still exercise the real investigations flow).
    inv = client.post("/api/investigations", json={
        "id": "CASE-TEST-01", "title": "Test Investigation",
    })
    assert inv.status_code == 200

    create = client.post("/api/notes", json={
        "investigation_id": "CASE-TEST-01",
        "author": "Analyst_Test",
        "body": "This note should persist across a refresh.",
    })
    assert create.status_code == 200
    note = create.json()
    assert note["body"] == "This note should persist across a refresh."
    note_id = note["id"]

    listed = client.get("/api/notes", params={"investigation_id": "CASE-TEST-01"})
    assert listed.status_code == 200
    bodies = [n["body"] for n in listed.json()]
    assert "This note should persist across a refresh." in bodies

    deleted = client.delete(f"/api/notes/{note_id}")
    assert deleted.status_code == 200
    assert deleted.json()["deleted"] is True

    listed_after = client.get("/api/notes", params={"investigation_id": "CASE-TEST-01"}).json()
    assert note_id not in [n["id"] for n in listed_after]


def test_notes_requires_body():
    r = client.post("/api/notes", json={"investigation_id": "CASE-TEST-01", "body": ""})
    assert r.status_code == 400


def test_correlation_sweep_persists_and_is_deterministic():
    r1 = client.post("/api/scans", json={"action": "start"})
    assert r1.status_code == 200
    result1 = r1.json()
    assert result1["status"] == "COMPLETED"
    assert result1["sources_scanned"] >= 0

    r2 = client.post("/api/scans", json={"action": "start"})
    result2 = r2.json()
    # Same seeded/static dataset => same derived counts every run.
    for key in ["sources_scanned", "new_actors", "new_relationships",
                "new_infrastructure", "new_wallet_links", "persona_changes"]:
        assert result1[key] == result2[key], f"Correlation Sweep counts for {key} should be deterministic"

    history = client.get("/api/scans")
    assert history.status_code == 200
    assert len(history.json()) >= 2


def test_report_generation_for_unknown_investigation_404s():
    r = client.get("/api/reports/NOT-A-REAL-CASE.json")
    assert r.status_code == 404
