/* ═══════════════════════════════════════
   CoreInventory — Modals
   File: js/modals.js
   Depends on: data.js
═══════════════════════════════════════ */

function openModal(type) {
  // Fill product dropdowns with current products
  ['r-product', 'd-product', 't-product', 'a-product'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = products.map(p => `<option value="${p.name}">${p.name} (${p.stock} ${p.unit})</option>`).join('');
    }
  });
  // Set today's date in date inputs
  ['r-date', 'd-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today();
  });
  document.getElementById('modal-' + type).classList.add('open');
}

function closeModal(type) {
  document.getElementById('modal-' + type).classList.remove('open');
}

// Close modal when clicking the dark overlay behind it
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
