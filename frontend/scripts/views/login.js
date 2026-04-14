/* ── login.js ─────────────────────────────────────────────────────────── */
import { auth }                     from '../../services/api.js';
import { QAStore }                  from '../state/store.js';
import { showToast, setBtnLoading } from '../ui/ui-shared.js';
import { redirectIfLoggedIn }       from '../../components/auth-guard.js';

redirectIfLoggedIn();

const _params = new URLSearchParams(window.location.search);
if (_params.get('registered') === '1') {
  document.getElementById('register-success')?.classList.remove('hidden');
}

const form  = document.getElementById('login-form');
const btnEl = document.getElementById('login-btn');
const errEl = document.getElementById('form-error');
const showErr = (m) => { errEl.textContent = m; errEl.classList.remove('hidden'); };
const hideErr = ()  => errEl.classList.add('hidden');

document.getElementById('toggle-pass')?.addEventListener('click', () => {
  const inp = document.getElementById('password');
  inp.type  = inp.type === 'password' ? 'text' : 'password';
});

// Mapa para convertir respuesta del backend al formato que espera el dashboard
const LEVEL_MAP = {
  'BASIC':        { label: 'BASICO',     id: '33070531-22ae-4bd6-af5e-e6d1beb1657f' },
  'INTERMEDIATE': { label: 'INTERMEDIO', id: '94e3c1e1-ef45-4e29-b846-020403648162' },
  'ADVANCED':     { label: 'AVANZADO',   id: '169f5154-b152-4e7c-877c-e93fb9e56540' },
};
const ROUTE_IDS = {
  'Ruta Básica de QA Testing':     'b5228685-766f-4cdb-ab6f-6229561b4618',
  'Ruta Basica de QA Testing':     'b5228685-766f-4cdb-ab6f-6229561b4618',
  'Ruta Intermedia de QA Testing': 'b0bb6a45-1320-46e5-af50-89e8d87b4ad3',
  'Ruta Avanzada de QA Testing':   'c51d7c28-471c-484b-9874-fe6f2512fc0e',
};

function normalizeDiag(raw) {
  const level = LEVEL_MAP[raw.level_name] || { label: raw.level_name || '—', id: '' };
  const route = { name: raw.route_name || '—', id: ROUTE_IDS[raw.route_name] || '' };
  return { ...raw, level, route };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideErr();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) { showErr('Completa todos los campos.'); return; }
  if (password.length < 8) { showErr('La contraseña debe tener mínimo 8 caracteres.'); return; }

  setBtnLoading(btnEl, true);
  try {
    const data = await auth.login({ email, password });
    QAStore.login(data);

    if (QAStore.isAdmin()) {
      window.location.href = '../pages/learning-dashboard.html';
      return;
    }

    // Verificar diagnóstico SIEMPRE desde el backend — no confiar en localStorage
    let hasDiag = false;
    try {
      const token   = QAStore.getToken();
      const res     = await fetch('http://localhost:5000/api/diagnostic', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const diags   = await res.json();
      const list    = Array.isArray(diags) ? diags : (diags.diagnostics || []);
      if (list.length > 0) {
        QAStore.setDiag(normalizeDiag(list[0]));
        hasDiag = true;
      } else {
        // Limpiar diagnóstico viejo si ya no existe en la DB
        localStorage.removeItem('qa_last_diagnostic');
      }
    } catch {
      // Fallback a localStorage solo si hay error de red
      hasDiag = !!QAStore.getDiag();
    }

    setTimeout(() => {
      window.location.href = hasDiag
        ? '../pages/learning-dashboard.html'
        : '../pages/diagnostic.html';
    }, 400);

  } catch (err) {
    const msg = err.message.includes('credentials') || err.message.includes('Invalid')
      ? 'Correo o contraseña incorrectos.'
      : (err.message || 'Error al iniciar sesión.');
    showErr(msg);
    setBtnLoading(btnEl, false);
  }
});