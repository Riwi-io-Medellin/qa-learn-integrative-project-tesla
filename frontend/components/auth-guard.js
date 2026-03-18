/* ── QA Learn · components/auth-guard.js ───────────────────────────────── */
import { QAStore } from '../scripts/state/store.js';

const inPublic = () => window.location.pathname.includes('/public/');

const loginURL     = () => inPublic() ? 'login.html'                         : '../public/login.html';
const dashboardURL = () => inPublic() ? '../pages/learning-dashboard.html' : 'learning-dashboard.html';
const diagURL      = () => inPublic() ? '../pages/diagnostic.html'           : 'diagnostic.html';

/** Protege vistas privadas. Si no hay token → redirige a login. */
export function requireAuth() {
  if (!QAStore.hasToken()) {
    window.location.replace(loginURL());
    return null;
  }
  return QAStore.getUser();
}

/** Solo para admins. */
export function requireAdmin() {
  const u = requireAuth();
  if (!u) return null;
  if (!QAStore.isAdmin()) { window.location.replace(dashboardURL()); return null; }
  return u;
}

/** En vistas públicas: si ya hay sesión activa redirige al destino correcto. */
export function redirectIfLoggedIn() {
  if (QAStore.hasToken()) {
    window.location.replace(QAStore.getDiag() ? dashboardURL() : diagURL());
  }
}
