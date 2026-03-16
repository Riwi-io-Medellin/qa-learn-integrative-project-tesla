/* ── QA Learn · components/sidebar.js ──────────────────────────────────── */
import { QAStore } from '../scripts/state/store.js';
import { auth }    from '../services/api.js';

const ICON = {
  aprendizaje: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>`,
  laboratorio: `<path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>`,
  perfil:       `<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>`,
  config:       `<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`,
  logout:       `<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>`,
};

function svg(d) {
  return `<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">${d}</svg>`;
}

/**
 * active: 'aprendizaje' | 'ruta' | 'laboratorio' | 'pruebas' | 'repositorio' | 'perfil' | 'config'
 */
export function initSidebar(active) {
  const mount = document.getElementById('sidebar-mount');
  if (!mount) return;

  const name     = QAStore.displayName();
  const initials = QAStore.initials();
  const user     = QAStore.getUser();
  const email    = user?.email || '';

  const ap  = ['aprendizaje','ruta'].includes(active);
  const lab = ['laboratorio','pruebas','repositorio'].includes(active);

  function topItem(key, href, label) {
    const isActive = (key === 'aprendizaje' && ap) || (key === 'laboratorio' && lab);
    return `
      <a href="${href}" class="sb-item ${isActive ? 'active' : ''}" style="justify-content:space-between">
        <span class="flex items-center gap-2.5">
          ${svg(ICON[key])}
          <span>${label}</span>
        </span>
        <svg class="w-3.5 h-3.5 transition-transform" style="transform:rotate(${isActive?'0':'-90'}deg)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </a>`;
  }

  function subItem(key, href, label) {
    return `<a href="${href}" class="sb-sub ${active === key ? 'active' : ''}">
      <div class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:${active===key?'#3B5BDB':'#D0D9F0'}"></div>
      ${label}
    </a>`;
  }

  function plainItem(key, href, label) {
    return `<a href="${href}" class="sb-item ${active===key?'active':''}">
      ${svg(ICON[key])}<span>${label}</span>
    </a>`;
  }

  mount.innerHTML = `
    <aside class="app-sidebar">
      <!-- Logo -->
      <div style="height:60px;display:flex;align-items:center;padding:0 20px;border-bottom:1px solid #D0D9F0;flex-shrink:0">
        <a href="06-dashboard-aprendizaje.html" style="display:flex;align-items:center;gap:10px;text-decoration:none">
          <div style="width:30px;height:30px;border-radius:8px;background:#3B5BDB;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg style="width:16px;height:16px;color:white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span style="font-weight:800;color:#1E3A5F;font-size:15px">QA <span style="color:#3B5BDB">Learn</span></span>
        </a>
      </div>

      <!-- Nav -->
      <nav style="flex:1;padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:2px">
        ${topItem('aprendizaje','06-dashboard-aprendizaje.html','Aprendizaje')}
        ${ap ? `<div style="display:flex;flex-direction:column;gap:1px;margin-bottom:4px">
          ${subItem('aprendizaje','06-dashboard-aprendizaje.html','Dashboard')}
          ${subItem('ruta','07-ruta.html','Ruta de Aprendizaje')}
        </div>` : ''}

        ${topItem('laboratorio','08-dashboard-laboratorio.html','Laboratorio')}
        ${lab ? `<div style="display:flex;flex-direction:column;gap:1px;margin-bottom:4px">
          ${subItem('laboratorio','08-dashboard-laboratorio.html','Dashboard')}
          ${subItem('pruebas','09-pruebas.html','Pruebas')}
          ${subItem('repositorio','10-biblioteca.html','Repositorio')}
        </div>` : ''}

        ${plainItem('perfil','11-perfil.html','Perfil')}
        ${plainItem('config','12-configuraciones.html','Configuraciones')}
      </nav>

      <!-- Footer usuario -->
      <div style="border-top:1px solid #D0D9F0;padding:14px 16px;flex-shrink:0">
        <div style="display:flex;align-items:center;gap:10px">
          <div id="sb-avatar" style="width:34px;height:34px;border-radius:50%;background:#3B5BDB;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:700;flex-shrink:0">${initials}</div>
          <div style="flex:1;min-width:0">
            <p id="sb-name"  style="font-size:12px;font-weight:700;color:#1E3A5F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</p>
            <p id="sb-email" style="font-size:11px;color:#4A5073;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${email}</p>
          </div>
          <button id="logout-btn" title="Cerrar sesión"
            style="width:28px;height:28px;border-radius:8px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#4A5073;transition:background 0.15s"
            onmouseover="this.style.background='#EEF2FB'" onmouseout="this.style.background='transparent'">
            ${svg(ICON.logout)}
          </button>
        </div>
      </div>
    </aside>`;

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try { await auth.logout(); } catch {}
    QAStore.logout();
    window.location.href = '../public/02-login.html';
  });
}
