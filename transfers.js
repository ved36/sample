/* ═══════════════════════════════════════
   CoreInventory — Transfers Module
   File: js/transfers.js
   Depends on: data.js
═══════════════════════════════════════ */

function renderTransfers(statusFilter = '') {
  const sf = statusFilter || document.getElementById('trf-status-filter').value;
  const rows = transfers.filter(t => !sf || t.status === sf);
  document.getElementById('transfers-table').innerHTML = rows.length
    ? rows.map(t => `
        <tr>
          <td class="td-mono">${t.id}</td>
          <td><strong>${t.product}</strong></td>
          <td class="td-muted">${t.from}</td>
          <td class="td-muted">${t.to}</td>
          <td>${t.qty}</td>
          <td class="td-muted">${t.date}</td>
          <td><span class="badge ${BC[t.status] || 'badge-draft'}">${t.status}</span></td>
          <td style="display:flex;gap:6px">
            ${t.status === 'Draft' ? `<button class="act-btn" onclick="updateTransfer('${t.id}','Ready')">Mark Ready</button>` : ''}
            ${t.status === 'Ready' ? `<button class="act-btn green" onclick="validateTransfer('${t.id}')">✓ Complete</button>` : ''}
          </td>
        </tr>`).join('')
    : `<tr><td colspan="8" style="text-align:center;color:#aaa;padding:28px">No transfers found.</td></tr>`;
}

function updateTransfer(id, status) {
  const t = transfers.find(x => x.id === id);
  if (t) t.status = status;
  saveData();
  renderAll();
}

function validateTransfer(id) {
  const t = transfers.find(x => x.id === id);
  if (!t) return;
  moveHistory.unshift({ date: today(), ref: t.id, product: t.product, type: 'Transfer', movement: t.from + '→' + t.to, qty: t.qty, unit: '', stockAfter: '—' });
  t.status = 'Done';
  saveData();
  renderAll();
  alert(`✅ Transfer completed: ${t.product} moved from ${t.from} to ${t.to}.`);
}

function saveTransfer() {
  const prod = document.getElementById('t-product').value;
  const from = document.getElementById('t-from').value;
  const to   = document.getElementById('t-to').value;
  const qty  = parseInt(document.getElementById('t-qty').value) || 1;
  if (from === to) { alert('From and To locations cannot be the same.'); return; }
  transfers.unshift({ id: 'TRF-' + String(transfers.length + 1).padStart(3, '0'), product: prod, from, to, qty, status: 'Draft', date: today() });
  saveData();
  closeModal('transfer');
  renderAll();
}
