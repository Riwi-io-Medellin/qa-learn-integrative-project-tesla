/* ── profile.js ───────────────────────────────────────────────────────── */
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

function badge(s) {
  const M = { ACTIVE: ['#2D9B6F', 'Activo'], INACTIVE: ['#4A5073', 'Inactivo'] };
  const [c, l] = M[s] || ['#4A5073', s];
  return `<span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;background:${c}20;color:${c}">${l}</span>`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

// ── Cargar perfil ─────────────────────────────────────────────────────────
async function loadProfile() {

  // Datos del usuario desde /auth/me
  try {
    const data = await apiFetch('/auth/me');
    const me   = data?.user || data;
    const ini  = (me.first_name ? me.first_name[0] : 'U').toUpperCase() + (me.last_name ? me.last_name[0].toUpperCase() : '');
    const full = ((me.first_name || '') + ' ' + (me.last_name || '')).trim();
    document.getElementById('p-avatar').textContent  = ini;
    document.getElementById('p-name').textContent    = full || '—';
    document.getElementById('p-email').textContent   = me.email    || '—';
    document.getElementById('p-role').textContent    = me.role_name || 'STUDENT';
    document.getElementById('p-status').innerHTML    = badge(me.status || 'ACTIVE');
    document.getElementById('p-joined').textContent  = fmtDate(me.created_at);
    // Actualizar sidebar y store con datos frescos
    document.getElementById('sb-avatar').textContent = ini;
    document.getElementById('sb-name').textContent   = full;
    localStorage.setItem('qa_user', JSON.stringify({ ..._U, first_name: me.first_name, last_name: me.last_name, email: me.email, role_name: me.role_name }));
  } catch {
    // Fallback al store local
    document.getElementById('p-avatar').textContent = _ini;
    document.getElementById('p-name').textContent   = _dn;
    document.getElementById('p-email').textContent  = _U.email || '—';
    document.getElementById('p-role').textContent   = _U.role_name || _U.role || 'STUDENT';
    document.getElementById('p-status').innerHTML   = badge('ACTIVE');
    document.getElementById('p-joined').textContent = '—';
  }

  // Nivel y ruta desde localStorage
  const diagLocal = JSON.parse(localStorage.getItem('qa_last_diagnostic') || 'null');
  const progress  = JSON.parse(localStorage.getItem('qa_progress') || '{}');

  if (diagLocal?.level) {
    document.getElementById('nivel-name').textContent = diagLocal.level.label || '—';
    document.getElementById('nivel-ruta').textContent = 'Ruta: ' + (diagLocal.route?.name || '—');
    if (document.getElementById('sb-level')) document.getElementById('sb-level').textContent = diagLocal.level.label;
  } else {
    document.getElementById('nivel-card').innerHTML = '<p class="text-sm text-muted">Sin nivel asignado. <a href="diagnostic.html" style="color:#3B5BDB;font-weight:700">Hacer diagnóstico →</a></p>';
    document.getElementById('stat-progress').textContent = '0%';
    document.getElementById('stat-modules').textContent  = '0';
    document.getElementById('ruta-progress').innerHTML   = '<p class="text-sm text-muted">Completa el diagnóstico para ver tu progreso.</p>';
  }

  // Progreso de la ruta
  if (diagLocal?.route?.id) {
    const rp   = progress[diagLocal.route.id] || { completedModules: [], completedCourses: [] };
    const done = rp.completedModules.length;
    try {
      const routeData = await apiFetch('/routes/' + diagLocal.route.id);
      const rObj      = routeData?.route || routeData;
      const courses   = (rObj.courses || []).filter(c => c && c.id_course);
      let totalMods   = 0;
      for (const c of courses) {
        try { const md = await apiFetch('/courses/' + c.id_course + '/modules'); totalMods += (md.modules || []).length; } catch {}
      }
      const pct = totalMods > 0 ? Math.round((done / totalMods) * 100) : 0;
      document.getElementById('stat-progress').textContent = pct + '%';
      document.getElementById('stat-modules').textContent  = done;
      document.getElementById('ruta-progress').innerHTML   = `
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-navy">${rObj.route_name || diagLocal.route.name || '—'}</span>
          <span class="text-xs font-bold" style="color:#3B5BDB">${pct}%</span>
        </div>
        <div class="h-2.5 rounded-full overflow-hidden" style="background:#EEF2FB">
          <div class="h-full rounded-full transition-all" style="width:${pct}%;background:#3B5BDB"></div>
        </div>
        <p class="text-xs text-muted mt-2">${done} módulo${done !== 1 ? 's' : ''} completado${done !== 1 ? 's' : ''} de ${totalMods}</p>`;
    } catch {
      document.getElementById('ruta-progress').innerHTML = '<p class="text-sm text-muted">Error al cargar el progreso.</p>';
    }
  }

  // Laboratorio
  try {
    const pd  = await apiFetch('/projects');
    const pls = Array.isArray(pd) ? pd : (pd.projects || []);
    document.getElementById('stat-projects').textContent = pls.length;
    document.getElementById('lab-summary').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="p-3 rounded-xl text-center" style="background:#EEF2FB"><p class="text-xl font-extrabold text-navy">${pls.length}</p><p class="text-xs text-muted mt-0.5">Proyectos</p></div>
        <div class="p-3 rounded-xl text-center" style="background:#F0FDF4"><p class="text-xl font-extrabold" style="color:#2D9B6F">${pls.filter(p => p.status === 'ACTIVE').length}</p><p class="text-xs text-muted mt-0.5">Activos</p></div>
        <div class="p-3 rounded-xl text-center" style="background:#FFF7E6"><p class="text-xl font-extrabold" style="color:#D4A017">${pls.filter(p => p.status === 'ARCHIVED').length}</p><p class="text-xs text-muted mt-0.5">Archivados</p></div>
      </div>`;
  } catch {
    document.getElementById('lab-summary').innerHTML    = '<p class="text-sm text-muted">Error al cargar proyectos.</p>';
    document.getElementById('stat-projects').textContent = '—';
  }
}

// ── Sidebar nav collapse ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  loadProfile();
  document.querySelectorAll('nav > div').forEach(function (item) {
    const link = item.querySelector(':scope > a');
    const sub  = item.querySelector(':scope > div');
    const chev = link ? link.querySelector('svg:last-child') : null;
    if (!link || !sub) return;
    sub.style.overflow   = 'hidden';
    sub.style.transition = 'max-height .25s ease';
    const ia = item.dataset.active === 'true';
    sub.style.maxHeight  = ia ? sub.scrollHeight + 'px' : '0';
    if (chev) chev.style.transform = ia ? 'rotate(0deg)' : 'rotate(-90deg)';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const io = sub.style.maxHeight !== '0px' && sub.style.maxHeight !== '';
      document.querySelectorAll('nav > div').forEach(function (o) {
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