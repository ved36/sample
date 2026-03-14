/* ═══════════════════════════════════════
   CoreInventory — Data & Storage
   File: js/data.js
═══════════════════════════════════════ */

// ── DEFAULT SEED DATA ──────────────────────────────────
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Steel Rods',     sku: 'STL-001', category: 'Raw Materials', unit: 'kg',  stock: 77, reorderAt: 20 },
  { id: 'p2', name: 'Office Chairs',  sku: 'FRN-042', category: 'Furniture',     unit: 'pcs', stock: 14, reorderAt: 10 },
  { id: 'p3', name: 'Copper Wire',    sku: 'ELC-007', category: 'Electrical',    unit: 'm',   stock: 6,  reorderAt: 15 },
  { id: 'p4', name: 'PVC Pipes',      sku: 'PLM-003', category: 'Plumbing',      unit: 'pcs', stock: 0,  reorderAt: 10 },
  { id: 'p5', name: 'Safety Helmets', sku: 'SAF-012', category: 'Safety',        unit: 'pcs', stock: 32, reorderAt: 10 },
];
const DEFAULT_RECEIPTS = [
  { id: 'REC-001', supplier: 'MetalCorp', product: 'Steel Rods',    qty: 50,  status: 'Done',    date: '2025-03-10', items: 1 },
  { id: 'REC-002', supplier: 'FurniHub',  product: 'Office Chairs', qty: 20,  status: 'Waiting', date: '2025-03-13', items: 1 },
  { id: 'REC-003', supplier: 'ElecParts', product: 'Copper Wire',   qty: 100, status: 'Ready',   date: '2025-03-14', items: 1 },
];
const DEFAULT_DELIVERIES = [
  { id: 'DEL-001', customer: 'ABC Corp', product: 'Steel Rods',    qty: 10, status: 'Done', date: '2025-03-09', items: 1 },
  { id: 'DEL-002', customer: 'XYZ Ltd',  product: 'Office Chairs', qty: 5,  status: 'Pick', date: '2025-03-14', items: 1 },
];
const DEFAULT_TRANSFERS = [
  { id: 'TRF-001', product: 'Steel Rods',  from: 'Main Warehouse', to: 'Production Floor', qty: 30, status: 'Done',  date: '2025-03-11' },
  { id: 'TRF-002', product: 'Copper Wire', from: 'Rack A',         to: 'Rack B',           qty: 10, status: 'Ready', date: '2025-03-14' },
];
const DEFAULT_ADJUSTMENTS = [
  { id: 'ADJ-001', product: 'Steel Rods', type: 'Decrease', qty: 3, reason: 'Damaged',        date: '2025-03-12', by: 'Rahul M.' },
  { id: 'ADJ-002', product: 'PVC Pipes',  type: 'Decrease', qty: 5, reason: 'Physical Count', date: '2025-03-13', by: 'Amit K.' },
];

// ── LIVE STATE VARIABLES ───────────────────────────────
let products    = [];
let receipts    = [];
let deliveries  = [];
let transfers   = [];
let adjustments = [];
let moveHistory = [];
let warehouses  = ['Main Warehouse', 'Production Floor', 'Rack A', 'Rack B'];
let currentUser = null;

// ── LOAD & SAVE ────────────────────────────────────────
function loadData() {
  products    = JSON.parse(localStorage.getItem('ci_products'))    || JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  receipts    = JSON.parse(localStorage.getItem('ci_receipts'))    || JSON.parse(JSON.stringify(DEFAULT_RECEIPTS));
  deliveries  = JSON.parse(localStorage.getItem('ci_deliveries'))  || JSON.parse(JSON.stringify(DEFAULT_DELIVERIES));
  transfers   = JSON.parse(localStorage.getItem('ci_transfers'))   || JSON.parse(JSON.stringify(DEFAULT_TRANSFERS));
  adjustments = JSON.parse(localStorage.getItem('ci_adjustments')) || JSON.parse(JSON.stringify(DEFAULT_ADJUSTMENTS));
  warehouses  = JSON.parse(localStorage.getItem('ci_warehouses'))  || warehouses.slice();
  rebuildHistory();
}

function saveData() {
  localStorage.setItem('ci_products',    JSON.stringify(products));
  localStorage.setItem('ci_receipts',    JSON.stringify(receipts));
  localStorage.setItem('ci_deliveries',  JSON.stringify(deliveries));
  localStorage.setItem('ci_transfers',   JSON.stringify(transfers));
  localStorage.setItem('ci_adjustments', JSON.stringify(adjustments));
  localStorage.setItem('ci_warehouses',  JSON.stringify(warehouses));
}

function rebuildHistory() {
  moveHistory = [];
  receipts.filter(r => r.status === 'Done').forEach(r => {
    const p = products.find(x => x.name === r.product);
    moveHistory.push({ date: r.date, ref: r.id, product: r.product, type: 'Receipt', movement: 'IN', qty: '+' + r.qty, unit: p ? p.unit : '', stockAfter: p ? p.stock : '—' });
  });
  deliveries.filter(d => d.status === 'Done').forEach(d => {
    const p = products.find(x => x.name === d.product);
    moveHistory.push({ date: d.date, ref: d.id, product: d.product, type: 'Delivery', movement: 'OUT', qty: '-' + d.qty, unit: p ? p.unit : '', stockAfter: p ? p.stock : '—' });
  });
  transfers.filter(t => t.status === 'Done').forEach(t => {
    moveHistory.push({ date: t.date, ref: t.id, product: t.product, type: 'Transfer', movement: t.from + '→' + t.to, qty: t.qty, unit: '', stockAfter: '—' });
  });
  adjustments.forEach(a => {
    const p = products.find(x => x.name === a.product);
    moveHistory.push({ date: a.date, ref: a.id, product: a.product, type: 'Adjustment', movement: a.type, qty: (a.type === 'Increase' ? '+' : '-') + a.qty, unit: p ? p.unit : '', stockAfter: p ? p.stock : '—' });
  });
  moveHistory.sort((a, b) => b.date.localeCompare(a.date));
}
