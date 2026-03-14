/* ═══════════════════════════════════════
   CoreInventory — Dashboard & Navigation
   File: js/dashboard.js
   Depends on: data.js, auth.js
═══════════════════════════════════════ */

// ── OPEN DASHBOARD ─────────────────────────────────────
function openDashboard(user) {
  currentUser = user;
  loadData();
  showPage('dashboard-page');

  document.getElementById('user-name').textContent     = user.name;
  document.getElementById('user-role-tag').textContent = user.role;
  document.getElementById('user-avatar').textContent   = user.name.charAt(0).toUpperCase();
  document.getElementById('user-avatar').className     = 'user-avatar ' + (user.role === 'Inventory Manager' ? 'avatar-manager' : 'avatar-staff');

  const rt = document.getElementById('topbar-role-tag');
  rt.textContent = user.role;
  rt.className   = 'role-tag ' + (user.role === 'Inventory Manager' ? 'role-tag-manager' : 'role-tag-staff');

  document.getElementById('settings-user-info').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:4px 0">
      <div class="user-avatar ${user.role === 'Inventory Manager' ? 'avatar-manager' : 'avatar-staff'}" style="width:44px;height:44px;font-size:18px">
        ${user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div style="font-size:14px;font-weight:600">${user.name}</div>
        <div style="font-size:12px;color:#888">${user.email || ''}</div>
        <div style="margin-top:4px">
          <span class="role-tag ${user.role === 'Inventory Manager' ? 'role-tag-manager' : 'role-tag-staff'}">${user.role}</span>
        </div>
      </div>
    </div>`;

  renderAll();
}

// ── SIDEBAR NAVIGATION ─────────────────────────────────
const pageTitles = {
  dashboard:   'Dashboard',
  products:    'Products',
  receipts:    'Receipts',
  deliveries:  'Delivery Orders',
  transfers:   'Internal Transfers',
  adjustments: 'Stock Adjustments',
  history:     'Move History',
  settings:    'Settings',
};

function goPage(page, btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-' + page).classList.add('active');
  document.getElementById('page-title').textContent = pageTitles[page] || page;
  document.getElementById('global-search').value = '';
  if (page === 'products')    renderProducts();
  if (page === 'receipts')    renderReceipts();
  if (page === 'deliveries')  renderDeliveries();
  if (page === 'transfers')   renderTransfers();
  if (page === 'adjustments') renderAdjustments();
  if (page === 'history')     renderHistory();
  if (page === 'settings')    renderSettings();
}

function renderAll() {
  renderKPIs();
  renderAlerts();
  renderActivity();
  renderProducts();
  renderReceipts();
  renderDeliveries();
  renderTransfers();
  renderAdjustments();
  renderHistory();
  renderSettings();
}

// ── KPIs ───────────────────────────────────────────────
function renderKPIs() {
  const low = products.filter(p => p.stock > 0 && p.stock <= p.reorderAt).length;
  const out = products.filter(p => p.stock === 0).length;
  document.getElementById('kpi-total').textContent      = products.length;
  document.getElementById('kpi-low').textContent        = low;
  document.getElementById('kpi-out').textContent        = out;
  document.getElementById('kpi-receipts').textContent   = receipts.filter(r => r.status !== 'Done' && r.status !== 'Canceled').length;
  document.getElementById('kpi-deliveries').textContent = deliveries.filter(d => d.status !== 'Done' && d.status !== 'Canceled').length;
  document.getElementById('stock-badge').textContent    = low + out;
}

// ── STOCK ALERTS ───────────────────────────────────────
function renderAlerts() {
  const alerts = products.filter(p => p.stock <= p.reorderAt);
  document.getElementById('alert-count').textContent = alerts.length + ' items';
  document.getElementById('alert-list').innerHTML = alerts.map(p => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid #f0f0f0">
      <div style="width:8px;height:8px;border-radius:50%;background:${p.stock === 0 ? '#ef4444' : '#f97316'};flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${p.name}</div>
        <div style="font-size:11px;color:#888;font-family:monospace">${p.sku}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:16px;font-weight:700;color:${p.stock === 0 ? '#ef4444' : '#f97316'}">${p.stock} ${p.unit}</div>
        <div style="font-size:11px;color:#aaa">min ${p.reorderAt}</div>
      </div>
    </div>`).join('') || '<p style="color:#aaa;padding:12px 0;font-size:13px">✅ No stock alerts right now.</p>';
}

// ── ACTIVITY TABLE ─────────────────────────────────────
let activeFilters = { type: 'All', status: 'All' };

function filterBy(key, value, btn) {
  activeFilters[key] = value;
  if (btn) {
    document.querySelectorAll('.filter-chip').forEach(c => {
      if (c.getAttribute('onclick') && c.getAttribute('onclick').includes(`'${key}'`))
        c.classList.remove('active');
    });
    btn.classList.add('active');
  }
  renderActivity();
}

const BC = { Done: 'badge-done', Waiting: 'badge-waiting', Ready: 'badge-ready', Draft: 'badge-draft', Pick: 'badge-pick', Pack: 'badge-pack', Canceled: 'badge-canceled' };

function renderActivity(search = '') {
  const all = [
    ...receipts.map(r    => ({ id: r.id, type: 'Receipts',    party: r.supplier, items: r.items || 1, date: r.date, status: r.status })),
    ...deliveries.map(d  => ({ id: d.id, type: 'Delivery',    party: d.customer, items: d.items || 1, date: d.date, status: d.status })),
    ...adjustments.map(a => ({ id: a.id, type: 'Adjustments', party: a.product,  items: 1,            date: a.date, status: 'Done' })),
  ];
  const f = activeFilters;
  const filtered = all.filter(op =>
    (f.type   === 'All' || op.type   === f.type) &&
    (f.status === 'All' || op.status === f.status) &&
    (!search || op.id.toLowerCase().includes(search) || op.party.toLowerCase().includes(search))
  );
  document.getElementById('activity-table').innerHTML = filtered.length
    ? filtered.map(op => `
        <tr>
          <td class="td-mono">${op.id}</td>
          <td><span style="background:#f1f5f9;color:#475569;border-radius:5px;padding:2px 8px;font-size:11px">${op.type}</span></td>
          <td>${op.party}</td>
          <td class="td-muted">${op.items}</td>
          <td class="td-muted" style="font-size:12px">${op.date}</td>
          <td><span class="badge ${BC[op.status] || 'badge-draft'}">${op.status}</span></td>
        </tr>`).join('')
    : `<tr><td colspan="6" style="text-align:center;color:#aaa;padding:28px">No records match your filters.</td></tr>`;
}

// ── GLOBAL SEARCH ──────────────────────────────────────
function globalSearch(q) {
  const active = document.querySelector('.page-section.active');
  if (!active) return;
  const page = active.id.replace('section-', '');
  if (page === 'dashboard') renderActivity(q.toLowerCase());
  if (page === 'products')  renderProducts(q);
}
