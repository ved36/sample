/* ═══════════════════════════════════════
   CoreInventory — Authentication
   File: js/auth.js
   Depends on: data.js, ui.js
═══════════════════════════════════════ */

// ── SESSION HELPERS ────────────────────────────────────
function getUsers()     { return JSON.parse(localStorage.getItem('ci_users')   || '[]');   }
function saveUsers(u)   { localStorage.setItem('ci_users',   JSON.stringify(u)); }
function getSession()   { return JSON.parse(localStorage.getItem('ci_session') || 'null'); }
function saveSession(u) { localStorage.setItem('ci_session', JSON.stringify(u)); }
function clearSession() { localStorage.removeItem('ci_session'); }

// ── PAGE ROUTING ───────────────────────────────────────
const ALL_PAGES = ['role-select-page', 'manager-login-page', 'staff-login-page', 'dashboard-page'];

function showPage(id) {
  ALL_PAGES.forEach(p => document.getElementById(p).style.display = 'none');
  document.getElementById(id).style.display = 'flex';
}

function goToLogin(role) {
  showPage(role === 'manager' ? 'manager-login-page' : 'staff-login-page');
}

// ── TAB SWITCHING ──────────────────────────────────────
let mTab = 'login';
let sTab = 'login';

function mSwitchTab(t) {
  mTab = t;
  document.getElementById('m-tab-login').className  = 'tab' + (t === 'login'  ? ' active-manager' : '');
  document.getElementById('m-tab-signup').className = 'tab' + (t === 'signup' ? ' active-manager' : '');
  document.getElementById('m-name-field').style.display  = t === 'signup' ? 'block'  : 'none';
  document.getElementById('m-forgot-link').style.display = t === 'login'  ? 'inline' : 'none';
  document.getElementById('m-auth-btn').textContent = t === 'login' ? 'Sign In' : 'Create Account';
  document.getElementById('m-auth-error').style.display = 'none';
}

function sSwitchTab(t) {
  sTab = t;
  document.getElementById('s-tab-login').className  = 'tab' + (t === 'login'  ? ' active-staff' : '');
  document.getElementById('s-tab-signup').className = 'tab' + (t === 'signup' ? ' active-staff' : '');
  document.getElementById('s-name-field').style.display  = t === 'signup' ? 'block'  : 'none';
  document.getElementById('s-forgot-link').style.display = t === 'login'  ? 'inline' : 'none';
  document.getElementById('s-auth-btn').textContent = t === 'login' ? 'Sign In' : 'Create Account';
  document.getElementById('s-auth-error').style.display = 'none';
}

// ── SUBSECTION SHOW/HIDE ───────────────────────────────
function mShowAuth() {
  ['m-forgot-section', 'm-otp-section', 'm-newpw-section'].forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById('m-auth-section').style.display = 'block';
}
function sShowAuth() {
  ['s-forgot-section', 's-otp-section', 's-newpw-section'].forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById('s-auth-section').style.display = 'block';
}
function mShowForgot() {
  document.getElementById('m-auth-section').style.display   = 'none';
  document.getElementById('m-forgot-section').style.display = 'block';
}
function sShowForgot() {
  document.getElementById('s-auth-section').style.display   = 'none';
  document.getElementById('s-forgot-section').style.display = 'block';
}

// ── SIGN IN / SIGN UP ──────────────────────────────────
function handleAuth(role) {
  const p   = role === 'manager' ? 'm' : 's';
  const tab = role === 'manager' ? mTab : sTab;
  const email = document.getElementById(`${p}-inp-email`).value.trim();
  const pw    = document.getElementById(`${p}-inp-password`).value;
  const name  = document.getElementById(`${p}-inp-name`).value.trim();
  const errEl = document.getElementById(`${p}-auth-error`);
  const roleLabel = role === 'manager' ? 'Inventory Manager' : 'Warehouse Staff';

  if (!email || !pw) { showErr(errEl, 'Please fill in all fields.'); return; }

  if (tab === 'login') {
    const user = getUsers().find(u => u.email === email && u.password === pw && u.role === roleLabel);
    if (!user) { showErr(errEl, 'Invalid email or password.'); return; }
    saveSession(user);
    openDashboard(user);
  } else {
    if (!name) { showErr(errEl, 'Please enter your name.'); return; }
    if (pw.length < 6) { showErr(errEl, 'Password must be at least 6 characters.'); return; }
    if (getUsers().find(u => u.email === email && u.role === roleLabel)) {
      showErr(errEl, 'Email already registered for this role.'); return;
    }
    const newUser = { name, email, password: pw, role: roleLabel };
    saveUsers([...getUsers(), newUser]);
    saveSession(newUser);
    openDashboard(newUser);
  }
}

// ── OTP / FORGOT PASSWORD ──────────────────────────────
let otpForEmail = '';
const DEMO_OTP  = '123456';

function sendOTP(role) {
  const p     = role === 'manager' ? 'm' : 's';
  const email = document.getElementById(`${p}-forgot-email`).value.trim();
  const errEl = document.getElementById(`${p}-forgot-error`);
  if (!email) { showErr(errEl, 'Please enter your email.'); return; }
  otpForEmail = email;
  for (let i = 0; i < 6; i++) {
    const el = document.getElementById(`${p}-o${i}`);
    el.value = '';
    el.classList.remove('filled');
  }
  document.getElementById(`${p}-otp-hint`).innerHTML = `OTP sent to <b>${email}</b> &nbsp;|&nbsp; Demo: <b>123456</b>`;
  document.getElementById(`${p}-forgot-section`).style.display = 'none';
  document.getElementById(`${p}-otp-section`).style.display    = 'block';
  document.getElementById(`${p}-otp-error`).style.display      = 'none';
}

function otpType(p, i) {
  const el = document.getElementById(`${p}-o${i}`);
  el.value = el.value.replace(/[^0-9]/g, '');
  el.classList.toggle('filled', el.value !== '');
  if (el.value && i < 5) document.getElementById(`${p}-o${i + 1}`).focus();
}

function otpBack(e, p, i) {
  if (e.key === 'Backspace' && !document.getElementById(`${p}-o${i}`).value && i > 0) {
    document.getElementById(`${p}-o${i - 1}`).focus();
  }
}

function verifyOTP(role) {
  const p       = role === 'manager' ? 'm' : 's';
  const entered = [0, 1, 2, 3, 4, 5].map(i => document.getElementById(`${p}-o${i}`).value).join('');
  const errEl   = document.getElementById(`${p}-otp-error`);
  if (entered !== DEMO_OTP) { showErr(errEl, 'Wrong OTP. Hint: 123456'); return; }
  errEl.style.display = 'none';
  document.getElementById(`${p}-otp-section`).style.display   = 'none';
  document.getElementById(`${p}-newpw-section`).style.display = 'block';
}

function saveNewPassword(role) {
  const p     = role === 'manager' ? 'm' : 's';
  const pw    = document.getElementById(`${p}-inp-newpw`).value;
  const errEl = document.getElementById(`${p}-newpw-error`);
  if (pw.length < 6) { showErr(errEl, 'Min 6 characters required.'); return; }
  const users = getUsers();
  const idx   = users.findIndex(u => u.email === otpForEmail);
  if (idx !== -1) { users[idx].password = pw; saveUsers(users); }
  alert('Password updated! Please sign in.');
  role === 'manager' ? mShowAuth() : sShowAuth();
}

// ── LOGOUT ─────────────────────────────────────────────
function logout() {
  clearSession();
  currentUser = null;
  showPage('role-select-page');
  mShowAuth(); mSwitchTab('login');
  sShowAuth(); sSwitchTab('login');
}
