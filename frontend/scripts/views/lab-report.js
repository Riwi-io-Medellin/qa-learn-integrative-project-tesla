// lab-report.js — Reporte IA conectado a n8n

const API     = 'http://localhost:5000';
const N8N_URL = 'https://juanjo-77.app.n8n.cloud/webhook/f0285e21-f680-4828-8034-a7da38e88bee/chat';
const SESSION_ID = 'qa-' + Date.now();

function token() { return localStorage.getItem('qa_token') || ''; }
function authH() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() }; }

// ── Guard ─────────────────────────────────────────────────────────────────
const _U = JSON.parse(localStorage.getItem('qa_user') || 'null');
if (!_U) window.location.href = '../public/login.html';

const name     = _U?.first_name ? (_U.first_name + ' ' + (_U.last_name || '')).trim() : (_U?.name || 'Usuario');
const initials = name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
document.getElementById('sb-avatar').textContent = initials;
document.getElementById('sb-name').textContent   = name;
document.getElementById('logout-btn').onclick = () => { localStorage.clear(); window.location.href = '../public/login.html'; };

// ── Proyecto ──────────────────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
let PID = params.get('id');
if (!PID) {
  const last = localStorage.getItem('qa_selected_project') || localStorage.getItem('selectedProject');
  if (last) PID = JSON.parse(last).id_project;
}
if (!PID) { alert('No hay proyecto seleccionado.'); window.location.href = '../pages/lab-tests.html'; }

let _projectData = null;

async function apiFetch(path) {
  const r = await fetch(API + path, { headers: authH() });
  if (r.status === 401) { localStorage.clear(); window.location.href = '../public/login.html'; }
  if (!r.ok) throw new Error('Error ' + r.status);
  return r.json();
}

// ── Llamada a n8n ─────────────────────────────────────────────────────────
async function callN8N(userMessage) {
  const ctx = buildContext();
  const fullMessage = `Eres un asistente especializado en QA Testing. SOLO responde sobre el siguiente proyecto. Si te preguntan algo fuera de este contexto, indica que solo puedes ayudar con temas de QA de este proyecto.\n\nCONTEXTO DEL PROYECTO:\n${ctx}\n\nPREGUNTA: ${userMessage}`;

  const res = await fetch(N8N_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: SESSION_ID, chatInput: fullMessage })
  });

  if (!res.ok) throw new Error('Error n8n ' + res.status);
  const data = await res.json();
  if (Array.isArray(data)) return data[0]?.output || data[0]?.text || 'Sin respuesta';
  return data.output || data.text || data.message || 'Sin respuesta';
}

// ── Cargar proyecto ───────────────────────────────────────────────────────
async function loadProjectData() {
  try {
    const project    = await apiFetch(`/api/projects/${PID}`);
    let requirements = [], testCases = [];
    try { requirements = await apiFetch(`/api/projects/${PID}/requirements`); } catch {}
    try { testCases    = await apiFetch(`/api/projects/${PID}/test-cases`);   } catch {}

    let passed = 0, failed = 0, blocked = 0, pending = 0;
    const casesWithResults = await Promise.all(testCases.map(async tc => {
      let lastResult = null, execCount = 0;
      try {
        const execs = await apiFetch(`/api/executions/test-case/${tc.id_test_case}`);
        const list  = Array.isArray(execs) ? execs : (execs.executions || []);
        execCount   = list.length;
        lastResult  = list.length > 0 ? list[0].result : null;
      } catch {}
      return { ...tc, lastResult, executions: execCount };
    }));

    const reqsWithCases = requirements.map(r => ({
      ...r, cases: casesWithResults.filter(tc => tc.id_requirement === r.id_requirement)
    }));
    const unlinked = casesWithResults.filter(tc => !tc.id_requirement);
    if (unlinked.length) reqsWithCases.push({ code: 'SIN-REQ', description: 'Sin requerimiento', priority: '—', cases: unlinked });

    casesWithResults.forEach(tc => {
      if      (tc.lastResult === 'PASSED')  passed++;
      else if (tc.lastResult === 'FAILED')  failed++;
      else if (tc.lastResult === 'BLOCKED') blocked++;
      else pending++;
    });

    _projectData = {
      ...project, requirements: reqsWithCases, totalCases: testCases.length,
      stats: { passed, failed, blocked, pending, total: casesWithResults.filter(tc => tc.lastResult).length }
    };

    renderSummary(_projectData);
    document.getElementById('hdr-project').textContent = _projectData.name || 'Proyecto';

    // Mensaje de bienvenida
    addTyping();
    try {
      const reply = await callN8N(`Saluda al usuario y da un resumen breve del estado del proyecto en español.`);
      removeTyping();
      document.getElementById('welcome-msg').textContent = reply;
    } catch {
      removeTyping();
      document.getElementById('welcome-msg').textContent =
        `¡Hola! Proyecto "${_projectData.name}" cargado. ${requirements.length} requerimientos, ${testCases.length} casos. ¿En qué puedo ayudarte?`;
    }
  } catch (e) {
    console.error(e);
    document.getElementById('welcome-msg').textContent = 'No se pudo cargar el proyecto.';
  }
}

// ── Context ───────────────────────────────────────────────────────────────
function buildContext() {
  if (!_projectData) return '';
  const d = _projectData;
  let ctx = `Proyecto: ${d.name}\nDescripción: ${d.description || 'Sin descripción'}\n`;
  ctx += `Stats: ${d.stats?.passed || 0} pasados, ${d.stats?.failed || 0} fallidos, ${d.stats?.blocked || 0} bloqueados, ${d.stats?.pending || 0} sin ejecutar\n\nRequerimientos:\n`;
  (d.requirements || []).forEach(r => {
    ctx += `[${r.code}] ${r.description} (Prioridad: ${r.priority || '—'})\n`;
    (r.cases || []).forEach(c => {
      ctx += `  - "${c.title}" | ${c.type} | ${c.status} | Resultado: ${c.lastResult || 'Sin ejecutar'}\n`;
    });
  });
  return ctx;
}

// ── Render ────────────────────────────────────────────────────────────────
function renderSummary(d) {
  document.getElementById('summary-loading').classList.add('hidden');
  document.getElementById('summary-content').classList.remove('hidden');
  document.getElementById('sum-name').textContent    = d.name || '—';
  document.getElementById('sum-desc').textContent    = d.description || 'Sin descripción.';
  document.getElementById('sum-reqs').textContent    = d.requirements?.length || 0;
  document.getElementById('sum-cases').textContent   = d.totalCases || 0;
  document.getElementById('sum-passed').textContent  = d.stats?.passed  || 0;
  document.getElementById('sum-failed').textContent  = d.stats?.failed  || 0;
  document.getElementById('sum-blocked').textContent = d.stats?.blocked || 0;
  document.getElementById('sum-pending').textContent = d.stats?.pending || 0;
  const total = d.stats?.total || 0;
  const pct   = total > 0 ? Math.round((d.stats.passed / total) * 100) : 0;
  document.getElementById('sum-progress-bar').style.width = pct + '%';
  document.getElementById('sum-pct').textContent = pct + '% completado';
  document.getElementById('sum-reqs-list').innerHTML = (d.requirements || []).map(r => {
    const t  = r.cases?.length || 0;
    const p  = r.cases?.filter(c => c.lastResult === 'PASSED').length || 0;
    const pc = t > 0 ? Math.round((p / t) * 100) : 0;
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

// ── Chat UI ───────────────────────────────────────────────────────────────
function addMessage(role, content) {
  const el = document.getElementById('chat-messages');
  const isUser = role === 'user';
  const div = document.createElement('div');
  div.style.cssText = `display:flex;align-items:flex-start;gap:12px;${isUser ? 'flex-direction:row-reverse' : ''}`;
  div.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;background:${isUser ? '#3B5BDB' : 'linear-gradient(135deg,#3B5BDB,#2D9B6F)'}">${isUser ? initials : 'IA'}</div>
    <div style="max-width:${isUser ? '75%' : '85%'};padding:14px;border-radius:${isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};background:${isUser ? '#3B5BDB' : 'white'};border:${isUser ? 'none' : '1px solid #D0D9F0'}">
      ${isUser ? '' : '<p style="font-size:13px;font-weight:700;color:#1E3A5F;margin:0 0 4px;">Asistente QA</p>'}
      <p style="font-size:13px;margin:0;color:${isUser ? 'white' : '#1E3A5F'};line-height:1.6">${content.replace(/\n/g, '<br>')}</p>
    </div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function addTyping() {
  const el = document.getElementById('chat-messages');
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

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg || !_projectData) return;
  input.value = '';
  document.getElementById('send-btn').disabled = true;
  addMessage('user', msg);
  addTyping();
  try {
    const reply = await callN8N(msg);
    removeTyping();
    addMessage('assistant', reply);
  } catch (e) {
    removeTyping();
    addMessage('assistant', 'Error al conectar con el asistente. Intenta de nuevo.');
    console.error(e);
  }
  document.getElementById('send-btn').disabled = false;
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

// ── PDF ───────────────────────────────────────────────────────────────────
function downloadPDF() {
  if (!_projectData) { alert('Espera a que carguen los datos.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const d   = _projectData;
  let y = 20;
  const addLine = (text, size=10, bold=false, color=[30,58,95]) => {
    doc.setFontSize(size); doc.setTextColor(...color);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.splitTextToSize(String(text), 170).forEach(line => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 20, y); y += size * 0.5;
    });
    y += 2;
  };
  doc.setFillColor(59,91,219); doc.rect(0,0,210,35,'F');
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
  addLine(`Pasados: ${d.stats?.passed||0}`,     10, false, [45,155,111]);
  addLine(`Fallidos: ${d.stats?.failed||0}`,    10, false, [192,57,43]);
  addLine(`Bloqueados: ${d.stats?.blocked||0}`, 10, false, [212,160,23]);
  addLine(`Sin ejecutar: ${d.stats?.pending||0}`, 10, false, [74,80,115]);
  const pct = d.stats?.total > 0 ? Math.round((d.stats.passed/d.stats.total)*100) : 0;
  addLine(`Tasa de éxito: ${pct}%`, 10, true);
  y += 5;
  addLine('REQUERIMIENTOS Y CASOS', 13, true, [59,91,219]);
  (d.requirements||[]).forEach(r => {
    y += 3; if (y > 260) { doc.addPage(); y = 20; }
    addLine(`[${r.code}] ${r.description}`, 11, true);
    addLine(`Prioridad: ${r.priority||'—'} | Casos: ${r.cases?.length||0}`);
    (r.cases||[]).forEach(c => {
      const rc = c.lastResult==='PASSED'?[45,155,111]:c.lastResult==='FAILED'?[192,57,43]:[74,80,115];
      addLine(`  • ${c.title}`, 9, false, [30,58,95]);
      addLine(`    Tipo: ${c.type} | Resultado: ${c.lastResult||'Sin ejecutar'}`, 9, false, rc);
    });
  });
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(74,80,115); doc.setFont('helvetica','normal');
    doc.text(`QA Learn — Reporte generado automáticamente | Página ${i} de ${pages}`, 20, 290);
  }
  doc.save(`reporte-${(d.name||'proyecto').replace(/\s+/g,'-').toLowerCase()}.pdf`);
}

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadProjectData);