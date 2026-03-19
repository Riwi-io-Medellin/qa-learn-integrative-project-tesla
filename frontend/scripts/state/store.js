/* ── QA Learn · scripts/state/store.js ─────────────────────────────────── */

const K = { TOKEN:'qa_token', USER:'qa_user', DIAG:'qa_last_diagnostic' };
 
export const QAStore = {
  // Token
  setToken: (t) => localStorage.setItem(K.TOKEN, t),
  getToken: ()  => localStorage.getItem(K.TOKEN),
  hasToken: ()  => !!localStorage.getItem(K.TOKEN),
 
  // Decodifica el payload del JWT sin librería y verifica que no haya expirado
  isTokenValid: () => {
    const token = localStorage.getItem(K.TOKEN);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp está en segundos, Date.now() en milisegundos
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
 
  // User
  // Login shape: { id, name, email, role }  (name=first_name, role=role_name)
  // /me   shape: { id_user, first_name, last_name, email, role_name, status, created_at }
  setUser: (u) => localStorage.setItem(K.USER, JSON.stringify(u)),
  getUser: () => { try { return JSON.parse(localStorage.getItem(K.USER)); } catch { return null; } },
  isAdmin: () => { const u = QAStore.getUser(); return u?.role === 'ADMIN' || u?.role_name === 'ADMIN'; },
 
  // Nombre e iniciales — compatibles con ambos shapes
  displayName: () => {
    const u = QAStore.getUser();
    if (!u) return 'Usuario';
    if (u.first_name) return `${u.first_name} ${u.last_name || ''}`.trim();
    return u.name || u.email || 'Usuario';
  },
  initials: () => {
    const u = QAStore.getUser();
    if (!u) return 'U';
    if (u.first_name) return `${u.first_name[0]}${(u.last_name || '')[0] || ''}`.toUpperCase();
    if (u.name) return u.name.slice(0, 2).toUpperCase();
    return (u.email || 'U').slice(0, 1).toUpperCase();
  },
 
  // Diagnóstico
  setDiag: (d) => localStorage.setItem(K.DIAG, JSON.stringify(d)),
  getDiag: ()  => { try { return JSON.parse(localStorage.getItem(K.DIAG)); } catch { return null; } },
 
  // Login completo
  // apiResponse = { message, user: { user:{id,name,email,role}, token } }
  login: (apiResponse) => {
    const inner = apiResponse.user;       // { user:{...}, token }
    QAStore.setToken(inner.token);
    QAStore.setUser(inner.user);          // { id, name, email, role }
  },
 
  // Logout
  logout: () => {
    localStorage.removeItem(K.TOKEN);
    localStorage.removeItem(K.USER);
    localStorage.removeItem(K.DIAG);
  },
};