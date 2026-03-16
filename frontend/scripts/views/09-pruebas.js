/* ── 09-pruebas.js ────────────────────────────────────────────────────── */
import { projects, requirements, testCases, steps, executions } from '../../services/api.js';
import { QAStore }     from '../state/store.js';
import { requireAuth } from '../../components/auth-guard.js';
import { initSidebar } from '../../components/sidebar.js';
import { showLoading, showError, showEmpty, showToast, setBtnLoading, badge } from '../ui/ui-shared.js';
import { renderReqRow, renderTCRow, renderStepRow, renderExecRow } from '../ui/ui-laboratorio.js';

requireAuth();
initSidebar('pruebas');

document.getElementById('topbar-name').textContent     = QAStore.displayName();
document.getElementById('topbar-initials').textContent = QAStore.initials();

const params = new URLSearchParams(window.location.search);
const PID    = params.get('id');
if (!PID) window.location.href = '08-dashboard-laboratorio.html';

let activeTab = 'req';
let activeTcId = null;

// ── Tab switching ──────────────────────────────────────────────────────
window.setTab = (tab) => {
  activeTab = tab;
  ['req', 'tc', 'exec'].forEach(t => {
    const btn   = document.getElementById(`tab-${t}`);
    const panel = document.getElementById(`panel-${t}`);
    const on    = t === tab;
    btn.style.borderBottomColor = on ? '#3B5BDB' : 'transparent';
    btn.style.color             = on ? '#3B5BDB' : '#4A5073';
    btn.style.fontWeight        = on ? '700' : '500';
    panel.classList.toggle('hidden', !on);
  });
  if (tab === 'req')  loadReqs();
  if (tab === 'tc')   loadTCs();
  if (tab === 'exec') loadExecs();
};

// ── Inicializar proyecto ───────────────────────────────────────────────
async function init() {
  try {
    const data = await projects.getById(PID);
    const p    = data?.id_project ? data : (data.project || data);
    document.getElementById('proj-name').textContent   = p.name        || '—';
    document.getElementById('proj-desc').textContent   = p.description || '';
    document.getElementById('proj-status').innerHTML   = badge(p.status || 'ACTIVE');
  } catch {
    showToast('No se pudo cargar el proyecto.', 'error');
  }
  setTab('req');
}

// ── REQUERIMIENTOS ─────────────────────────────────────────────────────
async function loadReqs() {
  showLoading('panel-req');
  try {
    const data = await requirements.getAll(PID);
    const list = Array.isArray(data) ? data : (data.requirements || []);

    document.getElementById('panel-req').innerHTML =
      `<div style="display:flex;justify-content:flex-end;margin-bottom:12px">
         <button onclick="openReqModal()" style="background:#3B5BDB;color:white;border:none;padding:7px 14px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer">+ Nuevo requerimiento</button>
       </div>
       ${list.length
         ? `<div style="display:flex;flex-direction:column;gap:8px">${list.map(renderReqRow).join('')}</div>`
         : `<div style="text-align:center;padding:40px 0;font-size:13px;color:#4A5073">Sin requerimientos. Crea el primero.</div>`}`;
  } catch { showError('panel-req', 'Error al cargar requerimientos.'); }
}

window.openReqModal  = () => { document.getElementById('req-modal').classList.remove('hidden'); document.getElementById('req-form').reset(); };
window.closeReqModal = () => document.getElementById('req-modal').classList.add('hidden');

document.getElementById('req-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    code:        document.getElementById('req-code').value.trim(),
    description: document.getElementById('req-desc').value.trim(),
    priority:    document.getElementById('req-prio').value,
    status:      'DRAFT',
  };
  if (!body.code || !body.description) { showToast('Código y descripción son obligatorios.', 'error'); return; }
  const btn = document.getElementById('save-req-btn');
  setBtnLoading(btn, true);
  try {
    await requirements.create(PID, body);
    showToast('Requerimiento creado.', 'success');
    closeReqModal();
    loadReqs();
  } catch (err) {
    showToast(err.message || 'Error al guardar.', 'error');
  } finally { setBtnLoading(btn, false); }
});

// ── CASOS DE PRUEBA ────────────────────────────────────────────────────
async function loadTCs() {
  showLoading('panel-tc');
  try {
    const data  = await testCases.getAll(PID);
    const list  = Array.isArray(data) ? data : (data.testCases || data.test_cases || []);

    document.getElementById('panel-tc').innerHTML =
      `<div style="display:flex;justify-content:flex-end;margin-bottom:12px">
         <button onclick="openTCModal()" style="background:#3B5BDB;color:white;border:none;padding:7px 14px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer">+ Nuevo caso de prueba</button>
       </div>
       ${list.length
         ? `<div style="display:flex;flex-direction:column;gap:8px">${list.map(renderTCRow).join('')}</div>`
         : `<div style="text-align:center;padding:40px 0;font-size:13px;color:#4A5073">Sin casos de prueba. Crea el primero.</div>`}`;
  } catch { showError('panel-tc', 'Error al cargar casos de prueba.'); }
}

window.openTCModal  = () => { document.getElementById('tc-modal').classList.remove('hidden'); document.getElementById('tc-form').reset(); };
window.closeTCModal = () => document.getElementById('tc-modal').classList.add('hidden');

document.getElementById('tc-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    title:         document.getElementById('tc-title').value.trim(),
    description:   document.getElementById('tc-desc').value.trim(),
    preconditions: document.getElementById('tc-precond').value.trim(),
    type:          document.getElementById('tc-type').value,
    status:        'DRAFT',
  };
  if (!body.title) { showToast('El título es obligatorio.', 'error'); return; }
  const btn = document.getElementById('save-tc-btn');
  setBtnLoading(btn, true);
  try {
    await testCases.create(PID, body);
    showToast('Caso de prueba creado.', 'success');
    closeTCModal();
    loadTCs();
  } catch (err) {
    showToast(err.message || 'Error al guardar.', 'error');
  } finally { setBtnLoading(btn, false); }
});

// ── DETALLE CASO DE PRUEBA + DRAWER ───────────────────────────────────
window.openTC = async (tcId) => {
  activeTcId = tcId;
  const drawer  = document.getElementById('tc-drawer');
  const overlay = document.getElementById('drawer-overlay');
  drawer.classList.add('open');
  overlay.classList.remove('hidden');

  showLoading('d-steps');
  showLoading('d-execs');

  try {
    // GET /api/projects/:id/test-cases/:cId → objeto directo
    const tc = await testCases.getById(PID, tcId);
    const t  = tc?.id_test_case ? tc : (tc.testCase || tc);
    const tl = { FUNCTIONAL:'Funcional', NON_FUNCTIONAL:'No Funcional', REGRESSION:'Regresión' };

    document.getElementById('d-title').textContent   = t.title || '—';
    document.getElementById('d-type').textContent    = tl[t.type] || t.type || '—';
    document.getElementById('d-status').innerHTML    = badge(t.status);
    document.getElementById('d-desc').textContent    = t.description   || 'Sin descripción.';
    document.getElementById('d-precond').textContent = t.preconditions || 'Sin precondiciones.';

    // Pasos: array directo
    const stepsData = await steps.getAll(PID, tcId);
    const stepsList = Array.isArray(stepsData) ? stepsData : (stepsData.steps || []);
    stepsList.sort((a, b) => a.step_number - b.step_number);

    document.getElementById('d-steps').innerHTML = stepsList.length
      ? `<div style="display:flex;flex-direction:column;gap:8px">${stepsList.map(renderStepRow).join('')}</div>
         <button onclick="openStepModal()" style="margin-top:10px;width:100%;padding:8px;border-radius:9px;border:2px dashed #D0D9F0;background:transparent;font-size:12px;font-weight:700;color:#4A5073;cursor:pointer;transition:all .15s"
           onmouseover="this.style.borderColor='#3B5BDB';this.style.color='#3B5BDB'"
           onmouseout="this.style.borderColor='#D0D9F0';this.style.color='#4A5073'">+ Agregar paso</button>`
      : `<div style="text-align:center;padding:16px;font-size:13px;color:#4A5073">Sin pasos. <button onclick="openStepModal()" style="color:#3B5BDB;font-weight:700;background:none;border:none;cursor:pointer;text-decoration:underline">+ Agregar</button></div>`;

    // Ejecuciones: { executions: [...] }
    const execData = await executions.getByTestCase(tcId);
    const execList = execData?.executions || (Array.isArray(execData) ? execData : []);

    document.getElementById('d-execs').innerHTML = execList.length
      ? `<div style="display:flex;flex-direction:column;gap:8px">${execList.map(renderExecRow).join('')}</div>`
      : `<div style="text-align:center;padding:16px;font-size:13px;color:#4A5073">Sin ejecuciones. <button onclick="openExecModal()" style="color:#3B5BDB;font-weight:700;background:none;border:none;cursor:pointer;text-decoration:underline">+ Registrar</button></div>`;

    document.getElementById('d-add-step').onclick = openStepModal;
    document.getElementById('d-add-exec').onclick = openExecModal;

  } catch (err) {
    showToast('Error al cargar el caso de prueba.', 'error');
  }
};

window.closeDrawer = () => {
  document.getElementById('tc-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.add('hidden');
};
document.getElementById('drawer-overlay')?.addEventListener('click', window.closeDrawer);

// ── Modal paso ─────────────────────────────────────────────────────────
window.openStepModal  = () => { document.getElementById('step-modal').classList.remove('hidden'); document.getElementById('step-form').reset(); document.getElementById('step-num').value = '1'; };
window.closeStepModal = () => document.getElementById('step-modal').classList.add('hidden');

document.getElementById('step-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    step_number:     parseInt(document.getElementById('step-num').value) || 1,
    action:          document.getElementById('step-action').value.trim(),
    expected_result: document.getElementById('step-expected').value.trim(),
  };
  if (!body.action || !body.expected_result) { showToast('Acción y resultado esperado son obligatorios.', 'error'); return; }
  const btn = document.getElementById('save-step-btn');
  setBtnLoading(btn, true);
  try {
    await steps.create(PID, activeTcId, body);
    showToast('Paso agregado.', 'success');
    closeStepModal();
    openTC(activeTcId);
  } catch (err) {
    showToast(err.message || 'Error al agregar paso.', 'error');
  } finally { setBtnLoading(btn, false); }
});

// ── Modal ejecución ────────────────────────────────────────────────────
window.openExecModal  = () => { document.getElementById('exec-modal').classList.remove('hidden'); document.getElementById('exec-form').reset(); };
window.closeExecModal = () => document.getElementById('exec-modal').classList.add('hidden');

document.getElementById('exec-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    id_test_case: activeTcId,
    result:       document.getElementById('exec-result').value,
    observations: document.getElementById('exec-obs').value.trim() || null,
  };
  const btn = document.getElementById('save-exec-btn');
  setBtnLoading(btn, true);
  try {
    await executions.create(body);
    showToast('Ejecución registrada.', 'success');
    closeExecModal();
    openTC(activeTcId);
  } catch (err) {
    showToast(err.message || 'Error al registrar ejecución.', 'error');
  } finally { setBtnLoading(btn, false); }
});

// ── Tab ejecuciones del proyecto ───────────────────────────────────────
async function loadExecs() {
  showLoading('panel-exec');
  try {
    const data = await executions.getAll();
    const list = data?.executions || (Array.isArray(data) ? data : []);
    if (!list.length) { showEmpty('panel-exec', 'Sin ejecuciones registradas.'); return; }
    document.getElementById('panel-exec').innerHTML =
      `<div style="display:flex;flex-direction:column;gap:8px">${list.slice(0, 30).map(renderExecRow).join('')}</div>`;
  } catch { showError('panel-exec', 'Error al cargar ejecuciones.'); }
}

init();
