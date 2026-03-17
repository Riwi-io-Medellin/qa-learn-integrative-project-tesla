/* ── 13-admin.js ── Panel de administracion ──────────────────────────── */
import { users, courses, modules, library } from '../../services/api.js';
import { QAStore }      from '../state/store.js';
import { requireAdmin } from '../../components/auth-guard.js';
import { showToast, showError, showConfirm, badge, fmtDate } from '../ui/ui-shared.js';

const _u = requireAdmin();
if (_u) {
  document.getElementById('adminName')?.setAttribute('textContent', QAStore.displayName());
  const el = document.getElementById('adminName'); if(el) el.textContent = QAStore.displayName();
  const ini = document.getElementById('adminInitial'); if(ini) ini.textContent = QAStore.initials();
}

window.doLogout = () => { QAStore.logout(); window.location.href = '../public/02-login.html'; };

window.navigate = (view) => {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
  const titles = { dashboard:'Dashboard', users:'Usuarios', courses:'Cursos', library:'Repositorio' };
  const el = document.getElementById('pageTitle'); if(el) el.textContent = titles[view]||'Admin';
  document.getElementById('content').innerHTML = '';
  ({ dashboard, usersView, coursesView, libraryView })[view==='users'?'usersView':view==='courses'?'coursesView':view==='library'?'libraryView':view]?.();
};

// ── Helpers ───────────────────────────────────────────────────────────────
const API = 'http://localhost:3000/api';
const tok = () => localStorage.getItem('qa_token');
const apiFetch = (path, opts={}) => fetch(`${API}${path}`, {
  ...opts, headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${tok()}`, ...(opts.headers||{}) }
});
const empty = (msg) => `<p style="padding:24px;text-align:center;font-size:13px;color:#4A5073">${msg}</p>`;
const confirm = (title, msg, text, danger, fn) => showConfirm({ title, message:msg, confirmText:text, danger, onConfirm:fn });
const tbl = (heads, rows) => `<table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;

// ── DASHBOARD ─────────────────────────────────────────────────────────────
async function dashboard() {
  document.getElementById('content').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div class="stat-card"><div class="stat-val" id="s-users">—</div><div class="stat-label">Usuarios registrados</div></div>
      <div class="stat-card"><div class="stat-val" id="s-courses">—</div><div class="stat-label">Cursos activos</div></div>
      <div class="stat-card"><div class="stat-val" id="s-library">—</div><div class="stat-label">Casos en repositorio</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-header"><span class="card-title">Usuarios recientes</span><button class="btn btn-outline" onclick="navigate('users')">Ver todos</button></div>
        <div id="dash-users">${empty('Cargando...')}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Accesos rapidos</span></div>
        <div style="padding:16px;display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-primary" style="text-align:left" onclick="navigate('courses')">Gestionar cursos</button>
          <button class="btn btn-outline" style="text-align:left" onclick="navigate('library')">Revisar repositorio</button>
          <button class="btn btn-outline" style="text-align:left" onclick="navigate('users')">Gestionar usuarios</button>
        </div>
      </div>
    </div>`;
  try {
    const [ud, cd, ld] = await Promise.all([users.getAll().catch(()=>null), courses.getAll().catch(()=>null), library.getAll().catch(()=>null)]);
    const uList = ud?.users||[], cList = cd?.courses||[], lList = ld?.libraryTests||[];
    document.getElementById('s-users').textContent   = uList.length;
    document.getElementById('s-courses').textContent = cList.filter(c=>c.status==='ACTIVE').length;
    document.getElementById('s-library').textContent = lList.length;
    document.getElementById('dash-users').innerHTML = uList.length === 0 ? empty('Sin usuarios')
      : tbl(['Nombre','Email','Estado'], uList.map(u=>`<tr>
          <td style="font-weight:600;color:${u.role_name==='ADMIN'?'#3B5BDB':'#1E3A5F'}">${u.first_name} ${u.last_name}${u.role_name==='ADMIN'?` <span class="qa-badge" style="background:#EEF2FF;color:#3B5BDB">ADMIN</span>`:''}</td>
          <td style="color:#4A5073">${u.email}</td><td>${badge(u.status)}</td></tr>`).join(''));
  } catch { showToast('Error al cargar el dashboard','error'); }
}

// ── USUARIOS ──────────────────────────────────────────────────────────────
async function usersView() {
  document.getElementById('content').innerHTML = `<div class="card"><div class="card-header"><span class="card-title">Gestion de usuarios</span><span id="u-count" style="font-size:12px;color:#4A5073"></span></div><div id="u-body">${empty('Cargando...')}</div></div>`;
  try {
    const uList = (await users.getAll())?.users||[];
    document.getElementById('u-count').textContent = `${uList.length} usuarios`;
    document.getElementById('u-body').innerHTML = uList.length === 0 ? empty('Sin usuarios registrados')
      : tbl(['Nombre','Email','Rol','Estado','Acciones'], uList.map(u=>`<tr>
          <td style="font-weight:600">${u.first_name} ${u.last_name}</td>
          <td style="color:#4A5073">${u.email}</td>
          <td><span class="qa-badge" style="background:#EEF2FF;color:#3B5BDB">${u.role_name||'—'}</span></td>
          <td>${badge(u.status)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn ${u.status==='ACTIVE'?'btn-warning':'btn-success'}" onclick="toggleStatus('${u.id_user}','${u.status}')">${u.status==='ACTIVE'?'Suspender':'Activar'}</button>
            <button class="btn btn-danger" onclick="deleteUserConfirm('${u.id_user}')">Eliminar</button>
          </td></tr>`).join(''));
  } catch { showError('u-body'); }
}

window.toggleStatus = (id, s) => {
  const ns = s==='ACTIVE'?'INACTIVE':'ACTIVE';
  confirm(ns==='INACTIVE'?'Suspender usuario':'Activar usuario', `¿Deseas ${ns==='INACTIVE'?'suspender':'activar'} este usuario?`, ns==='INACTIVE'?'Suspender':'Activar', ns==='INACTIVE', async()=>{
    try { await users.updateStatus(id,ns); showToast('Estado actualizado'); usersView(); } catch(e){showToast(e.message,'error');}
  });
};

window.deleteUserConfirm = (id) => confirm('Eliminar usuario','Esta accion no se puede deshacer.','Eliminar',true, async()=>{
  try { await users.delete(id); showToast('Usuario eliminado'); usersView(); } catch(e){showToast(e.message,'error');}
});

// ── CURSOS ────────────────────────────────────────────────────────────────
let _editCourseId=null, _editModuleId=null, _moduleData={}, _currentCourse=null;

async function coursesView() {
  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header"><span class="card-title">Gestion de cursos</span><button class="btn btn-primary" onclick="showCourseForm()">+ Nuevo curso</button></div>
      <div class="form-panel" id="course-form">
        <p id="course-form-title" style="font-size:13px;font-weight:700;color:#1E3A5F;margin-bottom:12px">Nuevo curso</p>
        <input id="c-title" class="form-input" placeholder="Titulo del curso">
        <textarea id="c-desc" class="form-input" rows="2" placeholder="Descripcion (opcional)" style="resize:vertical"></textarea>
        <div style="display:flex;gap:8px">
          <button class="btn btn-success" onclick="saveCourse()">Guardar</button>
          <button class="btn btn-outline" onclick="hideCourseForm()">Cancelar</button>
        </div>
      </div>
      <div id="c-body">${empty('Cargando...')}</div>
    </div>`;
  await loadCourses();
}

async function loadCourses() {
  try {
    const cList = (await courses.getAll())?.courses||[];
    document.getElementById('c-body').innerHTML = cList.length===0 ? empty('Sin cursos')
      : tbl(['Titulo','Descripcion','Estado','Acciones'], cList.map(c=>`<tr>
          <td style="font-weight:600">${c.title}</td>
          <td style="color:#4A5073">${(c.description||'—').slice(0,60)}${(c.description||'').length>60?'...':''}</td>
          <td>${badge(c.status)}</td>
          <td style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-outline" style="color:#7C3AED;border-color:#7C3AED" onclick="viewModules('${c.id_course}','${c.title.replace(/'/g,"\\'")}')">Modulos</button>
            <button class="btn btn-outline" style="color:#3B5BDB;border-color:#3B5BDB" onclick="editCourse('${c.id_course}','${c.title.replace(/'/g,"\\'")}','${(c.description||'').replace(/'/g,"\\'")}')">Editar</button>
            <button class="btn btn-danger" onclick="deleteCourseConfirm('${c.id_course}')">Eliminar</button>
          </td></tr>`).join(''));
  } catch { showError('c-body'); }
}

window.showCourseForm = () => { _editCourseId=null; document.getElementById('course-form-title').textContent='Nuevo curso'; document.getElementById('c-title').value=''; document.getElementById('c-desc').value=''; document.getElementById('course-form').style.display='block'; };
window.editCourse = (id,title,desc) => { _editCourseId=id; document.getElementById('course-form-title').textContent='Editar curso'; document.getElementById('c-title').value=title; document.getElementById('c-desc').value=desc; document.getElementById('course-form').style.display='block'; };
window.hideCourseForm = () => { document.getElementById('course-form').style.display='none'; _editCourseId=null; };
window.saveCourse = async () => {
  const title=document.getElementById('c-title').value.trim(), description=document.getElementById('c-desc').value.trim();
  if(!title){showToast('El titulo es requerido','error');return;}
  try { _editCourseId ? await courses.update(_editCourseId,{title,description}) : await courses.create({title,description,status:'ACTIVE'}); showToast(_editCourseId?'Curso actualizado':'Curso creado'); hideCourseForm(); await loadCourses(); } catch(e){showToast(e.message,'error');}
};
window.deleteCourseConfirm = (id) => confirm('Eliminar curso','Se eliminaran tambien todos sus modulos.','Eliminar',true,async()=>{
  try { await courses.delete(id); showToast('Curso eliminado'); await loadCourses(); } catch(e){showToast(e.message,'error');}
});

// ── MODULOS ───────────────────────────────────────────────────────────────
window.viewModules = async (courseId, courseTitle) => {
  _currentCourse={id:courseId,title:courseTitle}; _moduleData={};
  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px"><button class="btn btn-outline" onclick="coursesView()">Volver</button><span class="card-title">${courseTitle}</span></div>
        <button class="btn btn-primary" onclick="showModuleForm()">+ Nuevo modulo</button>
      </div>
      <div class="form-panel" id="module-form">
        <p id="module-form-title" style="font-size:13px;font-weight:700;color:#1E3A5F;margin-bottom:12px">Nuevo modulo</p>
        <input id="m-title" class="form-input" placeholder="Titulo del modulo">
        <textarea id="m-content" class="form-input" rows="4" placeholder="Contenido del modulo" style="resize:vertical"></textarea>
        <input id="m-order" class="form-input" type="number" min="1" placeholder="Orden (ej: 1)">
        <div style="display:flex;gap:8px"><button class="btn btn-success" onclick="saveModule()">Guardar</button><button class="btn btn-outline" onclick="hideModuleForm()">Cancelar</button></div>
      </div>
      <div id="m-body">${empty('Cargando...')}</div>
    </div>`;
  await loadModules(courseId);
};

async function loadModules(courseId) {
  try {
    const mList = (await modules.getAll(courseId))?.modules||[];
    _moduleData={}; mList.forEach(m=>{_moduleData[m.id_module]=m;});
    document.getElementById('m-body').innerHTML = mList.length===0 ? empty('Sin modulos')
      : tbl(['Orden','Titulo','Acciones'], mList.map(m=>`<tr>
          <td style="font-weight:700;color:#3B5BDB">${m.orders}</td>
          <td style="font-weight:600">${m.title}</td>
          <td style="display:flex;gap:6px">
            <button class="btn btn-outline" style="color:#3B5BDB;border-color:#3B5BDB" onclick="editModule('${m.id_module}',${m.orders})">Editar</button>
            <button class="btn btn-danger" onclick="deleteModuleConfirm('${m.id_module}')">Eliminar</button>
          </td></tr>`).join(''));
  } catch { showError('m-body'); }
}

window.showModuleForm = () => { _editModuleId=null; document.getElementById('module-form-title').textContent='Nuevo modulo'; ['m-title','m-content','m-order'].forEach(id=>document.getElementById(id).value=''); document.getElementById('module-form').style.display='block'; };
window.editModule = (id,orders) => { _editModuleId=id; const m=_moduleData[id]; document.getElementById('module-form-title').textContent='Editar modulo'; document.getElementById('m-title').value=m?.title||''; document.getElementById('m-content').value=m?.content||''; document.getElementById('m-order').value=orders; document.getElementById('module-form').style.display='block'; };
window.hideModuleForm = () => { document.getElementById('module-form').style.display='none'; _editModuleId=null; };
window.saveModule = async () => {
  const title=document.getElementById('m-title').value.trim(), content=document.getElementById('m-content').value.trim(), orders=parseInt(document.getElementById('m-order').value);
  if(!title){showToast('El titulo es requerido','error');return;} if(!orders){showToast('El orden es requerido','error');return;}
  try { _editModuleId ? await modules.update(_currentCourse.id,_editModuleId,{title,content,orders}) : await modules.create(_currentCourse.id,{title,content,orders}); showToast(_editModuleId?'Modulo actualizado':'Modulo creado'); hideModuleForm(); await loadModules(_currentCourse.id); } catch(e){showToast(e.message,'error');}
};
window.deleteModuleConfirm = (id) => confirm('Eliminar modulo','¿Eliminar este modulo?','Eliminar',true,async()=>{
  try { await modules.delete(_currentCourse.id,id); showToast('Modulo eliminado'); await loadModules(_currentCourse.id); } catch(e){showToast(e.message,'error');}
});

// ── REPOSITORIO ───────────────────────────────────────────────────────────
async function libraryView() {
  document.getElementById('content').innerHTML = `
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><span class="card-title">Solicitudes pendientes</span><span id="pending-count" style="font-size:12px;color:#D4A017;font-weight:700"></span></div>
      <div id="pending-body">${empty('Cargando...')}</div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Repositorio validado</span><span id="lib-count" style="font-size:12px;color:#4A5073"></span></div>
      <div id="lib-body">${empty('Cargando...')}</div>
    </div>`;

  try {
    const r = await apiFetch('/test-cases/pending-library');
    const pendList = r.ok ? (await r.json()).cases||[] : [];
    document.getElementById('pending-count').textContent = pendList.length ? `${pendList.length} pendientes` : '';
    document.getElementById('pending-body').innerHTML = pendList.length===0 ? empty('Sin solicitudes pendientes')
      : tbl(['Título','Proyecto','Usuario','Acciones'], pendList.map(item=>`<tr>
          <td style="font-weight:600">${item.title||'—'}</td>
          <td style="color:#4A5073">${item.project_name||'—'}</td>
          <td style="color:#4A5073">${item.user_name||'—'}</td>
          <td style="display:flex;gap:8px">
            <button class="btn btn-success" onclick="approveLibraryCase('${item.id_test_case}','${item.id_project}')">✓ Aprobar</button>
            <button class="btn btn-danger" onclick="rejectLibraryCase('${item.id_test_case}','${item.id_project}')">✗ Rechazar</button>
          </td></tr>`).join(''));
  } catch { document.getElementById('pending-body').innerHTML = empty('Sin solicitudes pendientes'); }

  try {
    const lList = (await library.getAll())?.libraryTests||[];
    document.getElementById('lib-count').textContent = `${lList.length} casos validados`;
    document.getElementById('lib-body').innerHTML = lList.length===0 ? empty('Sin casos en el repositorio')
      : tbl(['Título','Categoría','Tags','Validado','Acciones'], lList.map(item=>`<tr>
          <td style="font-weight:600">${item.title||'—'}</td>
          <td><span class="qa-badge" style="background:#EEF2FF;color:#3B5BDB">${item.category||'—'}</span></td>
          <td style="color:#4A5073">${item.tags?.length?item.tags.join(', '):'—'}</td>
          <td style="color:#4A5073">${fmtDate(item.validated_at)}</td>
          <td><button class="btn btn-warning" onclick="removeLibraryConfirm('${item.id_library}')">Quitar</button></td>
          </tr>`).join(''));
  } catch { showError('lib-body'); }
}

window.approveLibraryCase = (tcId, projId) => confirm('Aprobar caso','¿Aprobar y publicar en el repositorio?','Aprobar',false,async()=>{
  try { await apiFetch(`/projects/${projId}/test-cases/${tcId}/library-approve`,{method:'PATCH',body:JSON.stringify({category:'General',tags:[]})}); showToast('Caso aprobado.','success'); libraryView(); } catch(e){showToast(e.message,'error');}
});

window.rejectLibraryCase = (tcId, projId) => confirm('Rechazar solicitud','¿Rechazar? El caso volverá a estado sin solicitud.','Rechazar',true,async()=>{
  try { await apiFetch(`/projects/${projId}/test-cases/${tcId}/library-reject`,{method:'PATCH'}); showToast('Solicitud rechazada.','success'); libraryView(); } catch(e){showToast(e.message,'error');}
});

window.removeLibraryConfirm = (id) => confirm('Quitar del repositorio','¿Quitar este caso?','Quitar',true,async()=>{
  try { await library.delete(id); showToast('Caso quitado'); libraryView(); } catch(e){showToast(e.message,'error');}
});

// ── Init ──────────────────────────────────────────────────────────────────
dashboard();