"""
Database engine setup.

Defaults to a local SQLite file so `uvicorn app.main:app --reload` works with
zero external setup. Set DATABASE_URL (e.g. the Render-provided Postgres URL)
to use PostgreSQL in production — the schema in database/schema.sql is
written for Postgres; init_db() below auto-adapts a small number of
Postgres-only syntax bits (SERIAL, TEXT[], JSONB) when running on SQLite so
local dev "just works" too.
"""
import os
import re
import sqlite3
from pathlib import Path
from contextlib import contextmanager

ROOT = Path(__file__).resolve().parents[2]
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{ROOT / 'database' / 'darktrace.db'}")
IS_SQLITE = DATABASE_URL.startswith("sqlite")


def _sqlite_path():
    return DATABASE_URL.replace("sqlite:///", "")


def _strip_sql_comments(sql: str) -> str:
    """Remove `-- ...` line comments so stray ';' inside comments can't break
    naive statement splitting, and so downstream regexes only see real SQL."""
    return "\n".join(line.split("--", 1)[0] for line in sql.splitlines())


def _strip_balanced_check(sql: str) -> str:
    """Remove CHECK (...) constraints, including one level of nested parens
    (e.g. CHECK (x IN ('a', 'b')))."""
    out = []
    i = 0
    while i < len(sql):
        if sql[i:i + 5] == "CHECK":
            j = sql.find("(", i)
            depth = 0
            k = j
            while k < len(sql):
                if sql[k] == "(":
                    depth += 1
                elif sql[k] == ")":
                    depth -= 1
                    if depth == 0:
                        break
                k += 1
            i = k + 1
            continue
        out.append(sql[i])
        i += 1
    return "".join(out)


def _adapt_schema_for_sqlite(sql: str) -> str:
    sql = _strip_sql_comments(sql)
    sql = re.sub(r"\bSERIAL\b", "INTEGER", sql)
    sql = re.sub(r"\bTIMESTAMPTZ\b", "TEXT", sql)
    sql = re.sub(r"\bJSONB\b", "TEXT", sql)
    sql = re.sub(r"\bTEXT\[\]", "TEXT", sql)
    sql = re.sub(r"DEFAULT now\(\)", "DEFAULT CURRENT_TIMESTAMP", sql)
    sql = re.sub(r"ON CONFLICT \([^)]*\) DO NOTHING", "", sql)
    sql = re.sub(r"^INSERT INTO", "INSERT OR IGNORE INTO", sql, flags=re.MULTILINE)
    sql = _strip_balanced_check(sql)
    # strip ALTER TABLE ... ADD CONSTRAINT (sqlite ALTER support is limited) — safe now that
    # comments are gone, so '.' won't accidentally cross statement boundaries via a comment ';'
    sql = re.sub(r"ALTER TABLE.*?;", "", sql, flags=re.DOTALL)
    return sql


@contextmanager
def get_conn():
    if IS_SQLITE:
        conn = sqlite3.connect(_sqlite_path())
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()
    else:
        import psycopg2
        import psycopg2.extras
        conn = psycopg2.connect(DATABASE_URL)
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()


def dict_rows(cur):
    cols = [c[0] for c in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


def db_status() -> dict:
    """Real connectivity check — never fake ONLINE. Returns database
    type + whether a trivial query actually succeeds right now."""
    db_type = "sqlite" if IS_SQLITE else "postgresql"
    try:
        with get_conn() as conn:
            conn.cursor().execute("SELECT 1")
        return {"connected": True, "type": db_type}
    except Exception:
        return {"connected": False, "type": db_type}


def init_db(seed: bool = True):
    """Create tables (and seed demo data) if they don't already exist."""
    schema_sql = (ROOT / "database" / "schema.sql").read_text()
    seed_sql = (ROOT / "database" / "seed.sql").read_text() if seed else ""

    if IS_SQLITE:
        schema_sql = _adapt_schema_for_sqlite(schema_sql)
        seed_sql = _adapt_schema_for_sqlite(seed_sql)
    else:
        # Postgres accepts the schema/seed files as authored, but comments
        # still need stripping first since naive ';' splitting would
        # otherwise break on a semicolon that appears inside a comment.
        schema_sql = _strip_sql_comments(schema_sql)
        seed_sql = _strip_sql_comments(seed_sql)

    with get_conn() as conn:
        cur = conn.cursor()
        for statement in schema_sql.split(";"):
            statement = statement.strip()
            if statement:
                cur.execute(statement)
        if seed:
            for statement in seed_sql.split(";"):
                statement = statement.strip()
                if statement and not statement.startswith("--"):
                    try:
                        cur.execute(statement)
                    except Exception:
                        pass  # already seeded / duplicate — safe to ignore
