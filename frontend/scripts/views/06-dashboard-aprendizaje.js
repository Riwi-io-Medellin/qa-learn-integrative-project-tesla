/* ── 06-dashboard-aprendizaje.js ──────────────────────────────────────── */
import { routes }      from '../../services/api.js';
import { QAStore }     from '../state/store.js';
import { requireAuth } from '../../components/auth-guard.js';
import { initSidebar } from '../../components/sidebar.js';
import { showLoading, showError, showEmpty } from '../ui/ui-shared.js';
import { renderRouteCard } from '../ui/ui-aprendizaje.js';

requireAuth();
initSidebar('aprendizaje');

document.getElementById('topbar-name').textContent     = QAStore.displayName();
document.getElementById('topbar-initials').textContent = QAStore.initials();

const diag = QAStore.getDiag();

async function init() {
  // Banner sin diagnóstico
  if (!diag) {
    document.getElementById('diag-banner').classList.remove('hidden');
  } else {
    document.getElementById('assigned-card').classList.remove('hidden');
    document.getElementById('assigned-name').textContent  = diag.route?.name || '—';
    document.getElementById('assigned-level').textContent = diag.level?.label || '—';
  }

  // Cargar rutas
  // GET /api/routes → { routes: [{ id_route, route_name, level_name, total_courses }] }
  showLoading('routes-container');
  try {
    const data = await routes.getAll();
    const list = data.routes || [];

    if (!list.length) { showEmpty('routes-container', 'No hay rutas disponibles aún.'); return; }

    const activeId = diag?.route?.id;
    document.getElementById('routes-container').innerHTML =
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        ${list.map(r => renderRouteCard(r, r.id_route === activeId)).join('')}
       </div>`;
  } catch (err) {
    showError('routes-container', 'No se pudieron cargar las rutas.');
  }
}

init();
