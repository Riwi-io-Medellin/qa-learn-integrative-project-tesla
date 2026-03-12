// user.js — init, navegación, helpers

function init() {
  state.user      = JSON.parse(localStorage.getItem('currentUser'))    || { nombre:'Ana García', email:'ana@demo.com' };
  const resultado = JSON.parse(localStorage.getItem('ultimoResultado')) || {};
  const p         = resultado.porcentaje ?? 68;

  state.nivelKey = p <= 39 ? 'basico' : p <= 69 ? 'intermedio' : 'avanzado';

  const nivel = MOCK.levels[state.nivelKey];
  const name  = state.user.nombre || state.user.email || 'Usuario';

  // Footer sidebar
  el('avatarInitial').textContent    = name.charAt(0).toUpperCase();
  el('sidebarName').textContent      = name;
  el('sidebarLevel').textContent     = nivel.label;

  // Topbar
  el('topbarTitle').textContent         = `¡Bienvenid@ de nuevo, ${name.split(' ')[0]}!`;
  el('topbarSub').textContent        = `Lista para continuar con tu ${nivel.ruta}`;

  // Círculo de progreso
  const offset = 75.4 - (p / 100) * 75.4;
  el('progressCircle').setAttribute('stroke-dashoffset', offset);
  el('progressLabel').textContent = p;

  navigate('ruta');
}

// ══════════════════════════════════════════
// NAVEGACIÓN
// ══════════════════════════════════════════

function navigate(view) {
  state.view = view;

  const inAprendizaje = ['ruta','dashboard'].includes(view);
  const inLab         = view.startsWith('lab-');

  // Limpiar activos
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.nav-sub-item').forEach(n => n.classList.remove('active'));

  // Activar item padre correcto
  if (inAprendizaje)         el('navAprendizaje').classList.add('active');
  else if (inLab)            el('navLaboratorio').classList.add('active');
  else if (el('nav-'+view))  el('nav-'+view).classList.add('active');

  // Activar sub-item exacto
  document.querySelectorAll('.nav-sub-item[data-nav="'+view+'"]')
    .forEach(n => n.classList.add('active'));

  // Submenús
  el('sub-aprendizaje').classList.toggle('hidden', !inAprendizaje);
  el('sub-laboratorio').classList.toggle('hidden', !inLab);
  el('chev-aprendizaje').classList.toggle('open', inAprendizaje);
  el('chev-laboratorio').classList.toggle('open', inLab);

  // Render
  const renders = { ruta, dashboard, 'lab-pruebas': labPruebas, 'lab-dashboard': labDashboard, 'lab-repo': labRepo, perfil, config };
  el('content').innerHTML = '';
  el('content').className = 'content fade-in';
  (renders[view] || ruta)();

  updateTopbar(view);
}

function updateTopbar(view) {
  const titles = {
    ruta:          ['¡Bienvenid@ de nuevo, ' + firstName() + '!', `Lista para continuar con tu ${MOCK.levels[state.nivelKey].ruta}`],
    dashboard:     ['Dashboard de Aprendizaje',    'Tu progreso en tiempo real'],
    'lab-pruebas': ['Laboratorio de Pruebas',       'Gestiona tus casos de prueba'],
    'lab-dashboard':['Dashboard del Laboratorio',  'Tu actividad de pruebas en tiempo real'],
    'lab-repo':    ['Repositorio de Pruebas',       'Biblioteca de casos validados — consulta e importación'],
    perfil:        ['Mi Perfil',                    'Información personal y resumen de actividad'],
    config:        ['Configuraciones',              'Personaliza tu experiencia en QA Learning Lab'],
  };
  const [title, sub] = titles[view] || ['QA Learning Lab', ''];
  el('topbarTitle').textContent = title;
  el('topbarSub').textContent   = sub;
}

// ══════════════════════════════════════════
// VISTA: RUTA DE APRENDIZAJE
// ══════════════════════════════════════════

function ruta() {
  const nivel = MOCK.levels[state.nivelKey];
  el('content').innerHTML = `
    <div style="display:flex;gap:16px;height:100%;">

      <!-- Col rutas -->
      <div style="width:200px;flex-shrink:0;">
        <p class="section-title">Mis rutas</p>
        <div class="card" style="border:2px solid var(--bright);padding:14px;">
          <span class="badge badge-blue" style="margin-bottom:8px;">${nivel.badge}</span>
          <p style="font-size:12px;font-weight:700;color:var(--navy);margin:6px 0 8px;">${nivel.ruta}</p>
          <div class="prog"><div class="prog-fill" style="width:68%;background:var(--bright)"></div></div>
          <p style="font-size:11px;color:var(--muted);margin-top:6px;">68% completado</p>
        </div>
      </div>

      <!-- Col módulos -->
      <div style="width:220px;flex-shrink:0;">
        <p class="section-title">Módulos</p>
        <div id="module-list"></div>
      </div>

      <!-- Col contenido -->
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;" id="course-pills"></div>
        <div class="card" id="course-content" style="flex:1;overflow-y:auto;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-outline" onclick="prevCourse()">← Curso anterior</button>
          <button class="btn btn-success" id="completeBtn" onclick="markDone()">✓ Marcar como completado</button>
          <button class="btn btn-primary" onclick="nextCourse()">Siguiente curso →</button>
        </div>
      </div>
    </div>`;

  renderModules();
  renderCourses();
  renderCourseContent();
}

function renderModules() {
  const html = MOCK.modules.map((m, i) => {
    const isActive = i === state.moduleIdx;
    const icon = {
      done:   `<div class="mod-icon" style="background:var(--pass)"><svg width="14" height="14" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>`,
      active: `<div class="mod-icon" style="background:var(--bright)"><div style="width:9px;height:9px;border-radius:50%;background:white"></div></div>`,
      locked: `<div class="mod-icon" style="background:var(--border)"><svg width="12" height="12" fill="none" stroke="${'var(--muted)'}" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>`,
    }[m.status];

    const sub = m.status==='done'
      ? `<span style="font-size:11px;color:var(--pass)">Completado · ${m.courses} cursos</span>`
      : m.status==='active'
      ? `<span style="font-size:11px;color:var(--muted)">${state.courseIdx+1} de ${m.courses} cursos</span>`
      : `<span style="font-size:11px;color:var(--muted)">Bloqueado</span>`;

    const prog = m.status==='active'
      ? `<div class="prog" style="margin:6px 0 0 36px"><div class="prog-fill" style="width:${m.progress}%;background:var(--bright)"></div></div>` : '';

    return `<div class="mod-item ${isActive?'active':''} ${m.status==='locked'?'':''}${ m.status==='locked'?'" style="opacity:.5;cursor:default"':'"'} onclick="${m.status!=='locked'?`selectModule(${i})`:''}">
      <div style="display:flex;align-items:center;gap:10px;">${icon}
        <div><p style="font-size:12px;font-weight:700;color:var(--navy)">${m.title}</p>${sub}</div>
      </div>${prog}
    </div>`;
  }).join('');
  el('module-list').innerHTML = html;
}

function renderCourses() {
  el('course-pills').innerHTML = MOCK.courses.map((c, i) =>
    `<button class="pill ${i===state.courseIdx?'active':''}" onclick="selectCourse(${i})">${c.pill}</button>`
  ).join('');
}

function renderCourseContent() {
  const c = MOCK.courses[state.courseIdx];
  const isDone = state.coursesDone.has(state.courseIdx);
  el('course-content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--bright)">${c.label}</span>
      <span class="badge badge-muted">${c.time} de lectura</span>
    </div>
    <h2 style="font-size:18px;font-weight:800;color:var(--navy);margin-bottom:14px;">${c.heading}</h2>
    <p style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:14px;">El diseño de casos de prueba es una actividad fundamental en el aseguramiento de calidad. Un caso bien diseñado maximiza cobertura con el mínimo esfuerzo.</p>
    <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:8px;">¿Qué es un caso de prueba?</h3>
    <p style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:4px;">Un conjunto de condiciones bajo las cuales un tester determina si el sistema funciona correctamente. Incluye datos de entrada, pasos y resultado esperado.</p>
    <div class="code-wrap">
      <div class="code-header"><span>Estructura básica</span><span>ejemplo.md</span></div>
      <pre>TC-001: Verificar login con credenciales válidas

Precondiciones:
  - El usuario tiene una cuenta activa
Pasos:
  1. Navegar a /login
  2. Ingresar email y contraseña válidos
  3. Hacer clic en "Iniciar sesión"
Resultado esperado:
  - Redirección al dashboard</pre>
    </div>
    <div class="grid-2" style="margin-top:4px;">
      ${['Precondiciones','Pasos de ejecución','Datos de prueba','Resultado esperado'].map(t =>
        `<div style="padding:14px;background:var(--sky);border:1px solid var(--border);border-radius:10px;">
          <p style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:4px;">${t}</p>
          <p style="font-size:12px;color:var(--muted);">Componente esencial del caso de prueba bien documentado</p>
        </div>`).join('')}
    </div>`;

  // Actualizar botón completar
  const btn = document.getElementById('completeBtn');
  if (btn) { btn.className = isDone ? 'btn btn-outline' : 'btn btn-success'; btn.textContent = isDone ? '✓ Completado' : '✓ Marcar como completado'; }
}

function selectModule(i) { state.moduleIdx = i; state.courseIdx = 0; renderModules(); renderCourses(); renderCourseContent(); }
function selectCourse(i) { state.courseIdx = i; renderCourses(); renderCourseContent(); }
function markDone()      { state.coursesDone.add(state.courseIdx); renderCourseContent(); }
function prevCourse()    { if (state.courseIdx > 0) selectCourse(state.courseIdx - 1); }
function nextCourse()    { if (state.courseIdx < MOCK.courses.length-1) selectCourse(state.courseIdx + 1); }

// ══════════════════════════════════════════
// VISTA: DASHBOARD APRENDIZAJE
// ══════════════════════════════════════════


function el(id)       { return document.getElementById(id) || { textContent:'', classList:{add:()=>{},remove:()=>{},toggle:()=>{}}, setAttribute:()=>{}, style:{} }; }
function firstName()  { return (state.user.nombre||state.user.email||'Usuario').split(' ')[0]; }
function logout()     { localStorage.removeItem('currentUser'); window.location.href = '../../pages/login.html'; }
function toggleDark() { document.body.classList.toggle('dark'); }

document.addEventListener('DOMContentLoaded', init);