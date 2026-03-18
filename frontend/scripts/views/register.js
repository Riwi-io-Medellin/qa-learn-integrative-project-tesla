/* ── 03-registro.js ───────────────────────────────────────────────────── */
import { auth }              from '../../services/api.js';
import { QAStore }           from '../state/store.js';
import { setBtnLoading }     from '../ui/ui-shared.js';
import { redirectIfLoggedIn } from '../../components/auth-guard.js';

redirectIfLoggedIn();

const form  = document.getElementById('register-form');
const btnEl = document.getElementById('register-btn');
const errEl = document.getElementById('form-error');

const showErr = (m) => { errEl.textContent = m; errEl.classList.remove('hidden'); };
const hideErr = ()  => errEl.classList.add('hidden');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideErr();

  const first_name = document.getElementById('first_name').value.trim();
  const last_name  = document.getElementById('last_name').value.trim();
  const email      = document.getElementById('email').value.trim();
  const password   = document.getElementById('password').value;
  const confirm    = document.getElementById('confirm_password').value;

  if (!first_name || !last_name || !email || !password) { showErr('Completa todos los campos.'); return; }
  if (password !== confirm)  { showErr('Las contraseñas no coinciden.'); return; }
  if (password.length < 6)   { showErr('La contraseña debe tener mínimo 6 caracteres.'); return; }

  setBtnLoading(btnEl, true);
  try {
    await auth.register({ first_name, last_name, email, password });

    // Flujo correcto: 03 → 02 (login) → 04 (diagnóstico)
    // Mostrar mensaje de éxito y redirigir al login
    window.location.href = 'login.html?registered=1';
  } catch (err) {
    const msg = err.message.toLowerCase().includes('already')
      ? 'Este correo ya está registrado.'
      : (err.message || 'Error al crear la cuenta.');
    showErr(msg);
    setBtnLoading(btnEl, false);
  }
});
