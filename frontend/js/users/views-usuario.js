// views-usuario.js — perfil + config

async function perfil() {
  const name  = state.user.name || state.user.nombre || 'Usuario';
  const email = state.user.email || '—';
  const nivel = LEVELS[state.nivelKey];
  const p     = state.porcentaje;

  if (state.projects.length === 0) {
    try { 
      const data = await apiFetch('/api/projects');
      state.projects = normalizeArrayResponse(data);
    } catch {}
  }

  var summaryHtml = [[p+'%','Diagnóstico'],[state.courses.length,'Cursos'],[state.projects.length,'Proyectos']].map(function(item) {
    return '<div style="text-align:center;padding:12px;background:var(--sky);border-radius:10px;">'
         + '<div style="font-size:20px;font-weight:800;color:var(--navy)">' + item[0] + '</div>'
         + '<div style="font-size:11px;color:var(--muted);margin-top:2px">' + item[1] + '</div>'
         + '</div>';
  }).join('');

  setHTML('content', `
    <div class="grid-2" style="align-items:start;gap:20px;">
      <div class="card" style="text-align:center;padding:28px;">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--bright);color:white;font-size:26px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">${name[0].toUpperCase()}</div>
        <h2 style="font-size:16px;font-weight:800;color:var(--navy)">${name}</h2>
        <p style="font-size:12px;color:var(--muted);margin-bottom:12px">${email}</p>
        <span class="badge badge-blue" style="padding:5px 14px;">✓ ${nivel.badge}</span>
        <div style="margin:14px 0;text-align:left;">
          <p style="font-size:12px;color:var(--muted);">📚 ${nivel.ruta}</p>
        </div>
        <button class="btn btn-outline" style="width:100%;justify-content:center;" onclick="logout()">↪ Cerrar sesión</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="card">
          <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Resumen</h3>
          <div class="grid-3">
            ${summaryHtml}
          </div>
        </div>
        <div class="card">
          <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:8px;">Nivel <span style="float:right;color:var(--bright)">${p}%</span></h3>
          <div class="prog"><div class="prog-fill" style="width:${p}%;background:var(--bright)"></div></div>
          <p style="font-size:12px;color:var(--muted);margin-top:8px;">${nivel.label}</p>
        </div>
      </div>
    </div>`);
}

function config() {
  const emailVal = state.user.email || '—';
  const nivelLabel = LEVELS[state.nivelKey].label;

  setHTML('content', `
    <div style="max-width:640px;">
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:14px;">Cuenta</h3>
        <div style="padding:12px;background:var(--sky);border-radius:10px;margin-bottom:8px;">
          <p style="font-size:12px;font-weight:700;color:var(--navy)">Email</p>
          <p style="font-size:12px;color:var(--muted)">${emailVal}</p>
        </div>
        <div style="padding:12px;background:var(--sky);border-radius:10px;margin-bottom:14px;">
          <p style="font-size:12px;font-weight:700;color:var(--navy)">Nivel</p>
          <p style="font-size:12px;color:var(--muted)">${nivelLabel}</p>
        </div>
        <button class="btn btn-outline" style="width:100%;justify-content:center;" onclick="logout()">↪ Cerrar sesión</button>
      </div>
    </div>`);
}