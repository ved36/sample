/* ═══════════════════════════════════════
   CoreInventory — Adjustments Module
   File: js/adjustments.js
   Depends on: data.js
═══════════════════════════════════════ */

function renderAdjustments() {
  document.getElementById('adjustments-table').innerHTML = adjustments.length
    ? adjustments.map(a => `
        <tr>
          <td class="td-mono">${a.id}</td>
          <td><strong>${a.product}</strong></td>
          <td><span class="badge ${a.type === 'Increase' ? 'badge-in' : 'badge-out'}">${a.type === 'Increase' ? '▲ Increase' : '▼ Decrease'}</span></td>
          <td>${a.qty}</td>
          <td class="td-muted">${a.reason}</td>
          <td class="td-muted">${a.date}</td>
          <td class="td-muted">${a.by || '—'}</td>
        </tr>`).join('')
    : `<tr><td colspan="7" style="text-align:center;color:#aaa;padding:28px">No adjustments yet.</td></tr>`;
}

function saveAdjustment() {
  const prod   = document.getElementById('a-product').value;
  const type   = document.getElementById('a-type').value;
  const qty    = parseInt(document.getElementById('a-qty').value) || 1;
  const reason = document.getElementById('a-reason').value;
  const p      = products.find(x => x.name === prod);
  if (p) {
    if (type === 'Decrease' && p.stock < qty) { alert(`⚠️ Cannot decrease: only ${p.stock} ${p.unit} in stock.`); return; }
    p.stock += type === 'Increase' ? qty : -qty;
    moveHistory.unshift({ date: today(), ref: 'ADJ-' + String(adjustments.length + 1).padStart(3, '0'), product: prod, type: 'Adjustment', movement: type, qty: (type === 'Increase' ? '+' : '-') + qty, unit: p.unit, stockAfter: p.stock });
  }
  adjustments.unshift({ id: 'ADJ-' + String(adjustments.length + 1).padStart(3, '0'), product: prod, type, qty, reason, date: today(), by: currentUser ? currentUser.name : '—' });
  saveData();
  closeModal('adjustment');
  renderAll();
  alert(`✅ Stock ${type.toLowerCase()}d by ${qty} for ${prod}.`);
}
