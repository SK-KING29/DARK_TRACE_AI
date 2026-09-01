# Judge Demonstration Guide — 5 Minutes

Case used throughout: **CASE-26151-07**, primary actor **ShadowFox**.

| Time | Step | What to show |
|---|---|---|
| 00:00 | Open DARKTRACE | Case Nexus loads — headline metrics (actors identified, high-confidence links, evidence collected), investigation timeline, relationship constellation preview. |
| 00:30 | Load Demo Case | Click "LOAD DEMO INVESTIGATION" (or hit `GET /api/demo/load`). Narrate: all data synthetic, deterministic, judge-repeatable. |
| 01:00 | Actor Dossier | Open ShadowFox. Point out 3 aliases, 2 PGP identities, 4 wallets, status/risk fields. |
| 01:45 | Relationship Constellation | Click the PGP node → show the two aliases sharing one fingerprint (the core correlation signal). Click an edge → relationship type, confidence, evidence. |
| 02:30 | Infrastructure Analysis | Hidden service → candidate clearnet domain, with certificate/fingerprint correlation and a confidence score. Emphasize: **"candidate infrastructure," never "real attacker IP."** |
| 03:00 | Blockchain Intelligence | Wallet → transaction pattern → related wallet/marketplace. Point out the **SYNTHETIC DATA** label. |
| 03:30 | Persona Analysis | ShadowFox (prior) vs. Shadow_Fox (alias): stylometric/behavioural/vocabulary/temporal similarity → 83% → "Potential Migration." Point out the **DEMONSTRATION MODEL** label — no live ML claimed. |
| 04:00 | Timeline + Evidence | Filter timeline by category; open one evidence record end-to-end (source → observation → reliability → confidence). |
| 04:30 | Attribution Matrix | Overall attribution 88%, broken into weighted contributing signals (PGP +24, wallet +21, stylometry +18, ...) — explainable, not a black box. |
| 05:00 | Generate Report | Export JSON/CSV (or print-to-PDF) — show the download actually completing. |

## One-line framing for judges

"DARKTRACE AI never claims to identify a real person. It surfaces
**evidence-backed candidate correlations** with an explainable confidence
score, so a human analyst can decide what to investigate next."
