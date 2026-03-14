/* ═══════════════════════════════════════
   CoreInventory — Move History Module
   File: js/history.js
   Depends on: data.js
═══════════════════════════════════════ */

function renderHistory(typeFilter = '', prodFilter = '') {
  const tf = typeFilter || document.getElementById('hist-type-filter').value;
  const pf = prodFilter || document.getElementById('hist-prod-filter').value;

  // Populate product filter dropdown dynamically
  const pSel     = document.getElementById('hist-prod-filter');
  const existing = Array.from(pSel.options).map(o => o.value);
  products.forEach(p => {
    if (!existing.includes(p.name)) {
      const o = document.createElement('option');
      o.value = p.name;
      o.textContent = p.name;
      pSel.appendChild(o);
    }
  });

  const rows = moveHistory.filter(h => (!tf || h.type === tf) && (!pf || h.product === pf));
  document.getElementById('history-table').innerHTML = rows.length
    ? rows.map(h => `
        <tr>
          <td class="td-muted">${h.date}</td>
          <td class="td-mono">${h.ref}</td>
          <td><strong>${h.product}</strong></td>
          <td><span style="background:#f1f5f9;color:#475569;border-radius:5px;padding:2px 8px;font-size:11px">${h.type}</span></td>
          <td class="td-muted" style="font-size:12px">${h.movement}</td>
          <td style="font-weight:700;color:${h.qty.toString().startsWith('-') ? '#ef4444' : '#22c55e'}">${h.qty} ${h.unit}</td>
          <td class="td-muted">${h.stockAfter}</td>
        </tr>`).join('')
    : `<tr><td colspan="7" style="text-align:center;color:#aaa;padding:28px">No history found.</td></tr>`;
}
