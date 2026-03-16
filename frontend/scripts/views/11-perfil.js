/* ── 11-perfil.js ─────────────────────────────────────────────────────── */
import { auth, diagnostic } from '../../services/api.js';
import { QAStore }     from '../state/store.js';
import { requireAuth } from '../../components/auth-guard.js';
import { initSidebar } from '../../components/sidebar.js';
import { showToast, fmtDate, badge } from '../ui/ui-shared.js';

requireAuth();
initSidebar('perfil');

document.getElementById('topbar-name').textContent     = QAStore.displayName();
document.getElementById('topbar-initials').textContent = QAStore.initials();

async function init() {
  // GET /api/auth/me → { user: { id_user, first_name, last_name, email, role_name, status, created_at } }
  try {
    const data = await auth.me();
    const me   = data?.user || data;
    const ini  = `${me.first_name?.[0] || ''}${me.last_name?.[0] || ''}`.toUpperCase() || 'U';
    const full = `${me.first_name || ''} ${me.last_name || ''}`.trim();

    document.getElementById('p-avatar').textContent  = ini;
    document.getElementById('p-name').textContent    = full || '—';
    document.getElementById('p-email').textContent   = me.email || '—';
    document.getElementById('p-role').textContent    = me.role_name || 'Estudiante';
    document.getElementById('p-joined').textContent  = fmtDate(me.created_at);
    document.getElementById('p-status').innerHTML    = badge(me.status || 'ACTIVE');

    // Actualizar store con datos frescos del servidor
    QAStore.setUser({ ...QAStore.getUser(), first_name: me.first_name, last_name: me.last_name, email: me.email, role_name: me.role_name });
  } catch {
    showToast('No se pudo cargar el perfil.', 'error');
  }

  // GET /api/diagnostic → array directo
  try {
    const diagData = await diagnostic.getAll();
    const diags    = Array.isArray(diagData) ? diagData : (diagData.diagnostics || []);

    document.getElementById('p-diag-count').textContent = diags.length;

    if (diags.length) {
      const d = diags[0]; // ya viene ordenado DESC por performed_at
      document.getElementById('diag-section').classList.remove('hidden');
      document.getElementById('d-score').textContent  = `${Math.round(d.score)}%`;
      document.getElementById('d-level').textContent  = d.level_name || '—';
      document.getElementById('d-route').textContent  = d.route_name || '—';
      document.getElementById('d-date').textContent   = fmtDate(d.performed_at);
    } else {
      document.getElementById('no-diag').classList.remove('hidden');
    }
  } catch {
    document.getElementById('p-diag-count').textContent = '0';
  }
}

init();
