// admin.js — Panel de administración completo

const API = 'http://localhost:3000';
function token() { return localStorage.getItem('token') || ''; }
function authH() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() }; }
async function apiFetch(path, opts = {}) {
  const { headers: extraHeaders, ...restOpts } = opts;
  const r = await fetch(API + path, {
    headers: { ...authH(), ...(extraHeaders || {}) },
    ...restOpts
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || r.status);
  }
  return r.json();
}

// Guard — solo admins
(function() {
  const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!u) { window.location.href = '../../pages/login.html'; return; }
  if (u.role?.toUpperCase() !== 'ADMIN') { window.location.href = '../user.html'; }
})();

window.history.pushState(null, '', window.location.href);
window.addEventListener('popstate', () => {
    const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!u || u.role?.toUpperCase() !== 'ADMIN') {
        window.location.href = '../../pages/login.html';
    }
});

function setText(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
function setHTML(id, v)  { const e = document.getElementById(id); if (e) e.innerHTML  = v; }
function logout() { localStorage.clear(); window.location.href = '../../pages/login.html'; }

let _refreshInterval = null;

function navigate(view) {
  // Limpiar auto-refresh anterior
  if (_refreshInterval) { clearInterval(_refreshInterval); _refreshInterval = null; }

  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-view="'+view+'"]')?.classList.add('active');
  document.getElementById('content').innerHTML = '';
  ({ dashboard, users, library, courses })[view]?.();

  // Auto-refresh cada 15 segundos en dashboard y library
  if (view === 'library' || view === 'dashboard') {
    _refreshInterval = setInterval(() => {
      ({ dashboard, users, library, courses })[view]?.();
    }, 15000);
  }
}

async function init() {
  const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
  setText('adminName',    u.name || u.nombre || 'Admin');
  setText('adminInitial', (u.name || u.nombre || 'A')[0].toUpperCase());
  navigate('dashboard');
}

// ══════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════
async function dashboard() {
  setHTML('content', '<div style="padding:40px;text-align:center;color:#6B7280">Cargando...</div>');

  let userList = [], libItems = [], pendingCases = [], courseList = [];
  try { const d = await apiFetch('/api/users');   userList     = d.users || d || []; } catch {}
  try { const d = await apiFetch('/api/library'); libItems     = d.libraryTests || d || []; } catch {}
  try { pendingCases = await apiFetch('/api/admin/test-cases'); } catch {}
  try { courseList   = await apiFetch('/api/courses'); } catch {}

  setHTML('content', `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
      ${[['👥',userList.length,'Usuarios','#3B5BDB'],['📋',libItems.length,'En repositorio','#059669'],
         ['⏳',pendingCases.length,'Pendientes revisión','#D97706'],['🎓',courseList.length,'Cursos','#7C3AED']]
        .map(([ic,v,l,c])=>`
        <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;padding:20px;cursor:pointer;"
             onclick="navigate('${v===pendingCases.length?'library':v===userList.length?'users':'dashboard'}')">
          <div style="font-size:24px;margin-bottom:8px">${ic}</div>
          <div style="font-size:26px;font-weight:800;color:${c}">${v}</div>
          <div style="font-size:12px;color:#6B7280;margin-top:4px">${l}</div>
        </div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;padding:20px;">
        <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;margin-bottom:14px;">Usuarios recientes</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="border-bottom:1px solid #E5E7EB;">
            <th style="text-align:left;padding:8px 0;color:#6B7280;font-size:11px;text-transform:uppercase">Nombre</th>
            <th style="text-align:left;padding:8px 0;color:#6B7280;font-size:11px;text-transform:uppercase">Email</th>
            <th style="text-align:left;padding:8px 0;color:#6B7280;font-size:11px;text-transform:uppercase">Estado</th>
          </tr></thead>
          <tbody>
            ${userList.slice(0,5).map(u=>`
            <tr style="border-bottom:1px solid #F3F4F6;">
              <td style="padding:10px 0;font-weight:600;color:#1E3A5F">${u.first_name} ${u.last_name}</td>
              <td style="padding:10px 0;color:#6B7280">${u.email}</td>
              <td style="padding:10px 0">
                <span style="padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;
                  background:${u.status==='ACTIVE'?'#ECFDF5':'#FEF2F2'};
                  color:${u.status==='ACTIVE'?'#059669':'#DC2626'}">${u.status}</span>
              </td>
            </tr>`).join('') || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#6B7280">Sin usuarios</td></tr>'}
          </tbody>
        </table>
        <button onclick="navigate('users')" style="margin-top:12px;font-size:12px;color:#3B5BDB;background:none;border:none;cursor:pointer;">Ver todos →</button>
      </div>
      <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;padding:20px;">
        <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;margin-bottom:14px;">⏳ Casos pendientes de revisión</h3>
        ${pendingCases.length === 0
          ? '<p style="font-size:13px;color:#6B7280;text-align:center;padding:20px;">Sin casos pendientes 🎉</p>'
          : pendingCases.slice(0,4).map(tc=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #F3F4F6;">
              <div>
                <p style="font-size:13px;font-weight:600;color:#1E3A5F">${tc.title}</p>
                <p style="font-size:11px;color:#6B7280">📁 ${tc.project_name}</p>
              </div>
              <button onclick="navigate('library')" style="font-size:11px;padding:4px 12px;background:#3B5BDB;color:white;border:none;border-radius:8px;cursor:pointer;">Revisar</button>
            </div>`).join('')}
        <button onclick="navigate('library')" style="margin-top:12px;font-size:12px;color:#3B5BDB;background:none;border:none;cursor:pointer;">Ir al repositorio →</button>
      </div>
    </div>`);
}

// ══════════════════════════════════════════
// USUARIOS
// ══════════════════════════════════════════
async function users() {
  setHTML('content', '<div style="padding:40px;text-align:center;color:#6B7280">Cargando usuarios...</div>');
  let userList = [];
  try { const d = await apiFetch('/api/users'); userList = d.users || d || []; } catch {}

  setHTML('content', `
    <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
      <div style="padding:16px 20px;border-bottom:1px solid #E5E7EB;display:flex;justify-content:space-between;align-items:center;">
        <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;">Gestión de usuarios</h3>
        <span style="font-size:12px;color:#6B7280">${userList.length} usuarios</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#F9FAFB;">
          <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase">Nombre</th>
          <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase">Email</th>
          <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase">Rol</th>
          <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase">Estado</th>
          <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase">Acciones</th>
        </tr></thead>
        <tbody>
          ${userList.map(u=>`
          <tr style="border-bottom:1px solid #F3F4F6;">
            <td style="padding:14px 20px;font-weight:600;color:#1E3A5F">${u.first_name} ${u.last_name}</td>
            <td style="padding:14px 20px;color:#6B7280">${u.email}</td>
            <td style="padding:14px 20px">
              <span style="padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;background:#EEF2FF;color:#3B5BDB">${u.role_name}</span>
            </td>
            <td style="padding:14px 20px">
              <span style="padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;
                background:${u.status==='ACTIVE'?'#ECFDF5':'#FEF2F2'};
                color:${u.status==='ACTIVE'?'#059669':'#DC2626'}">${u.status}</span>
            </td>
            <td style="padding:14px 20px;display:flex;flex-direction:column;gap:4px;">
              <button onclick="toggleUserStatus('${u.id_user}','${u.status}')"
                style="font-size:11px;padding:5px 12px;border-radius:8px;background:white;cursor:pointer;
                border:1.5px solid ${u.status==='ACTIVE'?'#FECACA':'#BBF7D0'};
                  color:${u.status==='ACTIVE'?'#DC2626':'#059669'}">
                ${u.status === 'ACTIVE' ? 'SUSPENDER' : 'ACTIVAR'}
              </button>
              <button onclick="deleteUser('${u.id_user}')"
                style="font-size:11px;padding:5px 12px;border-radius:8px;border:none;background:#DC2626;cursor:pointer;color:white;font-weight:700;">
                ELIMINAR
              </button>
            </td>
          </tr>`).join('') || '<tr><td colspan="5" style="padding:24px;text-align:center;color:#6B7280">Sin usuarios</td></tr>'}
        </tbody>
      </table>
    </div>`); 
}

async function toggleUserStatus(id, currentStatus) {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const label     = newStatus === 'INACTIVE' ? 'suspender' : 'activar';
  if (!confirm('¿Deseas '+label+' este usuario?')) return;
  try {
    const url = API + '/api/users/' + id + '/status';
    const r = await fetch(url, {
      method:  'PATCH',
      headers: authH(),
      body:    JSON.stringify({ status: newStatus })
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      alert('Error ' + r.status + ': ' + (err.error || 'No autorizado'));
      return;
    }
    await users();
  } catch(e) { alert('Error de conexión: ' + e.message); }
}

async function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
  try {
    await apiFetch('/api/users/' + id, { method: 'DELETE' });
    await users();
  } catch(e) { alert('Error al eliminar: ' + e.message); }
}

// ══════════════════════════════════════════
// REPOSITORIO / LIBRARY
// ══════════════════════════════════════════
async function library() {
  setHTML('content', '<div style="padding:40px;text-align:center;color:#6B7280">Cargando...</div>');

  let libItems = [], pendingCases = [];
  try { const d = await apiFetch('/api/library'); libItems = d.libraryTests || d || []; } catch {}
  // Endpoint admin — trae todos los casos DRAFT de todos los proyectos
  try { pendingCases = await apiFetch('/api/admin/test-cases'); } catch {}

  const typeBg    = t => ({FUNCTIONAL:'#EEF2FF',NON_FUNCTIONAL:'#FFFBEB',REGRESSION:'#FEF2F2'})[t]||'#F3F4F6';
  const typeColor = t => ({FUNCTIONAL:'#3B5BDB',NON_FUNCTIONAL:'#D97706',REGRESSION:'#DC2626'})[t]||'#6B7280';

  setHTML('content', `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">

      <!-- Pendientes de aprobación -->
      <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #E5E7EB;background:#FFFBEB;">
          <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;">⏳ Pendientes de aprobación</h3>
          <p style="font-size:12px;color:#6B7280;margin-top:2px;">${pendingCases.length} casos en borrador</p>
        </div>
        <div style="max-height:520px;overflow-y:auto;">
          ${pendingCases.length === 0
            ? '<p style="padding:24px;text-align:center;font-size:13px;color:#6B7280">No hay casos pendientes 🎉</p>'
            : pendingCases.map(tc=>`
              <div style="padding:14px 20px;border-bottom:1px solid #F3F4F6;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                  <div style="flex:1;min-width:0;">
                    <p style="font-size:13px;font-weight:700;color:#1E3A5F;margin-bottom:2px;">${tc.title}</p>
                    <p style="font-size:11px;color:#6B7280;margin-bottom:6px;">
                      📁 ${tc.project_name} &nbsp;·&nbsp; 👤 ${tc.first_name} ${tc.last_name}
                    </p>
                    <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;
                      background:${typeBg(tc.type)};color:${typeColor(tc.type)}">${tc.type}</span>
                    ${tc.description ? `<p style="font-size:12px;color:#6B7280;margin-top:6px;line-height:1.5">${tc.description.slice(0,80)}${tc.description.length>80?'...':''}</p>` : ''}
                  </div>
                  <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
                    <button onclick="approveCase('${tc.id_test_case}','${tc.title}','${tc.type}')"
                      style="font-size:11px;padding:6px 14px;background:#059669;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">
                      ✓ Aprobar
                    </button>
                    <button onclick="rejectCase('${tc.id_test_case}')"
                      style="font-size:11px;padding:6px 14px;background:white;color:#DC2626;border:1.5px solid #FECACA;border-radius:8px;cursor:pointer;">
                      ✕ Rechazar
                    </button>
                  </div>
                </div>
              </div>`).join('')}
        </div>
      </div>

      <!-- Repositorio aprobado -->
      <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #E5E7EB;background:#ECFDF5;">
          <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;">✓ Repositorio aprobado</h3>
          <p style="font-size:12px;color:#6B7280;margin-top:2px;">${libItems.length} casos validados</p>
        </div>
        <div style="max-height:520px;overflow-y:auto;">
          ${libItems.length === 0
            ? '<p style="padding:24px;text-align:center;font-size:13px;color:#6B7280">Aún no hay casos aprobados</p>'
            : libItems.map(item=>`
              <div style="padding:14px 20px;border-bottom:1px solid #F3F4F6;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                  <div style="flex:1;min-width:0;">
                    <p style="font-size:13px;font-weight:700;color:#1E3A5F;margin-bottom:4px;">${item.title||'—'}</p>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                      <span style="padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;
                        background:${typeBg(item.type)};color:${typeColor(item.type)}">${item.type||'—'}</span>
                      ${item.category ? `<span style="font-size:11px;color:#3B5BDB;font-weight:600">📁 ${item.category}</span>` : ''}
                    </div>
                    ${item.tags?.length ? `<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">
                      ${item.tags.map(t=>`<span style="padding:2px 8px;background:#F3F4F6;border-radius:999px;font-size:11px;color:#6B7280">${t}</span>`).join('')}
                    </div>` : ''}
                  </div>
                  <button onclick="removeFromLibrary('${item.id_library}')"
                    style="font-size:11px;padding:5px 10px;background:white;color:#DC2626;border:1.5px solid #FECACA;border-radius:8px;cursor:pointer;flex-shrink:0;">
                    Quitar
                  </button>
                </div>
              </div>`).join('')}
        </div>
      </div>
    </div>`);
}

async function approveCase(id_test_case, title, type) {
  const category = prompt('Categoría para "'+title+'":', ({FUNCTIONAL:'Funcional',NON_FUNCTIONAL:'No Funcional',REGRESSION:'Regresión'})[type]||'General');
  if (category === null) return;
  const tagsInput = prompt('Tags (separados por coma, opcional):', '');
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

  try {
    // 1. Agregar al repositorio
    await apiFetch('/api/library', {
      method: 'POST',
      body: JSON.stringify({ id_test_case, category: category||'General', tags })
    });
    // 2. Cambiar status a ACTIVE usando endpoint admin (sin verificar ownership)
    await apiFetch('/api/admin/test-cases/'+id_test_case+'/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' })
    });
    await library();
  } catch(e) {
    alert('Error al aprobar: ' + e.message);
  }
}

async function rejectCase(id_test_case) {
  if (!confirm('¿Rechazar este caso? Se marcará como DEPRECATED.')) return;
  try {
    await apiFetch('/api/admin/test-cases/'+id_test_case+'/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DEPRECATED' })
    });
    await library();
  } catch { alert('Error al rechazar'); }
}

async function removeFromLibrary(id_library) {
  if (!confirm('¿Quitar este caso del repositorio?')) return;
  try {
    await apiFetch('/api/library/'+id_library, { method: 'DELETE' });
    await library();
  } catch { alert('Error al eliminar'); }
}

// ══════════════════════════════════════════
// CURSOS
// ══════════════════════════════════════════
a// ══════════════════════════════════════════
// CURSOS + RUTAS DE APRENDIZAJE
// ══════════════════════════════════════════

function normalizeArrayResponse(data) {
  if (Array.isArray(data)) return data;
  if (data?.courses) return data.courses;
  if (data?.routes)  return data.routes;
  if (data?.levels)  return data.levels;
  if (data?.users)   return data.users;
  return [];
}

function openModal(html) {
  const overlay = document.createElement('div');
  overlay.id = 'adminModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;';
  overlay.innerHTML = `<div style="background:white;border-radius:16px;padding:28px;width:480px;max-width:95vw;max-height:90vh;overflow-y:auto;">${html}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}
function closeModal() { document.getElementById('adminModal')?.remove(); }
function modalBtn(color = '#3B5BDB') {
  return `style="padding:9px 20px;background:${color};color:white;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;"`;
}
function inputStyle() {
  return `style="width:100%;padding:9px 12px;border:1.5px solid #E5E7EB;border-radius:8px;font-size:13px;font-family:inherit;box-sizing:border-box;"`;
}
function labelStyle() {
  return `style="display:block;font-size:12px;font-weight:700;color:#1E3A5F;margin-bottom:5px;"`;
}
function escHtml(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

async function courses() {
  setHTML('content', '<div style="padding:40px;text-align:center;color:#6B7280">Cargando...</div>');

  let courseList = [], routeList = [];
  try { courseList = normalizeArrayResponse(await apiFetch('/api/courses')); } catch {}
  try { routeList  = normalizeArrayResponse(await apiFetch('/api/routes'));  } catch {}

  setHTML('content', `
    <div style="display:flex;gap:8px;margin-bottom:20px;">
      <button id="tabCourses" onclick="showTab('courses')"
        style="padding:8px 20px;border-radius:8px;border:1.5px solid #3B5BDB;font-size:13px;font-weight:700;cursor:pointer;background:#3B5BDB;color:white;">
        🎓 Cursos
      </button>
      <button id="tabRoutes" onclick="showTab('routes')"
        style="padding:8px 20px;border-radius:8px;border:1.5px solid #E5E7EB;font-size:13px;font-weight:700;cursor:pointer;background:white;color:#6B7280;">
        🗺️ Rutas de aprendizaje
      </button>
    </div>

    <div id="panelCourses">
      <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #E5E7EB;display:flex;justify-content:space-between;align-items:center;">
          <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;margin:0;">Cursos (${courseList.length})</h3>
          <button onclick="openCreateCourse()" ${modalBtn()}>+ Nuevo curso</button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="background:#F9FAFB;">
            <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase;">Título</th>
            <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase;">Descripción</th>
            <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase;">Estado</th>
            <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase;">Acciones</th>
          </tr></thead>
          <tbody>
            ${courseList.length ? courseList.map(c => `
            <tr style="border-bottom:1px solid #F3F4F6;">
              <td style="padding:14px 20px;font-weight:600;color:#1E3A5F;">${c.title}</td>
              <td style="padding:14px 20px;color:#6B7280;max-width:260px;">${(c.description||'—').slice(0,60)}${(c.description||'').length>60?'...':''}</td>
              <td style="padding:14px 20px;">
                <span style="padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;
                  background:${c.status==='ACTIVE'?'#ECFDF5':'#FEF3C7'};
                  color:${c.status==='ACTIVE'?'#059669':'#D97706'};">
                  ${c.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style="padding:14px 20px;">
                <div style="display:flex;gap:6px;">
                  <button onclick="openEditCourse('${c.id_course}','${escHtml(c.title)}','${escHtml(c.description||'')}','${c.status}')"
                    style="padding:5px 12px;background:#EFF6FF;color:#3B5BDB;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
                    ✏️ Editar
                  </button>
                  <button onclick="toggleCourseStatus('${c.id_course}','${c.status}')"
                    style="padding:5px 12px;background:${c.status==='ACTIVE'?'#FEF3C7':'#ECFDF5'};color:${c.status==='ACTIVE'?'#D97706':'#059669'};border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
                    ${c.status === 'ACTIVE' ? '⏸ Desactivar' : '▶ Activar'}
                  </button>
                  <button onclick="deleteCourse('${c.id_course}','${escHtml(c.title)}')"
                    style="padding:5px 12px;background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
                    🗑
                  </button>
                </div>
              </td>
            </tr>`).join('') : '<tr><td colspan="4" style="padding:32px;text-align:center;color:#6B7280;">Sin cursos registrados</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <div id="panelRoutes" style="display:none;">
      <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #E5E7EB;display:flex;justify-content:space-between;align-items:center;">
          <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;margin:0;">Rutas de aprendizaje (${routeList.length})</h3>
          <button onclick="openCreateRoute()" ${modalBtn()}>+ Nueva ruta</button>
        </div>
        <div style="padding:20px;display:grid;gap:12px;">
          ${routeList.length ? routeList.map(r => `
          <div style="border:1px solid #E5E7EB;border-radius:12px;padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:start;">
              <div>
                <p style="margin:0;font-size:14px;font-weight:700;color:#1E3A5F;">${r.route_name}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#6B7280;">Nivel: ${r.level_name||'—'} · ${r.total_courses||0} curso(s)</p>
              </div>
              <div style="display:flex;gap:6px;">
                <button onclick="openManageCourses('${r.id_route}','${escHtml(r.route_name)}')"
                  style="padding:5px 12px;background:#EFF6FF;color:#3B5BDB;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
                  📚 Cursos
                </button>
                <button onclick="deleteRoute('${r.id_route}','${escHtml(r.route_name)}')"
                  style="padding:5px 12px;background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
                  🗑
                </button>
              </div>
            </div>
          </div>`).join('') : '<p style="text-align:center;color:#6B7280;padding:32px 0;">Sin rutas registradas</p>'}
        </div>
      </div>
    </div>
  `);
}

function showTab(tab) {
  const isCourses = tab === 'courses';
  document.getElementById('panelCourses').style.display = isCourses ? '' : 'none';
  document.getElementById('panelRoutes').style.display  = isCourses ? 'none' : '';
  document.getElementById('tabCourses').style.cssText = `padding:8px 20px;border-radius:8px;border:1.5px solid ${isCourses?'#3B5BDB':'#E5E7EB'};font-size:13px;font-weight:700;cursor:pointer;background:${isCourses?'#3B5BDB':'white'};color:${isCourses?'white':'#6B7280'};`;
  document.getElementById('tabRoutes').style.cssText  = `padding:8px 20px;border-radius:8px;border:1.5px solid ${!isCourses?'#3B5BDB':'#E5E7EB'};font-size:13px;font-weight:700;cursor:pointer;background:${!isCourses?'#3B5BDB':'white'};color:${!isCourses?'white':'#6B7280'};`;
}

function openCreateCourse() {
  openModal(`
    <h3 style="margin:0 0 20px;font-size:16px;font-weight:800;color:#1E3A5F;">Nuevo curso</h3>
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label ${labelStyle()}>Título *</label><input id="mTitle" ${inputStyle()} placeholder="Nombre del curso"></div>
      <div><label ${labelStyle()}>Descripción</label><textarea id="mDesc" rows="3" ${inputStyle()} placeholder="Descripción..."></textarea></div>
      <div><label ${labelStyle()}>Estado</label>
        <select id="mStatus" ${inputStyle()}>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </select>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
      <button onclick="closeModal()" style="padding:9px 20px;background:#F3F4F6;color:#374151;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Cancelar</button>
      <button onclick="submitCreateCourse()" ${modalBtn()}>Crear curso</button>
    </div>
  `);
}

async function submitCreateCourse() {
  const title  = document.getElementById('mTitle').value.trim();
  const desc   = document.getElementById('mDesc').value.trim();
  const status = document.getElementById('mStatus').value;
  if (!title) { alert('El título es obligatorio'); return; }
  try {
    await apiFetch('/api/courses', { method:'POST', body: JSON.stringify({ title, description: desc, status }) });
    closeModal(); courses();
  } catch(e) { alert('Error: ' + e.message); }
}

function openEditCourse(id, title, desc, status) {
  openModal(`
    <h3 style="margin:0 0 20px;font-size:16px;font-weight:800;color:#1E3A5F;">Editar curso</h3>
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label ${labelStyle()}>Título *</label><input id="mTitle" ${inputStyle()} value="${title}"></div>
      <div><label ${labelStyle()}>Descripción</label><textarea id="mDesc" rows="3" ${inputStyle()}>${desc}</textarea></div>
      <div><label ${labelStyle()}>Estado</label>
        <select id="mStatus" ${inputStyle()}>
          <option value="ACTIVE" ${status==='ACTIVE'?'selected':''}>Activo</option>
          <option value="INACTIVE" ${status==='INACTIVE'?'selected':''}>Inactivo</option>
        </select>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
      <button onclick="closeModal()" style="padding:9px 20px;background:#F3F4F6;color:#374151;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Cancelar</button>
      <button onclick="submitEditCourse('${id}')" ${modalBtn()}>Guardar cambios</button>
    </div>
  `);
}

async function submitEditCourse(id) {
  const title  = document.getElementById('mTitle').value.trim();
  const desc   = document.getElementById('mDesc').value.trim();
  const status = document.getElementById('mStatus').value;
  if (!title) { alert('El título es obligatorio'); return; }
  try {
    await apiFetch(`/api/courses/${id}`, { method:'PUT', body: JSON.stringify({ title, description: desc, status }) });
    closeModal(); courses();
  } catch(e) { alert('Error: ' + e.message); }
}

async function toggleCourseStatus(id, currentStatus) {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    await apiFetch(`/api/courses/${id}/status`, { method:'PATCH', body: JSON.stringify({ status: newStatus }) });
    courses();
  } catch(e) { alert('Error: ' + e.message); }
}

async function deleteCourse(id, title) {
  if (!confirm(`¿Eliminar el curso "${title}"?`)) return;
  try {
    await apiFetch(`/api/courses/${id}`, { method:'DELETE' });
    courses();
  } catch(e) { alert('Error: ' + e.message); }
}

async function openCreateRoute() {
  let levels = [];
  try { levels = normalizeArrayResponse(await apiFetch('/api/levels')); } catch {}
  openModal(`
    <h3 style="margin:0 0 20px;font-size:16px;font-weight:800;color:#1E3A5F;">Nueva ruta de aprendizaje</h3>
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label ${labelStyle()}>Nombre *</label><input id="mRName" ${inputStyle()} placeholder="Ej: Ruta Junior QA"></div>
      <div><label ${labelStyle()}>Descripción</label><textarea id="mRDesc" rows="3" ${inputStyle()} placeholder="Descripción..."></textarea></div>
      <div><label ${labelStyle()}>Nivel *</label>
        <select id="mRLevel" ${inputStyle()}>
          <option value="">Selecciona un nivel</option>
          ${levels.map(l=>`<option value="${l.id_level}">${l.level_name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
      <button onclick="closeModal()" style="padding:9px 20px;background:#F3F4F6;color:#374151;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Cancelar</button>
      <button onclick="submitCreateRoute()" ${modalBtn()}>Crear ruta</button>
    </div>
  `);
}

async function submitCreateRoute() {
  const route_name  = document.getElementById('mRName').value.trim();
  const description = document.getElementById('mRDesc').value.trim();
  const id_level    = document.getElementById('mRLevel').value;
  if (!route_name) { alert('El nombre es obligatorio'); return; }
  if (!id_level)   { alert('Selecciona un nivel'); return; }
  try {
    await apiFetch('/api/routes', { method:'POST', body: JSON.stringify({ route_name, description, id_level }) });
    closeModal(); courses(); showTab('routes');
  } catch(e) { alert('Error: ' + e.message); }
}

async function deleteRoute(id, name) {
  if (!confirm(`¿Eliminar la ruta "${name}"?`)) return;
  try {
    await apiFetch(`/api/routes/${id}`, { method:'DELETE' });
    courses(); showTab('routes');
  } catch(e) { alert('Error: ' + e.message); }
}

async function openManageCourses(routeId, routeName) {
  let routeData = {}, allCourses = [];
  try { routeData  = (await apiFetch(`/api/routes/${routeId}`)).route || {}; } catch {}
  try { allCourses = normalizeArrayResponse(await apiFetch('/api/courses')); } catch {}

  const assigned    = (routeData.courses || []).filter(c => c.id_course);
  const assignedIds = assigned.map(c => String(c.id_course));
  const available   = allCourses.filter(c => !assignedIds.includes(String(c.id_course)) && c.status === 'ACTIVE');

  openModal(`
    <h3 style="margin:0 0 6px;font-size:16px;font-weight:800;color:#1E3A5F;">📚 ${routeName}</h3>
    <p style="margin:0 0 20px;font-size:12px;color:#6B7280;">Cursos asignados a esta ruta</p>

    ${assigned.length ? `
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
      ${assigned.sort((a,b)=>a.orders-b.orders).map(c=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#F9FAFB;border-radius:8px;border:1px solid #E5E7EB;">
        <span style="font-size:13px;font-weight:600;color:#1E3A5F;">#${c.orders} — ${c.title}</span>
        <button onclick="removeCourseFromRoute('${routeId}','${c.id_course}','${escHtml(routeName)}')"
          style="padding:4px 10px;background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
          Quitar
        </button>
      </div>`).join('')}
    </div>` : '<p style="color:#6B7280;font-size:13px;margin-bottom:16px;">Sin cursos asignados aún.</p>'}

    ${available.length ? `
    <div style="border-top:1px solid #E5E7EB;padding-top:16px;">
      <p style="font-size:12px;font-weight:700;color:#1E3A5F;margin:0 0 10px;">Agregar curso</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div><label ${labelStyle()}>Curso</label>
          <select id="mAddCourse" ${inputStyle()}>
            ${available.map(c=>`<option value="${c.id_course}">${c.title}</option>`).join('')}
          </select>
        </div>
        <div><label ${labelStyle()}>Orden</label>
          <input id="mAddOrder" type="number" min="1" value="${assigned.length + 1}" ${inputStyle()}>
        </div>
        <button onclick="addCourseToRoute('${routeId}','${escHtml(routeName)}')" ${modalBtn()}>+ Agregar</button>
      </div>
    </div>` : '<p style="font-size:12px;color:#6B7280;margin-top:12px;">No hay cursos activos disponibles.</p>'}

    <div style="display:flex;justify-content:flex-end;margin-top:20px;">
      <button onclick="closeModal()" style="padding:9px 20px;background:#F3F4F6;color:#374151;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Cerrar</button>
    </div>
  `);
}

async function addCourseToRoute(routeId, routeName) {
  const id_course = document.getElementById('mAddCourse').value;
  const orders    = parseInt(document.getElementById('mAddOrder').value);
  if (!id_course)        { alert('Selecciona un curso'); return; }
  if (!orders || orders < 1) { alert('El orden debe ser mayor a 0'); return; }
  try {
    await apiFetch(`/api/routes/${routeId}/courses`, { method:'POST', body: JSON.stringify({ id_course, orders }) });
    openManageCourses(routeId, routeName);
  } catch(e) { alert('Error: ' + e.message); }
}

async function removeCourseFromRoute(routeId, courseId, routeName) {
  if (!confirm('¿Quitar este curso de la ruta?')) return;
  try {
    await apiFetch(`/api/routes/${routeId}/courses/${courseId}`, { method:'DELETE' });
    openManageCourses(routeId, routeName);
  } catch(e) { alert('Error: ' + e.message); }
}

document.addEventListener('DOMContentLoaded', init);