"""
Turns demo/demo_case.json into database/seed.sql (plain INSERT statements,
PostgreSQL-compatible). Run after generate_dataset.py:

    python -m app.services.generate_dataset
    python -m app.services.generate_seed_sql
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]


def esc(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        inner = ",".join(str(x).replace("'", "''") for x in v)
        return f"'{{{inner}}}'"
    return "'" + str(v).replace("'", "''") + "'"


def main():
    data = json.loads((ROOT / "demo" / "demo_case.json").read_text())
    lines = [
        "-- ============================================================",
        "-- DARKTRACE AI — SEED DATA (generated, synthetic, deterministic)",
        "-- Source: demo/demo_case.json — regenerate via",
        "--   python -m app.services.generate_dataset",
        "--   python -m app.services.generate_seed_sql",
        "-- ============================================================",
        "",
        f"INSERT INTO investigations (id, title, description, priority, status) VALUES",
        f"  ({esc(data['demoCaseId'])}, {esc('Dark Web Threat Actor Investigation')}, "
        f"{esc('Comprehensive attribution analysis and relationship mapping across multiple dark web sources and identifiers.')}, "
        f"{esc('HIGH PRIORITY')}, {esc('ACTIVE')})",
        "ON CONFLICT (id) DO NOTHING;",
        "",
    ]

    def bulk(table, cols, rows, mapper):
        if not rows:
            return
        lines.append(f"INSERT INTO {table} ({', '.join(cols)}) VALUES")
        vals = []
        for r in rows:
            vals.append("  (" + ", ".join(esc(v) for v in mapper(r)) + ")")
        lines.append(",\n".join(vals) + "\nON CONFLICT (id) DO NOTHING;\n")

    bulk("actors", ["id", "investigation_id", "alias", "confidence", "category", "first_seen", "last_seen", "status", "risk_level"],
         data["actors"],
         lambda a: [a["id"], data["demoCaseId"] if a["id"] == data["demoActorId"] else None, a["alias"], a["confidence"],
                    a["category"], a["firstSeen"], a["lastSeen"], a["status"], a["riskLevel"]])

    bulk("aliases", ["id", "actor_id", "handle", "platform", "first_seen"], data["aliases"],
         lambda a: [a["id"], a["actorId"], a["handle"], a["platform"], a["firstSeen"]])

    bulk("pgp_keys", ["id", "actor_id", "fingerprint", "first_seen", "reuse_count"], data["pgpKeys"],
         lambda p: [p["id"], p["actorId"], p["fingerprint"], p["firstSeen"], p["reuseCount"]])

    bulk("wallets", ["id", "actor_id", "chain", "address", "tx_count", "total_volume", "first_seen", "last_seen", "risk_indicators"],
         data["wallets"],
         lambda w: [w["id"], w["actorId"], w["chain"], w["address"], w["txCount"], w["totalVolume"],
                    w["firstSeen"], w["lastSeen"], w["riskIndicators"]])

    bulk("marketplaces", ["name"], [{"name": m} for m in data["marketplaces"]], lambda m: [m["name"]])
    bulk("forums", ["name"], [{"name": f} for f in data["forums"]], lambda f: [f["name"]])

    bulk("onion_services", ["id", "actor_id", "address", "status", "banner", "descriptor_consistency"],
         data["onionServices"],
         lambda o: [o["id"], o["actorId"], o["address"], o["status"], o["banner"], o["descriptorConsistency"]])

    bulk("infrastructure", ["id", "onion_id", "actor_id", "candidate_domain", "candidate_ip", "hosting_provider",
                             "cert_relationship", "server_fingerprint", "fingerprint", "confidence"],
         data["infrastructure"],
         lambda i: [i["id"], i["onionId"], i["actorId"], i["candidateDomain"], i["candidateIP"], i["hostingProvider"],
                    i["certRelationship"], i["serverFingerprint"], i["fingerprint"], i["confidence"]])

    bulk("relationships", ["id", "type", "source_id", "target_id", "first_seen", "last_seen", "confidence"],
         data["relationships"],
         lambda r: [r["id"], r["type"], r["source"], r["target"], r["firstSeen"], r["lastSeen"], r["confidence"]])

    bulk("sources", ["id", "name", "reliability", "history_score", "consistency_score", "corroboration_score", "freshness_score"],
         data["sources"],
         lambda s: [s["id"], s["name"], s["reliability"], s["factors"]["history"], s["factors"]["consistency"],
                    s["factors"]["corroboration"], s["factors"]["freshness"]])

    bulk("evidence", ["id", "actor_id", "type", "source", "\"timestamp\"", "observation", "reliability", "confidence"],
         data["evidence"],
         lambda e: [e["id"], e["actorId"], e["type"], e["source"], e["timestamp"], e["observation"],
                    e["reliability"], e["confidence"]])

    bulk("persona_matches", ["id", "persona_a", "persona_b", "stylometric", "behavioural", "vocabulary", "temporal", "overall", "status"],
         data["personaComparisons"],
         lambda p: [p["id"], p["personaA"], p["personaB"], p["stylometric"], p["behaviour"], p["vocabulary"],
                    p["temporal"], p["overall"], p["status"]])

    bulk("timeline_events", ["id", "actor_id", "investigation_id", "date", "category", "label"],
         data["timelineEvents"],
         lambda t: [t["id"], t["actorId"], data["demoCaseId"] if t["actorId"] == data["demoActorId"] else None,
                    t["date"], t["category"], t["label"]])

    bulk("analyst_notes", ["investigation_id", "author", "body", "pinned"],
         [
             {"author": "Analyst_007", "body": "Strong correlation between ShadowFox and Shadow_Fox based on PGP reuse, wallet activity and writing style. Infrastructure link further strengthens the hypothesis.", "pinned": True},
             {"author": "Analyst_004", "body": "Possible migration pattern observed in alias usage. Monitor new listings.", "pinned": False},
             {"author": "Analyst_002", "body": "Stylometry patterns nearly identical. Recommend continued monitoring.", "pinned": False},
         ],
         lambda n: [data["demoCaseId"], n["author"], n["body"], n["pinned"]])

    (ROOT / "database" / "seed.sql").write_text("\n".join(lines))
    print(f"Wrote database/seed.sql ({len((ROOT / 'database' / 'seed.sql').read_text().splitlines())} lines)")


if __name__ == "__main__":
    main()
