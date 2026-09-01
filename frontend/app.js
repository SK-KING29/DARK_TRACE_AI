/* ============================================================
   DARKTRACE AI — APPLICATION SHELL
   Vanilla JS SPA, hash-routed. No build step required.
   ============================================================ */

const state = {
  route: "investigation",
  selectedActorId: DATA.demoActorId,
  demoLoaded: true,
  scanRunning: false,
  scanLog: [],
};

const NAV_SECTIONS = [
  { title: "Investigation OS", items: [
    { id: "investigation", t1: "Case Nexus", t2: "Active Investigations" },
    { id: "investigation", t1: "New Investigation", t2: "Start a new case" },
    { id: "investigation", t1: "Case Vault", t2: "Archived cases" },
  ]},
  { title: "Intelligence Hub", items: [
    { id: "actors", t1: "Actor Dossiers", t2: "Detailed profiles" },
    { id: "actors", t1: "Alias Constellation", t2: "Identity mapping" },
    { id: "actors", t1: "PGP Intelligence", t2: "Key relationships" },
    { id: "blockchain", t1: "Wallet Tracker", t2: "Crypto footprints" },
    { id: "infrastructure", t1: "Infra Scanner", t2: "Infrastructure links" },
  ]},
  { title: "Evidence Lab", items: [
    { id: "evidence", t1: "Evidence Vault", t2: "Collected intel" },
    { id: "evidence", t1: "Evidence Threads", t2: "Correlation chains" },
    { id: "settings", t1: "Source Matrix", t2: "Reliability & trust" },
    { id: "timeline", t1: "Timeline Reconstructor", t2: "Event reconstruction" },
  ]},
  { title: "Analytics Core", items: [
    { id: "persona", t1: "Persona Analyzer", t2: "Stylometry engine" },
    { id: "persona", t1: "Behavioral Profiler", t2: "Action patterns" },
    { id: "investigation", t1: "Attribution Matrix", t2: "Confidence engine" },
    { id: "graph", t1: "Relationship Engine", t2: "Graph analytics" },
  ]},
  { title: "Reporting Suite", items: [
    { id: "reports", t1: "Investigation Reports", t2: "Generate reports" },
    { id: "reports", t1: "Export Center", t2: "PDF, CSV, JSON" },
    { id: "reports", t1: "Analyst Notebook", t2: "Secure notes" },
  ]},
];
// Flat route map retained for legacy lookups (search/palette navigation, hash routing)
const NAV = [
  { id: "investigation", label: "Case Nexus" },
  { id: "actors", label: "Actor Dossiers" },
  { id: "infrastructure", label: "Infra Scanner" },
  { id: "graph", label: "Relationship Engine" },
  { id: "blockchain", label: "Wallet Tracker" },
  { id: "persona", label: "Persona Analyzer" },
  { id: "timeline", label: "Timeline Reconstructor" },
  { id: "evidence", label: "Evidence Vault" },
  { id: "scan", label: "Correlation Sweep" },
  { id: "reports", label: "Investigation Reports" },
  { id: "settings", label: "Source Matrix" },
];

function actorById(id){ return DATA.actors.find(a => a.id === id); }
function relatedAliases(actorId){ return DATA.aliases.filter(a => a.actorId === actorId); }
function relatedPGP(actorId){ return DATA.pgpKeys.filter(a => a.actorId === actorId); }
function relatedWallets(actorId){ return DATA.wallets.filter(a => a.actorId === actorId); }
function relatedOnions(actorId){ return DATA.onionServices.filter(a => a.actorId === actorId); }
function relatedInfra(actorId){ return DATA.infrastructure.filter(a => a.actorId === actorId); }
function relatedEvidence(actorId){ return DATA.evidence.filter(a => a.actorId === actorId); }
function relatedTimeline(actorId){
  if(actorId === DATA.demoActorId) return DATA.demoTimeline;
  return DATA.timelineEvents.filter(t => t.actorId === actorId);
}
function relOfActor(actorId){ return DATA.relationships.filter(r => r.source === actorId || r.target === actorId); }

function confBadgeClass(c){ return c >= 80 ? "high" : c >= 55 ? "medium" : "low"; }
function reliabilityClass(r){ return r === "HIGH" ? "high" : r === "MEDIUM" ? "medium" : "low"; }

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

/* ---------------- ROUTING ---------------- */
function navigate(route){
  state.route = route;
  window.location.hash = route;
  render();
}
window.addEventListener("hashchange", () => {
  const r = window.location.hash.replace("#", "") || "investigation";
  state.route = r;
  render();
});

/* ---------------- SHELL RENDER ---------------- */
function clockStrings(){
  const now = new Date();
  const utc = new Date(now.toUTCString().slice(0, -4));
  const t = utc.toISOString().slice(11, 19) + " UTC";
  const d = utc.toISOString().slice(0, 10).split("-").reverse().join(" ").toUpperCase();
  return { t, d };
}
function renderShell(){
  const app = document.getElementById("app");
  const { t, d } = clockStrings();
  app.innerHTML = `
    <aside class="rail" id="rail">
      <div class="rail-brand">
        <div class="mark">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" stroke="#fff" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="3" stroke="#fff" stroke-width="1.4"/></svg>
        </div>
        <div>
          <div class="logo">DARKTRACE AI</div>
          <div class="sub upper">Dark Web Intelligence Platform</div>
        </div>
      </div>
      <nav class="rail-nav" id="rail-nav"></nav>
      <div class="rail-foot">
        <div class="rail-foot-title upper">System Terminal</div>
        <div id="terminal-list"></div>
        <button class="demo-toggle" id="demo-btn">${state.demoLoaded ? "✓ DEMO CASE LOADED" : "LOAD DEMO INVESTIGATION"}</button>
      </div>
    </aside>
    <div class="main">
      <div class="topbar">
        <button class="btn btn-ghost btn-sm" id="rail-toggle" style="display:none;">☰</button>
        <button class="search-btn" id="open-cmdk">
          <span class="ic">⌕</span><span>Search actors, aliases, PGP keys, wallets, domains…</span>
          <kbd>CTRL / K</kbd>
        </button>
        <div class="topbar-right">
          <span class="session-pill"><span class="dot"></span>SECURE SESSION</span>
          <span class="session-pill" title="${DATA.health.database === 'connected' ? 'Live data from FastAPI backend + database' : 'Backend/database unreachable — using local deterministic demo case'}">
            <span class="dot" style="background:${DATA.health.api === 'online' ? 'var(--positive,#2ecc71)' : 'var(--warning,#f5a623)'}"></span>
            ${DATA.health.api === 'online' ? 'API ● ONLINE' : 'API ● OFFLINE'}
          </span>
          <span class="session-pill" title="Real database connectivity from GET /health, and whether this session is database-backed or a local fallback">
            <span class="dot" style="background:${DATA.health.database === 'connected' ? 'var(--positive,#2ecc71)' : 'var(--warning,#f5a623)'}"></span>
            ${DATA.health.database === 'connected' ? 'DB ● CONNECTED' : 'DB ● UNAVAILABLE'}
            &nbsp;·&nbsp;MODE ● ${DATA.health.database === 'connected' ? 'SYNTHETIC DEMO' : 'LOCAL FALLBACK'}
          </span>
          <div class="clock-block"><div class="t" id="topbar-clock">${t}</div><div class="d">${d}</div></div>
          <button class="icon-btn" title="Toggle theme">☀</button>
          <button class="icon-btn" title="Notifications">🔔<span class="badge-dot">7</span></button>
          <div class="avatar">🕵</div>
        </div>
      </div>
      <div class="content" id="content"></div>
    </div>
    <div id="cmdk-root"></div>
    <div id="toast-root"></div>
  `;
  const navEl = document.getElementById("rail-nav");
  navEl.innerHTML = NAV_SECTIONS.map(sec => `
    <div class="rail-section">
      <div class="rail-section-title upper">${sec.title}</div>
      ${sec.items.map(it => `
        <button class="rail-item ${state.route === it.id ? "active" : ""}" data-route="${it.id}">
          <span class="ic"></span>
          <span class="txt"><span class="t1">${it.t1}</span><span class="t2">${it.t2}</span></span>
        </button>`).join("")}
    </div>`).join("");
  navEl.querySelectorAll(".rail-item").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.route));
  });
  document.getElementById("terminal-list").innerHTML = DATA.systemTerminal.map(s => `
    <div class="term-row"><span class="term-dot"></span>${s.name}<span class="mono" style="margin-left:auto; color:var(--positive); font-size:9px;">${s.status}</span></div>`).join("");
  document.getElementById("demo-btn").addEventListener("click", () => {
    state.demoLoaded = true;
    state.selectedActorId = DATA.demoActorId;
    navigate("investigation");
    showToast(`Demo investigation ${DATA.demoCaseId} loaded.`);
  });
  document.getElementById("open-cmdk").addEventListener("click", openCommandPalette);
}

function showToast(msg){
  const root = document.getElementById("toast-root");
  root.innerHTML = `<div class="toast">${escapeHtml(msg)}</div>`;
  setTimeout(() => { root.innerHTML = ""; }, 2600);
}

/* ---------------- COMMAND PALETTE ---------------- */
function openCommandPalette(){
  const root = document.getElementById("cmdk-root");
  const searchables = [
    ...DATA.actors.map(a => ({ label: a.alias, type: "ACTOR", go: () => { state.selectedActorId = a.id; navigate("actors"); } })),
    ...DATA.aliases.map(a => ({ label: a.handle, type: "ALIAS", go: () => { state.selectedActorId = a.actorId; navigate("actors"); } })),
    ...DATA.wallets.map(w => ({ label: w.address.slice(0,18)+"…", type: "WALLET", go: () => { state.selectedActorId = w.actorId; navigate("blockchain"); } })),
    ...DATA.onionServices.map(o => ({ label: o.address, type: "ONION SERVICE", go: () => { state.selectedActorId = o.actorId; navigate("infrastructure"); } })),
    ...DATA.pgpKeys.map(p => ({ label: p.fingerprint, type: "PGP", go: () => { state.selectedActorId = p.actorId; navigate("actors"); } })),
  ];
  root.innerHTML = `
    <div class="cmdk-overlay" id="cmdk-overlay">
      <div class="cmdk-box" onclick="event.stopPropagation()">
        <input class="cmdk-input" id="cmdk-input" placeholder="Search actor, wallet, PGP, domain, onion service…" autofocus />
        <div class="cmdk-results" id="cmdk-results"></div>
      </div>
    </div>`;
  const overlay = document.getElementById("cmdk-overlay");
  const input = document.getElementById("cmdk-input");
  const results = document.getElementById("cmdk-results");
  function renderResults(q){
    const list = q ? searchables.filter(s => s.label.toLowerCase().includes(q.toLowerCase())).slice(0, 20) : searchables.slice(0, 12);
    results.innerHTML = list.map((s, i) => `<div class="cmdk-result" data-i="${i}"><span class="mono">${escapeHtml(s.label)}</span><span class="type">${s.type}</span></div>`).join("") || `<div class="cmdk-result muted">No matches</div>`;
    results.querySelectorAll(".cmdk-result").forEach((el, i) => {
      el.addEventListener("click", () => { list[i].go(); closeCommandPalette(); });
    });
  }
  renderResults("");
  input.addEventListener("input", () => renderResults(input.value));
  overlay.addEventListener("click", closeCommandPalette);
  input.focus();
}
function closeCommandPalette(){ document.getElementById("cmdk-root").innerHTML = ""; }
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openCommandPalette(); }
  if (e.key === "Escape") closeCommandPalette();
});

/* ============================================================
   PAGE: CASE NEXUS (Investigation Overview)
   ============================================================ */
const METRIC_ICONS = { "c-purple":"◈", "c-pink":"◎", "c-cyan":"⬡", "c-green":"⛨", "c-red":"⚠" };
function pageInvestigation(){
  const actor = actorById(state.selectedActorId) || actorById(DATA.demoActorId);
  return `
    <div class="page-head">
      <div>
        <div class="page-eyebrow upper">Investigation OS // Active Case</div>
        <div class="page-title">CASE NEXUS <span class="pill pill-case">${DATA.demoCaseId}</span><span class="pill pill-priority">${escapeHtml(actor.riskLevel || "HIGH PRIORITY")}</span></div>
        <div class="page-desc">Dark Web Threat Actor Investigation — comprehensive attribution analysis and relationship mapping across multiple dark-web sources and identifiers.</div>
      </div>
    </div>

    <div class="metric-strip" id="metric-strip"></div>

    <div class="nexus-grid">
      <div class="panel">
        <div class="panel-title upper">Investigation Timeline<span class="right-tools mono">⛃ ⋯</span></div>
        <div id="nexus-timeline"></div>
        <button class="btn btn-primary" style="width:100%; margin-top:10px;" data-route="timeline">View Full Timeline →</button>
      </div>

      <div class="panel">
        <div class="panel-title upper">Relationship Constellation<span class="right-tools mono">Legend ＋ － ⛶</span></div>
        <div class="graph-wrap"><div class="graph-legend" id="graph-legend"></div><svg id="graph-svg" width="100%" height="470" style="display:block;"></svg></div>
      </div>

      <div class="panel">
        <div class="panel-title upper">Attribution Matrix<span class="right-tools mono">⋯</span></div>
        <div id="attr-matrix"></div>
        <div class="attr-overall">
          <div>
            <div class="lbl upper">Overall Attribution Score</div>
            <div class="conf-tag upper">HIGH CONFIDENCE</div>
          </div>
          <div class="num">${DATA.overallAttribution}%</div>
        </div>
        <div class="disclaimer">Attribution hypothesis is supported by multiple independent correlations. This reflects candidate attribution, not guaranteed real-world identity.</div>
      </div>
    </div>

    <div class="panel" style="margin-top:14px;">
      <div class="panel-title upper">Evidence Threads<span class="right-tools"><button class="btn btn-sm" data-route="evidence">View All Threads</button></span></div>
      <div class="thread-row" id="thread-row"></div>
    </div>

    <div class="grid-2" style="margin-top:14px; grid-template-columns:2fr 1fr;">
      <div class="panel">
        <div class="panel-title upper">Recent Evidence</div>
        <div class="evrow" id="recent-evidence"></div>
      </div>
      <div class="panel">
        <div class="panel-title upper">Analyst Notes<span class="right-tools"><button class="btn btn-sm" id="add-note-btn">＋ Add Note</button></span></div>
        <div id="analyst-notes"></div>
      </div>
    </div>
  `;
}
function afterRenderInvestigation(){
  const actor = actorById(state.selectedActorId) || actorById(DATA.demoActorId);

  document.getElementById("metric-strip").innerHTML = DATA.nexusMetrics.map(m => `
    <div class="metric-card ${m.cls}">
      <div class="m-ic">${METRIC_ICONS[m.cls] || "◈"}</div>
      <div class="m-body">
        <div class="lbl upper">${m.label}</div>
        <div class="val">${m.value}</div>
        <div class="delta up">${m.delta}</div>
      </div>
    </div>`).join("");

  document.getElementById("nexus-timeline").innerHTML = DATA.nexusTimeline.map((e,i) => `
    <div class="tl-item">
      <div class="tl-dot-col"><div class="tl-dot"></div>${i<DATA.nexusTimeline.length-1?'<div class="tl-line"></div>':''}</div>
      <div class="tl-body">
        <div class="cat mono">${e.time}</div>
        <div class="lbl">${escapeHtml(e.cat)}</div>
        <div class="desc">${escapeHtml(e.label)}</div>
      </div>
    </div>`).join("");

  document.getElementById("attr-matrix").innerHTML = DATA.attributionMatrix.map(r => `
    <div class="matrix-row">
      <div class="name">${escapeHtml(r.name)}</div>
      <div class="bar"><i style="width:${r.value}%; background:${r.color};"></i></div>
      <div class="pct">${r.value}%</div>
      <div class="tag">${escapeHtml(r.tag)}</div>
    </div>`).join("");

  document.getElementById("thread-row").innerHTML = DATA.evidenceThreads.map(t => `
    <div class="thread-card" data-route="evidence">
      <div class="t-id mono">THREAD #${t.id}</div>
      <div class="t-name">${escapeHtml(t.name)}</div>
      <div class="t-meta"><span>${t.count} evidence items</span><span class="t-conf" style="color:${t.confidence>=90?'var(--positive)':t.confidence>=80?'var(--warning)':'var(--secondary)'}">${t.confidence}%</span></div>
    </div>`).join("");

  document.getElementById("recent-evidence").innerHTML = DATA.recentEvidenceCards.map(c => `
    <div class="evcard">
      <div class="ev-type">${c.type}</div>
      <div class="ev-main">${escapeHtml(c.main)}</div>
      <div class="ev-sub">${escapeHtml(c.sub)}</div>
      <div class="ev-time">${c.time}</div>
      <span class="badge ${reliabilityClass(c.level)}">${c.level}</span>
    </div>`).join("");

  const notesEl = document.getElementById("analyst-notes");
  function drawNotes(){
    notesEl.innerHTML = DATA.analystNotes.map(n => `
      <div class="note">
        <div class="n-head"><div class="n-avatar"></div><span class="n-name">${escapeHtml(n.author || n.body && "Analyst")}</span><span class="n-time">${n.time || (n.created_at ? new Date(n.created_at).toLocaleString() : "")}</span></div>
        <div class="n-body">${escapeHtml(n.body)}</div>
      </div>`).join("");
  }
  // Notes persistence: if the backend is live, notes are saved to the
  // database via POST /api/notes and reloaded from GET /api/notes, so
  // they survive a browser refresh. If the backend is offline, we fall
  // back to in-memory only and tell the analyst so — never silently
  // pretend something was saved when it wasn't.
  if (window.DarktraceAPI && DarktraceAPI.isLive()) {
    DarktraceAPI.notes.list(DATA.demoCaseId)
      .then(rows => { if (rows && rows.length) { DATA.analystNotes = rows; drawNotes(); } else drawNotes(); })
      .catch(() => drawNotes());
  } else {
    drawNotes();
  }
  document.getElementById("add-note-btn").addEventListener("click", () => {
    const text = prompt("Add analyst note:");
    if (!text || !text.trim()) return;
    const body = text.trim();
    if (window.DarktraceAPI && DarktraceAPI.isLive()) {
      DarktraceAPI.notes.create(DATA.demoCaseId, "Analyst_You", body)
        .then(saved => {
          DATA.analystNotes.unshift(saved);
          drawNotes();
          showToast("Note saved to case record (persisted).");
        })
        .catch(() => {
          DATA.analystNotes.unshift({ author: "Analyst_You", time: clockStrings().t, body });
          drawNotes();
          showToast("Backend unavailable — note kept locally only, will NOT survive refresh.");
        });
    } else {
      DATA.analystNotes.unshift({ author: "Analyst_You", time: clockStrings().t, body });
      drawNotes();
      showToast("Demo mode (no backend) — note kept locally only, will NOT survive refresh.");
    }
  });

  drawConstellation(actor);

  document.querySelectorAll("[data-route]").forEach(el => {
    if(!el.classList.contains("rail-item")) el.addEventListener("click", () => navigate(el.dataset.route));
  });
}

/* Relationship Constellation — centered radial graph for Case Nexus */
function drawConstellation(actor){
  const legendEl = document.getElementById("graph-legend");
  if (!legendEl) return;
  legendEl.innerHTML = Object.entries(NODE_COLORS).map(([k,c]) => `<div class="lg-item"><span class="sw" style="background:${c}"></span>${k}</div>`).join("");

  const al = relatedAliases(actor.id), pgp = relatedPGP(actor.id), wal = relatedWallets(actor.id), inf = relatedInfra(actor.id);
  const svgEl = document.getElementById("graph-svg");
  const W = svgEl.clientWidth || 700, H = 470, cx = W/2, cy = H/2;
  const nodes = [{ id: actor.id, type:"ACTOR", label: actor.alias, x: cx, y: cy }];
  const items = [
    ...al.slice(0,3).map(a => ({ id:a.id, type:"ALIAS", label:a.handle })),
    ...pgp.slice(0,2).map(p => ({ id:p.id, type:"PGP", label:p.fingerprint.slice(0,12) })),
    ...wal.slice(0,3).map(w => ({ id:w.id, type:"WALLET", label:w.address.slice(0,10)+"…" })),
    ...inf.slice(0,2).map(i => ({ id:i.id, type:"INFRASTRUCTURE", label:i.candidateDomain })),
  ];
  const R = Math.min(W,H)/2 - 76;
  items.forEach((it, i) => {
    const ang = (2*Math.PI*i)/items.length - Math.PI/2;
    it.x = cx + R*Math.cos(ang); it.y = cy + R*Math.sin(ang);
    nodes.push(it);
  });
  const edges = items.map((it,i) => ({ from: actor.id, to: it.id, type: rand(["USES","LINKED_TO","POSTED_ON","FUNDED","REUSED","ASSOCIATED_WITH"]) }));

  let svg = `<defs><radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8B2CFF" stop-opacity="0.35"/><stop offset="100%" stop-color="#8B2CFF" stop-opacity="0"/>
    </radialGradient></defs>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="90" fill="url(#centerGlow)" />`;
  edges.forEach(e => {
    const a = nodes.find(n=>n.id===e.from), b = nodes.find(n=>n.id===e.to);
    svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="rgba(168,85,247,.35)" stroke-width="1.2" />`;
    const mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
    svg += `<text x="${mx}" y="${my}" fill="#5C5C70" font-size="7.5" font-family="IBM Plex Mono, monospace" text-anchor="middle">${e.type}</text>`;
  });
  nodes.forEach(n => {
    const color = NODE_COLORS[n.type] || "#8B8B9E";
    const r = n.type === "ACTOR" ? 30 : 18;
    svg += `<g class="graph-node" data-id="${n.id}" style="cursor:pointer;">
      <circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${color}22" stroke="${color}" stroke-width="1.6"/>
      ${n.type === "ACTOR" ? `<circle cx="${n.x}" cy="${n.y}" r="${r-8}" fill="${color}33" stroke="${color}" stroke-width="1"/>` : ""}
      <text x="${n.x}" y="${n.y + r + 12}" fill="#EDEDF4" font-size="10" font-weight="600" font-family="IBM Plex Mono, monospace" text-anchor="middle">${escapeHtml(n.label.length>16? n.label.slice(0,16)+'…':n.label)}</text>
      <text x="${n.x}" y="${n.y + r + 23}" fill="#5C5C70" font-size="8" font-family="IBM Plex Mono, monospace" text-anchor="middle">${n.type}</text>
    </g>`;
  });
  svgEl.innerHTML = svg;
  svgEl.querySelectorAll(".graph-node").forEach(g => {
    g.addEventListener("click", () => {
      const id = g.dataset.id;
      const node = nodes.find(n=>n.id===id);
      showToast(`${node.type} · ${node.label} · Confidence ${actor.confidence}% · First seen ${actor.firstSeen}`);
    });
  });
}

function evidenceRibbonHtml(ev){
  const cls = reliabilityClass(ev.reliability);
  return `
    <div class="evidence-ribbon ${cls}">
      <div class="er-head">
        <span class="er-id mono">EVIDENCE ${ev.id}</span>
        <span class="badge ${cls}">${ev.reliability} RELIABILITY</span>
        <span class="er-conf">${ev.confidence}%</span>
      </div>
      <div class="er-obs">${escapeHtml(ev.observation)}</div>
      <div class="er-meta">
        <span>Source: ${escapeHtml(ev.source)}</span>
        <span>First Seen: ${ev.timestamp}</span>
        <span>Type: ${escapeHtml(ev.type)}</span>
      </div>
    </div>`;
}

/* ============================================================
   PAGE: ACTOR INTELLIGENCE
   ============================================================ */
function pageActors(){
  const actor = actorById(state.selectedActorId) || DATA.actors[0];
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Actor Intelligence</div>
      <div class="page-title">Threat Actor Registry</div>
    </div>
    <div class="workbench" style="grid-template-columns:280px 1fr;">
      <div>
        <div class="searchbar"><span>⌕</span><input id="actor-filter" placeholder="Filter actors…"/></div>
        <div id="actor-list" style="display:flex; flex-direction:column; gap:8px; max-height:70vh; overflow-y:auto;"></div>
      </div>
      <div id="actor-dossier"></div>
    </div>
  `;
}
function afterRenderActors(){
  function renderList(filter){
    const q = (filter||"").toLowerCase();
    const list = DATA.actors.filter(a => a.alias.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
    document.getElementById("actor-list").innerHTML = list.map(a => `
      <div class="actor-tile" data-id="${a.id}">
        <div class="name">${escapeHtml(a.alias)}</div>
        <div class="meta-line"><span>${escapeHtml(a.category)}</span><span class="mono badge ${confBadgeClass(a.confidence)}">${a.confidence}%</span></div>
      </div>`).join("") || `<div class="empty-state">No actors match this filter.</div>`;
    document.querySelectorAll(".actor-tile").forEach(t => t.addEventListener("click", () => { state.selectedActorId = t.dataset.id; render(); }));
  }
  renderList("");
  document.getElementById("actor-filter").addEventListener("input", (e) => renderList(e.target.value));
  renderDossier();
}
function renderDossier(){
  const actor = actorById(state.selectedActorId) || DATA.actors[0];
  const al = relatedAliases(actor.id);
  const pgp = relatedPGP(actor.id);
  const wal = relatedWallets(actor.id);
  const inf = relatedInfra(actor.id);
  const ev = relatedEvidence(actor.id);
  const pm = DATA.personaComparisons.filter(p => p.personaA.includes(actor.alias) || p.personaB.includes(actor.alias));
  document.getElementById("actor-dossier").innerHTML = `
    <div class="dossier">
      <div class="dossier-head">
        <div class="page-eyebrow upper">Actor Dossier</div>
        <div class="name">${escapeHtml(actor.alias)}</div>
      </div>
      <div class="dossier-row"><div class="k">Status</div><div class="v">${escapeHtml(actor.status)}</div></div>
      <div class="dossier-row"><div class="k">Confidence</div><div class="v"><span class="badge ${confBadgeClass(actor.confidence)}">${actor.confidence}%</span></div></div>
      <div class="dossier-row"><div class="k">Category</div><div class="v">${escapeHtml(actor.category)}</div></div>
      <div class="dossier-row"><div class="k">Identifiers</div><div class="v">${al.length} aliases · ${pgp.length} PGP · ${wal.length} wallets</div></div>
      <div class="dossier-row"><div class="k">Last Observed</div><div class="v">${actor.lastSeen}</div></div>
      <div class="dossier-foot"><span class="muted small">First seen ${actor.firstSeen}</span></div>
    </div>

    <div class="grid-2" style="margin-top:14px;">
      <div class="panel">
        <div class="panel-title upper">Identifiers</div>
        <div style="margin-bottom:10px;"><div class="small muted upper" style="margin-bottom:6px;">Known Handles</div>
          ${al.map(a => `<div class="dossier-row"><div class="k mono">${a.platform}</div><div class="v">${escapeHtml(a.handle)}</div></div>`).join("") || '<div class="small muted">None on record</div>'}
        </div>
        <div><div class="small muted upper" style="margin-bottom:6px;">PGP Keys</div>
          ${pgp.map(p => `<div class="dossier-row"><div class="k">Reuse ×${p.reuseCount}</div><div class="v mono">${p.fingerprint}</div></div>`).join("") || '<div class="small muted">None on record</div>'}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title upper">Blockchain</div>
        ${wal.map(w => `<div class="dossier-row"><div class="k">${w.chain}</div><div class="v mono">${w.address.slice(0,14)}…</div></div>`).join("") || '<div class="small muted">None on record</div>'}
      </div>
    </div>

    <div class="panel" style="margin-top:14px;">
      <div class="panel-title upper">Infrastructure &amp; Persona Links</div>
      <div class="grid-2">
        <div>
          ${inf.map(i => `<div class="dossier-row"><div class="k mono">${i.id}</div><div class="v">${escapeHtml(i.candidateDomain)} · ${i.confidence}%</div></div>`).join("") || '<div class="small muted">No infrastructure correlated</div>'}
        </div>
        <div>
          ${pm.map(p => `<div class="dossier-row"><div class="k">${p.status}</div><div class="v">${p.overall}% link</div></div>`).join("") || '<div class="small muted">No persona matches</div>'}
        </div>
      </div>
    </div>

    <div class="panel" style="margin-top:14px;">
      <div class="panel-title upper">Evidence</div>
      ${ev.slice(0,5).map(evidenceRibbonHtml).join("") || `<div class="empty-state">No evidence records linked.</div>`}
    </div>
  `;
}

/* ============================================================
   PAGE: INFRASTRUCTURE
   ============================================================ */
function pageInfrastructure(){
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Infrastructure Analysis</div>
      <div class="page-title">Hidden Service &amp; Clearnet Correlation</div>
      <div class="page-desc">Correlates Tor hidden-service indicators against candidate clearnet infrastructure using certificate, banner, and fingerprint metadata.</div>
    </div>
    <div id="infra-list"></div>
  `;
}
function afterRenderInfrastructure(){
  const list = DATA.infrastructure.slice().sort((a,b)=>b.confidence-a.confidence);
  document.getElementById("infra-list").innerHTML = list.map(inf => {
    const onion = DATA.onionServices.find(o => o.id === inf.onionId) || {};
    const actor = actorById(inf.actorId);
    return `
    <div class="panel">
      <div class="panel-title upper">Infrastructure Match ${inf.id}<span class="badge ${confBadgeClass(inf.confidence)}">${inf.confidence}% Confidence</span></div>
      <div class="infra-flow">
        <div class="infra-node"><span class="lbl">HIDDEN SERVICE</span>${escapeHtml(onion.address || "—")}</div>
        <div class="infra-arrow">→</div>
        <div class="infra-node"><span class="lbl">CANDIDATE CLEARNET</span>${escapeHtml(inf.candidateDomain)}</div>
        <div class="infra-arrow">→</div>
        <div class="infra-node"><span class="lbl">CANDIDATE IP</span>${inf.candidateIP}</div>
        <div class="infra-arrow">→</div>
        <div class="infra-node"><span class="lbl">CONFIDENCE</span>${inf.confidence}%</div>
      </div>
      <div class="grid-3">
        <div class="dossier-row"><div class="k">Certificate Relationship</div><div class="v">${inf.certRelationship}</div></div>
        <div class="dossier-row"><div class="k">Server Fingerprint</div><div class="v">${inf.serverFingerprint}</div></div>
        <div class="dossier-row"><div class="k">Descriptor Consistency</div><div class="v">${escapeHtml(onion.descriptorConsistency||"—")}</div></div>
        <div class="dossier-row"><div class="k">Hosting Provider</div><div class="v">${escapeHtml(inf.hostingProvider)}</div></div>
        <div class="dossier-row"><div class="k">Service Status</div><div class="v">${escapeHtml(onion.status||"—")}</div></div>
        <div class="dossier-row"><div class="k">Linked Actor</div><div class="v">${actor ? escapeHtml(actor.alias) : "—"}</div></div>
      </div>
      <div class="dossier-row"><div class="k">Fingerprint</div><div class="v mono small">${inf.fingerprint}</div></div>
      <div class="disclaimer">Infrastructure correlation identifies candidate relationships and does not guarantee real-world attribution.</div>
    </div>`;
  }).join("");
}

/* ============================================================
   PAGE: RELATIONSHIP GRAPH
   ============================================================ */
const NODE_COLORS = { ACTOR:"#13B8A6", ALIAS:"#5B8DEF", PGP:"#D6A84F", WALLET:"#D9822B", INFRASTRUCTURE:"#C94C4C" };
function pageGraph(){
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Relationship Graph</div>
      <div class="page-title">Entity Correlation Map — ${escapeHtml((actorById(state.selectedActorId)||DATA.actors[0]).alias)}</div>
      <div class="page-desc">Click any node to view relationship details, evidence, and confidence.</div>
    </div>
    <div class="graph-wrap"><div class="graph-legend" id="graph-legend"></div><svg id="graph-svg" width="100%" height="480" style="display:block;"></svg></div>
    <div class="panel" id="graph-detail" style="margin-top:14px;"><div class="panel-title upper">Node / Edge Detail</div><div class="empty-state">Select a node or edge above to inspect relationship evidence.</div></div>
  `;
}
function afterRenderGraph(){
  const actor = actorById(state.selectedActorId) || DATA.actors[0];
  document.getElementById("graph-legend").innerHTML = Object.entries(NODE_COLORS).map(([k,c]) => `<div class="lg-item"><span class="sw" style="background:${c}"></span>${k}</div>`).join("");

  const al = relatedAliases(actor.id), pgp = relatedPGP(actor.id), wal = relatedWallets(actor.id), inf = relatedInfra(actor.id);
  const svgEl = document.getElementById("graph-svg");
  const W = svgEl.clientWidth || 900, H = 480, cx = W/2, cy = H/2;
  const nodes = [{ id: actor.id, type:"ACTOR", label: actor.alias, x: cx, y: cy }];
  const items = [
    ...al.map(a => ({ id:a.id, type:"ALIAS", label:a.handle })),
    ...pgp.map(p => ({ id:p.id, type:"PGP", label:p.fingerprint.slice(0,10)+"…" })),
    ...wal.map(w => ({ id:w.id, type:"WALLET", label:w.address.slice(0,8)+"…" })),
    ...inf.map(i => ({ id:i.id, type:"INFRASTRUCTURE", label:i.candidateDomain })),
  ];
  const R = Math.min(W,H)/2 - 70;
  items.forEach((it, i) => {
    const ang = (2*Math.PI*i)/items.length - Math.PI/2;
    it.x = cx + R*Math.cos(ang); it.y = cy + R*Math.sin(ang);
    nodes.push(it);
  });
  const edges = items.map(it => ({ from: actor.id, to: it.id }));

  let svg = `<g>`;
  edges.forEach(e => {
    const a = nodes.find(n=>n.id===e.from), b = nodes.find(n=>n.id===e.to);
    svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#212B3D" stroke-width="1.4" />`;
  });
  nodes.forEach(n => {
    const color = NODE_COLORS[n.type] || "#8993A4";
    const r = n.type === "ACTOR" ? 26 : 16;
    svg += `<g class="graph-node" data-id="${n.id}" style="cursor:pointer;">
      <circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${color}22" stroke="${color}" stroke-width="1.6"/>
      <text x="${n.x}" y="${n.y - r - 7}" fill="#E7ECF3" font-size="10" font-family="IBM Plex Mono, monospace" text-anchor="middle">${escapeHtml(n.label.length>16? n.label.slice(0,16)+'…':n.label)}</text>
    </g>`;
  });
  svg += `</g>`;
  svgEl.innerHTML = svg;
  svgEl.querySelectorAll(".graph-node").forEach(g => {
    g.addEventListener("click", () => {
      const id = g.dataset.id;
      const node = nodes.find(n=>n.id===id);
      const rel = DATA.relationships.find(r => r.source===actor.id || r.target===actor.id) || { type:"ASSOCIATED_WITH", firstSeen: actor.firstSeen, lastSeen: actor.lastSeen, confidence: actor.confidence, source: actor.alias };
      document.getElementById("graph-detail").innerHTML = `
        <div class="panel-title upper">Node / Edge Detail</div>
        <div class="dossier-row"><div class="k">Entity</div><div class="v">${escapeHtml(node.label)} (${node.type})</div></div>
        <div class="dossier-row"><div class="k">Relationship Type</div><div class="v">${node.type === "ACTOR" ? "SELF" : "ASSOCIATED_WITH"}</div></div>
        <div class="dossier-row"><div class="k">Source</div><div class="v">Correlation Engine</div></div>
        <div class="dossier-row"><div class="k">First Seen</div><div class="v">${actor.firstSeen}</div></div>
        <div class="dossier-row"><div class="k">Last Seen</div><div class="v">${actor.lastSeen}</div></div>
        <div class="dossier-row"><div class="k">Confidence</div><div class="v"><span class="badge ${confBadgeClass(actor.confidence)}">${actor.confidence}%</span></div></div>`;
    });
  });
}

/* ============================================================
   PAGE: BLOCKCHAIN INTELLIGENCE
   ============================================================ */
function pageBlockchain(){
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Blockchain Intelligence <span class="badge medium">SYNTHETIC / DEMONSTRATION DATA</span></div>
      <div class="page-title">Wallet &amp; Transaction Correlation</div>
    </div>
    <div class="panel">
      <div class="panel-title upper">Transaction Relationship</div>
      <div class="chain-flow" id="chain-flow"></div>
    </div>
    <div class="panel" style="margin-top:14px;">
      <div class="panel-title upper">Tracked Wallets</div>
      <table>
        <thead><tr><th>Wallet</th><th>Chain</th><th>Tx Count</th><th>Volume</th><th>Related Actor</th><th>Risk Indicators</th></tr></thead>
        <tbody id="wallet-rows"></tbody>
      </table>
    </div>
  `;
}
function afterRenderBlockchain(){
  const actor = actorById(state.selectedActorId) || DATA.actors[0];
  const wal = relatedWallets(actor.id)[0] || DATA.wallets[0];
  const market = rand(DATA.marketplaces);
  document.getElementById("chain-flow").innerHTML = `
    <div class="infra-node"><span class="lbl">WALLET A</span>${wal.address.slice(0,10)}…</div>
    <div class="infra-arrow">→</div>
    <div class="infra-node"><span class="lbl">TRANSACTION</span>${wal.txCount} tx / ${wal.totalVolume} ${wal.chain==="Bitcoin"?"BTC":"ETH"}</div>
    <div class="infra-arrow">→</div>
    <div class="infra-node"><span class="lbl">WALLET B</span>${rand(DATA.wallets).address.slice(0,10)}…</div>
    <div class="infra-arrow">→</div>
    <div class="infra-node"><span class="lbl">MARKETPLACE</span>${escapeHtml(market)}</div>
  `;
  document.getElementById("wallet-rows").innerHTML = DATA.wallets.map(w => {
    const a = actorById(w.actorId);
    return `<tr><td class="mono small">${w.address.slice(0,16)}…</td><td>${w.chain}</td><td>${w.txCount}</td><td>${w.totalVolume}</td><td>${a?escapeHtml(a.alias):"—"}</td><td>${w.riskIndicators.map(r=>`<span class="badge medium">${r}</span>`).join(" ")||'<span class="muted small">None</span>'}</td></tr>`;
  }).join("");
}

/* ============================================================
   PAGE: PERSONA ANALYSIS
   ============================================================ */
function pagePersona(){
  const list = DATA.personaComparisons;
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Persona Analysis</div>
      <div class="page-title">Stylometric &amp; Behavioural Comparison</div>
    </div>
    <div class="filter-chips" id="persona-chips"></div>
    <div id="persona-detail"></div>
  `;
}
function afterRenderPersona(){
  let idx = 0;
  const list = DATA.personaComparisons;
  function draw(i){
    idx = i;
    const p = list[i];
    document.getElementById("persona-chips").innerHTML = list.map((pp, j) => `<button class="chip ${j===idx?"active":""}" data-i="${j}">${escapeHtml(pp.personaA)} ↔ ${escapeHtml(pp.personaB)}</button>`).join("");
    document.querySelectorAll("#persona-chips .chip").forEach(c => c.addEventListener("click", () => draw(parseInt(c.dataset.i))));
    document.getElementById("persona-detail").innerHTML = `
      <div class="persona-vs">
        <div class="persona-col"><div class="p-name">${escapeHtml(p.personaA)}</div><div class="small muted">PERSONA A</div></div>
        <div class="persona-vs-mid">VS</div>
        <div class="persona-col"><div class="p-name">${escapeHtml(p.personaB)}</div><div class="small muted">PERSONA B</div></div>
      </div>
      <div class="panel" style="margin-top:14px;">
        <div class="panel-title upper">Similarity Metrics</div>
        ${metricRow("Stylometric Similarity", p.stylometric)}
        ${metricRow("Behaviour Similarity", p.behaviour)}
        ${metricRow("Vocabulary Similarity", p.vocabulary)}
        ${metricRow("Temporal Similarity", p.temporal)}
        <div class="attr-score">
          <div class="num">${p.overall}%</div>
          <div class="lbl upper">Persona Link Confidence</div>
          <div class="badge ${confBadgeClass(p.overall)}" style="margin-top:8px;">${p.status}</div>
        </div>
        <div class="disclaimer">Persona linkage reflects statistical writing and behavioural similarity. It is a candidate correlation, not confirmed identity.</div>
      </div>
    `;
  }
  draw(0);
}
function metricRow(label, val){
  return `<div class="metric-row"><div class="m-top"><span class="name">${label}</span><span class="pct">${val}%</span></div><div class="confidence-bar"><i style="width:${val}%; background:${val>=80?"var(--primary)":val>=55?"var(--accent)":"var(--danger)"}"></i></div></div>`;
}

/* ============================================================
   PAGE: TIMELINE
   ============================================================ */
function pageTimeline(){
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Investigation Timeline</div>
      <div class="page-title">Chronological Intelligence Log</div>
    </div>
    <div class="filter-chips" id="tl-chips"></div>
    <div class="panel" id="tl-list"></div>
  `;
}
function afterRenderTimeline(){
  const cats = ["All","Identity","Infrastructure","Blockchain","Persona","Marketplace"];
  let active = "All";
  const events = DATA.demoTimeline.concat(DATA.timelineEvents).sort((a,b)=>a.date.localeCompare(b.date));
  function draw(){
    document.getElementById("tl-chips").innerHTML = cats.map(c => `<button class="chip ${c===active?"active":""}" data-c="${c}">${c}</button>`).join("");
    document.querySelectorAll("#tl-chips .chip").forEach(c => c.addEventListener("click", () => { active = c.dataset.c; draw(); }));
    const list = active === "All" ? events : events.filter(e => e.category === active);
    document.getElementById("tl-list").innerHTML = list.map((e,i) => `
      <div class="tl-item">
        <div class="tl-date">${e.date}</div>
        <div class="tl-dot-col"><div class="tl-dot"></div>${i<list.length-1?'<div class="tl-line"></div>':''}</div>
        <div class="tl-body"><div class="cat upper">${e.category}</div><div class="lbl">${escapeHtml(e.label)}</div></div>
      </div>`).join("") || `<div class="empty-state">No events in this category.</div>`;
  }
  draw();
}

/* ============================================================
   PAGE: EVIDENCE
   ============================================================ */
function pageEvidence(){
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Evidence System</div>
      <div class="page-title">Intelligence Findings &amp; Provenance</div>
    </div>
    <div class="searchbar"><span>⌕</span><input id="ev-search" placeholder="Filter by observation, source, or actor…"/></div>
    <div id="ev-list"></div>
  `;
}
function afterRenderEvidence(){
  function draw(q){
    q = (q||"").toLowerCase();
    const list = DATA.evidence.filter(e => !q || e.observation.toLowerCase().includes(q) || e.source.toLowerCase().includes(q));
    document.getElementById("ev-list").innerHTML = list.slice(0,30).map(evidenceRibbonHtml).join("") || `<div class="empty-state">No evidence matches this filter.</div>`;
  }
  draw("");
  document.getElementById("ev-search").addEventListener("input", (e) => draw(e.target.value));
}

/* ============================================================
   PAGE: CORRELATION SWEEP
   (renamed from "Autonomous Scan" — this performs no live scanning
   or unauthorized access; it re-correlates the existing synthetic/
   demo dataset and, when the backend is live, persists a row to
   scan_history via POST /api/scans so history survives a refresh.)
   ============================================================ */
function pageScan(){
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Intelligence Correlation Sweep</div>
      <div class="page-title">Correlation Sweep Console <span class="pill">DEMONSTRATION MODE</span></div>
      <div class="page-desc">Re-correlates the existing synthetic/demo dataset. No live scanning or unauthorized access of real infrastructure is performed. When connected to the backend, each sweep is saved to the database.</div>
    </div>
    <div class="panel">
      <div class="panel-title upper">Sweep Control</div>
      <div class="scan-status" style="margin-bottom:14px;">
        <span class="pulse" id="scan-pulse" style="display:${state.scanRunning?"block":"none"};"></span>
        <span class="mono" id="scan-status-text">${state.scanRunning ? "RUNNING" : "IDLE"}</span>
      </div>
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button class="btn btn-primary" id="scan-start">RUN CORRELATION SWEEP</button>
      </div>
      <div class="grid-3">
        <div class="counter"><div class="val" id="scan-sources">0</div><div class="lbl upper">Sources Scanned</div></div>
        <div class="counter accent-primary"><div class="val" id="scan-actors">0</div><div class="lbl upper">New Actor Candidates</div></div>
        <div class="counter"><div class="val" id="scan-wallets">0</div><div class="lbl upper">New Wallet Links</div></div>
        <div class="counter"><div class="val" id="scan-infra">0</div><div class="lbl upper">New Infrastructure</div></div>
        <div class="counter accent-warning"><div class="val" id="scan-persona">0</div><div class="lbl upper">Persona Changes</div></div>
        <div class="counter"><div class="val" id="scan-rel">0</div><div class="lbl upper">New Relationships</div></div>
      </div>
    </div>
    <div class="panel" style="margin-top:14px;">
      <div class="panel-title upper">Sweep History ${window.DarktraceAPI && DarktraceAPI.isLive() ? "(persisted)" : "(this session only — backend offline)"}</div>
      <div id="scan-log" class="mono small"></div>
    </div>
  `;
}

function _renderScanLog(rows){
  const log = document.getElementById("scan-log");
  if (!log) return;
  if (!rows || !rows.length) { log.innerHTML = `<div class="empty-state">No sweeps recorded yet.</div>`; return; }
  log.innerHTML = rows.map(r => {
    const when = r.ended_at || r.started_at || "";
    return `<div style="padding:4px 0;border-bottom:1px solid var(--border-soft);">` +
      `[${escapeHtml(String(when))}] ${escapeHtml(r.status)} — ` +
      `${r.sources_scanned||0} sources · ${r.new_actors||0} actors · ${r.new_relationships||0} relationships · ` +
      `${r.new_infrastructure||0} infrastructure · ${r.new_wallet_links||0} wallet links · ${r.persona_changes||0} persona changes` +
      `</div>`;
  }).join("");
}

function afterRenderScan(){
  // Load persisted sweep history if the backend is reachable.
  if (window.DarktraceAPI && DarktraceAPI.isLive()) {
    DarktraceAPI.scans.list().then(_renderScanLog).catch(() => _renderScanLog([]));
  } else {
    _renderScanLog(state.scanLog);
  }

  document.getElementById("scan-start").addEventListener("click", () => {
    if (state.scanRunning) return;
    state.scanRunning = true;
    document.getElementById("scan-status-text").textContent = "RUNNING";
    document.getElementById("scan-pulse").style.display = "block";

    const finish = (result) => {
      state.scanRunning = false;
      document.getElementById("scan-status-text").textContent = "IDLE";
      document.getElementById("scan-pulse").style.display = "none";
      document.getElementById("scan-sources").textContent = result.sources_scanned;
      document.getElementById("scan-actors").textContent = result.new_actors;
      document.getElementById("scan-wallets").textContent = result.new_wallet_links;
      document.getElementById("scan-infra").textContent = result.new_infrastructure;
      document.getElementById("scan-persona").textContent = result.persona_changes;
      document.getElementById("scan-rel").textContent = result.new_relationships;
    };

    if (window.DarktraceAPI && DarktraceAPI.isLive()) {
      DarktraceAPI.scans.start()
        .then(result => {
          finish(result);
          showToast("Correlation sweep complete — saved to scan_history.");
          DarktraceAPI.scans.list().then(_renderScanLog).catch(() => {});
        })
        .catch(() => {
          state.scanRunning = false;
          showToast("Backend unavailable — could not run sweep.");
          document.getElementById("scan-status-text").textContent = "IDLE";
          document.getElementById("scan-pulse").style.display = "none";
        });
    } else {
      // Deterministic local fallback (no Math.random): derived from the
      // counts already loaded into DATA, same formula as the backend uses.
      const result = {
        sources_scanned: DATA.sources.length,
        new_actors: Math.max(1, Math.floor(DATA.actors.length / 12)),
        new_relationships: Math.max(1, Math.floor(DATA.relationships.length / 8)),
        new_infrastructure: Math.max(1, Math.floor(DATA.infrastructure.length / 7)),
        new_wallet_links: Math.max(1, Math.floor(DATA.wallets.length / 5)),
        persona_changes: Math.max(1, Math.floor(DATA.personaComparisons.length / 5)),
        status: "COMPLETED", started_at: new Date().toISOString(), ended_at: new Date().toISOString(),
      };
      setTimeout(() => {
        finish(result);
        state.scanLog.unshift(result);
        _renderScanLog(state.scanLog);
        showToast("Correlation sweep complete (demo mode — not persisted to a database).");
      }, 600);
    }
  });
}

/* ============================================================
   PAGE: REPORTS
   ============================================================ */
function pageReports(){
  const actor = actorById(state.selectedActorId) || DATA.actors[0];
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Reports</div>
      <div class="page-title">Case Report Generator — ${DATA.demoCaseId}</div>
    </div>
    <div class="panel">
      <div class="panel-title upper">Report Contents</div>
      <div class="grid-2">
        <ul class="small muted" style="line-height:2;">
          <li>Case ID &amp; Actor Summary</li>
          <li>Identifiers (aliases, PGP, wallets)</li>
          <li>Infrastructure Correlation</li>
          <li>Blockchain Relationships</li>
        </ul>
        <ul class="small muted" style="line-height:2;">
          <li>Persona Analysis</li>
          <li>Timeline of Events</li>
          <li>Evidence &amp; Source Reliability</li>
          <li>Attribution Confidence Breakdown</li>
        </ul>
      </div>
      <div style="display:flex; gap:8px; margin-top:14px;">
        <button class="btn btn-primary" id="rep-json">EXPORT JSON</button>
        <button class="btn" id="rep-csv">EXPORT CSV</button>
        <button class="btn" id="rep-pdf">GENERATE PDF REPORT</button>
      </div>
    </div>
    <div class="panel" style="margin-top:14px;">
      <div class="panel-title upper">Analyst Notes</div>
      <textarea class="mono" style="width:100%; min-height:90px; background:var(--bg-2); border:1px solid var(--border); border-radius:4px; color:var(--text); padding:10px; font-size:12px;" placeholder="Add investigation notes for this report…"></textarea>
    </div>
  `;
}
function afterRenderReports(){
  const actor = actorById(state.selectedActorId) || DATA.actors[0];
  function buildReportObj(){
    return {
      caseId: DATA.demoCaseId,
      actor: actor.alias,
      confidence: actor.confidence,
      identifiers: { aliases: relatedAliases(actor.id).map(a=>a.handle), pgp: relatedPGP(actor.id).map(p=>p.fingerprint), wallets: relatedWallets(actor.id).map(w=>w.address) },
      infrastructure: relatedInfra(actor.id),
      persona: DATA.personaComparisons.filter(p=>p.personaA.includes(actor.alias)||p.personaB.includes(actor.alias)),
      timeline: relatedTimeline(actor.id),
      evidence: relatedEvidence(actor.id),
      attributionFactors: DATA.attributionFactors,
      generated: new Date().toISOString(),
      dataClassification: "SYNTHETIC / DEMONSTRATION DATA",
    };
  }
  function download(filename, content, type){
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  document.getElementById("rep-json").addEventListener("click", () => { download(`darktrace-${DATA.demoCaseId}.json`, JSON.stringify(buildReportObj(), null, 2), "application/json"); showToast("JSON report exported."); });
  document.getElementById("rep-csv").addEventListener("click", () => {
    const rows = [["id","type","source","observation","reliability","confidence"]];
    relatedEvidence(actor.id).forEach(e => rows.push([e.id, e.type, e.source, e.observation.replace(/,/g," "), e.reliability, e.confidence]));
    download(`darktrace-${DATA.demoCaseId}-evidence.csv`, rows.map(r=>r.join(",")).join("\n"), "text/csv");
    showToast("CSV report exported.");
  });
  document.getElementById("rep-pdf").addEventListener("click", () => {
    const w = window.open("", "_blank");
    const r = buildReportObj();
    w.document.write(`<html><head><title>DARKTRACE AI Report ${r.caseId}</title>
      <style>body{font-family:monospace;background:#080B12;color:#E7ECF3;padding:40px;} h1{color:#13B8A6;} h2{color:#5B8DEF; margin-top:24px;} .m{color:#8993A4;font-size:12px;}</style></head><body>
      <h1>DARKTRACE AI — Case Report</h1>
      <div class="m">SYNTHETIC / DEMONSTRATION DATA — Generated ${r.generated}</div>
      <h2>Case ${r.caseId} — ${r.actor}</h2>
      <div>Attribution Confidence: ${r.confidence}%</div>
      <h2>Identifiers</h2><pre>${JSON.stringify(r.identifiers,null,2)}</pre>
      <h2>Infrastructure</h2><pre>${JSON.stringify(r.infrastructure,null,2)}</pre>
      <h2>Persona</h2><pre>${JSON.stringify(r.persona,null,2)}</pre>
      <h2>Timeline</h2><pre>${JSON.stringify(r.timeline,null,2)}</pre>
      <h2>Evidence</h2><pre>${JSON.stringify(r.evidence,null,2)}</pre>
      <p class="m">Candidate attribution only. Not a guarantee of real-world identity.</p>
      </body></html>`);
    w.document.close(); w.print();
  });
}

/* ============================================================
   PAGE: SETTINGS
   ============================================================ */
function pageSettings(){
  return `
    <div class="page-head">
      <div class="page-eyebrow upper">Settings</div>
      <div class="page-title">Platform Configuration</div>
    </div>
    <div class="panel">
      <div class="panel-title upper">Environment</div>
      <div class="dossier-row"><div class="k">Mode</div><div class="v">Demonstration (Synthetic Data)</div></div>
      <div class="dossier-row"><div class="k">Data Source</div><div class="v">Local synthetic dataset — no live scraping or unauthorized access</div></div>
      <div class="dossier-row"><div class="k">Graph Backend</div><div class="v">In-memory fallback (Neo4j not configured)</div></div>
      <div class="dossier-row"><div class="k">Version</div><div class="v">DARKTRACE AI Prototype v1.0 — SIH26151</div></div>
    </div>
    <div class="panel" style="margin-top:14px;">
      <div class="panel-title upper">Source Reliability</div>
      ${DATA.sources.map(s => `<div class="dossier-row"><div class="k">${escapeHtml(s.name)}</div><div class="v"><span class="badge ${confBadgeClass(s.reliability)}">${s.reliability}%</span></div></div>`).join("")}
    </div>
  `;
}

/* ============================================================
   ATTRIBUTION CONFIDENCE WIDGET (used within actor page footer optionally)
   ============================================================ */

/* ============================================================
   RENDER DISPATCH
   ============================================================ */
const PAGES = {
  investigation: { render: pageInvestigation, after: afterRenderInvestigation },
  actors: { render: pageActors, after: afterRenderActors },
  infrastructure: { render: pageInfrastructure, after: afterRenderInfrastructure },
  graph: { render: pageGraph, after: afterRenderGraph },
  blockchain: { render: pageBlockchain, after: afterRenderBlockchain },
  persona: { render: pagePersona, after: afterRenderPersona },
  timeline: { render: pageTimeline, after: afterRenderTimeline },
  evidence: { render: pageEvidence, after: afterRenderEvidence },
  scan: { render: pageScan, after: afterRenderScan },
  reports: { render: pageReports, after: afterRenderReports },
  settings: { render: pageSettings, after: null },
};

function render(){
  renderShell();
  const page = PAGES[state.route] || PAGES.investigation;
  document.getElementById("content").innerHTML = page.render();
  if (page.after) page.after();
}

function boot() {
  const initial = window.location.hash.replace("#","");
  if (initial && PAGES[initial]) state.route = initial;
  render();
  setInterval(() => {
    const clockEl = document.getElementById("topbar-clock");
    if (clockEl) clockEl.textContent = clockStrings().t;
  }, 1000);
}

// app.js is now loaded dynamically by api-client.js AFTER the initial
// document has already parsed (so it can wait on the backend fetch
// first) — by that point DOMContentLoaded has usually already fired,
// so waiting for it here would leave the app blank forever. Boot
// immediately if the document is already ready, otherwise wait as before.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
