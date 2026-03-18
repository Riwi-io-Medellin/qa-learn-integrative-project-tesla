/* ── 02-login.js ──────────────────────────────────────────────────────── */
import { auth }              from '../../services/api.js';
import { QAStore }           from '../state/store.js';
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideErr();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) { showErr('Completa todos los campos.'); return; }

  setBtnLoading(btnEl, true);
  try {
    // { message, user: { user:{id,name,email,role}, token } }
    const data = await auth.login({ email, password });
    QAStore.login(data);

    const isAdmin = QAStore.isAdmin();
    const hasDiag = !!QAStore.getDiag();

    setTimeout(() => {
      window.location.href = isAdmin
        ? '../pages/learning-dashboard.html'
        : hasDiag
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
