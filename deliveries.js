/* ═══════════════════════════════════════
   CoreInventory — Deliveries Module
   File: js/deliveries.js
   Depends on: data.js
═══════════════════════════════════════ */

function renderDeliveries(statusFilter = '') {
  const sf = statusFilter || document.getElementById('del-status-filter').value;
  const rows = deliveries.filter(d => !sf || d.status === sf);
  document.getElementById('deliveries-table').innerHTML = rows.length
    ? rows.map(d => `
        <tr>
          <td class="td-mono">${d.id}</td>
          <td>${d.customer}</td>
          <td><strong>${d.product}</strong> × ${d.qty}</td>
          <td class="td-muted">${d.date}</td>
          <td><span class="badge ${BC[d.status] || 'badge-draft'}">${d.status}</span></td>
          <td style="display:flex;gap:6px;flex-wrap:wrap">
            ${d.status === 'Pick' ? `<button class="act-btn" onclick="updateDelivery('${d.id}','Pack')">→ Pack</button>` : ''}
            ${d.status === 'Pack' ? `<button class="act-btn green" onclick="validateDelivery('${d.id}')">✓ Ship</button>` : ''}
            ${d.status !== 'Done' && d.status !== 'Canceled' ? `<button class="act-btn red" onclick="updateDelivery('${d.id}','Canceled')">Cancel</button>` : ''}
          </td>
        </tr>`).join('')
    : `<tr><td colspan="6" style="text-align:center;color:#aaa;padding:28px">No delivery orders found.</td></tr>`;
}

function updateDelivery(id, status) {
  const d = deliveries.find(x => x.id === id);
  if (d) d.status = status;
  saveData();
  renderAll();
}

function validateDelivery(id) {
  const d = deliveries.find(x => x.id === id);
  if (!d) return;
  const p = products.find(x => x.name === d.product);
  if (p) {
    if (p.stock < d.qty) { alert(`⚠️ Insufficient stock! Only ${p.stock} ${p.unit} available.`); return; }
    p.stock -= d.qty;
    moveHistory.unshift({ date: today(), ref: d.id, product: d.product, type: 'Delivery', movement: 'OUT', qty: '-' + d.qty, unit: p.unit, stockAfter: p.stock });
  }
  d.status = 'Done';
  saveData();
  renderAll();
  alert(`✅ Delivery shipped! Stock decreased by ${d.qty} ${p ? p.unit : ''}.`);
}

function saveDelivery() {
  const cust = document.getElementById('d-customer').value.trim();
  const prod = document.getElementById('d-product').value;
  const qty  = parseInt(document.getElementById('d-qty').value) || 1;
  const date = document.getElementById('d-date').value || today();
  if (!cust) { alert('Customer required.'); return; }
  deliveries.unshift({ id: 'DEL-' + String(deliveries.length + 1).padStart(3, '0'), customer: cust, product: prod, qty, status: 'Pick', date, items: 1 });
  saveData();
  closeModal('delivery');
  renderAll();
  document.getElementById('d-customer').value = '';
}
