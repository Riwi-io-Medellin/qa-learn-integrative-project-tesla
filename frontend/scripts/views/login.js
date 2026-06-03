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
  'BASIC':        { label: 'BASICO',     id: 'f92dae24-6cc1-49a7-b479-f0eef37462e1' },
  'INTERMEDIATE': { label: 'INTERMEDIO', id: '4dd53a6e-493e-4826-9e31-51401c216d47' },
  'ADVANCED':     { label: 'AVANZADO',   id: '00be0382-6fe9-4086-905e-871e018741c3' },
};
const ROUTE_IDS = {
  'Ruta Básica de QA Testing':     '53d7cbbc-4c78-40d0-a59a-e3b38e996a96',
  'Ruta Basica de QA Testing':     '53d7cbbc-4c78-40d0-a59a-e3b38e996a96',
  'Ruta Intermedia de QA Testing': '4b682e84-6853-4e44-8220-b5cea023cd9a',
  'Ruta Avanzada de QA Testing':   '5e1aa8bf-8d3e-47c1-9b7d-9743475e4829',
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