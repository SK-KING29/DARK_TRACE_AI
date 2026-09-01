# Demo Case — CASE-26151-07

`demo_case.json` is the full curated dataset (synthetic) used to seed the
database and to power `GET /api/demo/load`. It centers on primary actor
**ShadowFox**, with a coherent judge-ready story:

- 3 aliases (`Shadow_Fox`, `SF_Market`, `foxshadow_ops`)
- 2 PGP identities (reused across aliases — the headline correlation signal)
- 4 cryptocurrency wallets (synthetic Bitcoin/Ethereum addresses)
- 2 marketplace accounts, 1 forum identity
- 2 infrastructure relationships (hidden service → candidate clearnet infra)
- 1 persona migration (`ShadowFox (prior)` → `Shadow_Fox (alias)`, 83% link)
- 8+ evidence records tied to the actor, plus a 6-event curated timeline
- Overall attribution: **88%**, explainable via `attributionFactors`

See `docs/JUDGE-DEMO.md` for the 5-minute walkthrough script and
`frontend/data.js` for the identical dataset already wired into the existing
UI client-side (this file is the backend-side equivalent, used once the
optional API integration in `frontend/api-client.js` is enabled).

All data is fictional. This file, and the database it seeds, must never be
populated with real actor, credential, wallet, or infrastructure data.
