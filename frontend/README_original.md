# DARKTRACE AI
### Dark Web Threat Actor Intelligence, Correlation & Attribution Analysis Platform
**Smart India Hackathon 2026 — Problem Statement SIH26151**
**Theme:** Cybersecurity + Blockchain · **Organization:** NTRO · **Team:** IT ROYALS

---

## 1. What this is

This is a **working, self-contained frontend prototype** of DARKTRACE AI: a digital-forensics-style
investigation workbench for correlating dark-web threat actor footprints (aliases, PGP identities,
cryptocurrency wallets, hidden services, infrastructure, and writing-style personas) into
evidence-backed, confidence-scored **candidate attribution** — never claimed as guaranteed identity.

It runs entirely in the browser with **no build step, no server, and no external API keys required**,
so it can be opened directly or hosted on any static host for a live SIH demo.

> This prototype ships with a **synthetic/demonstration dataset only**. No real individuals, real
> credentials, real wallets, or real infrastructure are represented anywhere in the app.

## 2. How to run it

**Option A — open directly:**
Open `index.html` in any modern browser (Chrome/Edge/Firefox). That's it.

**Option B — local static server (recommended for demo stability):**
```bash
cd darktrace-ai
python3 -m http.server 8080
# then open http://localhost:8080
```

**Option C — deploy:** drag-and-drop the folder onto Netlify/Vercel/GitHub Pages — it's a static site.

## 3. Judge demo flow (5 minutes)

1. Click **LOAD DEMO INVESTIGATION** in the left rail (loaded by default).
2. **Investigation** — case `DT-2026-00421`, attribution confidence, evidence workspace.
3. **Actor Intelligence** — open the **ShadowVector** dossier: 3 aliases, 2 PGP identities, 4 wallets.
4. **Relationship Graph** — click nodes to inspect relationship type, confidence, and evidence.
5. **Infrastructure** — hidden service → candidate clearnet domain → confidence score flow.
6. **Blockchain Intelligence** — wallet → transaction → wallet → marketplace flow (synthetic).
7. **Persona Analysis** — ShadowVector (prior) vs. vector_ops (new): 83% persona link, "Potential Migration."
8. **Timeline** — chronological view of the case, filterable by evidence category.
9. **Autonomous Scan** — start a simulated continuous correlation sweep.
10. **Reports** — export JSON / CSV or generate a printable PDF-style report.

`Ctrl/Cmd + K` opens global investigation search across actors, aliases, wallets, PGP keys, and onion
services from anywhere in the app.

## 4. Architecture

```
darktrace-ai/
├── index.html      Entry point, loads data.js then app.js
├── data.js         Synthetic dataset generator (actors, aliases, PGP, wallets,
│                    onion services, infrastructure, relationships, evidence,
│                    timeline, persona comparisons, source reliability) +
│                    curated demo case (DT-2026-00421 / ShadowVector)
├── app.js           Hash-routed SPA: page renderers, Evidence Ribbon and
│                    Actor Dossier signature components, relationship graph
│                    (SVG), command palette, autonomous scan simulation,
│                    report export (JSON/CSV/print-to-PDF)
├── styles.css        Design tokens (#080B12 / #13B8A6 / #5B8DEF / #D6A84F /
│                    #D9822B / #C94C4C) and forensic-workbench styling
└── README.md
```

This is a frontend prototype built to demonstrate the product experience and information
architecture end-to-end. A production system would sit this UI on top of:

- **FastAPI** backend exposing `/api/actors`, `/api/infrastructure`, `/api/relationships`,
  `/api/wallets`, `/api/persona/matches`, `/api/timeline`, `/api/evidence`, `/api/sources`,
  `/api/investigations`, `POST /api/investigations`, `POST /api/scans`, `POST /api/reports`
- **PostgreSQL** for structured entities (actors, aliases, PGP keys, wallets, marketplaces,
  forums, onion services, infrastructure, certificates, evidence, investigations, sources, reports)
- **Neo4j** (or an in-memory fallback graph) for the relationship graph
- **Redis + Celery** for autonomous scan scheduling and background correlation jobs
- Authentication/role-ready middleware, rate limiting, and audit logging before any real deployment

The current prototype's `data.js` module maps directly onto that schema, so swapping the static
dataset for real API calls is a matter of replacing the `DATA` object's source with `fetch()` calls.

## 5. Feature coverage against SIH26151

| Capability | Status |
|---|---|
| A. Tor hidden-service infrastructure analysis (banners, TLS, fingerprints → candidate clearnet infra) | ✅ Infrastructure page |
| B. Threat actor correlation (aliases, PGP, wallets, forums, marketplaces, infrastructure) | ✅ Actor dossier + Relationship Graph |
| C. AI persona analysis (stylometric/behavioural similarity, persona migration) | ✅ Persona Analysis page |
| Explainable attribution confidence (contributing evidence weights) | ✅ Investigation workbench |
| Evidence system with provenance & reliability | ✅ Evidence Ribbon component, Evidence page |
| Source reliability scoring | ✅ Settings page |
| Autonomous scan simulation | ✅ Autonomous Scan page |
| Reporting/export | ✅ JSON, CSV, print-to-PDF |
| Demo mode with one-click load | ✅ "LOAD DEMO INVESTIGATION" |
| Ethical/legal safety language | ✅ "Candidate attribution" disclaimers throughout |

## 6. Ethical & legal limitations (by design)

- All data is synthetic. No real threat actors, credentials, or infrastructure are depicted.
- The app never claims guaranteed deanonymization — only **candidate correlations** with
  explainable confidence scores.
- No scanning, scraping, or access of any live system is performed by this prototype.
- Any production deployment must operate only against authorized environments, public metadata,
  or controlled demonstration services, with human analyst review before any attribution claim
  is acted upon.

## 7. Known limitations of this prototype

- Data is generated client-side on load (no persistence between sessions) — a production build
  would back this with PostgreSQL/Neo4j as described above.
- The relationship graph uses a simple radial layout rather than a force-directed physics engine;
  swapping in Cytoscape.js/React Flow is a drop-in upgrade for a fuller demo.
- Autonomous Scan is a simulated counter-driven animation, not a live source-scanning job queue.
- Authentication, RBAC, and audit logging are described in the architecture but not implemented
  in this static prototype.
