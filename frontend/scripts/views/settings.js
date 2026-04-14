/* ── settings.js ──────────────────────────────────────────────────────── */
const BASE_URL = 'http://localhost:5000/api';
const _TOKEN   = localStorage.getItem('qa_token');
if (!_TOKEN) window.location.href = '../public/login.html';

const _U    = JSON.parse(localStorage.getItem('qa_user') || '{}');
const _diag = JSON.parse(localStorage.getItem('qa_last_diagnostic') || 'null');

// ── Sidebar ───────────────────────────────────────────────────────────────
const _dn  = _U.first_name ? (_U.first_name + ' ' + (_U.last_name || '')).trim() : (_U.name || 'Usuario');
const _ini = (_U.first_name ? _U.first_name[0] : (_U.name || 'U')[0]).toUpperCase() + (_U.last_name ? _U.last_name[0].toUpperCase() : '');
document.getElementById('sb-avatar').textContent = _ini;
document.getElementById('sb-name').textContent   = _dn;
if (document.getElementById('sb-level') && _diag?.level)
  document.getElementById('sb-level').textContent = _diag.level.label;

document.getElementById('logout-btn').onclick = async () => {
  try { await fetch(BASE_URL + '/auth/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + _TOKEN } }); } catch {}
  localStorage.clear();
  window.location.href = '../public/login.html';
};

// ── Helpers ───────────────────────────────────────────────────────────────
async function apiFetch(p, o = {}) {
  const h = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _TOKEN, ...(o.headers || {}) };
  const r = await fetch(BASE_URL + p, { ...o, headers: h });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { localStorage.clear(); window.location.href = '../public/login.html'; return null; }
  if (!r.ok) throw new Error(d.error || d.message || 'Error ' + r.status);
  return d;
}

function showToast(msg, color = '#3B5BDB') {
  const e = document.createElement('div');
  e.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:9999;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:500;color:#1E3A5F;background:white;box-shadow:0 8px 32px rgba(30,58,95,0.15);border-left:4px solid ${color};font-family:Plus Jakarta Sans,sans-serif`;
  e.textContent = msg;
  document.body.appendChild(e);
  setTimeout(() => { e.style.opacity = '0'; e.style.transition = 'opacity .3s'; setTimeout(() => e.remove(), 300); }, 3000);
}

// ── Tema ──────────────────────────────────────────────────────────────────
let _darkMode = localStorage.getItem('qa_theme') === 'dark';

function setTheme(mode) {
  _darkMode = mode === 'dark';
  localStorage.setItem('qa_theme', mode);
  updateThemeUI();
}

function toggleTheme() { setTheme(_darkMode ? 'light' : 'dark'); }

function updateThemeUI() {

  document.body.classList.toggle('dark', _darkMode);

  const toggle = document.getElementById('theme-toggle');
  const dot    = document.getElementById('theme-dot');
  const btnL   = document.getElementById('btn-light');
  const btnD   = document.getElementById('btn-dark');
  if (_darkMode) {
    if (toggle) toggle.style.background = '#3B5BDB';
    if (dot)    dot.style.transform = 'translateX(20px)';
    if (btnD) { btnD.style.borderColor = '#3B5BDB'; btnD.style.color = '#3B5BDB'; }
    if (btnL) { btnL.style.borderColor = '#D0D9F0'; btnL.style.color = '#4A5073'; }
  } else {
    if (toggle) toggle.style.background = '#D0D9F0';
    if (dot)    dot.style.transform = 'translateX(0)';
    if (btnL) { btnL.style.borderColor = '#3B5BDB'; btnL.style.color = '#3B5BDB'; }
    if (btnD) { btnD.style.borderColor = '#D0D9F0'; btnD.style.color = '#4A5073'; }
  }
}

// ── Cargar datos ──────────────────────────────────────────────────────────
async function initConfig() {
  updateThemeUI();
  try {
    const data = await apiFetch('/auth/me');
    const me   = data?.user || data;
    if (document.getElementById('cfg-fname')) document.getElementById('cfg-fname').value = me.first_name || '';
    if (document.getElementById('cfg-lname')) document.getElementById('cfg-lname').value = me.last_name  || '';
    if (document.getElementById('cfg-email-display')) document.getElementById('cfg-email-display').textContent = me.email || '—';
  } catch {}
}

// ── Guardar perfil ────────────────────────────────────────────────────────
function saveProfile() {
  const fn = document.getElementById('cfg-fname').value.trim();
  const ln = document.getElementById('cfg-lname').value.trim();
  if (!fn || !ln) { showToast('Nombre y apellido son obligatorios.', '#C0392B'); return; }
  const cur = JSON.parse(localStorage.getItem('qa_user') || '{}');
  localStorage.setItem('qa_user', JSON.stringify({ ...cur, first_name: fn, last_name: ln, name: fn }));
  if (document.getElementById('sb-name')) document.getElementById('sb-name').textContent = (fn + ' ' + ln).trim();
  const saved = document.getElementById('profile-saved');
  if (saved) { saved.classList.remove('hidden'); setTimeout(() => saved.classList.add('hidden'), 3000); }
  showToast('Información actualizada.', '#2D9B6F');
}

// ── Contraseña ────────────────────────────────────────────────────────────
function togglePassSection() {
  const s = document.getElementById('pass-section');
  if (!s) return;
  s.classList.toggle('hidden');
  ['cfg-current-pass', 'cfg-new-pass', 'cfg-confirm-pass'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const errEl = document.getElementById('pass-error');
  if (errEl) errEl.classList.add('hidden');
}

function changePass() {
  const np    = document.getElementById('cfg-new-pass')?.value || '';
  const cp    = document.getElementById('cfg-confirm-pass')?.value || '';
  const errEl = document.getElementById('pass-error');
  if (errEl) errEl.classList.add('hidden');
  if (np.length < 8) { if (errEl) { errEl.textContent = 'Mínimo 8 caracteres.'; errEl.classList.remove('hidden'); } return; }
  if (np !== cp)     { if (errEl) { errEl.textContent = 'Las contraseñas no coinciden.'; errEl.classList.remove('hidden'); } return; }
  showToast('Cambio de contraseña disponible en v2.', '#3B5BDB');
  togglePassSection();
}

function showChangeEmail() { showToast('Cambio de email disponible en v2.', '#3B5BDB'); }

// ── Cerrar sesión ─────────────────────────────────────────────────────────
async function logoutNow() {
  try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
  localStorage.clear();
  window.location.href = '../public/login.html';
}

// ── Sidebar nav collapse ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initConfig();
  const ni = document.querySelectorAll('nav > div');
  ni.forEach(function (item) {
    const link = item.querySelector(':scope > a');
    const sub  = item.querySelector(':scope > div');
    const chev = link ? link.querySelector('svg:last-child') : null;
    if (!link || !sub) return;
    sub.style.overflow   = 'hidden';
    sub.style.transition = 'max-height 0.25s ease';
    const ia = item.dataset.active === 'true';
    sub.style.maxHeight  = ia ? sub.scrollHeight + 'px' : '0';
    if (chev) chev.style.transform = ia ? 'rotate(0deg)' : 'rotate(-90deg)';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const io = sub.style.maxHeight !== '0px' && sub.style.maxHeight !== '';
      ni.forEach(function (o) {
        if (o === item) return;
        const s = o.querySelector(':scope > div');
        const c = o.querySelector(':scope > a svg:last-child');
        if (s) s.style.maxHeight = '0';
        if (c) c.style.transform = 'rotate(-90deg)';
      });
      sub.style.maxHeight = io ? '0' : sub.scrollHeight + 'px';
      if (chev) chev.style.transform = io ? 'rotate(-90deg)' : 'rotate(0deg)';
    });
  });
});