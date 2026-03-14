/* ═══════════════════════════════════════
   CoreInventory — Settings Module
   File: js/settings.js
   Depends on: data.js
═══════════════════════════════════════ */

function renderSettings() {
  document.getElementById('wh-list').innerHTML = warehouses.map((w, i) => `
    <div class="wh-card">
      <div>
        <div class="wh-name">🏭 ${w}</div>
        <div class="wh-loc">India</div>
      </div>
      ${i > 1
        ? `<button class="act-btn red" onclick="deleteWarehouse(${i})">Remove</button>`
        : '<span class="badge badge-done">Active</span>'}
    </div>`).join('');
}

function saveWarehouse() {
  const name = document.getElementById('wh-name').value.trim();
  if (!name) { alert('Warehouse name required.'); return; }
  warehouses.push(name);
  saveData();
  closeModal('warehouse');
  renderSettings();
  document.getElementById('wh-name').value = '';
  document.getElementById('wh-loc').value  = '';
}

function deleteWarehouse(idx) {
  if (!confirm('Remove this warehouse?')) return;
  warehouses.splice(idx, 1);
  saveData();
  renderSettings();
}
