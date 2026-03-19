import { QAStore } from '../scripts/state/store.js';
 
const inPublic = () => window.location.pathname.includes('/public/');
 
const loginURL     = () => inPublic() ? '02-login.html'                         : '../public/02-login.html';
const dashboardURL = () => inPublic() ? '../user/06-dashboard-aprendizaje.html' : '06-dashboard-aprendizaje.html';
const diagURL      = () => inPublic() ? '../user/04-diagnostico.html'           : '04-diagnostico.html';
 
/** Protege vistas privadas. Si no hay token válido → limpia storage y redirige a login. */
export function requireAuth() {
  if (!QAStore.isTokenValid()) {
    QAStore.logout();
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
 
/** En vistas públicas: si ya hay sesión activa Y válida redirige al destino correcto. */
export function redirectIfLoggedIn() {
  if (QAStore.isTokenValid()) {
    window.location.replace(QAStore.getDiag() ? dashboardURL() : diagURL());
  } else {
    // Token expirado o inválido — limpia para no bloquear el login
    QAStore.logout();
  }
}