-- ============================================================
-- DARKTRACE AI — DATABASE SCHEMA (PostgreSQL)
-- SIH 2026 — SIH26151 — Cybersecurity & Blockchain
-- All data represented by this schema is intended to hold only
-- synthetic/demonstration or authorized data. No real individuals,
-- credentials, wallets, or infrastructure should ever be stored here.
-- ============================================================

CREATE TABLE IF NOT EXISTS investigations (
    id              TEXT PRIMARY KEY,               -- e.g. CASE-26151-07
    title           TEXT NOT NULL,
    description     TEXT,
    priority        TEXT DEFAULT 'MODERATE',
    status          TEXT DEFAULT 'ACTIVE',
    overall_attribution INTEGER CHECK (overall_attribution BETWEEN 0 AND 100),
    is_demo_case    BOOLEAN DEFAULT FALSE,            -- flags the ONE case /api/demo/load serves
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actors (
    id              TEXT PRIMARY KEY,               -- ACT-001
    investigation_id TEXT REFERENCES investigations(id) ON DELETE SET NULL,
    alias           TEXT NOT NULL,
    confidence      INTEGER CHECK (confidence BETWEEN 0 AND 100),
    category        TEXT,
    first_seen      DATE,
    last_seen       DATE,
    status          TEXT,
    risk_level      TEXT,
    is_demo_primary BOOLEAN DEFAULT FALSE,            -- flags the primary actor of the demo case
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Weighted factors behind the demo case's attribution score
-- (Section: "Attribution Factors" panel on Case Nexus).
CREATE TABLE IF NOT EXISTS attribution_factors (
    id              TEXT PRIMARY KEY,               -- AF-001
    investigation_id TEXT REFERENCES investigations(id) ON DELETE CASCADE,
    label           TEXT NOT NULL,
    weight          INTEGER,
    sort_order      INTEGER DEFAULT 0
);

-- Per-signal attribution matrix rows (Section: "Attribution Matrix" panel).
CREATE TABLE IF NOT EXISTS attribution_matrix (
    id              TEXT PRIMARY KEY,               -- AM-001
    investigation_id TEXT REFERENCES investigations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    value           INTEGER,
    tag             TEXT,
    sort_order      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS aliases (
    id              TEXT PRIMARY KEY,               -- AL-001
    actor_id        TEXT REFERENCES actors(id) ON DELETE CASCADE,
    handle          TEXT NOT NULL,
    platform        TEXT,
    first_seen      DATE
);

CREATE TABLE IF NOT EXISTS pgp_keys (
    id              TEXT PRIMARY KEY,               -- PGP-001
    actor_id        TEXT REFERENCES actors(id) ON DELETE CASCADE,
    fingerprint     TEXT NOT NULL,
    first_seen      DATE,
    reuse_count     INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wallets (
    id              TEXT PRIMARY KEY,               -- WAL-001
    actor_id        TEXT REFERENCES actors(id) ON DELETE CASCADE,
    chain           TEXT CHECK (chain IN ('Bitcoin', 'Ethereum')),
    address         TEXT NOT NULL,
    tx_count        INTEGER DEFAULT 0,
    total_volume    NUMERIC(20, 6) DEFAULT 0,
    first_seen      DATE,
    last_seen       DATE,
    risk_indicators TEXT[],                          -- e.g. {Mixer Interaction,Marketplace Payout}
    is_synthetic    BOOLEAN DEFAULT TRUE              -- always TRUE in this build - never real chain data
);

CREATE TABLE IF NOT EXISTS marketplaces (
    id              SERIAL PRIMARY KEY,
    name            TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS forums (
    id              SERIAL PRIMARY KEY,
    name            TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS onion_services (
    id                      TEXT PRIMARY KEY,       -- ONI-001
    actor_id                TEXT REFERENCES actors(id) ON DELETE CASCADE,
    address                 TEXT NOT NULL,
    status                  TEXT,
    banner                  TEXT,
    descriptor_consistency  TEXT
);

CREATE TABLE IF NOT EXISTS certificates (
    id              TEXT PRIMARY KEY,               -- CERT-001
    infrastructure_id TEXT,                          -- FK added below after infrastructure table exists
    common_name     TEXT,
    san_domains     TEXT[],
    issuer          TEXT,
    first_seen      DATE
);

CREATE TABLE IF NOT EXISTS infrastructure (
    id                  TEXT PRIMARY KEY,           -- INF-001
    onion_id            TEXT REFERENCES onion_services(id) ON DELETE SET NULL,
    actor_id            TEXT REFERENCES actors(id) ON DELETE CASCADE,
    candidate_domain    TEXT,                        -- "candidate", never asserted as ground truth
    candidate_ip        TEXT,
    hosting_provider    TEXT,
    cert_relationship   TEXT,                        -- MATCH / PARTIAL MATCH / NO MATCH
    server_fingerprint  TEXT,                         -- SIMILAR / IDENTICAL PATTERN / WEAK CORRELATION
    fingerprint         TEXT,
    confidence          INTEGER CHECK (confidence BETWEEN 0 AND 100)
);

ALTER TABLE certificates
    ADD CONSTRAINT fk_certificates_infrastructure
    FOREIGN KEY (infrastructure_id) REFERENCES infrastructure(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS relationships (
    id              TEXT PRIMARY KEY,               -- REL-001
    type            TEXT NOT NULL,                   -- USES / REUSED / ASSOCIATED_WITH / TRUSTS / ...
    source_id       TEXT NOT NULL,                   -- polymorphic reference (actor/alias/wallet/pgp/etc id)
    target_id       TEXT NOT NULL,
    first_seen      DATE,
    last_seen       DATE,
    confidence      INTEGER CHECK (confidence BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS sources (
    id              TEXT PRIMARY KEY,               -- SRC-01
    name            TEXT NOT NULL,
    reliability     INTEGER CHECK (reliability BETWEEN 0 AND 100),
    history_score       INTEGER,
    consistency_score   INTEGER,
    corroboration_score INTEGER,
    freshness_score      INTEGER
);

CREATE TABLE IF NOT EXISTS evidence (
    id              TEXT PRIMARY KEY,               -- DT-EV-00001
    actor_id        TEXT REFERENCES actors(id) ON DELETE CASCADE,
    relationship_id TEXT REFERENCES relationships(id) ON DELETE SET NULL,
    type            TEXT,
    source          TEXT,
    source_id       TEXT REFERENCES sources(id) ON DELETE SET NULL,
    "timestamp"     DATE,
    observation     TEXT,
    reliability     TEXT CHECK (reliability IN ('HIGH', 'MEDIUM', 'LOW')),
    confidence      INTEGER CHECK (confidence BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS persona_profiles (
    id              TEXT PRIMARY KEY,               -- PP-001
    actor_id        TEXT REFERENCES actors(id) ON DELETE CASCADE,
    label           TEXT,
    stylometry_vector JSONB,
    model_type      TEXT DEFAULT 'DEMONSTRATION MODEL'
);

CREATE TABLE IF NOT EXISTS persona_matches (
    id              TEXT PRIMARY KEY,               -- PM-001
    persona_a       TEXT NOT NULL,
    persona_b       TEXT NOT NULL,
    stylometric     INTEGER,
    behavioural     INTEGER,
    vocabulary      INTEGER,
    temporal        INTEGER,
    overall         INTEGER,
    status          TEXT,                            -- POTENTIAL MIGRATION / PARTIAL SIMILARITY / LOW SIMILARITY
    model_type      TEXT DEFAULT 'DEMONSTRATION MODEL'
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id              TEXT PRIMARY KEY,               -- TL-001
    actor_id        TEXT REFERENCES actors(id) ON DELETE CASCADE,
    investigation_id TEXT REFERENCES investigations(id) ON DELETE SET NULL,
    date            DATE,
    category        TEXT,
    label           TEXT,
    is_demo_highlight BOOLEAN DEFAULT FALSE           -- curated subset shown as "demoTimeline"
);

CREATE TABLE IF NOT EXISTS reports (
    id              SERIAL PRIMARY KEY,
    investigation_id TEXT REFERENCES investigations(id) ON DELETE CASCADE,
    format          TEXT CHECK (format IN ('JSON', 'CSV', 'PDF')),
    generated_at    TIMESTAMPTZ DEFAULT now(),
    file_path       TEXT
);

CREATE TABLE IF NOT EXISTS analyst_notes (
    id              SERIAL PRIMARY KEY,
    investigation_id TEXT REFERENCES investigations(id) ON DELETE CASCADE,
    author          TEXT,
    body            TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    pinned          BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS scan_history (
    id              SERIAL PRIMARY KEY,
    started_at      TIMESTAMPTZ DEFAULT now(),
    ended_at        TIMESTAMPTZ,
    status          TEXT DEFAULT 'RUNNING',          -- RUNNING / PAUSED / STOPPED / COMPLETED
    sources_scanned INTEGER DEFAULT 0,
    new_actors      INTEGER DEFAULT 0,
    new_relationships INTEGER DEFAULT 0,
    new_infrastructure INTEGER DEFAULT 0,
    new_wallet_links INTEGER DEFAULT 0,
    persona_changes INTEGER DEFAULT 0
);

-- Indexes for the join/filter patterns the API and graph views rely on
CREATE INDEX IF NOT EXISTS idx_aliases_actor          ON aliases(actor_id);
CREATE INDEX IF NOT EXISTS idx_pgp_actor               ON pgp_keys(actor_id);
CREATE INDEX IF NOT EXISTS idx_wallets_actor           ON wallets(actor_id);
CREATE INDEX IF NOT EXISTS idx_onion_actor             ON onion_services(actor_id);
CREATE INDEX IF NOT EXISTS idx_infra_actor             ON infrastructure(actor_id);
CREATE INDEX IF NOT EXISTS idx_relationships_source    ON relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target    ON relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_evidence_actor          ON evidence(actor_id);
CREATE INDEX IF NOT EXISTS idx_timeline_actor          ON timeline_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_timeline_date           ON timeline_events(date);
