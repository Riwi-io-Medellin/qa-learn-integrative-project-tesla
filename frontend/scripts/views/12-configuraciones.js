/* ── 12-configuraciones.js ────────────────────────────────────────────── */
import { auth }        from '../../services/api.js';
import { QAStore }     from '../state/store.js';
import { requireAuth } from '../../components/auth-guard.js';
import { initSidebar } from '../../components/sidebar.js';
import { showToast, setBtnLoading } from '../ui/ui-shared.js';

requireAuth();
initSidebar('config');

document.getElementById('topbar-name').textContent     = QAStore.displayName();
document.getElementById('topbar-initials').textContent = QAStore.initials();

async function init() {
  // GET /api/auth/me → { user: { first_name, last_name, email, role_name } }
  try {
    const data = await auth.me();
    const me   = data?.user || data;
    document.getElementById('cfg-fname').value = me.first_name || '';
    document.getElementById('cfg-lname').value = me.last_name  || '';
    document.getElementById('cfg-email').value = me.email      || '';
    document.getElementById('cfg-role').value  = me.role_name  || 'STUDENT';
  } catch {
    showToast('No se pudo cargar la información de cuenta.', 'error');
  }
}

// ── Guardar información personal ──────────────────────────────────────
document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const first_name = document.getElementById('cfg-fname').value.trim();
  const last_name  = document.getElementById('cfg-lname').value.trim();
  if (!first_name || !last_name) { showToast('Nombre y apellido son obligatorios.', 'error'); return; }

  const btn = document.getElementById('save-profile-btn');
  setBtnLoading(btn, true);

  // Actualizar store local (el backend v1 no expone PATCH /auth/me)
  const current = QAStore.getUser();
  QAStore.setUser({ ...current, first_name, last_name, name: first_name });
  document.getElementById('topbar-name').textContent         = `${first_name} ${last_name}`.trim();
  document.getElementById('sb-name')?.textContent            && (document.getElementById('sb-name').textContent = `${first_name} ${last_name}`.trim());

  await new Promise(r => setTimeout(r, 400));
  showToast('Información actualizada.', 'success');
  setBtnLoading(btn, false);
});

// ── Cambiar contraseña ────────────────────────────────────────────────
document.getElementById('password-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const np = document.getElementById('cfg-newpass').value;
  const cp = document.getElementById('cfg-confirm').value;
  const errEl = document.getElementById('pass-err');
  errEl.classList.add('hidden');

  if (np.length < 6) { errEl.textContent = 'Mínimo 6 caracteres.'; errEl.classList.remove('hidden'); return; }
  if (np !== cp)      { errEl.textContent = 'Las contraseñas no coinciden.'; errEl.classList.remove('hidden'); return; }

  showToast('El cambio de contraseña estará disponible en la próxima versión.', 'info');
  document.getElementById('password-form').reset();
});

// ── Cerrar sesión ─────────────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', async () => {
  try { await auth.logout(); } catch {}
  QAStore.logout();
  window.location.href = '../public/02-login.html';
});

init();
