// executions.js — integración de ejecuciones y PASOS dentro de casos de prueba

// ─── Helpers ──────────────────────────────────────────────────────────────────
function closeModals() {
    document.querySelectorAll('[data-modal="true"]').forEach(m => m.remove());
}
function validateSession() {
    const tkn  = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    if (!tkn || !user) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        window.location.href = '../../pages/login.html';
        return false;
    }
    return true;
}
function getToken() { return localStorage.getItem('token') || ''; }
function authHeaders() {
    return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' };
}

// Encuentra el id_project del caso seleccionado mirando el estado global
function getProjectId() {
    return state?.selectedProject?.id_project || null;
}

// ─── Ver detalles del caso + sus pasos ───────────────────────────────────────
async function showCaseDetails(caseId) {
    if (!validateSession()) return;

    const projectId = getProjectId();
    if (!projectId) { alert('No hay proyecto seleccionado.'); return; }

    try {
        // El backend incluye los steps en la respuesta de GET /test-cases/:caseId
        const response = await fetch(
            API + '/api/projects/' + projectId + '/test-cases/' + caseId,
            { headers: { 'Authorization': 'Bearer ' + getToken() } }
        );
        if (!response.ok) throw new Error('Error ' + response.status);
        const testCase = await response.json();

        renderCaseModal(testCase, projectId);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el caso: ' + error.message);
    }
}

function renderCaseModal(testCase, projectId) {
    const modal = document.createElement('div');
    modal.setAttribute('data-modal', 'true');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;overflow-y:auto;padding:20px;';

    const statusBadge = { DRAFT:'badge-muted', ACTIVE:'badge-pass', DEPRECATED:'badge-fail' };
    const typeBadge   = { FUNCTIONAL:'badge-blue', NON_FUNCTIONAL:'badge-warn', REGRESSION:'badge-fail' };

    const steps = Array.isArray(testCase.steps) ? testCase.steps : [];

    // Pre-calcular secciones en variables para evitar backticks anidados
    var descHtml = '';
    if (testCase.description) {
        descHtml = '<div style="margin-bottom:16px;padding:14px;background:#F5F7FF;border-radius:10px;border-left:3px solid var(--bright);">'
                 + '<p style="font-size:11px;font-weight:700;color:var(--muted);margin:0 0 4px;text-transform:uppercase;">Descripción</p>'
                 + '<p style="font-size:13px;color:var(--body);margin:0;white-space:pre-wrap;">' + testCase.description + '</p>'
                 + '</div>';
    }

    var preconHtml = '';
    if (testCase.preconditions) {
        preconHtml = '<div style="margin-bottom:16px;padding:14px;background:#FFFBEB;border-radius:10px;border-left:3px solid #D97706;">'
                   + '<p style="font-size:11px;font-weight:700;color:var(--muted);margin:0 0 4px;text-transform:uppercase;">📍 Precondiciones</p>'
                   + '<p style="font-size:13px;color:var(--body);margin:0;white-space:pre-wrap;">' + testCase.preconditions + '</p>'
                   + '</div>';
    }

    var stepsHtml = steps.length === 0
        ? '<p style="font-size:12px;color:var(--muted);text-align:center;padding:16px;">Sin pasos aún. Agrega el primer paso.</p>'
        : steps.map(function(s) { return renderStepCard(s, testCase.id_test_case); }).join('');

    var execBtnHtml = testCase.status === 'ACTIVE'
        ? '<button data-exec class="btn btn-primary" style="flex:1;">&#9654; Ejecutar caso</button>'
        : '<span style="flex:1;text-align:center;font-size:12px;color:var(--muted);display:flex;align-items:center;justify-content:center;">Solo casos ACTIVE pueden ejecutarse</span>';

    const content = document.createElement('div');
    content.style.cssText = 'background:white;border-radius:16px;padding:28px;width:640px;max-width:95vw;max-height:90vh;overflow-y:auto;';
    content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px;">
            <div>
                <h2 style="font-size:17px;font-weight:800;color:var(--navy);margin:0 0 6px;">&#128203; ${testCase.title || 'Caso de Prueba'}</h2>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <span class="badge ${statusBadge[testCase.status] || 'badge-muted'}">${testCase.status || '&#8212;'}</span>
                    <span class="badge ${typeBadge[testCase.type] || 'badge-muted'}">${testCase.type || '&#8212;'}</span>
                </div>
            </div>
            <button data-close style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--muted);line-height:1;">&#10005;</button>
        </div>

        ${descHtml}
        ${preconHtml}

        <div style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <p style="font-size:13px;font-weight:700;color:var(--navy);margin:0;">&#128290; Pasos de prueba</p>
                <button data-add-step style="font-size:12px;padding:5px 12px;" class="btn btn-primary">+ Agregar paso</button>
            </div>
            <div id="stepsContainer" style="display:flex;flex-direction:column;gap:8px;">
                ${stepsHtml}
            </div>
        </div>

        <div style="display:flex;gap:10px;padding-top:16px;border-top:1px solid var(--border);">
            <button data-close class="btn btn-outline" style="flex:1;">&#8592; Cerrar</button>
            ${execBtnHtml}
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Cerrar modal
    content.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeModals));
    modal.addEventListener('click', e => { if (e.target === modal) closeModals(); });

    // Agregar paso
    content.querySelector('[data-add-step]').addEventListener('click', () => {
        showAddStepForm(testCase.id_test_case, steps.length + 1, () => {
            closeModals();
            showCaseDetails(testCase.id_test_case);
        });
    });

    // Ejecutar caso
    const execBtn = content.querySelector('[data-exec]');
    if (execBtn) {
        execBtn.addEventListener('click', () => {
            closeModals();
            startExecution(testCase.id_test_case);
        });
    }
}

// ─── Render card de un paso ──────────────────────────────────────────────────
function renderStepCard(step, caseId) {
    return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;display:flex;gap:12px;align-items:start;" data-step-id="' + step.id_step + '">'
         + '<div style="min-width:28px;height:28px;border-radius:50%;background:var(--bright);color:white;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
         + step.step_number
         + '</div>'
         + '<div style="flex:1;min-width:0;">'
         + '<p style="font-size:12px;font-weight:700;color:var(--navy);margin:0 0 2px;">Acción</p>'
         + '<p style="font-size:13px;color:var(--body);margin:0 0 8px;white-space:pre-wrap;">' + step.action + '</p>'
         + '<p style="font-size:12px;font-weight:700;color:var(--muted);margin:0 0 2px;">Resultado esperado</p>'
         + '<p style="font-size:13px;color:var(--body);margin:0;white-space:pre-wrap;">' + step.expected_result + '</p>'
         + '</div>'
         + '<div style="display:flex;gap:6px;flex-shrink:0;">'
         + '<button onclick="showEditStepForm(\'' + caseId + '\',\'' + step.id_step + '\',' + step.step_number + ',\'' + encodeURIComponent(step.action) + '\',\'' + encodeURIComponent(step.expected_result) + '\')"'
         + ' style="background:none;border:1px solid var(--border);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;color:var(--navy);">✏️</button>'
         + '<button onclick="deleteStep(\'' + caseId + '\',\'' + step.id_step + '\')"'
         + ' style="background:none;border:1px solid var(--border);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;color:var(--fail);">🗑</button>'
         + '</div></div>';
}

// ─── Agregar paso ─────────────────────────────────────────────────────────────
function showAddStepForm(caseId, suggestedNumber, onSuccess) {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1100;';
    overlay.innerHTML = `
        <div style="background:white;border-radius:14px;padding:24px;width:480px;max-width:95vw;">
            <h3 style="font-size:15px;font-weight:800;color:var(--navy);margin:0 0 16px;">➕ Nuevo paso</h3>
            <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
                <div>
                    <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">N° de paso *</label>
                    <input id="newStepNum" type="number" min="1" value="${suggestedNumber}"
                        style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;">
                </div>
                <div>
                    <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Acción *</label>
                    <textarea id="newStepAction" rows="3" placeholder="Ej: Ingresar usuario y contraseña válidos y hacer click en Ingresar"
                        style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;resize:vertical;"></textarea>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Resultado esperado *</label>
                    <textarea id="newStepExpected" rows="2" placeholder="Ej: El sistema redirige al dashboard"
                        style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;resize:vertical;"></textarea>
                </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button id="cancelAddStep" class="btn btn-outline">Cancelar</button>
                <button id="confirmAddStep" class="btn btn-primary">Guardar paso</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);
    overlay.querySelector('#cancelAddStep').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#confirmAddStep').addEventListener('click', async () => {
        const step_number   = parseInt(overlay.querySelector('#newStepNum').value);
        const action        = overlay.querySelector('#newStepAction').value.trim();
        const expected_result = overlay.querySelector('#newStepExpected').value.trim();

        if (!action || !expected_result) { alert('Acción y resultado esperado son obligatorios'); return; }
        if (!step_number || step_number < 1) { alert('El número de paso debe ser al menos 1'); return; }

        try {
            const r = await fetch(API + '/api/test-cases/' + caseId + '/steps', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ step_number, action, expected_result })
            });
            if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Error al crear paso'); }
            overlay.remove();
            if (onSuccess) onSuccess();
        } catch (err) { alert('Error: ' + err.message); }
    });
}

// ─── Editar paso ──────────────────────────────────────────────────────────────
function showEditStepForm(caseId, stepId, currentNum, encodedAction, encodedExpected) {
    const action   = decodeURIComponent(encodedAction);
    const expected = decodeURIComponent(encodedExpected);

    const overlay = document.createElement('div');
    overlay.setAttribute('data-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1100;';
    overlay.innerHTML = `
        <div style="background:white;border-radius:14px;padding:24px;width:480px;max-width:95vw;">
            <h3 style="font-size:15px;font-weight:800;color:var(--navy);margin:0 0 16px;">✏️ Editar paso ${currentNum}</h3>
            <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
                <div>
                    <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">N° de paso *</label>
                    <input id="editStepNum" type="number" min="1" value="${currentNum}"
                        style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;">
                </div>
                <div>
                    <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Acción *</label>
                    <textarea id="editStepAction" rows="3"
                        style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;resize:vertical;">${action}</textarea>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Resultado esperado *</label>
                    <textarea id="editStepExpected" rows="2"
                        style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;resize:vertical;">${expected}</textarea>
                </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button id="cancelEdit" class="btn btn-outline">Cancelar</button>
                <button id="confirmEdit" class="btn btn-primary">Guardar cambios</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);
    overlay.querySelector('#cancelEdit').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#confirmEdit').addEventListener('click', async () => {
        const step_number    = parseInt(overlay.querySelector('#editStepNum').value);
        const actionVal      = overlay.querySelector('#editStepAction').value.trim();
        const expectedVal    = overlay.querySelector('#editStepExpected').value.trim();

        if (!actionVal || !expectedVal) { alert('Todos los campos son obligatorios'); return; }

        try {
            const r = await fetch(API + '/api/test-cases/' + caseId + '/steps/' + stepId, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ step_number, action: actionVal, expected_result: expectedVal })
            });
            if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Error al editar'); }
            overlay.remove();
            closeModals();
            showCaseDetails(caseId);
        } catch (err) { alert('Error: ' + err.message); }
    });
}

// ─── Eliminar paso ────────────────────────────────────────────────────────────
async function deleteStep(caseId, stepId) {
    if (!confirm('¿Eliminar este paso?')) return;
    try {
        const r = await fetch(API + '/api/test-cases/' + caseId + '/steps/' + stepId, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Error al eliminar'); }
        closeModals();
        showCaseDetails(caseId);
    } catch (err) { alert('Error: ' + err.message); }
}

// ─── Ejecutar caso ────────────────────────────────────────────────────────────
async function startExecution(caseId) {
    const modal = document.createElement('div');
    modal.setAttribute('data-modal', 'true');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;';

    const results = [
        {val:'PASS',    label:'✅ PASÓ'},
        {val:'FAIL',    label:'❌ FALLÓ'},
        {val:'BLOCKED', label:'⛔ BLOQUEADO'},
        {val:'SKIP',    label:'⏭ OMITIDO'}
    ];

    var resultsHtml = results.map(function(r) {
        return '<label style="cursor:pointer;padding:12px;border:2px solid var(--border);border-radius:8px;text-align:center;transition:.15s;" data-result-label>'
             + '<input type="radio" name="exec-result" value="' + r.val + '" style="display:none;">'
             + '<span style="font-size:12px;font-weight:700;color:var(--navy);">' + r.label + '</span>'
             + '</label>';
    }).join('');

    const content = document.createElement('div');
    content.style.cssText = 'background:white;border-radius:16px;padding:28px;width:520px;max-width:95vw;';
    content.innerHTML = `
        <h3 style="font-size:16px;font-weight:800;color:var(--navy);margin:0 0 20px;">▶ Ejecutar Caso</h3>
        <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:20px;">
            <div>
                <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:8px;">Resultado *</label>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                    ${resultsHtml}
                </div>
            </div>
            <div>
                <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:6px;">Observaciones</label>
                <textarea id="execObservations" rows="3" placeholder="Describe lo que sucedió..."
                    style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;resize:vertical;outline:none;"></textarea>
            </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn btn-outline" data-close>Cancelar</button>
            <button class="btn btn-primary" id="submitExecBtn">✓ Registrar y agregar evidencia</button>
        </div>`;

    // Estilo de selección de resultado
    content.querySelectorAll('[data-result-label]').forEach(lbl => {
        lbl.querySelector('input').addEventListener('change', function() {
            content.querySelectorAll('[data-result-label]').forEach(l => l.style.borderColor = 'var(--border)');
            this.closest('[data-result-label]').style.borderColor = 'var(--bright)';
        });
    });

    content.querySelector('[data-close]').addEventListener('click', closeModals);
    content.querySelector('#submitExecBtn').addEventListener('click', () => submitExecution(caseId));

    modal.appendChild(content);
    modal.addEventListener('click', e => { if (e.target === modal) closeModals(); });
    document.body.appendChild(modal);
}

// ─── Enviar ejecución ─────────────────────────────────────────────────────────
async function submitExecution(caseId) {
    const checked = document.querySelector('input[name="exec-result"]:checked');
    if (!checked) { alert('Selecciona un resultado'); return; }

    const observations = (document.getElementById('execObservations')?.value || '').trim();
    const btn = document.getElementById('submitExecBtn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Registrando...'; }

    try {
        const r = await fetch(API + '/api/executions', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                id_test_case: caseId,
                result: checked.value,
                observations
            })
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Error al registrar'); }

        const data = await r.json();
        // data.execution.id_execution  — el id real de la ejecución recién creada
        const executionId = data.execution?.id_execution || data.id_execution;

        closeModals();

        // Ofrecer subir evidencia con el id_execution real
        if (executionId) {
            showEvidenceUploadModal(executionId, caseId);
        } else {
            alert('Ejecución registrada correctamente');
        }
    } catch (err) {
        console.error('Error en submitExecution:', err);
        alert('Error: ' + err.message);
        if (btn) { btn.disabled = false; btn.textContent = '✓ Registrar y agregar evidencia'; }
    }
}

// ─── Modal para subir evidencia tras crear la ejecución ───────────────────────
function showEvidenceUploadModal(executionId, caseId) {
    const modal = document.createElement('div');
    modal.setAttribute('data-modal', 'true');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;';

    const content = document.createElement('div');
    content.style.cssText = 'background:white;border-radius:16px;padding:28px;width:520px;max-width:95vw;';
    content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-size:16px;font-weight:800;color:var(--navy);margin:0;">✅ Ejecución registrada</h3>
            <button data-close style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--muted);">✕</button>
        </div>
        <p style="font-size:13px;color:var(--muted);margin:0 0 16px;">¿Deseas agregar evidencia a esta ejecución?</p>
        <div id="uploadContainer"></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
            <button data-close class="btn btn-outline">Cerrar sin evidencia</button>
        </div>`;

    content.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeModals));
    modal.appendChild(content);
    modal.addEventListener('click', e => { if (e.target === modal) closeModals(); });
    document.body.appendChild(modal);

    // Ahora sí pasamos el id_execution real al widget de upload
    createUploadWidget('uploadContainer', null, executionId, caseId);
}

// ─── Historial de ejecuciones ─────────────────────────────────────────────────
async function viewExecutionHistory(caseId) {
    try {
        const r = await fetch(API + '/api/executions/test-case/' + caseId, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!r.ok) throw new Error('Error ' + r.status);
        const data = await r.json();
        const executions = normalizeArrayResponse(data);

        const modal = document.createElement('div');
        modal.setAttribute('data-modal', 'true');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;overflow-y:auto;padding:20px;';

        const content = document.createElement('div');
        content.style.cssText = 'background:white;border-radius:16px;padding:28px;width:700px;max-width:95vw;max-height:90vh;overflow-y:auto;';

        const resultColors = {
            PASS:    { bg:'#E8F5E9', color:'#2E7D32', label:'✅ PASÓ' },
            FAIL:    { bg:'#FFEBEE', color:'#C62828', label:'❌ FALLÓ' },
            BLOCKED: { bg:'#FFF3E0', color:'#E65100', label:'⛔ BLOQUEADO' },
            SKIP:    { bg:'#F3F4F6', color:'#374151', label:'⏭ OMITIDO' },
        };

        var historyRowsHtml = executions.map(function(ex, i) {
            const c = resultColors[ex.result] || { bg:'#F3F4F6', color:'#374151', label: ex.result };
            const date = new Date(ex.executed_at).toLocaleString('es-CO');
            return '<tr style="border-bottom:1px solid var(--border);' + (i%2===0?'background:#FAFAFA':'') + '">'
                 + '<td style="padding:10px;font-size:12px;">' + date + '</td>'
                 + '<td style="padding:10px;text-align:center;">'
                 + '<span style="padding:3px 10px;border-radius:6px;font-weight:700;font-size:11px;background:' + c.bg + ';color:' + c.color + ';">' + c.label + '</span>'
                 + '</td>'
                 + '<td style="padding:10px;font-size:12px;color:var(--body);">' + (ex.observations || '—') + '</td>'
                 + '<td style="padding:10px;text-align:center;">'
                 + '<button onclick="loadAndViewEvidences(\'' + ex.id_execution + '\')" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:11px;font-weight:700;color:var(--bright);">📎 Ver</button>'
                 + '</td>'
                 + '</tr>';
        }).join('');

        var historyBodyHtml = executions.length === 0
            ? '<p style="text-align:center;color:var(--muted);padding:20px;">Sin ejecuciones registradas.</p>'
            : '<table style="width:100%;border-collapse:collapse;font-size:13px;">'
            + '<thead><tr style="border-bottom:2px solid var(--border);">'
            + '<th style="padding:10px;text-align:left;font-size:11px;color:var(--muted);text-transform:uppercase;">Fecha</th>'
            + '<th style="padding:10px;text-align:center;font-size:11px;color:var(--muted);text-transform:uppercase;">Resultado</th>'
            + '<th style="padding:10px;text-align:left;font-size:11px;color:var(--muted);text-transform:uppercase;">Observaciones</th>'
            + '<th style="padding:10px;text-align:center;font-size:11px;color:var(--muted);text-transform:uppercase;">Evidencias</th>'
            + '</tr></thead><tbody>' + historyRowsHtml + '</tbody></table>';

        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="font-size:16px;font-weight:800;color:var(--navy);margin:0;">📊 Historial de ejecuciones</h3>
                <button data-close style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted);">✕</button>
            </div>
            ${historyBodyHtml}`;

        content.querySelector('[data-close]').addEventListener('click', closeModals);
        modal.appendChild(content);
        modal.addEventListener('click', e => { if (e.target === modal) closeModals(); });
        document.body.appendChild(modal);
    } catch (err) { alert('Error: ' + err.message); }
}

// ─── Cargar y mostrar evidencias desde id_execution ──────────────────────────
async function loadAndViewEvidences(executionId) {
    try {
        const r = await fetch(API + '/api/executions/' + executionId + '/evidences', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!r.ok) throw new Error('Error ' + r.status);
        const data = await r.json();
        const evidences = normalizeArrayResponse(data);
        viewEvidences(evidences);
    } catch (err) {
        alert('Error al cargar evidencias: ' + err.message);
    }
}

// ─── Ver evidencias ───────────────────────────────────────────────────────────
async function viewEvidences(evidences) {
    const modal = document.createElement('div');
    modal.setAttribute('data-modal', 'true');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1001;overflow-y:auto;padding:20px;';

    const content = document.createElement('div');
    content.style.cssText = 'background:white;border-radius:16px;padding:28px;width:700px;max-width:95vw;max-height:90vh;overflow-y:auto;';

    var evidencesHtml;
    if (!evidences || evidences.length === 0) {
        evidencesHtml = '<div style="text-align:center;padding:32px;"><div style="font-size:32px;margin-bottom:8px;">📭</div><p style="color:var(--muted);font-size:13px;">Sin evidencias para esta ejecución</p></div>';
    } else {
        evidencesHtml = evidences.map(function(ev) {
            const icon = ev.type === 'SCREENSHOT' ? '📷' : ev.type === 'VIDEO' ? '🎥' : '📄';
            const size  = ((ev.file_size || 0) / 1024).toFixed(1);
            // file_url contiene el nombre del archivo guardado por multer
            const fileRef = ev.file_url || '';
            return '<div style="border:1px solid var(--border);border-radius:12px;padding:16px;">'
                 + '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">'
                 + '<div>'
                 + '<p style="font-size:12px;font-weight:700;color:var(--navy);margin:0 0 2px;">' + icon + ' ' + ev.type + '</p>'
                 + '<p style="font-size:11px;color:var(--muted);margin:0;">'
                 + (ev.original_filename || fileRef || 'Archivo') + (size > 0 ? ' • ' + size + 'KB' : '')
                 + '</p>'
                 + (ev.description ? '<p style="font-size:12px;color:var(--muted);margin:4px 0 0;">' + ev.description + '</p>' : '')
                 + '</div>'
                 + '<a href="' + API + '/uploads/' + fileRef + '" download'
                 + ' style="padding:5px 14px;background:var(--bright);color:white;border-radius:6px;font-size:11px;text-decoration:none;font-weight:700;">↓ Descargar</a>'
                 + '</div>'
                 + getFilePreview(fileRef, ev.type)
                 + '</div>';
        }).join('');
    }

    content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-size:16px;font-weight:800;color:var(--navy);margin:0;">📎 Evidencias</h3>
            <button data-close style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted);">✕</button>
        </div>
        <div style="display:grid;gap:16px;">
            ${evidencesHtml}
        </div>`;

    content.querySelector('[data-close]').addEventListener('click', closeModals);
    modal.appendChild(content);
    modal.addEventListener('click', e => { if (e.target === modal) closeModals(); });
    document.body.appendChild(modal);
}
