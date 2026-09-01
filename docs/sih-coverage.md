# SIH26151 Requirement Coverage Audit

Status key: **IMPLEMENTED** (working code exists and was verified in this
build), **SIMULATED** (implemented as a clearly-labeled demonstration, not a
live/production capability — matches Phase 13's ethical-operation
constraints), **PARTIAL** (a real, working subset exists; noted honestly
below rather than overclaimed).

| Requirement | Status | Where |
|---|---|---|
| Tor hidden-service infrastructure analysis | IMPLEMENTED | `onion_services` + `infrastructure` tables, `GET /api/infrastructure`, `GET /api/onion-services`; UI: Infra Scanner page. Uses "candidate infrastructure" / "candidate origin" / "evidence-based confidence" language throughout — never "real attacker IP". |
| Actor correlation (aliases, PGP, wallets, forums, marketplaces, infrastructure) | IMPLEMENTED | `relationships` table + `GET /api/relationships`, `GET /api/graph`; Actor Dossier page aggregates all linked entities per actor. |
| PGP intelligence + reuse detection | IMPLEMENTED | `pgp_keys` table, `GET /api/pgp`, `GET /api/pgp/reuse` (fingerprints shared across >1 actor). |
| Wallet intelligence | IMPLEMENTED, synthetic data only | `wallets` table (`is_synthetic` flag always TRUE), `GET /api/wallets`. UI clearly labels synthetic data. |
| Relationship graph (nodes/edges, click-to-inspect) | IMPLEMENTED | `GET /api/graph`; existing Relationship Constellation SVG view in `frontend/app.js`. |
| AI persona analysis (stylometry, behaviour, migration) | SIMULATED | `persona_matches` table, `GET /api/persona` — every response includes `"modelType": "DEMONSTRATION MODEL"` and an explicit disclaimer. No trained ML model is used or claimed. |
| Timeline reconstruction with filtering | IMPLEMENTED | `timeline_events` table, `GET /api/timeline?actor_id=&category=&start=&end=`. |
| Evidence system with provenance | IMPLEMENTED | `evidence` table, linked to `sources`; every record carries id, source, timestamp, observation, reliability, confidence. |
| Source reliability scoring | IMPLEMENTED | `sources` table (history/consistency/corroboration/freshness factors), `GET /api/sources`. |
| Explainable attribution confidence | IMPLEMENTED | `attributionFactors` / `attributionMatrix` in the demo case; per-actor confidence is a stored field, not a black-box score. |
| Correlation Sweep | SIMULATED | `scan_history` table, `GET/POST /api/scans`. Records deterministic, data-derived counters (sources scanned, new actors, etc.) for a demonstration sweep — **no live scanning of real Tor services or third-party infrastructure is performed**, consistent with Phase 13. |
| Demo mode / one-click case load | IMPLEMENTED | `GET /api/demo/load`, curated case `CASE-26151-07`; UI's existing "LOAD DEMO INVESTIGATION" control. |
| GUI (existing DARKTRACE UI) | IMPLEMENTED, unmodified | `frontend/index.html`, `app.js`, `data.js`, `styles.css` — preserved exactly per Phase 2. |
| CSV / JSON export | IMPLEMENTED | `GET /api/reports/{id}.json`, `GET /api/reports/{id}.csv`; frontend also has its own client-side JSON/CSV/print-to-PDF export already built in. |
| PDF-style report | PARTIAL | Frontend ships print-to-PDF (browser print dialog → Save as PDF) for the UI's own report view. The backend does not render a server-side PDF binary in this build — JSON/CSV are served directly; PDF is produced client-side via print. This is stated here rather than left implied. |
| Ethical/legal safety language | IMPLEMENTED | "Candidate attribution", "candidate infrastructure", "evidence-based confidence" used throughout data model, API responses, and UI copy; no endpoint or UI string claims guaranteed deanonymization. |

## Honesty note

Per the project brief's own instruction not to falsely claim functionality:
this build's "AI" persona-similarity scoring and "autonomous scan" are
**deterministic, seeded demonstrations** designed to tell a coherent story
for judges — they are not live ML inference or live infrastructure scanning.
That is stated in the API responses themselves (`modelType` /
`disclaimer` fields), not just in this document.
