/* ── 02-login.js ──────────────────────────────────────────────────────── */
import { auth, diagnostic }         from '../../services/api.js';
import { QAStore }                  from '../state/store.js';
import { showToast, setBtnLoading } from '../ui/ui-shared.js';
import { redirectIfLoggedIn }       from '../../components/auth-guard.js';

redirectIfLoggedIn();

// Mostrar banner si viene del registro
const _params = new URLSearchParams(window.location.search);
if (_params.get('registered') === '1') {
  const banner = document.getElementById('register-success');
  if (banner) banner.classList.remove('hidden');
}

const form  = document.getElementById('login-form');
const btnEl = document.getElementById('login-btn');
const errEl = document.getElementById('form-error');

const showErr = (m) => { errEl.textContent = m; errEl.classList.remove('hidden'); };
const hideErr = ()  => errEl.classList.add('hidden');

// Toggle contraseña
document.getElementById('toggle-pass')?.addEventListener('click', () => {
  const inp = document.getElementById('password');
  inp.type  = inp.type === 'password' ? 'text' : 'password';
});

// Traduce level_name del backend al label que muestra el dashboard
const LEVEL_LABEL = { BASIC: 'BASICO', INTERMEDIATE: 'INTERMEDIO', ADVANCED: 'AVANZADO' };

function normalizeDiag(d) {
  return {
    id_diagnostic: d.id_diagnostic,
    score:         d.score,
    performed_at:  d.performed_at,
    level: { id: d.id_level, label: LEVEL_LABEL[d.level_name] || d.level_name },
    route: { id: d.id_route, name:  d.route_name },
  };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideErr();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) { showErr('Completa todos los campos.'); return; }

  setBtnLoading(btnEl, true);
  try {
    const data = await auth.login({ email, password });
    QAStore.login(data);

    const isAdmin = QAStore.isAdmin();

    if (isAdmin) {
      window.location.href = '../user/13-admin.html';
      return;
    }

    // Estudiante: recuperar diagnóstico del backend para no depender de localStorage
    try {
      const diagData = await diagnostic.getAll();
      const list = Array.isArray(diagData) ? diagData : (diagData?.diagnostics ?? []);
      if (list.length > 0) {
        QAStore.setDiag(normalizeDiag(list[0]));
      }
    } catch {
      // Si falla la consulta continuamos con lo que haya en localStorage
    }

    const hasDiag = !!QAStore.getDiag();
    window.location.href = hasDiag
      ? '../user/06-dashboard-aprendizaje.html'
      : '../user/04-diagnostico.html';

  } catch (err) {
    const msg = err.message.includes('credentials') || err.message.includes('Invalid')
      ? 'Correo o contraseña incorrectos.'
      : (err.message || 'Error al iniciar sesión.');
    showErr(msg);
    setBtnLoading(btnEl, false);
  }
});