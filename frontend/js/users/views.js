// views.js — render de cada vista

function dashboard() {
  el('content').innerHTML = `
    <div class="grid-4" style="margin-bottom:20px;">
      ${[ ['68%','Ruta completada','var(--bright)'],['1/3','Módulos completados','var(--bright)'],['18/26','Cursos completados','var(--bright)'],['24.5h','Tiempo total invertido','var(--bright)'] ].map(([v,l,c])=>`
      <div class="stat-card"><div style="width:32px;height:32px;background:var(--sky);border-radius:8px;margin-bottom:12px;"></div>
        <div class="stat-val" style="color:${c}">${v}</div><div class="stat-label">${l}</div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:68%"></div></div>
      </div>`).join('')}
    </div>
    <div class="grid-2" style="margin-bottom:20px;align-items:start;">
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:16px;">Progreso por módulo</h3>
        ${[['Fundamentos del Testing',100,'var(--pass)'],['Diseño de Casos de Prueba',50,'var(--bright)'],['Gestión de Bugs y Reportes',0,'var(--border)']].map(([n,p,c])=>`
        <div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;color:var(--navy)">${n}</span>
            <span style="font-size:13px;font-weight:700;color:${p===100?'var(--pass)':p>0?'var(--bright)':'var(--muted)'}">${p}%</span>
          </div>
          <div class="prog"><div class="prog-fill" style="width:${p}%;background:${c}"></div></div>
        </div>`).join('')}
      </div>
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:16px;">Cursos completados esta semana</h3>
        <div style="display:flex;gap:8px;justify-content:space-between;">
          ${[['Lu',2],['Ma',3],['Mi',0],['Ju',5],['Vi',4],['Sá',1],['Do',0]].map(([d,n])=>`
          <div style="text-align:center;">
            <div style="font-size:13px;font-weight:700;color:${n>0?'var(--bright)':'var(--muted)'};">${n}</div>
            <div style="width:4px;height:${Math.max(n*8,4)}px;background:${n>0?'var(--bright)':'var(--border)'};border-radius:4px;margin:4px auto;"></div>
            <div style="font-size:11px;color:var(--muted);">${d}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="grid-2" style="align-items:start;">
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Últimos cursos completados</h3>
        <table class="tbl">
          <thead><tr><th>Curso</th><th>Módulo</th><th>Fecha</th></tr></thead>
          <tbody>
            ${[['Tipos de pruebas de software','Fundamentos','Ayer'],['Ciclo de vida del bug','Fundamentos','Hace 2 días'],['Técnicas de diseño de casos','Diseño de Casos','Hace 3 días'],['Introducción al QA Testing','Fundamentos','Hace 5 días']].map(([c,m,f])=>`
            <tr><td>${c}</td><td style="color:var(--muted)">${m}</td><td style="color:var(--muted)">${f}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="background:linear-gradient(135deg,#1E3A5F,#2563eb);border-radius:14px;padding:24px;color:white;">
        <div style="font-size:24px;margin-bottom:8px;">🔥</div>
        <p style="font-weight:800;font-size:15px;margin-bottom:6px;">¡5 días activos seguidos!</p>
        <p style="font-size:12px;opacity:.8;margin-bottom:16px;">Mantén el ritmo, estás en el 15% superior de tu cohorte.</p>
        <button class="btn" style="background:white;color:var(--bright);width:100%;justify-content:center;" onclick="navigate('ruta')">Continuar aprendizaje →</button>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// VISTA: LABORATORIO > PRUEBAS
// ══════════════════════════════════════════

function labPruebas() {
  const statusBadge = s => ({ Aprobado:'badge-pass', Fallido:'badge-fail', 'No probado':'badge-muted', Bloqueado:'badge-warn' })[s] || 'badge-muted';
  const prioBadge   = p => p==='Alto' ? 'badge-fail' : p==='Medio' ? 'badge-warn' : 'badge-muted';

  el('content').innerHTML = `
    <div style="display:flex;gap:16px;height:100%;">
      <!-- Sidebar proyectos -->
      <div style="width:180px;flex-shrink:0;">
        <p class="section-title">Proyectos</p>
        ${MOCK.projects.map((p,i)=>`
        <div class="mod-item ${i===0?'active':''}" style="margin-bottom:4px;">
          <p style="font-size:12px;font-weight:700;color:var(--navy)">${p.name}</p>
          <p style="font-size:11px;color:var(--muted)">${p.total} casos</p>
        </div>`).join('')}
        <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px;font-size:12px;">+ Nuevo proyecto</button>
      </div>
      <!-- Contenido -->
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <p style="font-size:12px;color:var(--muted)">Proyectos / App E-commerce v2.4 / Laboratorio manual</p>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline" style="font-size:12px;">↑ Exportar</button>
            <button class="btn btn-primary" style="font-size:12px;">+ Nuevo caso</button>
          </div>
        </div>
        <!-- Stats -->
        <div class="grid-4">
          <div class="stat-card" style="padding:16px;"><div class="stat-val" style="font-size:22px;">124</div><div class="stat-label">Total casos</div></div>
          <div class="stat-card" style="padding:16px;"><div class="stat-val" style="font-size:22px;color:var(--pass)">82</div><div class="stat-label">✓ Aprobados 76.4%</div></div>
          <div class="stat-card" style="padding:16px;"><div class="stat-val" style="font-size:22px;color:var(--fail)">12</div><div class="stat-label">✗ Fallidos 9.3%</div></div>
          <div class="stat-card" style="padding:16px;"><div class="stat-val" style="font-size:22px;color:var(--warn)">5</div><div class="stat-label">⚠ Bloqueados 4%</div></div>
        </div>
        <!-- Tabla -->
        <div class="card" style="flex:1;overflow:auto;padding:0;">
          <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;gap:12px;">
            ${['Todos','Sin probar','Fallidos'].map((t,i)=>`<button style="font-size:13px;font-weight:600;padding:6px 0;border:none;background:none;cursor:pointer;color:${i===0?'var(--bright)':'var(--muted)'};border-bottom:${i===0?'2px solid var(--bright)':'2px solid transparent'}">${t}</button>`).join('')}
          </div>
          <table class="tbl">
            <thead><tr><th>ID</th><th>Título</th><th>Prioridad</th><th>Requisito</th><th>Estado</th></tr></thead>
            <tbody>
              ${MOCK.testCases.map(tc=>`
              <tr>
                <td class="tc-id">${tc.id}</td>
                <td><div>${tc.title}</div><div class="tc-sub">${tc.sub}</div></td>
                <td><span class="badge ${prioBadge(tc.prio)}">${tc.prio}</span></td>
                <td style="color:var(--bright);font-weight:600">${tc.req}</td>
                <td><span class="badge ${statusBadge(tc.status)}">${tc.status}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
          <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border);">
            <span style="font-size:12px;color:var(--muted)">Mostrando 1-4 de 124 casos</span>
            <div style="display:flex;gap:8px;"><button class="btn btn-outline" style="font-size:12px;">Anterior</button><button class="btn btn-outline" style="font-size:12px;">Siguiente</button></div>
          </div>
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// VISTA: LABORATORIO > DASHBOARD
// ══════════════════════════════════════════

function labDashboard() {
  el('content').innerHTML = `
    <div class="grid-4" style="margin-bottom:20px;">
      ${[['4','Proyectos creados'],['219','Casos ejecutados'],['76%','Tasa de éxito'],['12','Del repositorio']].map(([v,l])=>`
      <div class="stat-card"><div class="stat-val" style="color:${v==='76%'?'var(--pass)':'var(--navy)'}">${v}</div><div class="stat-label">${l}</div>
        ${v==='76%'?`<div class="prog" style="margin-top:10px"><div class="prog-fill" style="width:76%;background:var(--pass)"></div></div>`:''}
      </div>`).join('')}
    </div>
    <div class="grid-2" style="margin-bottom:20px;align-items:start;">
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:16px;">Distribución de resultados</h3>
        <div style="display:flex;gap:20px;align-items:center;">
          <div style="position:relative;width:100px;height:100px;flex-shrink:0;">
            <svg viewBox="0 0 36 36" style="width:100%;height:100%;transform:rotate(-90deg)">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" stroke-width="3.5"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--pass)"   stroke-width="3.5" stroke-dasharray="76.4 23.6"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--fail)"   stroke-width="3.5" stroke-dasharray="9.3 90.7"  stroke-dashoffset="-76.4"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--warn)"   stroke-width="3.5" stroke-dasharray="4 96"       stroke-dashoffset="-85.7"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <span style="font-size:16px;font-weight:800;color:var(--navy)">219</span>
              <span style="font-size:10px;color:var(--muted)">casos</span>
            </div>
          </div>
          <div style="font-size:12px;display:flex;flex-direction:column;gap:6px;">
            ${[['var(--pass)','Aprobados','167 · 76.4%'],['var(--fail)','Fallidos','20 · 9.3%'],['var(--warn)','Bloqueados','9 · 4%'],['var(--border)','Pendientes','23 · 10.3%']].map(([c,l,v])=>`
            <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:${c};flex-shrink:0"></div><span style="color:var(--muted)">${l}</span><span style="margin-left:auto;font-weight:700;color:var(--navy)">${v}</span></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Casos por proyecto</h3>
        ${MOCK.projects.map(p=>`
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:12px;color:var(--navy)">${p.name}</span>
            <span style="font-size:12px;font-weight:700;color:var(--navy)">${p.total}</span>
          </div>
          <div class="prog"><div class="prog-fill" style="width:${Math.round(p.total/2.24)}%;background:var(--bright)"></div></div>
        </div>`).join('')}
      </div>
    </div>
    <div class="grid-2" style="align-items:start;">
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Mis proyectos recientes</h3>
        <table class="tbl">
          <thead><tr><th>Proyecto</th><th>Total</th><th>Pasaron</th><th>Fallaron</th></tr></thead>
          <tbody>${MOCK.projects.map(p=>`
            <tr><td>${p.name}</td><td>${p.total}</td><td style="color:var(--pass);font-weight:700">${p.pass}</td><td style="color:var(--fail);font-weight:700">${p.fail}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="background:linear-gradient(135deg,#064e3b,#059669);border-radius:14px;padding:24px;color:white;">
        <div style="font-size:22px;margin-bottom:8px;">📈</div>
        <p style="font-weight:800;font-size:15px;margin-bottom:6px;">¡Tu tasa de éxito mejoró un 8% esta semana!</p>
        <p style="font-size:12px;opacity:.8;margin-bottom:16px;">Sigue ejecutando casos para mantener el progreso.</p>
        <button class="btn" style="background:white;color:#059669;width:100%;justify-content:center;" onclick="navigate('lab-pruebas')">Ir al laboratorio →</button>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// VISTA: LABORATORIO > REPOSITORIO
// ══════════════════════════════════════════

function labRepo() {
  const typeColor = t => ({ Funcional:'var(--bright)', Humo:'var(--pass)', Regresión:'var(--warn)', Aceptación:'#7c3aed' })[t] || 'var(--muted)';

  el('content').innerHTML = `
    <div style="display:flex;gap:20px;">
      <!-- Filtros -->
      <div style="width:180px;flex-shrink:0;">
        <div class="card" style="padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <span style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--navy)">Filtros</span>
            <button style="font-size:12px;color:var(--bright);background:none;border:none;cursor:pointer;">Limpiar</button>
          </div>
          <p style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:8px;">Tipo de prueba</p>
          ${['Funcional','Regresión','Humo','Aceptación'].map((t,i)=>`
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--navy);margin-bottom:6px;cursor:pointer;">
            <input type="checkbox" ${i===0?'checked':''} style="accent-color:var(--bright)"> ${t}
          </label>`).join('')}
          <p style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin:12px 0 8px;">Nivel</p>
          ${['Básico','Intermedio','Avanzado'].map((n,i)=>`
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--navy);margin-bottom:6px;cursor:pointer;">
            <input type="checkbox" ${i===1?'checked':''} style="accent-color:var(--bright)"> ${n}
          </label>`).join('')}
          <p style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin:12px 0 8px;">Etiquetas</p>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${['Login','API','UI','Pago','Carrito'].map((t,i)=>`
            <span style="padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;cursor:pointer;background:${i===0?'var(--bright)':'var(--sky)'};color:${i===0?'white':'var(--muted)'};">${t}</span>`).join('')}
          </div>
        </div>
      </div>
      <!-- Grid de casos -->
      <div style="flex:1;min-width:0;">
        <div style="margin-bottom:14px;">
          <input placeholder="Buscar por nombre, tipo o etiqueta..." style="width:100%;padding:10px 16px;border:1px solid var(--border);border-radius:10px;font-size:13px;color:var(--navy);outline:none;background:white;" onfocus="this.style.borderColor='var(--bright)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:14px;">Mostrando 1-6 de 48 casos validados</p>
        <div class="grid-3">
          ${MOCK.repoCases.map(c=>`
          <div class="repo-card">
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:${typeColor(c.type)}22;color:${typeColor(c.type)}">${c.type}</span>
              <span style="font-size:11px;font-weight:700;color:var(--pass)">✓ Validado</span>
            </div>
            <p style="font-size:11px;font-weight:700;color:var(--bright)">${c.id}</p>
            <p style="font-size:13px;font-weight:700;color:var(--navy)">${c.title}</p>
            <p style="font-size:12px;color:var(--muted);line-height:1.5">${c.desc}</p>
            <p style="font-size:11px;color:var(--muted)">${c.nivel} · ${c.imports}× importado</p>
            <div style="display:flex;gap:8px;margin-top:4px;">
              <button class="btn btn-outline" style="flex:1;justify-content:center;font-size:12px;padding:7px;">Ver detalle</button>
              <button class="btn btn-primary" style="flex:1;justify-content:center;font-size:12px;padding:7px;">Importar</button>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// VISTA: PERFIL
// ══════════════════════════════════════════

function perfil() {
  const name  = state.user.nombre || state.user.email || 'Usuario Demo';
  const email = state.user.email  || 'usuario@demo.com';
  const nivel = MOCK.levels[state.nivelKey];

  el('content').innerHTML = `
    <div class="grid-2" style="align-items:start;gap:20px;">
      <div class="card" style="text-align:center;padding:28px;">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--bright);color:white;font-size:26px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">${name.charAt(0).toUpperCase()}</div>
        <h2 style="font-size:16px;font-weight:800;color:var(--navy)">${name}</h2>
        <p style="font-size:12px;color:var(--muted);margin-bottom:12px">${email}</p>
        <span class="badge badge-blue" style="font-size:12px;padding:5px 14px;">✓ NIVEL ${nivel.badge}</span>
        <div style="margin:16px 0;text-align:left;">
          <p style="font-size:12px;color:var(--muted);margin-bottom:6px;">📚 Ruta: <strong style="color:var(--navy)">${nivel.ruta}</strong></p>
          <p style="font-size:12px;color:var(--muted);">📅 Miembro desde: <strong style="color:var(--navy)">Ene 2024</strong></p>
        </div>
        <button class="btn btn-outline" style="width:100%;justify-content:center;margin-bottom:8px;">Editar perfil</button>
        <button class="btn btn-outline" style="width:100%;justify-content:center;">Cambiar contraseña</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="card">
          <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Resumen de actividad</h3>
          <div class="grid-3">
            ${[['18','Cursos completados'],['3','Proyectos creados'],['201','Pruebas ejecutadas']].map(([v,l])=>`
            <div style="text-align:center;padding:12px;background:var(--sky);border-radius:10px;">
              <div style="font-size:22px;font-weight:800;color:var(--navy)">${v}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">${l}</div>
            </div>`).join('')}
          </div>
        </div>
        <div class="card">
          <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Progreso en la ruta <span style="float:right;color:var(--bright)">68%</span></h3>
          <div class="prog" style="margin-bottom:16px;"><div class="prog-fill" style="width:68%;background:var(--bright)"></div></div>
          ${[['done','Fundamentos del Testing Manual','Completado'],['active','Diseño de Casos de Prueba','45% en progreso'],['locked','Gestión de Bugs y Reportes','Bloqueado'],['locked','Laboratorio en la Práctica','Bloqueado']].map(([s,t,l])=>`
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
            ${s==='done'?`<div style="width:20px;height:20px;border-radius:50%;background:var(--pass);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="10" height="10" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>`:
              s==='active'?`<div style="width:20px;height:20px;border-radius:50%;border:2px solid var(--bright);display:flex;align-items:center;justify-content:center;flex-shrink:0"><div style="width:8px;height:8px;border-radius:50%;background:var(--bright)"></div></div>`:
              `<div style="width:20px;height:20px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;">🔒</div>`}
            <span style="font-size:13px;color:var(--navy)">${t}</span>
            <span style="margin-left:auto;font-size:12px;color:${s==='done'?'var(--pass)':s==='active'?'var(--bright)':'var(--muted)'};font-weight:600">${l}</span>
          </div>`).join('')}
        </div>
        <div class="card">
          <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Actividad reciente</h3>
          ${[['✓','Curso completado: Tipos de pruebas de software','Hoy, 10:30'],['⚡','Prueba ejecutada: TC-845 — App E-commerce','Ayer, 15:45'],['📁','Proyecto creado: Login Module','Hace 3 días']].map(([ic,t,d])=>`
          <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border);">
            <span style="font-size:14px">${ic}</span>
            <div><p style="font-size:13px;color:var(--navy)">${t}</p><p style="font-size:11px;color:var(--muted)">${d}</p></div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// VISTA: CONFIGURACIONES
// ══════════════════════════════════════════

function config() {
  el('content').innerHTML = `
    <div style="max-width:640px;display:flex;flex-direction:column;gap:16px;">
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:16px;">Apariencia</h3>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div><p style="font-size:13px;color:var(--navy);font-weight:600">Tema oscuro</p><p style="font-size:12px;color:var(--muted)">Cambiar al modo oscuro para reducir el brillo</p></div>
          <label class="toggle"><input type="checkbox" id="darkToggle" onchange="toggleDark()"><span class="toggle-slider"></span></label>
        </div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;border:2px solid var(--bright);border-radius:10px;padding:12px;text-align:center;cursor:pointer;">
            <div style="height:24px;background:#f8fafc;border-radius:4px;margin-bottom:8px;"></div>
            <span style="font-size:12px;font-weight:700;color:var(--navy)">☀️ Claro</span>
          </div>
          <div style="flex:1;border:2px solid var(--border);border-radius:10px;padding:12px;text-align:center;cursor:pointer;">
            <div style="height:24px;background:#111827;border-radius:4px;margin-bottom:8px;"></div>
            <span style="font-size:12px;font-weight:700;color:var(--muted)">🌙 Oscuro</span>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:16px;">Notificaciones</h3>
        ${[['Recordatorios de estudio','Recibe avisos diarios para mantener tu racha',true],['Actualizaciones de la plataforma','Nuevos cursos y funcionalidades disponibles',true],['Logros desbloqueados','Notificación cuando completes módulos o rutas',false]].map(([t,d,on])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);">
          <div><p style="font-size:13px;font-weight:600;color:var(--navy)">${t}</p><p style="font-size:12px;color:var(--muted)">${d}</p></div>
          <label class="toggle"><input type="checkbox" ${on?'checked':''}><span class="toggle-slider"></span></label>
        </div>`).join('')}
      </div>
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:16px;">Gestión de cuenta</h3>
        ${[['Correo electrónico',state.user.email||'usuario@demo.com'],['Contraseña','Última actualización: hace 30 días']].map(([l,v])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--sky);border-radius:10px;margin-bottom:8px;">
          <div><p style="font-size:12px;font-weight:700;color:var(--navy)">${l}</p><p style="font-size:12px;color:var(--muted)">${v}</p></div>
          <button class="btn btn-outline" style="font-size:12px;padding:6px 14px;">Cambiar</button>
        </div>`).join('')}
        <button class="btn btn-outline" style="width:100%;justify-content:center;margin-top:8px;" onclick="logout()">↪ Cerrar sesión</button>
        <button class="btn" style="width:100%;justify-content:center;margin-top:8px;background:#FEF2F2;color:var(--fail);border:1.5px solid #FECACA;">🗑 Eliminar mi cuenta</button>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════