/* ═══════════════════════════════════════
   CoreInventory — Products Module
   File: js/products.js
   Depends on: data.js
═══════════════════════════════════════ */

function stockStatus(p) {
  if (p.stock === 0)          return '<span class="badge badge-canceled">Out of Stock</span>';
  if (p.stock <= p.reorderAt) return '<span class="badge badge-waiting">Low Stock</span>';
  return '<span class="badge badge-done">In Stock</span>';
}

function stockBar(p) {
  const pct = Math.min(100, p.reorderAt > 0 ? Math.round(p.stock / p.reorderAt * 100) : 100);
  const col = p.stock === 0 ? '#ef4444' : p.stock <= p.reorderAt ? '#f97316' : '#22c55e';
  return `<div class="stock-bar-wrap">
    <span style="min-width:36px;font-size:13px;font-weight:600">${p.stock}</span>
    <div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%;background:${col}"></div></div>
  </div>`;
}

function renderProducts(search = '', cat = '') {
  const catVal = cat || document.getElementById('cat-filter').value;
  const rows = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) &&
    (!catVal || p.category === catVal)
  );
  document.getElementById('products-table').innerHTML = rows.length
    ? rows.map(p => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td class="td-mono">${p.sku}</td>
          <td><span style="background:#f1f5f9;color:#475569;border-radius:5px;padding:2px 8px;font-size:11px">${p.category}</span></td>
          <td class="td-muted">${p.unit}</td>
          <td>${stockBar(p)}</td>
          <td class="td-muted">${p.reorderAt} ${p.unit}</td>
          <td>${stockStatus(p)}</td>
          <td><button class="act-btn red" onclick="deleteProduct('${p.id}')">Delete</button></td>
        </tr>`).join('')
    : `<tr><td colspan="8" style="text-align:center;color:#aaa;padding:28px">No products found.</td></tr>`;
}

function saveProduct() {
  const name = document.getElementById('p-name').value.trim();
  const sku  = document.getElementById('p-sku').value.trim();
  if (!name || !sku) { alert('Name and SKU are required.'); return; }
  const p = {
    id: 'p' + Date.now(),
    name, sku,
    category:  document.getElementById('p-cat').value,
    unit:      document.getElementById('p-unit').value,
    stock:     parseInt(document.getElementById('p-stock').value)   || 0,
    reorderAt: parseInt(document.getElementById('p-reorder').value) || 10,
  };
  products.push(p);
  if (p.stock > 0) {
    moveHistory.unshift({ date: today(), ref: 'INIT', product: p.name, type: 'Receipt', movement: 'IN', qty: '+' + p.stock, unit: p.unit, stockAfter: p.stock });
  }
  saveData();
  closeModal('product');
  renderAll();
  ['p-name', 'p-sku'].forEach(id => document.getElementById(id).value = '');
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter(p => p.id !== id);
  saveData();
  renderAll();
}
