// views-laboratorio.js — lab-pruebas + lab-dashboard + lab-repo

async function labPruebas() {
  setHTML('content', '<div style="padding:40px;text-align:center;color:var(--muted);">Cargando...</div>');
  try { state.projects = await apiFetch('/api/projects'); } catch { state.projects = []; }
  if (!state.selectedProject && state.projects.length > 0) state.selectedProject = state.projects[0];
  if (state.selectedProject) {
    try { state.testCases = await apiFetch('/api/projects/'+state.selectedProject.id_project+'/test-cases'); }
    catch { state.testCases = []; }
  } else { state.testCases = []; }

  const tc = state.testCases;

  // Badges por status — con etiquetas claras para el estudiante
  const statusBadge = s => ({
    DRAFT:      '<span class="badge badge-muted">⏳ En revisión</span>',
    ACTIVE:     '<span class="badge badge-pass">✓ Aprobado</span>',
    DEPRECATED: '<span class="badge badge-fail">✕ Rechazado</span>',
  })[s] || '<span class="badge badge-muted">'+s+'</span>';

  const typeBadge = t => ({
    FUNCTIONAL:     '<span class="badge badge-blue">Funcional</span>',
    NON_FUNCTIONAL: '<span class="badge badge-warn">No Funcional</span>',
    REGRESSION:     '<span class="badge badge-fail">Regresión</span>',
  })[t] || '<span class="badge badge-muted">'+t+'</span>';

  setHTML('content', `
    <div style="display:flex;gap:16px;height:100%;">

      <!-- Sidebar proyectos -->
      <div style="width:180px;flex-shrink:0;">
        <p class="section-title">Proyectos</p>
        ${state.projects.map(p=>`
          <div class="mod-item ${state.selectedProject?.id_project===p.id_project?'active':''}"
               style="margin-bottom:4px;cursor:pointer;" onclick="selectProject('${p.id_project}')">
            <p style="font-size:12px;font-weight:700;color:var(--navy)">${p.name}</p>
            <p style="font-size:11px;color:var(--muted)">${p.status}</p>
          </div>`).join('') || '<p style="font-size:12px;color:var(--muted)">Sin proyectos</p>'}
        <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px;font-size:12px;"
                onclick="showNewProjectModal()">+ Nuevo proyecto</button>
      </div>

      <!-- Contenido -->
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px;">

        <!-- Stats -->
        <div class="grid-4">
          <div class="stat-card" style="padding:16px;">
            <div class="stat-val" style="font-size:22px;">${tc.length}</div>
            <div class="stat-label">Total casos</div>
          </div>
          <div class="stat-card" style="padding:16px;">
            <div class="stat-val" style="font-size:22px;color:var(--pass)">${tc.filter(t=>t.status==='ACTIVE').length}</div>
            <div class="stat-label">✓ Aprobados</div>
          </div>
          <div class="stat-card" style="padding:16px;">
            <div class="stat-val" style="font-size:22px;color:#D97706">${tc.filter(t=>t.status==='DRAFT').length}</div>
            <div class="stat-label">⏳ En revisión</div>
          </div>
          <div class="stat-card" style="padding:16px;">
            <div class="stat-val" style="font-size:22px;color:var(--fail)">${tc.filter(t=>t.status==='DEPRECATED').length}</div>
            <div class="stat-label">✕ Rechazados</div>
          </div>
        </div>

        <!-- Tabla casos -->
        <div class="card" style="flex:1;overflow:auto;padding:0;">
          <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;font-weight:700;color:var(--navy)">
              ${state.selectedProject?.name || 'Sin proyecto seleccionado'}
            </span>
            ${state.selectedProject
              ? `<button class="btn btn-primary" style="font-size:12px;" onclick="showNewCaseModal()">+ Nuevo caso</button>`
              : ''}
          </div>

          ${tc.length === 0 && state.selectedProject
            ? `<div style="padding:40px;text-align:center;">
                <div style="font-size:28px;margin-bottom:10px">📋</div>
                <p style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:6px">Sin casos de prueba</p>
                <p style="font-size:12px;color:var(--muted)">Crea tu primer caso — el admin lo revisará para aprobarlo al repositorio.</p>
              </div>`
            : `<table class="tbl">
                <thead><tr><th>Título</th><th>Tipo</th><th>Estado</th></tr></thead>
                <tbody>
                  ${tc.map(t=>`
                  <tr>
                    <td style="font-weight:600;color:var(--navy)">${t.title||'—'}</td>
                    <td>${typeBadge(t.type)}</td>
                    <td>${statusBadge(t.status)}</td>
                  </tr>`).join('')}
                </tbody>
              </table>`}

          ${tc.filter(t=>t.status==='DRAFT').length > 0 ? `
          <div style="padding:10px 16px;background:#FFFBEB;border-top:1px solid var(--border);font-size:12px;color:#92400E;">
            ⏳ Tienes ${tc.filter(t=>t.status==='DRAFT').length} caso(s) pendiente(s) de revisión por el administrador.
          </div>` : ''}
        </div>
      </div>
    </div>

    <!-- Modal nuevo caso -->
    <div id="caseModal" class="hidden" style="position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:100;">
      <div style="background:white;border-radius:16px;padding:28px;width:480px;max-width:95vw;">
        <h3 style="font-size:15px;font-weight:800;color:var(--navy);margin-bottom:6px;">Nuevo caso de prueba</h3>
        <p style="font-size:12px;color:var(--muted);margin-bottom:20px;">Se creará en estado <strong>En revisión</strong> hasta que el admin lo apruebe.</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Título *</label>
            <input id="caseTitle" placeholder="Ej: Verificar login con credenciales válidas"
              style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;outline:none;"
              onfocus="this.style.borderColor='var(--bright)'" onblur="this.style.borderColor='var(--border)'">
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Tipo *</label>
            <select id="caseType" style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;outline:none;background:white;">
              <option value="FUNCTIONAL">Funcional</option>
              <option value="NON_FUNCTIONAL">No funcional</option>
              <option value="REGRESSION">Regresión</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Descripción</label>
            <textarea id="caseDesc" rows="2" placeholder="Descripción del caso..."
              style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;outline:none;resize:vertical;"
              onfocus="this.style.borderColor='var(--bright)'" onblur="this.style.borderColor='var(--border)'"></textarea>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Precondiciones</label>
            <textarea id="casePre" rows="2" placeholder="Estado del sistema antes de ejecutar..."
              style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;outline:none;resize:vertical;"
              onfocus="this.style.borderColor='var(--bright)'" onblur="this.style.borderColor='var(--border)'"></textarea>
          </div>
          <div id="caseReqContainer"></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
          <button class="btn btn-outline" onclick="hideCaseModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="submitNewCase()">Crear caso</button>
        </div>
      </div>
    </div>`);
}

async function showNewCaseModal() {
  let reqs = [];
  if (state.selectedProject) {
    try { reqs = await apiFetch('/api/projects/'+state.selectedProject.id_project+'/requirements'); }
    catch { reqs = []; }
  }
  const reqEl = document.getElementById('caseReqContainer');
  if (reqEl) reqEl.innerHTML = reqs.length > 0 ? `
    <div>
      <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Requerimiento</label>
      <select id="caseReq" style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;outline:none;background:white;">
        <option value="">Sin requerimiento</option>
        ${reqs.map(r=>`<option value="${r.id_requirement}">${r.code} — ${(r.description||'').slice(0,50)}</option>`).join('')}
      </select>
    </div>` : '';
  document.getElementById('caseModal')?.classList.remove('hidden');
}

function hideCaseModal() { document.getElementById('caseModal')?.classList.add('hidden'); }

async function submitNewCase() {
  const title = document.getElementById('caseTitle')?.value.trim();
  const type  = document.getElementById('caseType')?.value;
  const desc  = document.getElementById('caseDesc')?.value.trim();
  const pre   = document.getElementById('casePre')?.value.trim();
  const req   = document.getElementById('caseReq')?.value;
  if (!title) { alert('El título es obligatorio'); return; }
  const body = { title, type };
  if (desc) body.description    = desc;
  if (pre)  body.preconditions  = pre;
  if (req)  body.id_requirement = req;
  try {
    const r = await fetch(API+'/api/projects/'+state.selectedProject.id_project+'/test-cases', {
      method:'POST', headers:authH(), body:JSON.stringify(body)
    });
    if (!r.ok) { const e = await r.json(); alert(e.error||'Error al crear'); return; }
    hideCaseModal();
    await labPruebas();
  } catch { alert('Error de conexión'); }
}

async function selectProject(id) {
  state.selectedProject = state.projects.find(p => p.id_project === id);
  await labPruebas();
}

// ── NUEVO PROYECTO CON REQUERIMIENTOS ─────────────────────────────────────
function showNewProjectModal() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="projectModal" style="position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:100;">
      <div style="background:white;border-radius:16px;padding:28px;width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;">
        <h3 style="font-size:15px;font-weight:800;color:var(--navy);margin-bottom:20px;">Nuevo proyecto</h3>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Nombre *</label>
          <input id="projName" placeholder="Ej: App E-commerce v2"
            style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;outline:none;"
            onfocus="this.style.borderColor='var(--bright)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:4px;">Descripción</label>
          <textarea id="projDesc" rows="2"
            style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;outline:none;resize:vertical;"
            onfocus="this.style.borderColor='var(--bright)'" onblur="this.style.borderColor='var(--border)'"></textarea>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <p style="font-size:13px;font-weight:700;color:var(--navy);">Requerimientos</p>
            <button class="btn btn-outline" style="font-size:12px;padding:6px 12px;" onclick="addReqRow()">+ Agregar</button>
          </div>
          <div id="reqRows"></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button class="btn btn-outline" onclick="document.getElementById('projectModal').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="submitNewProject()">Crear proyecto</button>
        </div>
      </div>
    </div>`);
  addReqRow();
}

function addReqRow() {
  const container = document.getElementById('reqRows');
  if (!container) return;
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';
  row.innerHTML = `
    <input placeholder="Código (REQ-001)" data-req="code"
      style="width:120px;padding:8px 12px;border:1.5px solid var(--border);border-radius:10px;font-size:12px;font-family:inherit;outline:none;"
      onfocus="this.style.borderColor='var(--bright)'" onblur="this.style.borderColor='var(--border)'">
    <input placeholder="Descripción del requerimiento" data-req="desc"
      style="flex:1;padding:8px 12px;border:1.5px solid var(--border);border-radius:10px;font-size:12px;font-family:inherit;outline:none;"
      onfocus="this.style.borderColor='var(--bright)'" onblur="this.style.borderColor='var(--border)'">
    <select data-req="priority" style="padding:8px 10px;border:1.5px solid var(--border);border-radius:10px;font-size:12px;font-family:inherit;outline:none;background:white;">
      <option value="MEDIUM">Media</option>
      <option value="HIGH">Alta</option>
      <option value="LOW">Baja</option>
    </select>
    <button onclick="this.parentElement.remove()"
      style="padding:8px 10px;border:1.5px solid var(--border);border-radius:10px;background:white;cursor:pointer;color:var(--fail);">✕</button>`;
  container.appendChild(row);
}

async function submitNewProject() {
  const name = document.getElementById('projName')?.value.trim();
  const desc = document.getElementById('projDesc')?.value.trim();
  if (!name) { alert('El nombre es obligatorio'); return; }
  try {
    const r = await fetch(API+'/api/projects', {
      method:'POST', headers:authH(), body:JSON.stringify({ name, description: desc||'' })
    });
    if (!r.ok) { const e = await r.json(); alert(e.error||'Error'); return; }
    const project = await r.json();
    const rows = document.querySelectorAll('#reqRows > div');
    for (const row of rows) {
      const code        = row.querySelector('[data-req="code"]')?.value.trim();
      const description = row.querySelector('[data-req="desc"]')?.value.trim();
      const priority    = row.querySelector('[data-req="priority"]')?.value;
      if (!code || !description) continue;
      await fetch(API+'/api/projects/'+project.id_project+'/requirements', {
        method:'POST', headers:authH(), body:JSON.stringify({ code, description, priority })
      });
    }
    document.getElementById('projectModal')?.remove();
    state.selectedProject = null;
    await labPruebas();
  } catch { alert('Error de conexión'); }
}

// ── LAB DASHBOARD ──────────────────────────────────────────────────────────
function labDashboard() {
  setHTML('content', `
    <div class="grid-4" style="margin-bottom:20px;">
      ${[[state.projects.length,'Proyectos'],[state.testCases.length,'Casos'],
         [state.testCases.filter(t=>t.status==='ACTIVE').length,'Aprobados'],
         [state.testCases.filter(t=>t.status==='DRAFT').length,'En revisión']].map(([v,l])=>`
      <div class="stat-card"><div class="stat-val">${v}</div><div class="stat-label">${l}</div></div>`).join('')}
    </div>
    <div class="card">
      <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Mis proyectos</h3>
      ${state.projects.length===0
        ? '<p style="color:var(--muted);font-size:13px;">Sin proyectos. Ve al Laboratorio para crear uno.</p>'
        : `<table class="tbl"><thead><tr><th>Nombre</th><th>Estado</th></tr></thead><tbody>
            ${state.projects.map(p=>`<tr>
              <td style="font-weight:600;color:var(--navy)">${p.name}</td>
              <td><span class="badge badge-blue">${p.status}</span></td>
            </tr>`).join('')}
           </tbody></table>`}
    </div>`);
}

// ── REPOSITORIO — casos validados, visibles para todos ────────────────────
async function labRepo() {
  setHTML('content', '<div style="padding:40px;text-align:center;color:var(--muted);">Cargando repositorio...</div>');

  let items = [];
  try {
    const data = await apiFetch('/api/library');
    items = data.libraryTests || data || [];
  } catch { items = []; }

  const typeColor = t => ({FUNCTIONAL:'badge-blue',NON_FUNCTIONAL:'badge-warn',REGRESSION:'badge-fail'})[t]||'badge-muted';
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  setHTML('content', `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <h2 style="font-size:16px;font-weight:800;color:var(--navy)">Repositorio de casos validados</h2>
          <p style="font-size:12px;color:var(--muted);margin-top:2px;">Casos aprobados por el administrador</p>
        </div>
        <span class="badge badge-blue">${items.length} casos</span>
      </div>

      ${categories.length > 0 ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        <button class="pill active" onclick="filterRepo(null,this)">Todos</button>
        ${categories.map(c=>`<button class="pill" onclick="filterRepo('${c}',this)">${c}</button>`).join('')}
      </div>` : ''}

      ${items.length === 0
        ? `<div class="card" style="text-align:center;padding:40px;">
            <div style="font-size:32px;margin-bottom:12px;">📭</div>
            <p style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:8px;">Sin casos en el repositorio</p>
            <p style="font-size:13px;color:var(--muted);">El administrador debe aprobar casos para que aparezcan aquí.</p>
          </div>`
        : `<div class="grid-3" id="repoGrid">
            ${items.map(item=>`
            <div class="card repo-item" data-category="${item.category||''}" style="display:flex;flex-direction:column;gap:10px;">
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <span class="badge ${typeColor(item.type)}">${item.type||'—'}</span>
                <span class="badge badge-pass">✓ Validado</span>
              </div>
              <h3 style="font-size:13px;font-weight:700;color:var(--navy)">${item.title||'Sin título'}</h3>
              <p style="font-size:12px;color:var(--muted);line-height:1.5;flex:1">${item.description||'Sin descripción'}</p>
              ${item.preconditions ? `<p style="font-size:11px;color:var(--muted)"><strong>Pre:</strong> ${item.preconditions.slice(0,80)}...</p>` : ''}
              ${item.category ? `<span style="font-size:11px;color:var(--bright);font-weight:600">📁 ${item.category}</span>` : ''}
              ${item.tags?.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;">${item.tags.map(t=>`<span style="padding:2px 8px;background:var(--sky);border-radius:999px;font-size:11px;color:var(--muted)">${t}</span>`).join('')}</div>` : ''}
              <button class="btn btn-primary" style="justify-content:center;font-size:12px;margin-top:4px;"
                      onclick='exportCase(${JSON.stringify(item).replace(/'/g,"&#39;")})'>↓ Exportar</button>
            </div>`).join('')}
          </div>`}
    </div>`);
}

function filterRepo(category, btn) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn?.classList.add('active');
  document.querySelectorAll('.repo-item').forEach(card => {
    card.style.display = (!category || card.dataset.category === category) ? '' : 'none';
  });
}

function exportCase(item) {
  const content = [
    'CASO DE PRUEBA — QA Learn',
    '══════════════════════════',
    '',
    'Título:       ' + (item.title||'—'),
    'Tipo:         ' + (item.type||'—'),
    'Categoría:    ' + (item.category||'—'),
    'Tags:         ' + (item.tags?.join(', ')||'—'),
    'Validado el:  ' + new Date(item.validated_at).toLocaleDateString('es-CO'),
    '',
    'DESCRIPCIÓN',
    '──────────',
    item.description||'Sin descripción',
    '',
    'PRECONDICIONES',
    '─────────────',
    item.preconditions||'Sin precondiciones',
  ].join('\n');
  const blob = new Blob([content], { type:'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = (item.title||'caso').replace(/\s+/g,'_') + '.txt';
  a.click();
  URL.revokeObjectURL(url);
}