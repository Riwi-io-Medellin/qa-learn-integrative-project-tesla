// lab-report.js — Reporte IA del proyecto seleccionado

const API = 'http://localhost:3000';
function token() { return localStorage.getItem('qa_token') || ''; }
function authH() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() }; }

// ── Guard de sesión ──────────────────────────────────────────────────────
const _U = JSON.parse(localStorage.getItem('qa_user') || 'null');
if (!_U) window.location.href = '../public/login.html';

// ── Sidebar usuario ──────────────────────────────────────────────────────
const name = _U?.name || _U?.nombre || (_U?.first_name ? _U.first_name + ' ' + (_U.last_name||'') : 'Usuario');
const initials = name.trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
document.getElementById('sb-avatar').textContent = initials;
document.getElementById('sb-name').textContent   = name.trim();
document.getElementById('logout-btn').onclick = () => { localStorage.clear(); window.location.href = '../public/login.html'; };

// ── Obtener proyecto del estado global o localStorage ─────────────────────
// El proyecto se pasa por query param ?id=UUID o desde localStorage
const params = new URLSearchParams(window.location.search);
let PID = params.get('id');

// Si no viene por URL, intentar desde el estado guardado
if (!PID) {
  const lastProject = localStorage.getItem('qa_selected_project') || localStorage.getItem('selectedProject');
  if (lastProject) PID = JSON.parse(lastProject).id_project;
}
if (!PID) {
  alert('No hay proyecto seleccionado.');
  window.location.href = '../pages/lab-tests.html';
}

let _projectData = null;
let _chatHistory = [];

// ── Cargar datos del proyecto usando endpoints existentes ─────────────────
async function loadProjectData() {
  try {
    // 1. Datos base del proyecto
    const project = await apiFetch(`/api/projects/${PID}`);

    // 2. Requerimientos
    let requirements = [];
    try { requirements = await apiFetch(`/api/projects/${PID}/requirements`); }
    catch { requirements = []; }

    // 3. Casos de prueba
    let testCases = [];
    try { testCases = await apiFetch(`/api/projects/${PID}/test-cases`); }
    catch { testCases = []; }

    // 4. Ejecuciones de cada caso
    let passed = 0, failed = 0, blocked = 0, pending = 0;
    const casesWithResults = await Promise.all(testCases.map(async tc => {
      let lastResult = null;
      let execCount  = 0;
      try {
        const execs = await apiFetch(`/api/executions/test-case/${tc.id_test_case}`);
        const list  = Array.isArray(execs) ? execs : (execs.executions || []);
        execCount   = list.length;
        lastResult  = list.length > 0 ? list[0].result : null;
      } catch {}
      return { ...tc, lastResult, executions: execCount };
    }));

    // 5. Agrupar casos por requerimiento
    const reqsWithCases = requirements.map(r => ({
      ...r,
      cases: casesWithResults.filter(tc => tc.id_requirement === r.id_requirement)
    }));

    // Casos sin requerimiento
    const unlinked = casesWithResults.filter(tc => !tc.id_requirement);
    if (unlinked.length > 0) {
      reqsWithCases.push({ code: 'SIN-REQ', description: 'Casos sin requerimiento', priority: '—', cases: unlinked });
    }

    // 6. Calcular stats
    casesWithResults.forEach(tc => {
      if      (tc.lastResult === 'PASS' || tc.lastResult === 'PASSED') passed++;
      else if (tc.lastResult === 'FAIL' || tc.lastResult === 'FAILED') failed++;
      else if (tc.lastResult === 'BLOCKED') blocked++;
      else    pending++;
    });

    _projectData = {
      ...project,
      requirements: reqsWithCases,
      totalCases: testCases.length,
      stats: { passed, failed, blocked, pending, total: casesWithResults.filter(tc=>tc.lastResult).length }
    };

    renderSummary(_projectData);
    document.getElementById('hdr-project').textContent = _projectData.name || 'Proyecto';
    document.getElementById('welcome-msg').textContent =
      `¡Hola! Tengo acceso completo al proyecto "${_projectData.name}". ` +
      `Tiene ${requirements.length} requerimientos y ${testCases.length} casos de prueba. ` +
      `De ${casesWithResults.filter(tc=>tc.lastResult).length} ejecuciones: ${passed} pasaron, ${failed} fallaron y ${blocked} estuvieron bloqueados. ` +
      `¿En qué puedo ayudarte?`;

  } catch (e) {
    console.error(e);
    document.getElementById('welcome-msg').textContent = 'No se pudo cargar el proyecto. Verifica que el servidor esté corriendo.';
  }
}

async function apiFetch(path) {
  const r = await fetch(API + path, { headers: authH() });
  if (r.status === 401) { localStorage.clear(); window.location.href = '../public/login.html'; }
  if (!r.ok) throw new Error('Error ' + r.status);
  return r.json();
}

// ── Render panel izquierdo ────────────────────────────────────────────────
function renderSummary(d) {
  document.getElementById('summary-loading').classList.add('hidden');
  document.getElementById('summary-content').classList.remove('hidden');
  document.getElementById('sum-name').textContent  = d.name || '—';
  document.getElementById('sum-desc').textContent  = d.description || 'Sin descripción.';
  document.getElementById('sum-reqs').textContent  = d.requirements?.length || 0;
  document.getElementById('sum-cases').textContent = d.totalCases || 0;
  document.getElementById('sum-passed').textContent  = d.stats?.passed  || 0;
  document.getElementById('sum-failed').textContent  = d.stats?.failed  || 0;
  document.getElementById('sum-blocked').textContent = d.stats?.blocked || 0;
  document.getElementById('sum-pending').textContent = d.stats?.pending || 0;

  const total = d.stats?.total || 0;
  const pct   = total > 0 ? Math.round((d.stats.passed / total) * 100) : 0;
  document.getElementById('sum-progress-bar').style.width = pct + '%';
  document.getElementById('sum-pct').textContent = pct + '% completado';

  const el = document.getElementById('sum-reqs-list');
  el.innerHTML = (d.requirements || []).map(r => {
    const t  = r.cases?.length || 0;
    const p  = r.cases?.filter(c => c.lastResult === 'PASS' || c.lastResult === 'PASSED').length || 0;
    const pc = t > 0 ? Math.round((p/t)*100) : 0;
    const col = pc === 100 ? '#2D9B6F' : pc > 0 ? '#D4A017' : '#4A5073';
    return `<div style="padding:12px;border-radius:12px;background:#F7F9FF;border:1px solid #D0D9F0;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-size:11px;font-weight:700;color:#3B5BDB;font-family:monospace">${r.code}</span>
        <span style="font-size:11px;font-weight:700;color:${col}">${pc}%</span>
      </div>
      <p style="font-size:11px;color:#4A5073;margin:0 0 6px;">${(r.description||'').slice(0,55)}${(r.description||'').length>55?'…':''}</p>
      <div style="height:4px;background:#EEF2FB;border-radius:999px;">
        <div style="height:100%;border-radius:999px;background:${col};width:${pc}%;transition:width .3s"></div>
      </div>
    </div>`;
  }).join('');
}

// ── Chat ──────────────────────────────────────────────────────────────────
function addMessage(role, content) {
  const el  = document.getElementById('chat-messages');
  const isUser = role === 'user';
  const div = document.createElement('div');
  div.style.cssText = `display:flex;align-items:flex-start;gap:12px;${isUser?'flex-direction:row-reverse':''}`;
  const avatarBg = isUser ? '#3B5BDB' : 'linear-gradient(135deg,#3B5BDB,#2D9B6F)';
  const avatarText = isUser ? initials : 'IA';
  div.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;background:${avatarBg}">${avatarText}</div>
    <div style="max-width:${isUser?'75%':'85%'};padding:14px;border-radius:${isUser?'18px 18px 4px 18px':'18px 18px 18px 4px'};background:${isUser?'#3B5BDB':'white'};border:${isUser?'none':'1px solid #D0D9F0'}">
      ${isUser ? '' : '<p style="font-size:13px;font-weight:700;color:#1E3A5F;margin:0 0 4px;">Asistente QA</p>'}
      <p style="font-size:13px;margin:0;color:${isUser?'white':'#1E3A5F'};line-height:1.6">${content.replace(/\n/g,'<br>')}</p>
    </div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function addTyping() {
  const el  = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.id = 'typing-indicator';
  div.style.cssText = 'display:flex;align-items:flex-start;gap:12px;';
  div.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;background:linear-gradient(135deg,#3B5BDB,#2D9B6F)">IA</div>
    <div style="padding:14px;border-radius:18px 18px 18px 4px;background:white;border:1px solid #D0D9F0;display:flex;align-items:center;gap:6px;">
      ${[0,.2,.4].map(d=>`<div style="width:7px;height:7px;border-radius:50%;background:#4A5073;animation:bounce 1.2s ${d}s infinite"></div>`).join('')}
    </div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function removeTyping() { document.getElementById('typing-indicator')?.remove(); }

function buildContext() {
  if (!_projectData) return '';
  const d = _projectData;
  let ctx = `PROYECTO: ${d.name}\nDESCRIPCIÓN: ${d.description||'Sin descripción'}\n`;
  ctx += `ESTADÍSTICAS: ${d.stats?.passed||0} pasados, ${d.stats?.failed||0} fallidos, ${d.stats?.blocked||0} bloqueados, ${d.stats?.pending||0} sin ejecutar\n\n`;
  ctx += `REQUERIMIENTOS Y CASOS:\n`;
  (d.requirements||[]).forEach(r => {
    ctx += `\n[${r.code}] ${r.description} (Prioridad: ${r.priority||'—'})\n`;
    (r.cases||[]).forEach(c => {
      ctx += `  - "${c.title}" | Tipo: ${c.type} | Estado: ${c.status} | Último resultado: ${c.lastResult||'Sin ejecutar'} | Ejecuciones: ${c.executions||0}\n`;
    });
  });
  return ctx;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg || !_projectData) return;
  input.value = '';
  document.getElementById('send-btn').disabled = true;

  addMessage('user', msg);
  _chatHistory.push({ role: 'user', content: msg });
  addTyping();

  try {
    const context      = buildContext();
    const systemPrompt = `Eres un asistente de QA especializado. SOLO responde preguntas sobre el siguiente proyecto de testing. No respondas nada fuera de este contexto.\n\n${context}\n\nResponde en español, de forma concisa y profesional. Si te preguntan algo que no está en los datos, indícalo.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'REEMPLAZA_CON_TU_API_KEY',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: _chatHistory
      })
    });

    const data  = await response.json();
    const reply = data.content?.[0]?.text || 'No pude generar una respuesta.';
    removeTyping();
    addMessage('assistant', reply);
    _chatHistory.push({ role: 'assistant', content: reply });
  } catch (e) {
    removeTyping();
    addMessage('assistant', 'Error al conectar con la IA. Verifica tu API key y conexión.');
    console.error(e);
  }
  document.getElementById('send-btn').disabled = false;
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

// ── Generar PDF ───────────────────────────────────────────────────────────
function downloadPDF() {
  if (!_projectData) { alert('Espera a que carguen los datos.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const d   = _projectData;
  let y = 20;

  const addLine = (text, size=10, bold=false, color=[30,58,95]) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(String(text), 170);
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += size * 0.5;
    });
    y += 2;
  };

  // Encabezado azul
  doc.setFillColor(59,91,219);
  doc.rect(0,0,210,35,'F');
  doc.setFontSize(18); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
  doc.text('Reporte de Testing QA', 20, 15);
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text(`Proyecto: ${d.name}`, 20, 24);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'})}`, 20, 30);
  y = 45;

  addLine('RESUMEN EJECUTIVO', 13, true, [59,91,219]);
  addLine(`Proyecto: ${d.name}`, 10, true);
  if (d.description) addLine(`Descripción: ${d.description}`);
  y += 3;
  addLine('ESTADÍSTICAS', 11, true, [30,58,95]);
  addLine(`Pasados: ${d.stats?.passed||0}`,   10, false, [45,155,111]);
  addLine(`Fallidos: ${d.stats?.failed||0}`,  10, false, [192,57,43]);
  addLine(`Bloqueados: ${d.stats?.blocked||0}`,10, false, [212,160,23]);
  addLine(`Sin ejecutar: ${d.stats?.pending||0}`, 10, false, [74,80,115]);
  const pct = d.stats?.total > 0 ? Math.round((d.stats.passed/d.stats.total)*100) : 0;
  addLine(`Tasa de éxito: ${pct}%`, 10, true);
  y += 5;

  addLine('REQUERIMIENTOS Y CASOS', 13, true, [59,91,219]);
  (d.requirements||[]).forEach(r => {
    y += 3;
    if (y > 260) { doc.addPage(); y = 20; }
    addLine(`[${r.code}] ${r.description}`, 11, true);
    addLine(`Prioridad: ${r.priority||'—'} | Casos: ${r.cases?.length||0}`);
    (r.cases||[]).forEach(c => {
      const rc = (c.lastResult==='PASS'||c.lastResult==='PASSED') ? [45,155,111]
               : (c.lastResult==='FAIL'||c.lastResult==='FAILED') ? [192,57,43] : [74,80,115];
      addLine(`  • ${c.title}`, 9, false, [30,58,95]);
      addLine(`    Tipo: ${c.type} | Resultado: ${c.lastResult||'Sin ejecutar'}`, 9, false, rc);
    });
  });

  if (_chatHistory.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    y += 5;
    addLine('CONSULTAS AL ASISTENTE IA', 13, true, [59,91,219]);
    _chatHistory.forEach(m => {
      addLine(m.role === 'user' ? 'Consulta:' : 'Respuesta:', 9, true, m.role==='user'?[59,91,219]:[30,58,95]);
      addLine(m.content, 9);
      y += 2;
    });
  }

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(74,80,115); doc.setFont('helvetica','normal');
    doc.text(`QA Learn — Reporte generado automáticamente | Página ${i} de ${pages}`, 20, 290);
  }

  doc.save(`reporte-${(d.name||'proyecto').replace(/\s+/g,'-').toLowerCase()}.pdf`);
}

// ── Iniciar ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadProjectData);