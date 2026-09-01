/* ============================================================
   DARKTRACE AI — SYNTHETIC / DEMONSTRATION INTELLIGENCE DATA
   All entities are fictional. No real individuals, credentials,
   infrastructure, or wallets are represented.

   DATA SOURCE PRIORITY (fixes the frontend/backend disconnect):
     1. If api-client.js successfully fetched the live case from the
        FastAPI backend (GET /api/demo/load), that response —
        window.__DARKTRACE_PRELOADED_DATA__ — is used as-is. This is
        the real database-backed path.
     2. Otherwise (backend unreachable), this file falls back to a
        LOCAL generator so the UI still works offline/standalone.
        That generator now uses a fixed-seed PRNG instead of
        Math.random(), so the fallback case is also deterministic —
        refreshing the page no longer reshuffles actor names, dates,
        wallets, etc. The same seed always produces the same case.
   ============================================================ */

const PRELOADED = (typeof window !== "undefined" && window.__DARKTRACE_PRELOADED_DATA__) || null;
const DATA_SOURCE = PRELOADED ? "backend" : "local-fallback";

// Real /health response from api-client.js (api/database/mode), or a
// never-fake fallback when the backend was unreachable — see the
// "do not display API ONLINE merely because /api/demo/load returned a
// JSON file" requirement.
const PRELOADED_HEALTH = (typeof window !== "undefined" && window.__DARKTRACE_HEALTH__) || null;
const HEALTH = PRELOADED_HEALTH || {
  status: "degraded",
  api: "offline",
  database: "unavailable",
  database_type: null,
  mode: "local-fallback",
};

// ---------- seeded PRNG (mulberry32) — replaces Math.random() ----------
// Fixed seed => the local fallback generator produces the exact same
// demo case (CASE-26151-07 / ShadowFox) on every load, per SIH spec
// Section 4 ("the same demo case should produce the same result").
function _mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const _rng = _mulberry32(0x26151007); // DARKTRACE / SIH26151 fixed seed

const rand = (arr) => arr[Math.floor(_rng() * arr.length)];
const randInt = (min, max) => Math.floor(_rng() * (max - min + 1)) + min;
const pad = (n, w) => String(n).padStart(w, "0");

function randDate(startYear, startMonth, endYear, endMonth) {
  const start = new Date(startYear, startMonth - 1, 1).getTime();
  const end = new Date(endYear, endMonth - 1, 28).getTime();
  const d = new Date(start + _rng() * (end - start));
  return d.toISOString().slice(0, 10);
}

const CATEGORIES = ["Credential Trading", "Ransomware Affiliate", "Access Broker", "Carding Operation",
  "Malware Distribution", "Data Extortion", "Exploit Sales", "Money Laundering Services"];

const MARKETPLACES = ["ObsidianBazaar", "GreyLedger", "VaultXchange", "NightRoute Market",
  "CipherRow", "DarkAtlas", "ShadowFerry Market", "RedlineMart", "Quietus Market", "IronVeil Bazaar"];

const FORUMS = ["BreachTalk", "CipherNode Forum", "UnderRoot", "Exfil Lounge", "GhostWire Forum",
  "Zero Ledger Board", "Nullpoint Community", "DarkSignal Forum", "Wraithchan", "Backdoor Bulletin",
  "SilentStack Forum", "OnionCourt", "LatentRoot", "Coalburn Forum", "Redcell Board"];

const ALIAS_PREFIXES = ["Shadow", "Ghost", "Null", "Cipher", "Vector", "Wraith", "Obsidian", "Ferrous",
  "Nyx", "Ashen", "Onyx", "Cold", "Silent", "Redline", "Blackglass", "Wire", "Static", "Drift"];
const ALIAS_SUFFIXES = ["Vector", "Node", "Route", "Byte", "Fox", "Reaper", "Ledger", "Root", "Signal",
  "Drift", "Hex", "Vault", "Wraith", "Point", "Runner", "Cell", "Cinder", "Frost"];

function genAlias() {
  const style = randInt(0, 2);
  if (style === 0) return rand(ALIAS_PREFIXES) + rand(ALIAS_SUFFIXES);
  if (style === 1) return rand(ALIAS_PREFIXES) + "_" + rand(["ops", "market", "x", "net", "dev", "prime"]);
  return rand(ALIAS_SUFFIXES).toLowerCase() + randInt(10, 99);
}

function genPGP() {
  let hex = "0x";
  for (let i = 0; i < 16; i++) hex += "0123456789ABCDEF"[randInt(0, 15)];
  return hex;
}

function genOnion() {
  let s = "";
  const chars = "abcdefghijklmnopqrstuvwxyz234567";
  for (let i = 0; i < 16; i++) s += chars[randInt(0, chars.length - 1)];
  return s + ".onion";
}

function genBTCWallet() {
  let s = "bc1q";
  const chars = "023456789acdefghjklmnpqrstuvwxyz";
  for (let i = 0; i < 30; i++) s += chars[randInt(0, chars.length - 1)];
  return s;
}

function genETHWallet() {
  let s = "0x";
  const chars = "0123456789abcdef";
  for (let i = 0; i < 40; i++) s += chars[randInt(0, chars.length - 1)];
  return s;
}

function genIP() {
  return `${randInt(20, 220)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

function genDomain() {
  const words = ["meridian", "vertex", "haloway", "cinderpath", "brightloop", "colderas", "novanet",
    "quietfield", "greylatch", "ironforge", "solstice", "farrowline", "duskgate", "amberport"];
  const tld = rand(["com", "net", "io", "co", "biz"]);
  return `${rand(words)}-${rand(["solutions", "systems", "networks", "hosting", "group", "labs"])}.${tld}`;
}

function genFingerprint() {
  let s = "";
  for (let i = 0; i < 40; i++) s += "0123456789abcdef"[randInt(0, 15)];
  return s.match(/.{1,4}/g).join(":").slice(0, 59);
}

const RELIABILITY_LEVELS = ["HIGH", "MEDIUM", "LOW"];
const ACTOR_NAMES = ["ShadowVector", "NullFerrous", "CipherWraith", "AshenRoute", "ObsidianDrift",
  "ColdSignal", "RedlineFox", "BlackglassNode", "NyxRunner", "VaultCinder", "StaticReaper", "WireHex"];
const REL_TYPES = ["USES", "CONTROLS", "ASSOCIATED_WITH", "REUSED", "TRUSTS", "POSTED_ON", "FUNDED",
  "HOSTED_ON", "RELATED_TO"];
const EVIDENCE_TYPES = ["Identifier Reuse", "Infrastructure Correlation", "Stylometric Match",
  "Wallet Relationship", "Behavioural Pattern", "Certificate Relationship", "Descriptor Match"];
const EVIDENCE_SOURCES = ["Marketplace Forum", "Dark-Web Crawl", "Certificate Transparency Log",
  "Blockchain Ledger Analysis", "Forum Archive", "Infrastructure Scan (Authorized)", "OSINT Correlation"];
const TIMELINE_CATS = ["Identity", "Infrastructure", "Blockchain", "Persona", "Marketplace"];

// Entity collections + curated demo case fields. Declared with `let` so
// they can come from either the backend (PRELOADED) or the local
// deterministic generator below — exactly one source, never a mix.
let actors, aliases, pgpKeys, wallets, onionServices, infrastructure,
  relationships, evidence, timelineEvents, personaComparisons, sources,
  DEMO_CASE_ID, demoActor, demoTimeline, attributionFactors,
  attributionMatrix, overallAttribution;

if (PRELOADED) {
  // ---------- REAL DATA PATH: from FastAPI /api/demo/load ----------
  actors = PRELOADED.actors;
  aliases = PRELOADED.aliases;
  pgpKeys = PRELOADED.pgpKeys;
  wallets = PRELOADED.wallets;
  onionServices = PRELOADED.onionServices;
  infrastructure = PRELOADED.infrastructure;
  relationships = PRELOADED.relationships;
  evidence = PRELOADED.evidence;
  timelineEvents = PRELOADED.timelineEvents;
  personaComparisons = PRELOADED.personaComparisons;
  sources = PRELOADED.sources;
  DEMO_CASE_ID = PRELOADED.demoCaseId;
  demoActor = actors.find((a) => a.id === PRELOADED.demoActorId) || actors[0];
  demoTimeline = PRELOADED.demoTimeline;
  attributionFactors = PRELOADED.attributionFactors;
  attributionMatrix = PRELOADED.attributionMatrix;
  overallAttribution = PRELOADED.overallAttribution;
} else {
  // ---------- LOCAL FALLBACK PATH: deterministic client generator ----------
  // ---------- ACTORS ----------
  actors = ACTOR_NAMES.map((name, i) => {
    const firstSeen = randDate(2024, 6, 2025, 12);
    const lastSeen = randDate(2026, 1, 2026, 8);
    return {
      id: `ACT-${pad(i + 1, 3)}`,
      alias: name,
      confidence: randInt(52, 94),
      category: rand(CATEGORIES),
      firstSeen,
      lastSeen,
      status: rand(["MONITORED", "ACTIVE INVESTIGATION", "DORMANT", "UNDER REVIEW"]),
      riskLevel: rand(["MODERATE", "ELEVATED", "HIGH"]),
    };
  });

  // ---------- ALIASES (30) ----------
  aliases = [];
  for (let i = 0; i < 30; i++) {
    const actor = rand(actors);
    aliases.push({
      id: `AL-${pad(i + 1, 3)}`,
      actorId: actor.id,
      handle: genAlias(),
      platform: rand([...MARKETPLACES, ...FORUMS]),
      firstSeen: randDate(2024, 6, 2026, 6),
    });
  }

  // ---------- PGP IDENTITIES (15) ----------
  pgpKeys = [];
  for (let i = 0; i < 15; i++) {
    const actor = rand(actors);
    pgpKeys.push({
      id: `PGP-${pad(i + 1, 3)}`,
      actorId: actor.id,
      fingerprint: genPGP() + "…" + genPGP().slice(2, 6),
      firstSeen: randDate(2024, 8, 2026, 5),
      reuseCount: randInt(1, 4),
    });
  }

  // ---------- WALLETS (20) ----------
  wallets = [];
  for (let i = 0; i < 20; i++) {
    const actor = rand(actors);
    const chain = rand(["Bitcoin", "Ethereum"]);
    wallets.push({
      id: `WAL-${pad(i + 1, 3)}`,
      actorId: actor.id,
      chain,
      address: chain === "Bitcoin" ? genBTCWallet() : genETHWallet(),
      txCount: randInt(8, 640),
      totalVolume: (_rng() * 40 + 0.2).toFixed(3),
      firstSeen: randDate(2024, 6, 2025, 12),
      lastSeen: randDate(2026, 1, 2026, 8),
      riskIndicators: rand([["Mixer Interaction"], ["Marketplace Payout"], ["Rapid Transfer Chain"],
        ["Mixer Interaction", "Marketplace Payout"], []]),
    });
  }

  // ---------- ONION SERVICES (12) ----------
  onionServices = [];
  for (let i = 0; i < 12; i++) {
    const actor = rand(actors);
    onionServices.push({
      id: `ONI-${pad(i + 1, 3)}`,
      actorId: actor.id,
      address: genOnion(),
      status: rand(["ONLINE", "OFFLINE", "INTERMITTENT"]),
      banner: rand(["nginx/1.18.0 (Ubuntu)", "Apache/2.4.41", "nginx/1.22.1", "lighttpd/1.4.55", "Caddy/2.6.4"]),
      descriptorConsistency: rand(["CONSISTENT", "MINOR DEVIATION", "INCONSISTENT"]),
    });
  }

  // ---------- INFRASTRUCTURE (15) ----------
  infrastructure = [];
  for (let i = 0; i < 15; i++) {
    const onion = rand(onionServices);
    infrastructure.push({
      id: `INF-${pad(i + 1, 3)}`,
      onionId: onion.id,
      actorId: onion.actorId,
      candidateDomain: genDomain(),
      candidateIP: genIP(),
      hostingProvider: rand(["Cloak Networks Ltd", "Meridian Hosting", "Vertex Systems", "Farrow Cloud",
        "Coldpath Data Centers", "Halo Colocation"]),
      certRelationship: rand(["MATCH", "PARTIAL MATCH", "NO MATCH"]),
      serverFingerprint: rand(["SIMILAR", "IDENTICAL PATTERN", "WEAK CORRELATION"]),
      fingerprint: genFingerprint(),
      confidence: randInt(41, 91),
    });
  }

  // ---------- RELATIONSHIPS (40) ----------
  relationships = [];
  for (let i = 0; i < 40; i++) {
    const a = rand(actors);
    let b = rand(actors);
    while (b.id === a.id) b = rand(actors);
    relationships.push({
      id: `REL-${pad(i + 1, 3)}`,
      type: rand(REL_TYPES),
      source: a.id,
      target: rand([b.id, ...aliases.map((x) => x.id), ...wallets.map((x) => x.id), ...pgpKeys.map((x) => x.id)]),
      firstSeen: randDate(2024, 6, 2026, 4),
      lastSeen: randDate(2026, 1, 2026, 8),
      confidence: randInt(48, 96),
    });
  }

  // ---------- EVIDENCE (30) ----------
  evidence = [];
  for (let i = 0; i < 30; i++) {
    const actor = rand(actors);
    const reliability = rand(RELIABILITY_LEVELS);
    evidence.push({
      id: `DT-EV-${pad(i + 1, 5)}`,
      actorId: actor.id,
      type: rand(EVIDENCE_TYPES),
      source: rand(EVIDENCE_SOURCES),
      timestamp: randDate(2024, 6, 2026, 8),
      observation: rand([
        "Same PGP fingerprint used across two distinct aliases",
        "Wallet payout pattern matches prior marketplace vendor account",
        "TLS certificate SAN overlaps with previously flagged clearnet domain",
        "Writing style similarity exceeds threshold across forum posts",
        "Server banner and fingerprint match a previously catalogued hidden service",
        "Posting time distribution consistent with a known persona",
        "Descriptor inconsistency suggests shared hosting infrastructure",
        "Vocabulary and punctuation pattern consistent with prior persona",
      ]),
      reliability,
      confidence: reliability === "HIGH" ? randInt(85, 98) : reliability === "MEDIUM" ? randInt(60, 84) : randInt(30, 59),
    });
  }

  // ---------- TIMELINE (25) ----------
  timelineEvents = [];
  for (let i = 0; i < 25; i++) {
    const actor = rand(actors);
    const cat = rand(TIMELINE_CATS);
    const label = {
      Identity: "New alias observed",
      Infrastructure: "Infrastructure relationship detected",
      Blockchain: "Wallet association identified",
      Persona: "Potential persona migration flagged",
      Marketplace: "Marketplace account activity change",
    }[cat];
    timelineEvents.push({
      id: `TL-${pad(i + 1, 3)}`,
      actorId: actor.id,
      date: randDate(2024, 6, 2026, 8),
      category: cat,
      label,
    });
  }
  timelineEvents.sort((a, b) => a.date.localeCompare(b.date));

  // ---------- PERSONA COMPARISONS (10) ----------
  personaComparisons = [];
  for (let i = 0; i < 10; i++) {
    const a1 = rand(actors);
    let a2 = rand(actors);
    while (a2.id === a1.id) a2 = rand(actors);
    const stylometric = randInt(58, 95);
    const behaviour = randInt(55, 92);
    const vocabulary = randInt(60, 96);
    const temporal = randInt(45, 88);
    const overall = Math.round((stylometric + behaviour + vocabulary + temporal) / 4);
    personaComparisons.push({
      id: `PM-${pad(i + 1, 3)}`,
      personaA: a1.alias,
      personaB: a2.alias,
      stylometric, behaviour, vocabulary, temporal,
      overall,
      status: overall >= 80 ? "POTENTIAL MIGRATION" : overall >= 60 ? "PARTIAL SIMILARITY" : "LOW SIMILARITY",
    });
  }

  // ---------- SOURCES ----------
  sources = EVIDENCE_SOURCES.map((name, i) => ({
    id: `SRC-${pad(i + 1, 2)}`,
    name,
    reliability: randInt(38, 95),
    factors: {
      history: randInt(40, 98),
      consistency: randInt(40, 98),
      corroboration: randInt(30, 98),
      freshness: randInt(30, 98),
    },
  }));

  /* ============================================================
     CURATED DEMO CASE — CASE-26151-07 / ShadowFox
     Overrides the seeded-random actor #1 so the guided demo tells
     a coherent, judge-ready story end to end, every single time.
     ============================================================ */
  DEMO_CASE_ID = "CASE-26151-07";
  demoActor = actors[0];
  demoActor.alias = "ShadowFox";
  demoActor.confidence = 88;
  demoActor.category = "Credential Trading";
  demoActor.firstSeen = "2025-11-04";
  demoActor.lastSeen = "2026-08-29";
  demoActor.status = "ACTIVE INVESTIGATION";
  demoActor.riskLevel = "HIGH PRIORITY";

  const demoAliasHandles = ["Shadow_Fox", "SF_Market", "foxshadow_ops"];
  aliases.slice(0, 3).forEach((a, i) => { a.actorId = demoActor.id; a.handle = demoAliasHandles[i]; });

  const demoPGPFingerprints = ["ABC1 23F0 89AA D62E", "2C77 E4A1 F3B9 D0AA"];
  pgpKeys.slice(0, 2).forEach((p, i) => { p.actorId = demoActor.id; p.fingerprint = demoPGPFingerprints[i]; p.reuseCount = 2; });

  wallets.slice(0, 4).forEach((w) => { w.actorId = demoActor.id; });

  onionServices.slice(0, 2).forEach((o) => { o.actorId = demoActor.id; });
  infrastructure.slice(0, 2).forEach((inf, i) => {
    inf.actorId = demoActor.id;
    inf.onionId = onionServices[i].id;
    inf.confidence = i === 0 ? 78 : 63;
    inf.certRelationship = i === 0 ? "MATCH" : "PARTIAL MATCH";
    inf.serverFingerprint = i === 0 ? "SIMILAR" : "WEAK CORRELATION";
  });

  evidence.slice(0, 8).forEach((ev) => { ev.actorId = demoActor.id; });
  evidence[0].observation = "Same PGP fingerprint used by two aliases (Shadow_Fox, SF_Market)";
  evidence[0].reliability = "HIGH"; evidence[0].confidence = 94; evidence[0].source = "Marketplace Forum";
  evidence[0].type = "Identifier Reuse";

  personaComparisons[0].personaA = "ShadowFox (prior)";
  personaComparisons[0].personaB = "Shadow_Fox (alias)";
  personaComparisons[0].stylometric = 84;
  personaComparisons[0].behaviour = 79;
  personaComparisons[0].vocabulary = 88;
  personaComparisons[0].temporal = 72;
  personaComparisons[0].overall = 83;
  personaComparisons[0].status = "POTENTIAL MIGRATION";

  demoTimeline = [
    { id: "TL-D01", actorId: demoActor.id, date: "2025-11-04", category: "Identity", label: "First alias observed (ShadowVector)" },
    { id: "TL-D02", actorId: demoActor.id, date: "2025-12-17", category: "Identity", label: "PGP fingerprint appears" },
    { id: "TL-D03", actorId: demoActor.id, date: "2026-01-09", category: "Blockchain", label: "Wallet associated" },
    { id: "TL-D04", actorId: demoActor.id, date: "2026-03-14", category: "Marketplace", label: "Marketplace migration detected" },
    { id: "TL-D05", actorId: demoActor.id, date: "2026-05-22", category: "Persona", label: "New persona appears (vector_ops)" },
    { id: "TL-D06", actorId: demoActor.id, date: "2026-08-29", category: "Infrastructure", label: "Infrastructure relationship detected" },
  ];

  attributionFactors = [
    { label: "PGP reuse", weight: 24 },
    { label: "Wallet relationship", weight: 21 },
    { label: "Writing similarity", weight: 18 },
    { label: "Behaviour similarity", weight: 13 },
    { label: "Infrastructure match", weight: 11 },
  ];

  attributionMatrix = [
    { name: "Identity Similarity", value: 94, tag: "Very Strong", color: "var(--secondary)" },
    { name: "PGP Relationship", value: 91, tag: "Very Strong", color: "var(--secondary)" },
    { name: "Wallet Relationship", value: 89, tag: "Strong", color: "var(--positive)" },
    { name: "Infrastructure Correlation", value: 87, tag: "Strong", color: "var(--warning)" },
    { name: "Stylometric Similarity", value: 81, tag: "Strong", color: "var(--critical)" },
    { name: "Behavioural Similarity", value: 78, tag: "Moderate", color: "var(--primary)" },
    { name: "Timeline Overlap", value: 90, tag: "Very Strong", color: "var(--secondary)" },
    { name: "Source Reliability", value: 74, tag: "Moderate", color: "var(--warning)" },
  ];
  overallAttribution = 88;
}

/* Case Nexus intelligence metric row (headline demo counters).
   Presentation-only aggregate strip — not raw entity data, so it stays
   as fixed curated content regardless of data source; already
   deterministic (no randomness) either way. */
const nexusMetrics = [
  { label: "Actors Identified", value: "248", delta: "+32 this week", cls: "c-purple" },
  { label: "High Confidence Links", value: "731", delta: "+81 this week", cls: "c-pink" },
  { label: "Evidence Collected", value: "2,481", delta: "+231 this week", cls: "c-cyan" },
  { label: "Active Correlations", value: "14", delta: "+4 this week", cls: "c-green" },
  { label: "Critical Alerts", value: "37", delta: "+6 this week", cls: "c-red" },
];

/* Evidence Threads — correlation chains shown on Case Nexus */
const evidenceThreads = [
  { id: "EVD-001", name: "PGP Key Reuse Chain", count: 5, confidence: 94 },
  { id: "EVD-002", name: "Wallet Cluster Chain", count: 7, confidence: 91 },
  { id: "EVD-003", name: "Infra Correlation Chain", count: 6, confidence: 87 },
  { id: "EVD-004", name: "Persona Similarity Chain", count: 6, confidence: 81 },
];

/* Recent Evidence cards */
const recentEvidenceCards = [
  { type: "PGP_KEY_DETECTED", main: "ABC1 23F0 89AA", sub: "Forum-A", time: "29 Aug 2026 02:15 PM", level: "HIGH" },
  { type: "WALLET_CLUSTER", main: "WLT-X9Z-44B", sub: "Marketplace-X", time: "29 Aug 2026 04:40 PM", level: "HIGH" },
  { type: "INFRA_MATCH", main: "serviceiikhh.onion", sub: "Hidden Service", time: "29 Aug 2026 06:25 PM", level: "MEDIUM" },
  { type: "STYLOMETRY_MATCH", main: "ShadowFox ↔ Shadow_Fox", sub: "Similarity: 84%", time: "29 Aug 2026 09:10 PM", level: "MEDIUM" },
  { type: "BEHAVIOR_PATTERN", main: "Activity Pattern Match", sub: "Multiple Sources", time: "29 Aug 2026 09:55 PM", level: "LOW" },
];

/* Analyst notes shown on Case Nexus */
const analystNotes = [
  { author: "Analyst_007", time: "29 Aug 2026 10:15 PM", body: "Strong correlation between ShadowFox and Shadow_Fox based on PGP reuse, wallet activity and writing style. Infrastructure link further strengthens the hypothesis." },
  { author: "Analyst_004", time: "29 Aug 2026 08:40 PM", body: "Possible migration pattern observed in alias usage. Monitor new listings." },
  { author: "Analyst_002", time: "29 Aug 2026 06:55 PM", body: "Stylometry patterns nearly identical. Recommend continued monitoring." },
];

/* Investigation Timeline strip shown on Case Nexus (distinct from full Timeline page) */
const nexusTimeline = [
  { time: "29 AUG 2026 10:20 AM", cat: "Alias Observed", label: "Handle 'Shadow_Fox' seen on Forum-A" },
  { time: "29 AUG 2026 02:15 PM", cat: "PGP Key Detected", label: "PGP Key ABC1 23F0 linked to handle" },
  { time: "29 AUG 2026 04:40 PM", cat: "Wallet Activity", label: "Wallet WLT-X9Z detected in marketplace" },
  { time: "29 AUG 2026 06:25 PM", cat: "Infrastructure Match", label: "Hidden service linked to same infrastructure" },
  { time: "29 AUG 2026 09:10 PM", cat: "Persona Similarity", label: "High similarity with alias 'Shadow_Fox'" },
  { time: "29 AUG 2026 10:05 PM", cat: "Attribution Hypothesis", label: "High confidence link established" },
];

/* System Terminal status list — "Data Collector" reflects the ACTUAL
   backend connection status instead of a hardcoded ONLINE, per the
   spec's "do not fake ONLINE status" requirement (Section 23). */
const systemTerminal = [
  { name: "AI Engine", status: "ONLINE" },
  { name: "Data Collector", status: HEALTH.database === "connected" ? "ONLINE" : "OFFLINE — DEMO FALLBACK" },
  { name: "Graph Module", status: "ONLINE" },
  { name: "N.L.U. Service", status: "ONLINE" },
];

const DATA = {
  source: DATA_SOURCE, // "backend" or "local-fallback" — used by the UI's API status indicator
  health: HEALTH, // real API/DB/mode status from GET /health — never faked
  demoCaseId: DEMO_CASE_ID,
  demoActorId: demoActor.id,
  demoTimeline,
  attributionFactors,
  attributionMatrix, overallAttribution,
  nexusMetrics, evidenceThreads, recentEvidenceCards, analystNotes, nexusTimeline, systemTerminal,
  actors, aliases, pgpKeys, wallets, onionServices, infrastructure,
  relationships, evidence, timelineEvents, personaComparisons, sources,
  marketplaces: MARKETPLACES, forums: FORUMS,
};
