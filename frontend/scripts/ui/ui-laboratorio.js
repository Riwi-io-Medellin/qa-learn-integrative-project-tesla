/* ── QA Learn · scripts/ui/ui-laboratorio.js ───────────────────────────── */
import { badge, fmtDate } from './ui-shared.js';

// shape: { id_project, name, status, created_at, description? }
export function renderProjectCard(p) {
  const sm = {
    ACTIVE:    { bg:'rgba(45,155,111,0.1)',  c:'#2D9B6F', l:'Activo'     },
    COMPLETED: { bg:'rgba(59,91,219,0.1)',   c:'#3B5BDB', l:'Completado' },
    ARCHIVED:  { bg:'rgba(74,80,115,0.1)',   c:'#4A5073', l:'Archivado'  },
  };
  const s = sm[p.status] || sm.ACTIVE;
  return `
    <div class="card-hover" style="background:#fff;border-radius:18px;border:1px solid #D0D9F0;padding:20px;cursor:pointer"
         onclick="window.location.href='lab-tests.html?id=${p.id_project}'">
      <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:12px">
        <div style="width:40px;height:40px;border-radius:11px;background:rgba(59,91,219,0.1);display:flex;align-items:center;justify-content:center">
          <svg style="width:20px;height:20px;color:#3B5BDB" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
          </svg>
        </div>
        <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${s.bg};color:${s.c}">${s.l}</span>
      </div>
      <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</h3>
      <p style="font-size:12px;color:#4A5073;margin-top:4px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${p.description||'Sin descripción.'}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:12px;border-top:1px solid #D0D9F0">
        <span style="font-size:11px;color:#4A5073">${fmtDate(p.created_at)}</span>
        <span style="font-size:11px;font-weight:600;color:#3B5BDB">Ver →</span>
      </div>
    </div>`;
}

// shape: { id_requirement, code, description, priority, status }
export function renderReqRow(req) {
  const pc = { HIGH:'#C0392B', MEDIUM:'#D4A017', LOW:'#2D9B6F' };
  const pl = { HIGH:'Alta',    MEDIUM:'Media',   LOW:'Baja'    };
  return `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;border:1px solid #D0D9F0;background:#fff">
      <span style="font-family:'DM Mono',monospace;font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;background:#EEF2FB;color:#3B5BDB;flex-shrink:0">${req.code}</span>
      <p style="flex:1;font-size:13px;color:#1E3A5F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${req.description}</p>
      <span style="font-size:11px;font-weight:700;flex-shrink:0;color:${pc[req.priority]||'#4A5073'}">${pl[req.priority]||req.priority}</span>
      ${badge(req.status)}
    </div>`;
}

// shape: { id_test_case, title, type, status }
export function renderTCRow(tc) {
  const tl = { FUNCTIONAL:'Funcional', NON_FUNCTIONAL:'No Funcional', REGRESSION:'Regresión' };
  return `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;border:1px solid #D0D9F0;background:#fff;cursor:pointer;transition:border-color .15s"
         onmouseover="this.style.borderColor='#3B5BDB'" onmouseout="this.style.borderColor='#D0D9F0'"
         onclick="openTC('${tc.id_test_case}')">
      <div style="flex:1;min-width:0">
        <p style="font-size:13px;font-weight:600;color:#1E3A5F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tc.title}</p>
        <p style="font-size:11px;color:#4A5073;margin-top:2px">${tl[tc.type]||tc.type}</p>
      </div>
      ${badge(tc.status)}
      <svg style="width:14px;height:14px;color:#4A5073;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </div>`;
}

// shape: { id_step, step_number, action, expected_result }
export function renderStepRow(s) {
  return `
    <div style="display:flex;align-items:start;gap:10px;padding:12px;border-radius:9px;border:1px solid #D0D9F0;background:#fff">
      <div style="width:26px;height:26px;border-radius:6px;background:rgba(59,91,219,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;font-weight:700;color:#3B5BDB">${s.step_number}</div>
      <div style="flex:1;min-width:0">
        <p style="font-size:11px;font-weight:700;color:#1E3A5F;margin-bottom:2px">Acción</p>
        <p style="font-size:13px;color:#1A1A2E">${s.action}</p>
        <p style="font-size:11px;font-weight:700;color:#4A5073;margin-top:8px;margin-bottom:2px">Resultado esperado</p>
        <p style="font-size:13px;color:#4A5073">${s.expected_result}</p>
      </div>
    </div>`;
}

// shape: { id_execution, result, observations, executed_at }
export function renderExecRow(ex) {
  return `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;border:1px solid #D0D9F0;background:#fff">
      <div style="flex:1;min-width:0">
        <p style="font-size:11px;color:#4A5073">${fmtDate(ex.executed_at)}</p>
        <p style="font-size:13px;color:#1E3A5F;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ex.observations||'Sin observaciones.'}</p>
      </div>
      ${badge(ex.result)}
    </div>`;
}
