/* ═══════════════════════════════════════
   CoreInventory — Receipts Module
   File: js/receipts.js
   Depends on: data.js
═══════════════════════════════════════ */

function renderReceipts(statusFilter = '') {
  const sf = statusFilter || document.getElementById('rec-status-filter').value;
  const rows = receipts.filter(r => !sf || r.status === sf);
  document.getElementById('receipts-table').innerHTML = rows.length
    ? rows.map(r => `
        <tr>
          <td class="td-mono">${r.id}</td>
          <td>${r.supplier}</td>
          <td><strong>${r.product}</strong> × ${r.qty}</td>
          <td class="td-muted">${r.date}</td>
          <td><span class="badge ${BC[r.status] || 'badge-draft'}">${r.status}</span></td>
          <td style="display:flex;gap:6px;flex-wrap:wrap">
            ${r.status === 'Waiting' ? `<button class="act-btn" onclick="updateReceipt('${r.id}','Ready')">Mark Ready</button>` : ''}
            ${r.status === 'Ready'   ? `<button class="act-btn green" onclick="validateReceipt('${r.id}')">✓ Validate</button>` : ''}
            ${r.status !== 'Done' && r.status !== 'Canceled' ? `<button class="act-btn red" onclick="updateReceipt('${r.id}','Canceled')">Cancel</button>` : ''}
          </td>
        </tr>`).join('')
    : `<tr><td colspan="6" style="text-align:center;color:#aaa;padding:28px">No receipts found.</td></tr>`;
}

function updateReceipt(id, status) {
  const r = receipts.find(x => x.id === id);
  if (r) r.status = status;
  saveData();
  renderAll();
}

function validateReceipt(id) {
  const r = receipts.find(x => x.id === id);
  if (!r) return;
  const p = products.find(x => x.name === r.product);
  if (p) {
    p.stock += r.qty;
    moveHistory.unshift({ date: today(), ref: r.id, product: r.product, type: 'Receipt', movement: 'IN', qty: '+' + r.qty, unit: p.unit, stockAfter: p.stock });
  }
  r.status = 'Done';
  saveData();
  renderAll();
  alert(`✅ Receipt validated! Stock increased by ${r.qty} ${p ? p.unit : ''}.`);
}

function saveReceipt() {
  const sup  = document.getElementById('r-supplier').value.trim();
  const prod = document.getElementById('r-product').value;
  const qty  = parseInt(document.getElementById('r-qty').value) || 1;
  const date = document.getElementById('r-date').value || today();
  if (!sup) { alert('Supplier required.'); return; }
  receipts.unshift({ id: 'REC-' + String(receipts.length + 1).padStart(3, '0'), supplier: sup, product: prod, qty, status: 'Waiting', date, items: 1 });
  saveData();
  closeModal('receipt');
  renderAll();
  document.getElementById('r-supplier').value = '';
}
