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
async function courses() {
  setHTML('content', '<div style="padding:40px;text-align:center;color:#6B7280">Cargando cursos...</div>');
  let courseList = [];
  try { courseList = await apiFetch('/api/courses'); } catch {}

  setHTML('content', `
    <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
      <div style="padding:16px 20px;border-bottom:1px solid #E5E7EB;display:flex;justify-content:space-between;align-items:center;">
        <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;">Cursos disponibles</h3>
        <span style="font-size:12px;color:#6B7280">${courseList.length} cursos</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#F9FAFB;">
          <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase">Título</th>
          <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase">Descripción</th>
          <th style="text-align:left;padding:12px 20px;color:#6B7280;font-size:11px;text-transform:uppercase">Estado</th>
        </tr></thead>
        <tbody>
          ${courseList.map(c=>`
          <tr style="border-bottom:1px solid #F3F4F6;">
            <td style="padding:14px 20px;font-weight:600;color:#1E3A5F">${c.title}</td>
            <td style="padding:14px 20px;color:#6B7280;max-width:300px">${(c.description||'—').slice(0,60)}${(c.description||'').length>60?'...':''}</td>
            <td style="padding:14px 20px">
              <span style="padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;background:#ECFDF5;color:#059669">${c.status}</span>
            </td>
          </tr>`).join('') || '<tr><td colspan="3" style="padding:24px;text-align:center;color:#6B7280">Sin cursos</td></tr>'}
        </tbody>
      </table>
    </div>`);
}

document.addEventListener('DOMContentLoaded', init);