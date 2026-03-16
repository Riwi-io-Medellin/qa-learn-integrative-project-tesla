/* ── 13-admin.js ── Panel de administracion ──────────────────────────── */
import { users, courses, modules, library } from '../../services/api.js';
import { QAStore }                           from '../state/store.js';
import { requireAdmin }                      from '../../components/auth-guard.js';
import { showToast, showLoading, showError, showConfirm, badge, fmtDate } from '../ui/ui-shared.js';

// ── Guard ────────────────────────────────────────────────────────────────
const _u = requireAdmin();
if (_u) {
  const name = QAStore.displayName();
  const el   = document.getElementById('adminName');
  const ini  = document.getElementById('adminInitial');
  if (el)  el.textContent  = name;
  if (ini) ini.textContent = QAStore.initials();
}

// ── Logout ───────────────────────────────────────────────────────────────
window.doLogout = () => {
  QAStore.logout();
  window.location.href = '../public/02-login.html';
};

// ── Navegacion ───────────────────────────────────────────────────────────
window.navigate = (view) => {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

  const titles = { dashboard:'Dashboard', users:'Usuarios', courses:'Cursos', library:'Repositorio' };
  const el = document.getElementById('pageTitle');
  if (el) el.textContent = titles[view] || 'Admin';

  document.getElementById('content').innerHTML = '';
  ({ dashboard, usersView, coursesView, libraryView })[view === 'users' ? 'usersView' : view === 'courses' ? 'coursesView' : view === 'library' ? 'libraryView' : view]?.();
};

// ─────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────
async function dashboard() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div class="stat-card"><div class="stat-val" id="s-users">—</div><div class="stat-label">Usuarios registrados</div></div>
      <div class="stat-card"><div class="stat-val" id="s-courses">—</div><div class="stat-label">Cursos activos</div></div>
      <div class="stat-card"><div class="stat-val" id="s-library">—</div><div class="stat-label">Casos en repositorio</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-header"><span class="card-title">Usuarios recientes</span><button class="btn btn-outline" onclick="navigate('users')">Ver todos</button></div>
        <div id="dash-users"><div style="padding:24px;text-align:center;color:#4A5073;font-size:13px">Cargando...</div></div>
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
    const [ud, cd, ld] = await Promise.all([
      users.getAll().catch(() => null),
      courses.getAll().catch(() => null),
      library.getAll().catch(() => null),
    ]);

    const uList = ud?.users || [];
    const cList = cd?.courses || [];
    const lList = ld?.libraryTests || [];

    document.getElementById('s-users').textContent   = uList.length;
    document.getElementById('s-courses').textContent = cList.filter(c => c.status === 'ACTIVE').length;
    document.getElementById('s-library').textContent = lList.length;

    document.getElementById('dash-users').innerHTML = uList.length === 0
      ? '<p style="padding:24px;text-align:center;font-size:13px;color:#4A5073">Sin usuarios</p>'
      : `<table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Estado</th></tr></thead>
          <tbody>${uList.map(u => `
            <tr>
              <td style="font-weight:600;color:${u.role_name === 'ADMIN' ? '#3B5BDB' : '#1E3A5F'}">${u.first_name} ${u.last_name}${u.role_name === 'ADMIN' ? ' <span class="qa-badge" style="background:#EEF2FF;color:#3B5BDB;margin-left:6px">ADMIN</span>' : ''}</td>
              <td style="color:#4A5073">${u.email}</td>
              <td>${badge(u.status)}</td>
            </tr>`).join('')}</tbody>
        </table>`;
  } catch {
    showToast('Error al cargar el dashboard', 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────────────────────────────────
async function usersView() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="card"><div class="card-header"><span class="card-title">Gestion de usuarios</span><span id="u-count" style="font-size:12px;color:#4A5073"></span></div><div id="u-body"><div style="padding:32px;text-align:center;color:#4A5073;font-size:13px">Cargando...</div></div></div>`;

  try {
    const data  = await users.getAll();
    const uList = data?.users || [];
    document.getElementById('u-count').textContent = `${uList.length} usuarios`;
    document.getElementById('u-body').innerHTML = uList.length === 0
      ? '<p style="padding:24px;text-align:center;font-size:13px;color:#4A5073">Sin usuarios registrados</p>'
      : `<table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${uList.map(u => `
            <tr>
              <td style="font-weight:600">${u.first_name} ${u.last_name}</td>
              <td style="color:#4A5073">${u.email}</td>
              <td><span class="qa-badge" style="background:#EEF2FF;color:#3B5BDB">${u.role_name || '—'}</span></td>
              <td>${badge(u.status)}</td>
              <td style="display:flex;gap:6px">
                <button class="btn ${u.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}" onclick="toggleStatus('${u.id_user}','${u.status}')">
                  ${u.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                </button>
                <button class="btn btn-danger" onclick="deleteUserConfirm('${u.id_user}')">Eliminar</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>`;
  } catch {
    showError('u-body');
  }
}

window.toggleStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  showConfirm({
    title: newStatus === 'INACTIVE' ? 'Suspender usuario' : 'Activar usuario',
    message: `¿Deseas ${newStatus === 'INACTIVE' ? 'suspender' : 'activar'} este usuario?`,
    confirmText: newStatus === 'INACTIVE' ? 'Suspender' : 'Activar',
    danger: newStatus === 'INACTIVE',
    onConfirm: async () => {
      try {
        await users.updateStatus(id, newStatus);
        showToast('Estado actualizado correctamente');
        usersView();
      } catch (e) { showToast(e.message, 'error'); }
    }
  });
};

window.deleteUserConfirm = (id) => {
  showConfirm({
    title: 'Eliminar usuario',
    message: 'Esta accion no se puede deshacer.',
    confirmText: 'Eliminar',
    danger: true,
    onConfirm: async () => {
      try {
        await users.delete(id);
        showToast('Usuario eliminado');
        usersView();
      } catch (e) { showToast(e.message, 'error'); }
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────
// CURSOS
// ─────────────────────────────────────────────────────────────────────────
let _editCourseId  = null;
let _editModuleId  = null;
let _moduleData    = {};
let _currentCourse = null;

async function coursesView() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Gestion de cursos</span>
        <button class="btn btn-primary" onclick="showCourseForm()">+ Nuevo curso</button>
      </div>
      <div class="form-panel" id="course-form">
        <p id="course-form-title" style="font-size:13px;font-weight:700;color:#1E3A5F;margin-bottom:12px">Nuevo curso</p>
        <input id="c-title" class="form-input" placeholder="Titulo del curso">
        <textarea id="c-desc" class="form-input" rows="2" placeholder="Descripcion (opcional)" style="resize:vertical"></textarea>
        <div style="display:flex;gap:8px">
          <button class="btn btn-success" onclick="saveCourse()">Guardar</button>
          <button class="btn btn-outline" onclick="hideCourseForm()">Cancelar</button>
        </div>
      </div>
      <div id="c-body"><div style="padding:32px;text-align:center;color:#4A5073;font-size:13px">Cargando...</div></div>
    </div>`;

  await loadCourses();
}

async function loadCourses() {
  try {
    const data  = await courses.getAll();
    const cList = data?.courses || [];
    document.getElementById('c-body').innerHTML = cList.length === 0
      ? '<p style="padding:24px;text-align:center;font-size:13px;color:#4A5073">Sin cursos</p>'
      : `<table>
          <thead><tr><th>Titulo</th><th>Descripcion</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${cList.map(c => `
            <tr>
              <td style="font-weight:600">${c.title}</td>
              <td style="color:#4A5073">${(c.description || '—').slice(0,60)}${(c.description || '').length > 60 ? '...' : ''}</td>
              <td>${badge(c.status)}</td>
              <td style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="btn btn-outline" style="color:#7C3AED;border-color:#7C3AED" onclick="viewModules('${c.id_course}','${c.title.replace(/'/g,"\\'")}')">Modulos</button>
                <button class="btn btn-outline" style="color:#3B5BDB;border-color:#3B5BDB" onclick="editCourse('${c.id_course}','${c.title.replace(/'/g,"\\'")}','${(c.description||'').replace(/'/g,"\\'")}')">Editar</button>
                <button class="btn btn-danger" onclick="deleteCourseConfirm('${c.id_course}')">Eliminar</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>`;
  } catch { showError('c-body'); }
}

window.showCourseForm = () => {
  _editCourseId = null;
  document.getElementById('course-form-title').textContent = 'Nuevo curso';
  document.getElementById('c-title').value = '';
  document.getElementById('c-desc').value  = '';
  document.getElementById('course-form').style.display = 'block';
};

window.editCourse = (id, title, desc) => {
  _editCourseId = id;
  document.getElementById('course-form-title').textContent = 'Editar curso';
  document.getElementById('c-title').value = title;
  document.getElementById('c-desc').value  = desc;
  document.getElementById('course-form').style.display = 'block';
};

window.hideCourseForm = () => {
  document.getElementById('course-form').style.display = 'none';
  _editCourseId = null;
};

window.saveCourse = async () => {
  const title = document.getElementById('c-title').value.trim();
  const description = document.getElementById('c-desc').value.trim();
  if (!title) { showToast('El titulo es requerido', 'error'); return; }
  try {
    if (_editCourseId) {
      await courses.update(_editCourseId, { title, description });
      showToast('Curso actualizado');
    } else {
      await courses.create({ title, description, status: 'ACTIVE' });
      showToast('Curso creado');
    }
    hideCourseForm();
    await loadCourses();
  } catch (e) { showToast(e.message, 'error'); }
};

window.deleteCourseConfirm = (id) => {
  showConfirm({
    title: 'Eliminar curso',
    message: 'Se eliminaran tambien todos sus modulos.',
    confirmText: 'Eliminar',
    danger: true,
    onConfirm: async () => {
      try {
        await courses.delete(id);
        showToast('Curso eliminado');
        await loadCourses();
      } catch (e) { showToast(e.message, 'error'); }
    }
  });
};

// ── Modulos ───────────────────────────────────────────────────────────────
window.viewModules = async (courseId, courseTitle) => {
  _currentCourse = { id: courseId, title: courseTitle };
  _moduleData = {};
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <button class="btn btn-outline" onclick="coursesView()">Volver</button>
          <span class="card-title">${courseTitle}</span>
        </div>
        <button class="btn btn-primary" onclick="showModuleForm()">+ Nuevo modulo</button>
      </div>
      <div class="form-panel" id="module-form">
        <p id="module-form-title" style="font-size:13px;font-weight:700;color:#1E3A5F;margin-bottom:12px">Nuevo modulo</p>
        <input id="m-title" class="form-input" placeholder="Titulo del modulo">
        <textarea id="m-content" class="form-input" rows="4" placeholder="Contenido del modulo" style="resize:vertical"></textarea>
        <input id="m-order" class="form-input" type="number" min="1" placeholder="Orden (ej: 1)">
        <div style="display:flex;gap:8px">
          <button class="btn btn-success" onclick="saveModule()">Guardar</button>
          <button class="btn btn-outline" onclick="hideModuleForm()">Cancelar</button>
        </div>
      </div>
      <div id="m-body"><div style="padding:32px;text-align:center;color:#4A5073;font-size:13px">Cargando...</div></div>
    </div>`;

  await loadModules(courseId);
};

async function loadModules(courseId) {
  try {
    const data  = await modules.getAll(courseId);
    const mList = data?.modules || [];
    _moduleData = {};
    mList.forEach(m => { _moduleData[m.id_module] = m; });

    document.getElementById('m-body').innerHTML = mList.length === 0
      ? '<p style="padding:24px;text-align:center;font-size:13px;color:#4A5073">Sin modulos</p>'
      : `<table>
          <thead><tr><th>Orden</th><th>Titulo</th><th>Acciones</th></tr></thead>
          <tbody>${mList.map(m => `
            <tr>
              <td style="font-weight:700;color:#3B5BDB">${m.orders}</td>
              <td style="font-weight:600">${m.title}</td>
              <td style="display:flex;gap:6px">
                <button class="btn btn-outline" style="color:#3B5BDB;border-color:#3B5BDB" onclick="editModule('${m.id_module}',${m.orders})">Editar</button>
                <button class="btn btn-danger" onclick="deleteModuleConfirm('${m.id_module}')">Eliminar</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>`;
  } catch { showError('m-body'); }
}

window.showModuleForm = () => {
  _editModuleId = null;
  document.getElementById('module-form-title').textContent = 'Nuevo modulo';
  document.getElementById('m-title').value   = '';
  document.getElementById('m-content').value = '';
  document.getElementById('m-order').value   = '';
  document.getElementById('module-form').style.display = 'block';
};

window.editModule = (id, orders) => {
  _editModuleId = id;
  const m = _moduleData[id];
  document.getElementById('module-form-title').textContent = 'Editar modulo';
  document.getElementById('m-title').value   = m?.title   || '';
  document.getElementById('m-content').value = m?.content || '';
  document.getElementById('m-order').value   = orders;
  document.getElementById('module-form').style.display = 'block';
};

window.hideModuleForm = () => {
  document.getElementById('module-form').style.display = 'none';
  _editModuleId = null;
};

window.saveModule = async () => {
  const title   = document.getElementById('m-title').value.trim();
  const content = document.getElementById('m-content').value.trim();
  const orders  = parseInt(document.getElementById('m-order').value);
  if (!title)  { showToast('El titulo es requerido', 'error'); return; }
  if (!orders) { showToast('El orden es requerido', 'error'); return; }
  try {
    if (_editModuleId) {
      await modules.update(_currentCourse.id, _editModuleId, { title, content, orders });
      showToast('Modulo actualizado');
    } else {
      await modules.create(_currentCourse.id, { title, content, orders });
      showToast('Modulo creado');
    }
    hideModuleForm();
    await loadModules(_currentCourse.id);
  } catch (e) { showToast(e.message, 'error'); }
};

window.deleteModuleConfirm = (id) => {
  showConfirm({
    title: 'Eliminar modulo',
    message: '¿Eliminar este modulo?',
    confirmText: 'Eliminar',
    danger: true,
    onConfirm: async () => {
      try {
        await modules.delete(_currentCourse.id, id);
        showToast('Modulo eliminado');
        await loadModules(_currentCourse.id);
      } catch (e) { showToast(e.message, 'error'); }
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────
// REPOSITORIO / LIBRARY
// ─────────────────────────────────────────────────────────────────────────
async function libraryView() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header"><span class="card-title">Repositorio de casos validados</span><span id="lib-count" style="font-size:12px;color:#4A5073"></span></div>
      <div id="lib-body"><div style="padding:32px;text-align:center;color:#4A5073;font-size:13px">Cargando...</div></div>
    </div>`;

  try {
    const data  = await library.getAll();
    const lList = data?.libraryTests || [];
    document.getElementById('lib-count').textContent = `${lList.length} casos validados`;
    document.getElementById('lib-body').innerHTML = lList.length === 0
      ? '<p style="padding:24px;text-align:center;font-size:13px;color:#4A5073">Sin casos en el repositorio</p>'
      : `<table>
          <thead><tr><th>Titulo</th><th>Categoria</th><th>Tags</th><th>Validado</th><th>Acciones</th></tr></thead>
          <tbody>${lList.map(item => `
            <tr>
              <td style="font-weight:600">${item.title || '—'}</td>
              <td><span class="qa-badge" style="background:#EEF2FF;color:#3B5BDB">${item.category || '—'}</span></td>
              <td style="color:#4A5073">${item.tags?.length ? item.tags.join(', ') : '—'}</td>
              <td style="color:#4A5073">${fmtDate(item.validated_at)}</td>
              <td>
                <button class="btn btn-warning" onclick="removeLibraryConfirm('${item.id_library}')">Quitar</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>`;
  } catch { showError('lib-body'); }
}

window.removeLibraryConfirm = (id) => {
  showConfirm({
    title: 'Quitar del repositorio',
    message: '¿Quitar este caso del repositorio?',
    confirmText: 'Quitar',
    danger: true,
    onConfirm: async () => {
      try {
        await library.delete(id);
        showToast('Caso quitado del repositorio');
        libraryView();
      } catch (e) { showToast(e.message, 'error'); }
    }
  });
};

// ── Init ──────────────────────────────────────────────────────────────────
dashboard();