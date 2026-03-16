// user.js — config, estado, init, navegación, helpers

const API = 'http://localhost:3000';
function token() { return localStorage.getItem('token') || ''; }
function authH() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() }; }
async function apiFetch(path) {
  const r = await fetch(API + path, { headers: authH() });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

const state = {
  user: {}, nivelKey: 'intermedio', porcentaje: 50,
  courses: [], selectedCourse: null,
  modules: [], selectedModule: null,
  projects: [], selectedProject: null, testCases: [],
};

const LEVELS = {
  basico:     { label:'Nivel Básico',     badge:'BÁSICO', ruta:'Ruta Básica de QA' },
  intermedio: { label:'Nivel Intermedio', badge:'INTER',  ruta:'Ruta Intermedia de QA' },
  avanzado:   { label:'Nivel Avanzado',   badge:'AVANZ',  ruta:'Ruta Avanzada de QA' },
};

function setText(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
function setHTML(id, v) { const e = document.getElementById(id); if (e) e.innerHTML = v; }
function logout()       { localStorage.clear(); window.location.href = '../../pages/login.html'; }
function toggleSub(s)   {
  document.getElementById('sub-'+s)?.classList.toggle('hidden');
  document.getElementById('chev-'+s)?.classList.toggle('open');
}

async function init() {
  state.user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!state.user) { window.location.href = '../../pages/login.html'; return; }

  const name = state.user.name || state.user.nombre || state.user.email || 'Usuario';

  try {
    const diags = await apiFetch('/api/diagnostic');
    const p = diags.length > 0 ? Math.round((diags[0].score / 20) * 100) : 50;
    state.porcentaje = p;
    state.nivelKey   = p <= 39 ? 'basico' : p <= 69 ? 'intermedio' : 'avanzado';
  } catch {
    const r = JSON.parse(localStorage.getItem('ultimoResultado') || '{}');
    state.porcentaje = r.porcentaje ?? 50;
    state.nivelKey   = state.porcentaje <= 39 ? 'basico' : state.porcentaje <= 69 ? 'intermedio' : 'avanzado';
  }

  try { 
    const data = await apiFetch('/api/courses'); state.courses = data.courses || data || []; 
  } 
  catch { state.courses = []; }

  const nivel = LEVELS[state.nivelKey];
  const p     = state.porcentaje;

  setText('avatarInitial', name[0].toUpperCase());
  setText('sidebarName',   name);
  setText('sidebarLevel',  nivel.label);
  setText('topbarTitle',   'Bienvenid@ de nuevo, ' + name.split(' ')[0] + '!');
  setText('topbarSub',     'Continúa con tu ' + nivel.ruta);
  document.getElementById('progressCircle')?.setAttribute('stroke-dashoffset', 75.4 - (p/100)*75.4);
  setText('progressLabel', p);

  navigate('ruta');
}

function navigate(view) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.nav-sub-item').forEach(n => n.classList.remove('active'));

  const inA = ['ruta','dashboard'].includes(view);
  const inL = view.startsWith('lab-');

  if (inA) document.getElementById('navAprendizaje')?.classList.add('active');
  else if (inL) document.getElementById('navLaboratorio')?.classList.add('active');
  else document.getElementById('nav-'+view)?.classList.add('active');

  document.querySelectorAll('[data-nav="'+view+'"]').forEach(n => n.classList.add('active'));
  document.getElementById('sub-aprendizaje')?.classList.toggle('hidden', !inA);
  document.getElementById('sub-laboratorio')?.classList.toggle('hidden', !inL);
  document.getElementById('chev-aprendizaje')?.classList.toggle('open', inA);
  document.getElementById('chev-laboratorio')?.classList.toggle('open', inL);

  const content = document.getElementById('content');
  if (content) { content.innerHTML = ''; content.className = 'content fade-in'; }

  const views = { ruta, dashboard, 'lab-pruebas':labPruebas, 'lab-dashboard':labDashboard, 'lab-repo':labRepo, perfil, config };
  (views[view] || ruta)();

  const titles = { ruta:'Ruta de Aprendizaje', dashboard:'Dashboard', 'lab-pruebas':'Laboratorio', 'lab-dashboard':'Dashboard Lab', 'lab-repo':'Repositorio', perfil:'Mi Perfil', config:'Configuraciones' };
  setText('topbarTitle', titles[view] || 'QA Learning Lab');
}

document.addEventListener('DOMContentLoaded', init);