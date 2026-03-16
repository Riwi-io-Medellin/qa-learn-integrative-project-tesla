/* ── 07-ruta.js ───────────────────────────────────────────────────────── */
import { routes, modules } from '../../services/api.js';
import { QAStore }         from '../state/store.js';
import { requireAuth }     from '../../components/auth-guard.js';
import { initSidebar }     from '../../components/sidebar.js';
import { showLoading, showError, showEmpty } from '../ui/ui-shared.js';
import { renderModuleCard } from '../ui/ui-aprendizaje.js';

requireAuth();
initSidebar('ruta');

document.getElementById('topbar-name').textContent     = QAStore.displayName();
document.getElementById('topbar-initials').textContent = QAStore.initials();

const diag    = QAStore.getDiag();
const params  = new URLSearchParams(window.location.search);
let allRoutes = [];
let activeId  = params.get('id') || diag?.route?.id;

// Exponer toggleModule al HTML generado dinámicamente
window.toggleModule = (id) => {
  const content = document.getElementById(`mc-${id}`);
  const arrow   = document.getElementById(`arr-${id}`);
  if (!content) return;
  const open = !content.classList.contains('hidden');
  content.classList.toggle('hidden');
  if (arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
};

window.switchRoute  = loadRoute;
window.pickCourse   = loadCourse;

async function init() {
  showLoading('route-tabs');
  try {
    const data = await routes.getAll();
    allRoutes  = data.routes || [];
    if (!allRoutes.length) { document.getElementById('route-tabs').innerHTML = '<p style="font-size:13px;color:#4A5073">No hay rutas.</p>'; return; }
    if (!activeId) activeId = allRoutes[0].id_route;
    renderTabs();
    await loadRoute(activeId);
  } catch {
    showError('route-tabs', 'Error al cargar las rutas.');
  }
}

function renderTabs() {
  document.getElementById('route-tabs').innerHTML = allRoutes.map(r => `
    <button onclick="switchRoute('${r.id_route}')"
      style="padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;border:1.5px solid ${r.id_route===activeId?'#3B5BDB':'#D0D9F0'};background:${r.id_route===activeId?'#3B5BDB':'#fff'};color:${r.id_route===activeId?'white':'#4A5073'}">
      ${r.route_name}
    </button>`).join('');
}

async function loadRoute(id) {
  activeId = id;
  renderTabs();

  const meta = allRoutes.find(r => r.id_route === id);
  document.getElementById('route-title').textContent = meta?.route_name || '—';
  document.getElementById('route-level').textContent = meta?.level_name || '';
  document.getElementById('courses-section').classList.remove('hidden');
  document.getElementById('modules-section').classList.add('hidden');

  showLoading('courses-list');
  try {
    // { route: { courses: [{id_course,title,orders}|null] } }
    const data = await routes.getById(id);
    const ro   = data.route || data;
    const list = (ro.courses || []).filter(c => c && c.id_course).sort((a, b) => (a.orders||0) - (b.orders||0));

    if (!list.length) { showEmpty('courses-list', 'Sin cursos asignados a esta ruta.'); return; }

    document.getElementById('courses-list').innerHTML =
      `<div style="display:flex;flex-direction:column;gap:8px">
        ${list.map((c, i) => `
          <button onclick="pickCourse('${c.id_course}', this)"
            class="course-btn"
            data-id="${c.id_course}"
            style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:11px;border:1.5px solid #D0D9F0;background:#fff;text-align:left;cursor:pointer;transition:all .15s;width:100%">
            <div style="width:32px;height:32px;border-radius:8px;background:#3B5BDB;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white;font-size:12px;font-weight:700">${i+1}</div>
            <p style="flex:1;font-size:13px;font-weight:600;color:#1E3A5F">${c.title}</p>
            <svg style="width:14px;height:14px;color:#4A5073;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>`).join('')}
       </div>`;

    // Auto-seleccionar el primer curso
    const firstBtn = document.querySelector('.course-btn');
    if (firstBtn) await loadCourse(list[0].id_course, firstBtn);
  } catch {
    showError('courses-list', 'No se pudieron cargar los cursos.');
  }
}

async function loadCourse(id, btn) {
  document.querySelectorAll('.course-btn').forEach(b => {
    b.style.borderColor = '#D0D9F0'; b.style.background = '#fff';
  });
  if (btn) { btn.style.borderColor = '#3B5BDB'; btn.style.background = 'rgba(59,91,219,0.05)'; }

  document.getElementById('modules-section').classList.remove('hidden');
  showLoading('modules-list');

  try {
    // { modules: [{ id_module, title, content, orders }] }
    const data = await modules.getAll(id);
    const mods = (data.modules || []).sort((a, b) => a.orders - b.orders);

    if (!mods.length) { showEmpty('modules-list', 'Sin módulos en este curso.'); return; }

    document.getElementById('modules-list').innerHTML =
      `<div style="display:flex;flex-direction:column;gap:10px">
        ${mods.map((m, i) => renderModuleCard(m, i === 0)).join('')}
       </div>`;

    // Abrir primer módulo
    if (mods[0]) {
      document.getElementById(`mc-${mods[0].id_module}`)?.classList.remove('hidden');
      const arr = document.getElementById(`arr-${mods[0].id_module}`);
      if (arr) arr.style.transform = 'rotate(180deg)';
    }
  } catch {
    showError('modules-list', 'No se pudieron cargar los módulos.');
  }
}

init();
