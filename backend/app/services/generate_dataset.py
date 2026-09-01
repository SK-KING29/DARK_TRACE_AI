"""
DARKTRACE AI — synthetic dataset generator (backend-side).

Ports the logic of frontend/data.js into deterministic, seeded Python so the
backend/database can serve the exact same shape of data the existing UI
already expects. All entities are fictional. No real individuals,
credentials, wallets, or infrastructure are represented anywhere.

Run directly to (re)generate demo/demo_case.json and database/seed.sql:
    python -m app.services.generate_dataset
"""
import json
import random
from pathlib import Path

random.seed(26151)  # deterministic across runs — same "randomness" every time

CATEGORIES = ["Credential Trading", "Ransomware Affiliate", "Access Broker", "Carding Operation",
              "Malware Distribution", "Data Extortion", "Exploit Sales", "Money Laundering Services"]

MARKETPLACES = ["ObsidianBazaar", "GreyLedger", "VaultXchange", "NightRoute Market",
                "CipherRow", "DarkAtlas", "ShadowFerry Market", "RedlineMart", "Quietus Market", "IronVeil Bazaar"]

FORUMS = ["BreachTalk", "CipherNode Forum", "UnderRoot", "Exfil Lounge", "GhostWire Forum",
          "Zero Ledger Board", "Nullpoint Community", "DarkSignal Forum", "Wraithchan", "Backdoor Bulletin",
          "SilentStack Forum", "OnionCourt", "LatentRoot", "Coalburn Forum", "Redcell Board"]

ALIAS_PREFIXES = ["Shadow", "Ghost", "Null", "Cipher", "Vector", "Wraith", "Obsidian", "Ferrous",
                  "Nyx", "Ashen", "Onyx", "Cold", "Silent", "Redline", "Blackglass", "Wire", "Static", "Drift"]
ALIAS_SUFFIXES = ["Vector", "Node", "Route", "Byte", "Fox", "Reaper", "Ledger", "Root", "Signal",
                  "Drift", "Hex", "Vault", "Wraith", "Point", "Runner", "Cell", "Cinder", "Frost"]

RELIABILITY_LEVELS = ["HIGH", "MEDIUM", "LOW"]

ACTOR_NAMES = ["ShadowVector", "NullFerrous", "CipherWraith", "AshenRoute", "ObsidianDrift",
               "ColdSignal", "RedlineFox", "BlackglassNode", "NyxRunner", "VaultCinder", "StaticReaper", "WireHex"]

# Extra names so the dataset comfortably clears SIH26151 minimums (12 actors / 30 aliases / etc.)
ACTOR_NAMES_EXTRA = ["FrostWraith", "EmberRoot", "PhantomLedger", "QuietCinder", "HalcyonBreach",
                      "IronVector", "MonochromeFox", "LatentSignal"]
ALL_ACTOR_NAMES = ACTOR_NAMES + ACTOR_NAMES_EXTRA  # 20 actors total


def pad(n, w):
    return str(n).zfill(w)


def rand_date(y1, m1, y2, m2):
    import datetime
    start = datetime.date(y1, m1, 1).toordinal()
    end = datetime.date(y2, m2, 28).toordinal()
    return datetime.date.fromordinal(random.randint(start, end)).isoformat()


def gen_alias():
    style = random.randint(0, 2)
    if style == 0:
        return random.choice(ALIAS_PREFIXES) + random.choice(ALIAS_SUFFIXES)
    if style == 1:
        return random.choice(ALIAS_PREFIXES) + "_" + random.choice(["ops", "market", "x", "net", "dev", "prime"])
    return random.choice(ALIAS_SUFFIXES).lower() + str(random.randint(10, 99))


def gen_pgp():
    return "0x" + "".join(random.choice("0123456789ABCDEF") for _ in range(16))


def gen_onion():
    chars = "abcdefghijklmnopqrstuvwxyz234567"
    return "".join(random.choice(chars) for _ in range(16)) + ".onion"


def gen_btc_wallet():
    chars = "023456789acdefghjklmnpqrstuvwxyz"
    return "bc1q" + "".join(random.choice(chars) for _ in range(30))


def gen_eth_wallet():
    chars = "0123456789abcdef"
    return "0x" + "".join(random.choice(chars) for _ in range(40))


def gen_ip():
    return f"{random.randint(20,220)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"


def gen_domain():
    words = ["meridian", "vertex", "haloway", "cinderpath", "brightloop", "colderas", "novanet",
             "quietfield", "greylatch", "ironforge", "solstice", "farrowline", "duskgate", "amberport"]
    tld = random.choice(["com", "net", "io", "co", "biz"])
    suffix = random.choice(["solutions", "systems", "networks", "hosting", "group", "labs"])
    return f"{random.choice(words)}-{suffix}.{tld}"


def gen_fingerprint():
    raw = "".join(random.choice("0123456789abcdef") for _ in range(40))
    groups = [raw[i:i + 4] for i in range(0, len(raw), 4)]
    return ":".join(groups)[:59]


def build_dataset():
    actors = []
    for i, name in enumerate(ALL_ACTOR_NAMES):
        actors.append({
            "id": f"ACT-{pad(i+1,3)}", "alias": name, "confidence": random.randint(52, 94),
            "category": random.choice(CATEGORIES), "firstSeen": rand_date(2024, 6, 2025, 12),
            "lastSeen": rand_date(2026, 1, 2026, 8),
            "status": random.choice(["MONITORED", "ACTIVE INVESTIGATION", "DORMANT", "UNDER REVIEW"]),
            "riskLevel": random.choice(["MODERATE", "ELEVATED", "HIGH"]),
        })

    aliases = []
    for i in range(36):
        actor = random.choice(actors)
        aliases.append({
            "id": f"AL-{pad(i+1,3)}", "actorId": actor["id"], "handle": gen_alias(),
            "platform": random.choice(MARKETPLACES + FORUMS), "firstSeen": rand_date(2024, 6, 2026, 6),
        })

    pgp_keys = []
    for i in range(18):
        actor = random.choice(actors)
        pgp_keys.append({
            "id": f"PGP-{pad(i+1,3)}", "actorId": actor["id"],
            "fingerprint": gen_pgp() + "…" + gen_pgp()[2:6],
            "firstSeen": rand_date(2024, 8, 2026, 5), "reuseCount": random.randint(1, 4),
        })

    wallets = []
    for i in range(24):
        actor = random.choice(actors)
        chain = random.choice(["Bitcoin", "Ethereum"])
        wallets.append({
            "id": f"WAL-{pad(i+1,3)}", "actorId": actor["id"], "chain": chain,
            "address": gen_btc_wallet() if chain == "Bitcoin" else gen_eth_wallet(),
            "txCount": random.randint(8, 640), "totalVolume": round(random.random() * 40 + 0.2, 3),
            "firstSeen": rand_date(2024, 6, 2025, 12), "lastSeen": rand_date(2026, 1, 2026, 8),
            "riskIndicators": random.choice([["Mixer Interaction"], ["Marketplace Payout"],
                                              ["Rapid Transfer Chain"],
                                              ["Mixer Interaction", "Marketplace Payout"], []]),
        })

    onion_services = []
    for i in range(14):
        actor = random.choice(actors)
        onion_services.append({
            "id": f"ONI-{pad(i+1,3)}", "actorId": actor["id"], "address": gen_onion(),
            "status": random.choice(["ONLINE", "OFFLINE", "INTERMITTENT"]),
            "banner": random.choice(["nginx/1.18.0 (Ubuntu)", "Apache/2.4.41", "nginx/1.22.1",
                                      "lighttpd/1.4.55", "Caddy/2.6.4"]),
            "descriptorConsistency": random.choice(["CONSISTENT", "MINOR DEVIATION", "INCONSISTENT"]),
        })

    infrastructure = []
    for i in range(18):
        onion = random.choice(onion_services)
        infrastructure.append({
            "id": f"INF-{pad(i+1,3)}", "onionId": onion["id"], "actorId": onion["actorId"],
            "candidateDomain": gen_domain(), "candidateIP": gen_ip(),
            "hostingProvider": random.choice(["Cloak Networks Ltd", "Meridian Hosting", "Vertex Systems",
                                               "Farrow Cloud", "Coldpath Data Centers", "Halo Colocation"]),
            "certRelationship": random.choice(["MATCH", "PARTIAL MATCH", "NO MATCH"]),
            "serverFingerprint": random.choice(["SIMILAR", "IDENTICAL PATTERN", "WEAK CORRELATION"]),
            "fingerprint": gen_fingerprint(), "confidence": random.randint(41, 91),
        })

    rel_types = ["USES", "CONTROLS", "ASSOCIATED_WITH", "REUSED", "TRUSTS", "POSTED_ON", "FUNDED",
                 "HOSTED_ON", "RELATED_TO"]
    relationships = []
    candidate_targets = ([a["id"] for a in actors] + [a["id"] for a in aliases] +
                          [w["id"] for w in wallets] + [p["id"] for p in pgp_keys])
    for i in range(44):
        a = random.choice(actors)
        b = random.choice(candidate_targets)
        relationships.append({
            "id": f"REL-{pad(i+1,3)}", "type": random.choice(rel_types), "source": a["id"], "target": b,
            "firstSeen": rand_date(2024, 6, 2026, 4), "lastSeen": rand_date(2026, 1, 2026, 8),
            "confidence": random.randint(48, 96),
        })

    evidence_types = ["Identifier Reuse", "Infrastructure Correlation", "Stylometric Match",
                       "Wallet Relationship", "Behavioural Pattern", "Certificate Relationship", "Descriptor Match"]
    evidence_sources = ["Marketplace Forum", "Dark-Web Crawl", "Certificate Transparency Log",
                         "Blockchain Ledger Analysis", "Forum Archive", "Infrastructure Scan (Authorized)",
                         "OSINT Correlation"]
    observations = [
        "Same PGP fingerprint used across two distinct aliases",
        "Wallet payout pattern matches prior marketplace vendor account",
        "TLS certificate SAN overlaps with previously flagged clearnet domain",
        "Writing style similarity exceeds threshold across forum posts",
        "Server banner and fingerprint match a previously catalogued hidden service",
        "Posting time distribution consistent with a known persona",
        "Descriptor inconsistency suggests shared hosting infrastructure",
        "Vocabulary and punctuation pattern consistent with prior persona",
    ]
    evidence = []
    for i in range(34):
        actor = random.choice(actors)
        reliability = random.choice(RELIABILITY_LEVELS)
        conf = (random.randint(85, 98) if reliability == "HIGH" else
                random.randint(60, 84) if reliability == "MEDIUM" else random.randint(30, 59))
        evidence.append({
            "id": f"DT-EV-{pad(i+1,5)}", "actorId": actor["id"], "type": random.choice(evidence_types),
            "source": random.choice(evidence_sources), "timestamp": rand_date(2024, 6, 2026, 8),
            "observation": random.choice(observations), "reliability": reliability, "confidence": conf,
        })

    tl_cats = ["Identity", "Infrastructure", "Blockchain", "Persona", "Marketplace"]
    tl_labels = {"Identity": "New alias observed", "Infrastructure": "Infrastructure relationship detected",
                 "Blockchain": "Wallet association identified", "Persona": "Potential persona migration flagged",
                 "Marketplace": "Marketplace account activity change"}
    timeline_events = []
    for i in range(28):
        actor = random.choice(actors)
        cat = random.choice(tl_cats)
        timeline_events.append({
            "id": f"TL-{pad(i+1,3)}", "actorId": actor["id"], "date": rand_date(2024, 6, 2026, 8),
            "category": cat, "label": tl_labels[cat],
        })
    timeline_events.sort(key=lambda e: e["date"])

    persona_comparisons = []
    for i in range(12):
        a1 = random.choice(actors)
        a2 = random.choice(actors)
        while a2["id"] == a1["id"]:
            a2 = random.choice(actors)
        stylometric, behaviour = random.randint(58, 95), random.randint(55, 92)
        vocabulary, temporal = random.randint(60, 96), random.randint(45, 88)
        overall = round((stylometric + behaviour + vocabulary + temporal) / 4)
        persona_comparisons.append({
            "id": f"PM-{pad(i+1,3)}", "personaA": a1["alias"], "personaB": a2["alias"],
            "stylometric": stylometric, "behaviour": behaviour, "vocabulary": vocabulary, "temporal": temporal,
            "overall": overall,
            "status": ("POTENTIAL MIGRATION" if overall >= 80 else
                       "PARTIAL SIMILARITY" if overall >= 60 else "LOW SIMILARITY"),
        })

    sources = [{"id": f"SRC-{pad(i+1,2)}", "name": name, "reliability": random.randint(38, 95),
                "factors": {"history": random.randint(40, 98), "consistency": random.randint(40, 98),
                            "corroboration": random.randint(30, 98), "freshness": random.randint(30, 98)}}
               for i, name in enumerate(evidence_sources)]

    # ---- curated demo case overrides (CASE-26151-07 / ShadowFox), matches frontend/data.js ----
    demo_actor = actors[0]
    demo_actor.update({"alias": "ShadowFox", "confidence": 88, "category": "Credential Trading",
                        "firstSeen": "2025-11-04", "lastSeen": "2026-08-29",
                        "status": "ACTIVE INVESTIGATION", "riskLevel": "HIGH PRIORITY"})

    demo_alias_handles = ["Shadow_Fox", "SF_Market", "foxshadow_ops"]
    for a, handle in zip(aliases[:3], demo_alias_handles):
        a["actorId"], a["handle"] = demo_actor["id"], handle

    demo_pgp_fps = ["ABC1 23F0 89AA D62E", "2C77 E4A1 F3B9 D0AA"]
    for p, fp in zip(pgp_keys[:2], demo_pgp_fps):
        p["actorId"], p["fingerprint"], p["reuseCount"] = demo_actor["id"], fp, 2

    for w in wallets[:4]:
        w["actorId"] = demo_actor["id"]
    for o in onion_services[:2]:
        o["actorId"] = demo_actor["id"]
    for i, inf in enumerate(infrastructure[:2]):
        inf["actorId"] = demo_actor["id"]
        inf["onionId"] = onion_services[i]["id"]
        inf["confidence"] = 78 if i == 0 else 63
        inf["certRelationship"] = "MATCH" if i == 0 else "PARTIAL MATCH"
        inf["serverFingerprint"] = "SIMILAR" if i == 0 else "WEAK CORRELATION"
    for ev in evidence[:8]:
        ev["actorId"] = demo_actor["id"]
    evidence[0].update({"observation": "Same PGP fingerprint used by two aliases (Shadow_Fox, SF_Market)",
                         "reliability": "HIGH", "confidence": 94, "source": "Marketplace Forum",
                         "type": "Identifier Reuse"})
    persona_comparisons[0].update({"personaA": "ShadowFox (prior)", "personaB": "Shadow_Fox (alias)",
                                    "stylometric": 84, "behaviour": 79, "vocabulary": 88, "temporal": 72,
                                    "overall": 83, "status": "POTENTIAL MIGRATION"})

    demo_timeline = [
        {"id": "TL-D01", "actorId": demo_actor["id"], "date": "2025-11-04", "category": "Identity",
         "label": "First alias observed (ShadowVector)"},
        {"id": "TL-D02", "actorId": demo_actor["id"], "date": "2025-12-17", "category": "Identity",
         "label": "PGP fingerprint appears"},
        {"id": "TL-D03", "actorId": demo_actor["id"], "date": "2026-01-09", "category": "Blockchain",
         "label": "Wallet associated"},
        {"id": "TL-D04", "actorId": demo_actor["id"], "date": "2026-03-14", "category": "Marketplace",
         "label": "Marketplace migration detected"},
        {"id": "TL-D05", "actorId": demo_actor["id"], "date": "2026-05-22", "category": "Persona",
         "label": "New persona appears (vector_ops)"},
        {"id": "TL-D06", "actorId": demo_actor["id"], "date": "2026-08-29", "category": "Infrastructure",
         "label": "Infrastructure relationship detected"},
    ]

    attribution_factors = [
        {"label": "PGP reuse", "weight": 24}, {"label": "Wallet relationship", "weight": 21},
        {"label": "Writing similarity", "weight": 18}, {"label": "Behaviour similarity", "weight": 13},
        {"label": "Infrastructure match", "weight": 11},
    ]
    attribution_matrix = [
        {"name": "Identity Similarity", "value": 94, "tag": "Very Strong"},
        {"name": "PGP Relationship", "value": 91, "tag": "Very Strong"},
        {"name": "Wallet Relationship", "value": 89, "tag": "Strong"},
        {"name": "Infrastructure Correlation", "value": 87, "tag": "Strong"},
        {"name": "Stylometric Similarity", "value": 81, "tag": "Strong"},
        {"name": "Behavioural Similarity", "value": 78, "tag": "Moderate"},
        {"name": "Timeline Overlap", "value": 90, "tag": "Very Strong"},
        {"name": "Source Reliability", "value": 74, "tag": "Moderate"},
    ]

    return {
        "demoCaseId": "CASE-26151-07", "demoActorId": demo_actor["id"], "demoTimeline": demo_timeline,
        "attributionFactors": attribution_factors, "attributionMatrix": attribution_matrix,
        "overallAttribution": 88,
        "actors": actors, "aliases": aliases, "pgpKeys": pgp_keys, "wallets": wallets,
        "onionServices": onion_services, "infrastructure": infrastructure, "relationships": relationships,
        "evidence": evidence, "timelineEvents": timeline_events, "personaComparisons": persona_comparisons,
        "sources": sources, "marketplaces": MARKETPLACES, "forums": FORUMS,
    }


if __name__ == "__main__":
    data = build_dataset()
    out_dir = Path(__file__).resolve().parents[3] / "demo"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "demo_case.json").write_text(json.dumps(data, indent=2))
    counts = {k: len(v) for k, v in data.items() if isinstance(v, list)}
    print("Generated demo/demo_case.json")
    print(json.dumps(counts, indent=2))
