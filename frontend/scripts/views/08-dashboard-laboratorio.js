/* ── 08-dashboard-laboratorio.js ──────────────────────────────────────── */
import { projects }    from '../../services/api.js';
import { QAStore }     from '../state/store.js';
import { requireAuth } from '../../components/auth-guard.js';
import { initSidebar } from '../../components/sidebar.js';
import { showLoading, showError, showEmpty, showToast, setBtnLoading } from '../ui/ui-shared.js';
import { renderProjectCard } from '../ui/ui-laboratorio.js';

requireAuth();
initSidebar('laboratorio');

document.getElementById('topbar-name').textContent     = QAStore.displayName();
document.getElementById('topbar-initials').textContent = QAStore.initials();

window.openNewProject  = () => { document.getElementById('proj-modal').classList.remove('hidden'); document.getElementById('proj-name').value = ''; document.getElementById('proj-desc').value = ''; };
window.closeNewProject = () => document.getElementById('proj-modal').classList.add('hidden');

async function loadProjects() {
  showLoading('projects-grid');
  try {
    // GET /api/projects → array directo
    const data = await projects.getAll();
    const list = Array.isArray(data) ? data : (data.projects || []);

    document.getElementById('stat-total').textContent  = list.length;
    document.getElementById('stat-active').textContent = list.filter(p => p.status === 'ACTIVE').length;
    document.getElementById('stat-done').textContent   = list.filter(p => p.status === 'COMPLETED').length;

    if (!list.length) {
      showEmpty('projects-grid', 'Sin proyectos todavía.',
        `<button onclick="openNewProject()" style="margin-top:10px;background:#3B5BDB;color:white;border:none;padding:8px 18px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer">+ Crear primer proyecto</button>`);
      return;
    }

    document.getElementById('projects-grid').innerHTML =
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        ${list.map(renderProjectCard).join('')}
       </div>`;
  } catch {
    showError('projects-grid', 'No se pudieron cargar los proyectos.');
  }
}

document.getElementById('proj-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('proj-name').value.trim();
  const desc = document.getElementById('proj-desc').value.trim();
  if (!name) { showToast('El nombre es obligatorio.', 'error'); return; }

  const btn = document.getElementById('save-proj-btn');
  setBtnLoading(btn, true);
  try {
    await projects.create({ name, description: desc });
    showToast('Proyecto creado.', 'success');
    closeNewProject();
    await loadProjects();
  } catch (err) {
    showToast(err.message || 'Error al crear el proyecto.', 'error');
  } finally {
    setBtnLoading(btn, false);
  }
});

loadProjects();
