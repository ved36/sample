/* ═══════════════════════════════════════
   CoreInventory — Utilities & Boot
   File: js/utils.js
   Depends on: auth.js, dashboard.js
═══════════════════════════════════════ */

// ── HELPERS ────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0];
}

function showErr(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

// ── BOOT — Auto-login if session exists ────────────────
(function boot() {
  const session = getSession();
  if (session) openDashboard(session);
})();
