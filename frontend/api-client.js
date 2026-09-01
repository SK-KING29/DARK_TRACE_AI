/* ============================================================
   DARKTRACE AI — BACKEND INTEGRATION / BOOT ORCHESTRATOR
   ============================================================
   This is now the FIRST and ONLY script tag index.html loads.
   It is responsible for:

     1. Trying to fetch the live case from the FastAPI backend
        (GET /api/demo/load), with a short timeout so a slow/dead
        backend never hangs the app.
     2. Exposing the result on window.__DARKTRACE_PRELOADED_DATA__
        BEFORE data.js runs, so data.js can use real database-backed
        data instead of always generating a fresh client-side case.
     3. Loading data.js, then app.js, in that guaranteed order —
        <script> tags can't `await` each other, so previously
        api-client.js's fetch was a no-op: data.js had already run
        by the time the fetch resolved. This file now drives the
        whole boot sequence instead of running in parallel with it.

   Configure the backend URL for split deployments (e.g. frontend on
   Netlify, backend on Render) by setting window.DARKTRACE_API_BASE
   in index.html BEFORE this script tag, e.g.:

       <script>window.DARKTRACE_API_BASE = "https://your-backend.onrender.com";</script>
       <script src="api-client.js"></script>

   Leave it unset (empty string) when the backend serves the frontend
   itself from the same origin (the default docker-compose / single
   Render service setup) — that's the zero-config case.
   ============================================================ */
(function () {
  var API_BASE = window.DARKTRACE_API_BASE || "";
  var FETCH_TIMEOUT_MS = 4000;

  // ---------------------------------------------------------------
  // Small persistence helper used by app.js for anything that must
  // survive a browser refresh (analyst notes, correlation sweeps).
  // Exposed on window so app.js (loaded after this file) can call it.
  // If a call fails (backend offline), it rejects — callers fall back
  // to local in-memory behaviour and should tell the user data won't
  // persist, per the spec's "never silently fail" requirement.
  // ---------------------------------------------------------------
  window.DarktraceAPI = {
    isLive: function () { return !!(window.DATA && window.DATA.source === "backend"); },
    notes: {
      list: function (investigationId) {
        return fetch(API_BASE + "/api/notes?investigation_id=" + encodeURIComponent(investigationId))
          .then(function (r) { if (!r.ok) throw new Error("GET /api/notes " + r.status); return r.json(); });
      },
      create: function (investigationId, author, body) {
        return fetch(API_BASE + "/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ investigation_id: investigationId, author: author, body: body }),
        }).then(function (r) { if (!r.ok) throw new Error("POST /api/notes " + r.status); return r.json(); });
      },
      remove: function (noteId) {
        return fetch(API_BASE + "/api/notes/" + encodeURIComponent(noteId), { method: "DELETE" })
          .then(function (r) { if (!r.ok) throw new Error("DELETE /api/notes " + r.status); return r.json(); });
      },
    },
    scans: {
      list: function () {
        return fetch(API_BASE + "/api/scans")
          .then(function (r) { if (!r.ok) throw new Error("GET /api/scans " + r.status); return r.json(); });
      },
      start: function () {
        return fetch(API_BASE + "/api/scans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        }).then(function (r) { if (!r.ok) throw new Error("POST /api/scans " + r.status); return r.json(); });
      },
    },
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Failed to load " + src)); };
      document.body.appendChild(s);
    });
  }

  function fetchDemoCase() {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller && setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);
    return fetch(API_BASE + "/api/demo/load", {
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw new Error("API responded " + res.status);
        return res.json();
      })
      .then(function (json) {
        window.__DARKTRACE_PRELOADED_DATA__ = json;
        console.info("[DARKTRACE AI] Loaded live case from backend API (" + (API_BASE || "same-origin") + ").");
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        window.__DARKTRACE_PRELOADED_DATA__ = null;
        console.info("[DARKTRACE AI] Backend API unavailable — using local deterministic demo case.", err.message);
      });
  }

  // Real backend + database status for the API/DB status pills — never
  // just infer "ONLINE" from the demo case having loaded. If this fetch
  // fails or times out, window.__DARKTRACE_HEALTH__ stays null and the UI
  // shows API ● OFFLINE / DB ● UNAVAILABLE / MODE ● LOCAL FALLBACK.
  function fetchHealth() {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller && setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);
    return fetch(API_BASE + "/health", {
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw new Error("health responded " + res.status);
        return res.json();
      })
      .then(function (json) { window.__DARKTRACE_HEALTH__ = json; })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        window.__DARKTRACE_HEALTH__ = null;
        console.info("[DARKTRACE AI] Health check failed — reporting DB as unavailable.", err.message);
      });
  }

  Promise.all([fetchDemoCase(), fetchHealth()])
    .then(function () { return loadScript("data.js"); })
    .then(function () { return loadScript("app.js"); })
    .catch(function (err) {
      console.error("[DARKTRACE AI] Fatal boot error:", err);
      var el = document.getElementById("app");
      if (el) {
        el.innerHTML = "<div style='padding:40px;font-family:monospace;color:#f66'>" +
          "Unable to load investigation.<br>The API server may be unavailable and the local " +
          "fallback failed to load.<br><button onclick='location.reload()'>Retry</button></div>";
      }
    });
})();
