/* ── 09-pruebas.js ────────────────────────────────────────────────────── */

const BASE_URL = 'http://localhost:5000/api';
const _TOKEN   = localStorage.getItem('qa_token');
if (!_TOKEN) window.location.href = '../public/login.html';

const _U    = JSON.parse(localStorage.getItem('qa_user') || '{}');
const _diag = JSON.parse(localStorage.getItem('qa_last_diagnostic') || 'null');
const _dn   = _U.first_name ? (_U.first_name + ' ' + (_U.last_name || '')).trim() : (_U.name || 'Usuario');
const _ini  = (_U.first_name ? _U.first_name[0] : (_U.name || 'U')[0]).toUpperCase() + (_U.last_name ? _U.last_name[0].toUpperCase() : '');

document.getElementById('sb-avatar').textContent = _ini;
document.getElementById('sb-name').textContent   = _dn;
if (document.getElementById('sb-level') && _diag?.level) {
  document.getElementById('sb-level').textContent = _diag.level.label;
}

document.getElementById('logout-btn').onclick = async () => {
  try { await fetch(BASE_URL + '/auth/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + _TOKEN } }); } catch {}
  localStorage.clear();
  window.location.href = '../public/login.html';
};

// ── Utilidades ─────────────────────────────────────────────────────────────

async function apiFetch(p, o = {}) {
  const h = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _TOKEN, ...(o.headers || {}) };
  const r = await fetch(BASE_URL + p, { ...o, headers: h });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { localStorage.clear(); window.location.href = '../public/login.html'; return null; }
  if (!r.ok) throw new Error(d.error || d.message || 'Error ' + r.status);
  return d;
}

function badge(s) {
  const M = {
    PASSED: ['#2D9B6F','Pasado'], FAILED: ['#C0392B','Fallido'], BLOCKED: ['#D4A017','Bloqueado'],
    DRAFT: ['#4A5073','Borrador'], ACTIVE: ['#3B5BDB','Activo'], COMPLETED: ['#2D9B6F','Completado'],
    ARCHIVED: ['#4A5073','Archivado'], PENDING: ['#D4A017','Pendiente'],
    HIGH: ['#C0392B','Alta'], MEDIUM: ['#D4A017','Media'], LOW: ['#2D9B6F','Baja'],
  };
  const [c, l] = M[s] || ['#4A5073', s];
  return `<span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;background:${c}20;color:${c}">${l}</span>`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  const c = type === 'success' ? '#2D9B6F' : type === 'error' ? '#C0392B' : '#3B5BDB';
  t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:999;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:600;color:white;background:${c};box-shadow:0 4px 20px rgba(0,0,0,.15);animation:slideUp .2s ease`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Modal / Drawer ─────────────────────────────────────────────────────────

function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.querySelectorAll('.modal-backdrop').forEach(el => {
  el.addEventListener('mousedown', function(e) { if (e.target === this) this.classList.add('hidden'); });
});

function openDrawer() {
  document.getElementById('drawer-overlay').classList.add('open');
  document.getElementById('tc-drawer').classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer-overlay').classList.remove('open');
  document.getElementById('tc-drawer').classList.remove('open');
}

// ── Estado activo ──────────────────────────────────────────────────────────

let _activeProjId = null, _activeReqId = null, _activeTcId = null;

// ── COL 1: Proyectos ───────────────────────────────────────────────────────

async function loadProjects() {
  try {
    const data = await apiFetch('/projects');
    const list = Array.isArray(data) ? data : (data.projects || []);
    const el   = document.getElementById('proj-list');
    if (!list.length) { el.innerHTML = '<p class="text-xs text-muted px-4 py-3">Sin proyectos. Crea uno.</p>'; return; }
    el.innerHTML = list.map(p => `
      <div id="proj-${p.id_project}" class="proj-item px-4 py-3 flex items-start gap-2.5"
           onclick="selectProj('${p.id_project}','${escHtml(p.name).replace(/'/g,"\\'")}')">
        <div class="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style="background:#EEF2FB">
          <svg class="w-3 h-3" style="color:#3B5BDB" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-navy truncate leading-snug">${escHtml(p.name)}</p>
          <p class="text-xs text-muted mt-0.5">${badge(p.status || 'ACTIVE')}</p>
        </div>
      </div>`).join('');
    if (list[0]) selectProj(list[0].id_project, list[0].name);
  } catch(e) {
    document.getElementById('proj-list').innerHTML = `<p class="text-xs text-muted px-4 py-3">Error: ${e.message}</p>`;
  }
}

function goToReport() {
  if (_activeProjId) window.location.href = 'lab-report.html?id=' + _activeProjId;
}

async function downloadPDF() {
  if (!_activeProjId) { showToast('Selecciona un proyecto.', 'error'); return; }
  showToast('Generando PDF...', 'info');
  try {
    const projData = await apiFetch('/projects');
    const projects = Array.isArray(projData) ? projData : (projData.projects || []);
    const proj = projects.find(p => p.id_project === _activeProjId);
    if (!proj) { showToast('Proyecto no encontrado.', 'error'); return; }

    const reqData = await apiFetch('/projects/' + _activeProjId + '/requirements');
    const reqs = Array.isArray(reqData) ? reqData : (reqData.requirements || []);

    // Build report HTML in an off-screen container
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:1000px;padding:40px;font-family:"Plus Jakarta Sans",sans-serif;background:#fff;color:#1A1A2E;z-index:-1';
    container.innerHTML = `
      <div style="margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #1E3A5F">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#1E3A5F">
            <span style="color:#fff;font-weight:800;font-size:14px">QL</span>
          </div>
          <div>
            <h1 style="font-size:24px;font-weight:800;color:#1E3A5F;margin:0">QA Learn</h1>
            <p style="font-size:13px;color:#4A5073;margin:0">Reporte de Pruebas de Software</p>
          </div>
        </div>
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#4A5073;width:140px">Proyecto</td><td style="padding:4px 0;font-weight:700;color:#1E3A5F">${escHtml(proj.name)}</td></tr>
          <tr><td style="padding:4px 0;color:#4A5073">Estado</td><td style="padding:4px 0;color:#1E3A5F">${proj.status || 'ACTIVE'}</td></tr>
          <tr><td style="padding:4px 0;color:#4A5073">Descripción</td><td style="padding:4px 0">${escHtml(proj.description || 'Sin descripción')}</td></tr>
          <tr><td style="padding:4px 0;color:#4A5073">Requerimientos</td><td style="padding:4px 0">${reqs.length} requerimientos</td></tr>
          <tr><td style="padding:4px 0;color:#4A5073">Fecha del reporte</td><td style="padding:4px 0">${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</td></tr>
        </table>
      </div>`;

    for (const req of reqs) {
      const tcData = await apiFetch('/projects/' + _activeProjId + '/requirements/' + req.id_requirement + '/test-cases').catch(() => ({ testCases: [] }));
      const tcs = tcData.testCases || [];

      container.innerHTML += `<div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #D0D9F0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:12px;font-family:monospace;font-weight:700;padding:2px 8px;border-radius:4px;background:#EEF2FB;color:#3B5BDB">${escHtml(req.code)}</span>
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:20px;background:${req.priority === 'HIGH' ? '#C0392B' : req.priority === 'MEDIUM' ? '#D4A017' : '#2D9B6F'}20;color:${req.priority === 'HIGH' ? '#C0392B' : req.priority === 'MEDIUM' ? '#D4A017' : '#2D9B6F'}">${req.priority || 'MEDIUM'}</span>
        </div>
        <h3 style="font-size:16px;font-weight:700;color:#1E3A5F;margin:4px 0 8px">${escHtml(req.description)}</h3>
        <p style="font-size:12px;color:#4A5073;margin:0 0 12px">${tcs.length} caso${tcs.length !== 1 ? 's' : ''} de prueba</p>`;

      if (tcs.length) {
        container.innerHTML += '<div style="margin-left:12px">';
        for (const tc of tcs) {
          const detail = await apiFetch('/projects/' + _activeProjId + '/test-cases/' + tc.id_test_case).catch(() => null);
          const steps = detail?.steps || [];

          container.innerHTML += `<div style="margin-bottom:16px;padding:16px;border-radius:12px;background:#F7F9FF;border:1px solid #D0D9F0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:14px;font-weight:700;color:#1E3A5F">${escHtml(tc.title || '—')}</span>
              <span style="font-size:11px;font-family:monospace;padding:2px 8px;border-radius:4px;background:#EEF2FB;color:#4A5073">${tc.type || '—'}</span>
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:20px;background:${tc.status === 'ACTIVE' ? '#3B5BDB' : '#4A5073'}20;color:${tc.status === 'ACTIVE' ? '#3B5BDB' : '#4A5073'}">${tc.status || 'DRAFT'}</span>
            </div>`;

          if (steps.length) {
            container.innerHTML += `<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px">
              <thead><tr>
                <th style="text-align:left;padding:6px 8px;background:#EEF2FB;color:#1E3A5F;font-weight:700;border:1px solid #D0D9F0">#</th>
                <th style="text-align:left;padding:6px 8px;background:#EEF2FB;color:#1E3A5F;font-weight:700;border:1px solid #D0D9F0">Acción</th>
                <th style="text-align:left;padding:6px 8px;background:#EEF2FB;color:#1E3A5F;font-weight:700;border:1px solid #D0D9F0">Resultado Esperado</th>
              </tr></thead><tbody>`;
            steps.forEach(s => {
              container.innerHTML += `<tr><td style="padding:6px 8px;border:1px solid #D0D9F0;text-align:center">${s.step_number || '—'}</td>
                <td style="padding:6px 8px;border:1px solid #D0D9F0">${escHtml(s.action || '—')}</td>
                <td style="padding:6px 8px;border:1px solid #D0D9F0">${escHtml(s.expected_result || s.expectedResult || '—')}</td></tr>`;
            });
            container.innerHTML += '</tbody></table>';
          }

          container.innerHTML += '</div>';
        }
        container.innerHTML += '</div>';
      }
      container.innerHTML += '</div>';
    }

    container.innerHTML += `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #D0D9F0;text-align:center;font-size:12px;color:#4A5073">
      Reporte generado por QA Learn — ${new Date().toLocaleDateString('es-CO')}
    </div>`;

    document.body.appendChild(container);
    await new Promise(r => setTimeout(r, 300)); // wait for render

    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    document.body.removeChild(container);

    const { jsPDF } = window.jspdf;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    let heightLeft = pdfH;
    let position = 0;
    const pageH = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
      heightLeft -= pageH;
    }

    const fileName = 'reporte-' + proj.name.replace(/\s+/g, '_').toLowerCase() + '.pdf';
    pdf.save(fileName);
    showToast('PDF descargado.', 'success');
  } catch(e) {
    showToast('Error al generar PDF: ' + e.message, 'error');
  }
}

function generatePDF() {
  if (!_activeProjId) return;
  downloadPDF();
}

async function showReportModal() {
  try {
    const projData = await apiFetch('/projects');
    const projects = Array.isArray(projData) ? projData : (projData.projects || []);
    const proj = projects.find(p => p.id_project === _activeProjId);
    if (!proj) { showToast('Proyecto no encontrado.', 'error'); return; }

    const reqData = await apiFetch('/projects/' + _activeProjId + '/requirements');
    const reqs = Array.isArray(reqData) ? reqData : (reqData.requirements || []);

    let html = `
    <div id="report-modal" class="modal-backdrop" onclick="if(event.target===this)closeReportModal()">
      <div class="bg-white rounded-2xl shadow-2xl" style="width:90%;max-width:1000px;max-height:90vh;overflow-y:auto">
        <div class="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 class="text-lg font-extrabold text-navy">Reporte de Pruebas</h2>
          <div class="flex gap-2">
            <button onclick="downloadPDF()" class="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90" style="background:#2D9B6F">
              <svg class="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Descargar PDF
            </button>
            <button onclick="closeReportModal()" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-sky text-muted"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
        </div>
        <div class="p-8" style="font-family:'Plus Jakarta Sans',sans-serif">
          <!-- Header del reporte -->
          <div class="mb-8 pb-6 border-b-2 border-navy">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:#1E3A5F"><span class="text-white font-extrabold text-sm">QL</span></div>
              <div><h1 class="text-2xl font-extrabold text-navy">QA Learn</h1><p class="text-sm text-muted">Reporte de Pruebas de Software</p></div>
            </div>
            <table style="width:100%;font-size:13px">
              <tr><td style="padding:4px 0;color:#4A5073;width:140px">Proyecto</td><td style="padding:4px 0;font-weight:700;color:#1E3A5F">${escHtml(proj.name)}</td></tr>
              <tr><td style="padding:4px 0;color:#4A5073">Estado</td><td style="padding:4px 0">${badge(proj.status || 'ACTIVE')}</td></tr>
              <tr><td style="padding:4px 0;color:#4A5073">Descripción</td><td style="padding:4px 0;color:#1A1A2E">${escHtml(proj.description || 'Sin descripción')}</td></tr>
              <tr><td style="padding:4px 0;color:#4A5073">Requerimientos</td><td style="padding:4px 0;color:#1A1A2E">${reqs.length} requerimientos</td></tr>
              <tr><td style="padding:4px 0;color:#4A5073">Fecha del reporte</td><td style="padding:4px 0;color:#1A1A2E">${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</td></tr>
            </table>
          </div>`;

    // Por cada requerimiento, listar sus casos
    for (const req of reqs) {
      const tcData = await apiFetch('/projects/' + _activeProjId + '/requirements/' + req.id_requirement + '/test-cases').catch(() => ({ testCases: [] }));
      const tcs = tcData.testCases || [];

      html += `<div class="mb-6 pb-4 border-b border-border">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded" style="background:#EEF2FB;color:#3B5BDB">${escHtml(req.code)}</span>
          ${badge(req.priority || 'MEDIUM')}
        </div>
        <h3 class="text-base font-bold text-navy mb-2">${escHtml(req.description)}</h3>
        <p class="text-xs text-muted mb-3">${tcs.length} caso${tcs.length !== 1 ? 's' : ''} de prueba</p>`;

      if (tcs.length) {
        html += '<div style="margin-left:12px">';
        for (const tc of tcs) {
          // Get steps for this test case
          const detail = await apiFetch('/projects/' + _activeProjId + '/test-cases/' + tc.id_test_case).catch(() => null);
          const steps = detail?.steps || [];
          const execs = detail?.executions || [];

          html += `<div class="mb-4 p-4 rounded-xl" style="background:#F7F9FF;border:1px solid #D0D9F0">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-bold text-navy flex-1">${escHtml(tc.title || '—')}</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded" style="background:#EEF2FB;color:#4A5073">${tc.type || '—'}</span>
              ${badge(tc.status || 'DRAFT')}
            </div>`;

          if (steps.length) {
            html += `<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px">
              <thead><tr><th style="text-align:left;padding:6px 8px;background:#EEF2FB;color:#1E3A5F;font-weight:700;border:1px solid #D0D9F0">#</th>
              <th style="text-align:left;padding:6px 8px;background:#EEF2FB;color:#1E3A5F;font-weight:700;border:1px solid #D0D9F0">Acción</th>
              <th style="text-align:left;padding:6px 8px;background:#EEF2FB;color:#1E3A5F;font-weight:700;border:1px solid #D0D9F0">Resultado Esperado</th></tr></thead><tbody>`;
            steps.forEach(s => {
              html += `<tr><td style="padding:6px 8px;border:1px solid #D0D9F0;color:#1A1A2E;text-align:center">${s.step_number || s.stepNumber || '—'}</td>
                <td style="padding:6px 8px;border:1px solid #D0D9F0;color:#1A1A2E">${escHtml(s.action || '—')}</td>
                <td style="padding:6px 8px;border:1px solid #D0D9F0;color:#1A1A2E">${escHtml(s.expected_result || s.expectedResult || '—')}</td></tr>`;
            });
            html += '</tbody></table>';
          }

          if (execs.length) {
            const last = execs[execs.length - 1];
            html += `<div class="mt-2 flex items-center gap-2 text-xs"><span class="text-muted">Última ejecución:</span> ${badge(last.result || last.result_test || '—')} <span class="text-muted">${fmtDate(last.executed_at || last.date_execution)}</span></div>`;
          }

          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    html += `<div class="mt-8 pt-4 border-t border-border text-center text-xs text-muted">
      Reporte generado por QA Learn — ${new Date().toLocaleDateString('es-CO')}
    </div>`;

    html += '</div></div></div>';

    const existing = document.getElementById('report-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  } catch(e) {
    showToast('Error al generar reporte: ' + e.message, 'error');
  }
}

function closeReportModal() {
  const el = document.getElementById('report-modal');
  if (el) el.remove();
}

async function selectProj(id, name) {
  _activeProjId = id; _activeReqId = null; _activeTcId = null;
  document.querySelectorAll('.proj-item').forEach(el => el.classList.remove('active'));
  document.getElementById('proj-' + id)?.classList.add('active');
  document.getElementById('btn-new-req').classList.remove('hidden');
  document.getElementById('btn-pdf')?.classList.remove('hidden');
  document.getElementById('hdr-breadcrumb').textContent = name + ' → Requerimientos → Casos de Prueba';
  document.getElementById('tc-list').innerHTML = '<div class="flex flex-col items-center justify-center h-64 text-center"><p class="text-sm text-muted">Selecciona un requerimiento</p></div>';
  document.getElementById('tc-label').textContent = 'Casos de Prueba';
  document.getElementById('btn-new-tc').classList.add('hidden');
  closeDrawer();
  await loadReqs();
  populateReqSelect();
}

// ── COL 2: Requerimientos ──────────────────────────────────────────────────

async function loadReqs() {
  if (!_activeProjId) return;
  try {
    const data = await apiFetch('/projects/' + _activeProjId + '/requirements');
    const list = Array.isArray(data) ? data : (data.requirements || []);
    const el   = document.getElementById('req-list');
    if (!list.length) { el.innerHTML = '<p class="text-xs text-muted px-4 py-3">Sin requerimientos.<br>Crea el primero.</p>'; return; }
    el.innerHTML = list.map(r => `
      <div id="req-${r.id_requirement}" class="req-item px-3 py-2.5 flex items-start gap-2"
           onclick="selectReq('${r.id_requirement}','${escHtml(r.code).replace(/'/g,"\\'")}')">
        <span class="text-xs font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 whitespace-nowrap"
              style="background:#EEF2FB;color:#3B5BDB">${escHtml(r.code)}</span>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-navy leading-tight">${escHtml(r.description.slice(0,60))}${r.description.length > 60 ? '…' : ''}</p>
          <p class="text-xs text-muted mt-0.5">${badge(r.priority || 'MEDIUM')}</p>
        </div>
      </div>`).join('');
    if (list[0]) selectReq(list[0].id_requirement, list[0].code);
  } catch(e) {
    document.getElementById('req-list').innerHTML = `<p class="text-xs text-muted px-4 py-3">Error: ${e.message}</p>`;
  }
}

async function selectReq(id, code) {
  _activeReqId = id; _activeTcId = null;
  document.querySelectorAll('.req-item').forEach(el => el.classList.remove('active'));
  document.getElementById('req-' + id)?.classList.add('active');
  document.getElementById('btn-new-tc').classList.remove('hidden');
  document.getElementById('tc-label').textContent = code + ' — Casos de Prueba';
  closeDrawer();
  await loadCases(id, code);
}

// ── COL 3: Casos de prueba ─────────────────────────────────────────────────

async function loadCases(reqId) {
  if (!_activeProjId) return;
  const el = document.getElementById('tc-list');
  el.innerHTML = '<p class="text-xs text-muted py-3 px-1">Cargando...</p>';
  try {
    const data  = await apiFetch('/projects/' + _activeProjId + '/test-cases');
    const all   = Array.isArray(data) ? data : (data.testCases || data.test_cases || []);
    const cases = all.filter(tc => String(tc.id_requirement) === String(reqId));
    const tl    = { FUNCTIONAL:'Funcional', NON_FUNCTIONAL:'No Funcional', REGRESSION:'Regresión' };
    if (!cases.length) {
      el.innerHTML = '<div class="flex flex-col items-center justify-center h-40 text-center px-4"><p class="text-sm text-muted mb-1">Sin casos de prueba</p><p class="text-xs text-muted">Crea el primero para este requerimiento</p></div>';
      return;
    }
    el.innerHTML = '<div class="space-y-2">' + cases.map(tc => `
      <div onclick="selectTC('${tc.id_test_case}')" class="tc-item p-3.5 cursor-pointer" id="tc-${tc.id_test_case}">
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <p class="text-sm font-semibold text-navy leading-snug flex-1">${escHtml(tc.title)}</p>
          ${badge(tc.status || 'DRAFT')}
        </div>
        <span class="text-xs text-muted">${tl[tc.type] || tc.type}</span>
      </div>`).join('') + '</div>';
  } catch(e) {
    el.innerHTML = `<p class="text-xs text-muted py-3">Error: ${e.message}</p>`;
  }
}

// ── Drawer: Detalle del caso ───────────────────────────────────────────────

async function selectTC(id) {
  _activeTcId = id;
  document.querySelectorAll('.tc-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tc-' + id)?.classList.add('active');
  openDrawer();

  document.getElementById('dr-title').textContent  = 'Cargando...';
  document.getElementById('dr-type').textContent   = '';
  document.getElementById('dr-status').innerHTML   = '';
  document.getElementById('dr-desc').textContent   = '';
  document.getElementById('dr-precond').textContent= '';
  document.getElementById('dr-steps').innerHTML    = '<p class="text-xs text-muted">Cargando pasos...</p>';
  document.getElementById('dr-execs').innerHTML    = '<p class="text-xs text-muted">Cargando historial...</p>';

  try {
    const tc = await apiFetch('/projects/' + _activeProjId + '/test-cases/' + id);
    const t  = tc?.id_test_case ? tc : (tc.testCase || tc);
    const tl = { FUNCTIONAL:'Funcional', NON_FUNCTIONAL:'No Funcional', REGRESSION:'Regresión' };

    document.getElementById('dr-title').textContent   = t.title || '—';
    document.getElementById('dr-type').textContent    = tl[t.type] || t.type || '—';
    document.getElementById('dr-status').innerHTML    = badge(t.status || 'DRAFT');
    document.getElementById('dr-desc').textContent    = t.description   || 'Sin descripción.';
    document.getElementById('dr-precond').textContent = t.preconditions || 'Sin precondiciones.';

    // Pasos
    const sd    = await apiFetch('/projects/' + _activeProjId + '/test-cases/' + id + '/steps').catch(() => []);
    const steps = (Array.isArray(sd) ? sd : (sd.steps || [])).sort((a, b) => a.step_number - b.step_number);
    document.getElementById('dr-steps').innerHTML = steps.length
      ? steps.map(s => `
          <div class="flex items-start gap-3 p-3 rounded-xl" style="background:#EEF2FB">
            <div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style="background:#3B5BDB">${s.step_number}</div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-navy">${escHtml(s.action)}</p>
              <p class="text-xs text-muted mt-1">↳ ${escHtml(s.expected_result)}</p>
            </div>
          </div>`).join('')
      : '<p class="text-xs text-muted">Sin pasos. Agrega el primero.</p>';
    document.getElementById('ps-num').value = steps.length + 1;

    // Historial de ejecuciones
    const ex     = await apiFetch('/executions/test-case/' + id).catch(() => ({}));
    const exList = ex?.executions || (Array.isArray(ex) ? ex : []);
    document.getElementById('dr-execs').innerHTML = exList.length
      ? exList.slice(0, 8).map(e => `
          <div class="flex items-center gap-2 py-2 border-b border-border last:border-0">
            <span class="text-xs text-muted flex-1">${fmtDate(e.executed_at || e.date_execution)}</span>
            ${badge(e.result || e.result_test)}
          </div>`).join('')
      : '<p class="text-xs text-muted">Sin ejecuciones registradas.</p>';

    // Sección repositorio
    const hasPassed  = exList.some(e => (e.result || e.result_test) === 'PASSED');
    const libStatus  = t.library_status || null;
    const repoSection= document.getElementById('dr-repo-section');
    const repoStatus = document.getElementById('dr-repo-status');

    if (hasPassed || libStatus) {
      repoSection.classList.remove('hidden');
      if (libStatus === 'APPROVED') {
        repoStatus.innerHTML = `
          <div class="flex items-center gap-2 p-2.5 rounded-lg" style="background:rgba(45,155,111,0.1)">
            <svg class="w-4 h-4 flex-shrink-0" style="color:#2D9B6F" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-xs font-bold" style="color:#2D9B6F">Publicado en el repositorio</span>
          </div>`;
      } else if (libStatus === 'PENDING') {
        repoStatus.innerHTML = `
          <div class="flex items-center gap-2 p-2.5 rounded-lg" style="background:rgba(212,160,23,0.1)">
            <svg class="w-4 h-4 flex-shrink-0" style="color:#D4A017" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-xs font-bold" style="color:#D4A017">Pendiente de aprobación por el administrador</span>
          </div>`;
      } else {
        repoStatus.innerHTML = `
          <button onclick="solicitarRepositorio()"
            class="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style="background:#3B5BDB">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Enviar al repositorio
          </button>`;
      }
    } else {
      repoSection.classList.add('hidden');
    }

  } catch(e) {
    document.getElementById('dr-title').textContent = 'Error al cargar';
    showToast('Error: ' + e.message, 'error');
  }
}

// ── Acciones del drawer ────────────────────────────────────────────────────

async function guardarEjecucion() {
  const result = document.getElementById('exec-result').value;
  const obs    = document.getElementById('exec-obs').value.trim();
  if (!result) { showToast('Selecciona un resultado.', 'error'); return; }
  try {
    await apiFetch('/executions', { method: 'POST', body: JSON.stringify({ id_test_case: _activeTcId, result, observations: obs || null }) });
    document.getElementById('exec-result').value = '';
    document.getElementById('exec-obs').value    = '';
    showToast('Ejecución registrada.', 'success');
    selectTC(_activeTcId);
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function solicitarRepositorio() {
  if (!_activeTcId || !_activeProjId) return;
  try {
    await apiFetch('/projects/' + _activeProjId + '/test-cases/' + _activeTcId + '/library-request', { method: 'PATCH' });
    showToast('Solicitud enviada. El administrador la revisará.', 'success');
    selectTC(_activeTcId);
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Crear entidades ────────────────────────────────────────────────────────

async function populateReqSelect() {
  if (!_activeProjId) return;
  try {
    const data = await apiFetch('/projects/' + _activeProjId + '/requirements');
    const list = Array.isArray(data) ? data : (data.requirements || []);
    document.getElementById('nc-req').innerHTML =
      '<option value="">— Selecciona un requerimiento —</option>' +
      list.map(r => `<option value="${r.id_requirement}" ${String(r.id_requirement) === String(_activeReqId) ? 'selected' : ''}>${escHtml(r.code)} — ${escHtml(r.description.slice(0, 50))}</option>`).join('');
  } catch {}
}

async function crearProyecto() {
  const name = document.getElementById('np-name').value.trim();
  const desc = document.getElementById('np-desc').value.trim();
  if (!name) { showToast('El nombre es obligatorio.', 'error'); return; }
  try {
    await apiFetch('/projects', { method: 'POST', body: JSON.stringify({ name, description: desc }) });
    closeModal('modal-proyecto');
    document.getElementById('np-name').value = '';
    document.getElementById('np-desc').value = '';
    showToast('Proyecto creado.', 'success');
    loadProjects();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function crearReq() {
  if (!_activeProjId) { showToast('Selecciona un proyecto primero.', 'error'); return; }
  const code = document.getElementById('nr-code').value.trim();
  const desc = document.getElementById('nr-desc').value.trim();
  const prio = document.getElementById('nr-prio').value;
  if (!code || !desc) { showToast('Código y descripción son obligatorios.', 'error'); return; }
  try {
    await apiFetch('/projects/' + _activeProjId + '/requirements', { method: 'POST', body: JSON.stringify({ code, description: desc, priority: prio, status: 'DRAFT' }) });
    closeModal('modal-req');
    document.getElementById('nr-code').value = '';
    document.getElementById('nr-desc').value = '';
    showToast('Requerimiento creado.', 'success');
    await loadReqs();
    populateReqSelect();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function crearCaso() {
  if (!_activeProjId) { showToast('Selecciona un proyecto primero.', 'error'); return; }
  const title   = document.getElementById('nc-title').value.trim();
  const type    = document.getElementById('nc-type').value;
  const desc    = document.getElementById('nc-desc').value.trim();
  const precond = document.getElementById('nc-precond').value.trim();
  const reqId   = document.getElementById('nc-req').value;
  if (!title) { showToast('El título es obligatorio.', 'error'); return; }
  if (!reqId) { showToast('Selecciona un requerimiento.', 'error'); return; }
  try {
    await apiFetch('/projects/' + _activeProjId + '/test-cases', {
      method: 'POST',
      body: JSON.stringify({ title, type, description: desc, preconditions: precond, status: 'DRAFT', id_requirement: reqId })
    });
    closeModal('modal-caso');
    document.getElementById('nc-title').value  = '';
    document.getElementById('nc-desc').value   = '';
    document.getElementById('nc-precond').value= '';
    showToast('Caso de prueba creado.', 'success');
    if (_activeReqId) loadCases(_activeReqId);
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function agregarPaso() {
  if (!_activeTcId || !_activeProjId) return;
  const num      = parseInt(document.getElementById('ps-num').value) || 1;
  const action   = document.getElementById('ps-action').value.trim();
  const expected = document.getElementById('ps-expected').value.trim();
  if (!action || !expected) { showToast('Acción y resultado esperado son obligatorios.', 'error'); return; }
  try {
    await apiFetch('/projects/' + _activeProjId + '/test-cases/' + _activeTcId + '/steps', {
      method: 'POST',
      body: JSON.stringify({ step_number: num, action, expected_result: expected })
    });
    closeModal('modal-paso');
    document.getElementById('ps-action').value  = '';
    document.getElementById('ps-expected').value= '';
    showToast('Paso agregado.', 'success');
    selectTC(_activeTcId);
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

// ── Sidebar nav collapse ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('nav > div').forEach(function(item) {
    const link = item.querySelector(':scope > a');
    const sub  = item.querySelector(':scope > div');
    const chev = link ? link.querySelector('svg:last-child') : null;
    if (!link) return;
    if (sub) {
      sub.style.overflow   = 'hidden';
      sub.style.transition = 'max-height .25s ease';
      const ia = item.dataset.active === 'true';
      sub.style.maxHeight = ia ? sub.scrollHeight + 'px' : '0';
      if (chev) chev.style.transform = ia ? 'rotate(0deg)' : 'rotate(-90deg)';
    }
    if (!sub) return;
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const io = sub.style.maxHeight !== '0px' && sub.style.maxHeight !== '';
      document.querySelectorAll('nav > div').forEach(function(o) {
        if (o === item) return;
        const s = o.querySelector(':scope > div');
        const c = o.querySelector(':scope > a svg:last-child');
        if (s) s.style.maxHeight = '0';
        if (c) c.style.transform = 'rotate(-90deg)';
      });
      sub.style.maxHeight = io ? '0' : sub.scrollHeight + 'px';
      if (chev) chev.style.transform = io ? 'rotate(-90deg)' : 'rotate(0deg)';
    });
  });
});

loadProjects();
