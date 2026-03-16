// views-aprendizaje.js — ruta + dashboard

async function ruta() {
  const nivel = LEVELS[state.nivelKey];
  setHTML('content', `
    <div style="display:flex;gap:16px;height:100%;">
      <div style="width:210px;flex-shrink:0;">
        <div class="card" style="border:2px solid var(--bright);padding:14px;margin-bottom:12px;">
          <span class="badge badge-blue" style="margin-bottom:8px;">${nivel.badge}</span>
          <p style="font-size:12px;font-weight:700;color:var(--navy);margin:6px 0 8px;">${nivel.ruta}</p>
          <div class="prog"><div class="prog-fill" style="width:${state.porcentaje}%;background:var(--bright)"></div></div>
          <p style="font-size:11px;color:var(--muted);margin-top:6px;">${state.porcentaje}% diagnóstico</p>
        </div>
        <p class="section-title">Cursos</p>
        <div id="course-list"><p style="font-size:12px;color:var(--muted)">Cargando...</p></div>
      </div>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;" id="module-pills"></div>
        <div class="card" id="module-content" style="flex:1;overflow-y:auto;"></div>
      </div>
    </div>`);

  if (state.courses.length === 0) {
    try { state.courses = await apiFetch('/api/courses'); } catch { state.courses = []; }
  }

  if (state.courses.length === 0) {
    setHTML('course-list', '<p style="font-size:12px;color:var(--muted)">No hay cursos disponibles.</p>');
    setHTML('module-content', `<div style="text-align:center;padding:40px;">
      <div style="font-size:32px;margin-bottom:12px;">📚</div>
      <p style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:8px;">Sin cursos aún</p>
      <p style="font-size:13px;color:var(--muted);">Los cursos de tu ruta aparecerán aquí.</p>
    </div>`);
    return;
  }

  if (!state.selectedCourse) state.selectedCourse = state.courses[0];
  renderCourseList();
  await loadModules(state.selectedCourse.id_course);
}

function renderCourseList() {
  setHTML('course-list', state.courses.map(c => `
    <div class="mod-item ${state.selectedCourse?.id_course===c.id_course?'active':''}"
         style="margin-bottom:4px;cursor:pointer;" onclick="selectCourse('${c.id_course}')">
      <p style="font-size:12px;font-weight:700;color:var(--navy)">${c.title}</p>
      <p style="font-size:11px;color:var(--muted)">${c.status||'ACTIVE'}</p>
    </div>`).join(''));
}

async function selectCourse(id) {
  state.selectedCourse = state.courses.find(c => c.id_course === id);
  state.selectedModule = null;
  renderCourseList();
  await loadModules(id);
}

async function loadModules(id_course) {
  setHTML('module-pills', '<span style="font-size:12px;color:var(--muted)">Cargando módulos...</span>');
  setHTML('module-content', '');
  try { state.modules = await apiFetch('/api/courses/'+id_course+'/modules'); }
  catch { state.modules = []; }

  if (state.modules.length === 0) {
    setHTML('module-pills', '');
    setHTML('module-content', '<p style="color:var(--muted);font-size:13px;padding:20px;">Este curso no tiene módulos aún.</p>');
    return;
  }
  if (!state.selectedModule) state.selectedModule = state.modules[0];
  renderModulePills();
  renderModuleContent();
}

function renderModulePills() {
  setHTML('module-pills', state.modules.map(m => `
    <button class="pill ${state.selectedModule?.id_module===m.id_module?'active':''}"
            onclick="selectModule('${m.id_module}')">${m.title}</button>`).join(''));
}

function selectModule(id) {
  state.selectedModule = state.modules.find(m => m.id_module === id);
  renderModulePills();
  renderModuleContent();
}

function renderModuleContent() {
  const m = state.selectedModule;
  if (!m) return;
  const html = (m.content||'')
    .replace(/^# (.+)$/gm,'<h2 style="font-size:18px;font-weight:800;color:var(--navy);margin:0 0 14px">$1</h2>')
    .replace(/^## (.+)$/gm,'<h3 style="font-size:14px;font-weight:700;color:var(--navy);margin:16px 0 8px">$1</h3>')
    .replace(/^### (.+)$/gm,'<h4 style="font-size:13px;font-weight:700;color:var(--navy);margin:12px 0 6px">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g,'<strong style="color:var(--ink)">$1</strong>')
    .replace(/```([\s\S]*?)```/g,'<div class="code-wrap"><pre>$1</pre></div>')
    .replace(/^- (.+)$/gm,'<li style="font-size:13px;color:var(--muted);line-height:1.7;margin-left:16px">$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li style="font-size:13px;color:var(--muted);line-height:1.7;margin-left:16px">$1</li>')
    .replace(/\n\n/g,'<br>');

  const idx = state.modules.findIndex(m2 => m2.id_module === m.id_module);
  setHTML('module-content', `
    <div style="padding:4px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--bright)">${state.selectedCourse?.title||''}</span>
        <span class="badge badge-muted">Módulo ${m.orders||idx+1} de ${state.modules.length}</span>
      </div>
      <div style="font-size:13px;color:var(--muted);line-height:1.8;">${html}</div>
      <div style="display:flex;justify-content:space-between;margin-top:24px;padding-top:16px;border-top:1px solid var(--border);">
        <button class="btn btn-outline" onclick="prevModule()" ${idx>0?'':'disabled style="opacity:.4;cursor:default"'}>← Anterior</button>
        <button class="btn btn-primary" onclick="nextModule()" ${idx<state.modules.length-1?'':'disabled style="opacity:.4;cursor:default"'}>Siguiente →</button>
      </div>
    </div>`);
}

function prevModule() {
  const idx = state.modules.findIndex(m => m.id_module === state.selectedModule?.id_module);
  if (idx > 0) selectModule(state.modules[idx-1].id_module);
}
function nextModule() {
  const idx = state.modules.findIndex(m => m.id_module === state.selectedModule?.id_module);
  if (idx < state.modules.length-1) selectModule(state.modules[idx+1].id_module);
}

function dashboard() {
  setHTML('content', `
    <div class="grid-4" style="margin-bottom:20px;">
      ${[[state.porcentaje+'%','Diagnóstico'],[state.courses.length,'Cursos disponibles'],[state.projects.length,'Proyectos'],['—','Casos ejecutados']].map(([v,l])=>`
      <div class="stat-card"><div class="stat-val" style="color:var(--bright)">${v}</div><div class="stat-label">${l}</div></div>`).join('')}
    </div>
    <div class="grid-2" style="align-items:start;">
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Cursos disponibles</h3>
        ${state.courses.length > 0
          ? state.courses.map(c=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
              <span style="font-size:13px;color:var(--navy)">${c.title}</span>
              <span class="badge badge-blue">${c.status}</span>
            </div>`).join('')
          : '<p style="font-size:13px;color:var(--muted)">Sin cursos</p>'}
      </div>
      <div style="background:linear-gradient(135deg,#1E3A5F,#2563eb);border-radius:14px;padding:24px;color:white;">
        <div style="font-size:24px;margin-bottom:8px;">🎯</div>
        <p style="font-weight:800;font-size:15px;margin-bottom:6px;">${LEVELS[state.nivelKey].label}</p>
        <p style="font-size:12px;opacity:.8;margin-bottom:16px;">Diagnóstico: ${state.porcentaje}%</p>
        <button class="btn" style="background:white;color:var(--bright);width:100%;justify-content:center;" onclick="navigate('ruta')">Ir a mi ruta →</button>
      </div>
    </div>`);
}