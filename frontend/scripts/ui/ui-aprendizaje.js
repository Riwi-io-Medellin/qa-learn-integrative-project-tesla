/* ── QA Learn · scripts/ui/ui-aprendizaje.js ───────────────────────────── */
import { renderMd } from './ui-shared.js';

// shape: { id_route, route_name, level_name, total_courses }
export function renderRouteCard(r, isActive = false) {
  const lc = { BASIC:'#2D9B6F', INTERMEDIATE:'#3B5BDB', ADVANCED:'#2E4FBA' };
  const ll = { BASIC:'Básico',  INTERMEDIATE:'Intermedio', ADVANCED:'Avanzado' };
  const lvl   = (r.level_name || '').toUpperCase();
  const color = lc[lvl] || '#3B5BDB';
  const label = ll[lvl] || r.level_name || '';
  const total = r.total_courses || 0;

  return `
    <div class="card-hover" style="background:#fff;border-radius:18px;border:${isActive?'2px solid #3B5BDB;box-shadow:0 0 0 4px rgba(59,91,219,0.1)':'1px solid #D0D9F0'};padding:22px;cursor:pointer"
         onclick="window.location.href='learning-path.html?id=${r.id_route}'">
      <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:14px">
        <div style="width:40px;height:40px;border-radius:11px;background:${color}20;display:flex;align-items:center;justify-content:center">
          <svg style="width:20px;height:20px;color:${color}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </div>
        <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${color}15;color:${color}">${label}</span>
      </div>
      <h3 style="font-size:14px;font-weight:700;color:#1E3A5F;margin-bottom:4px">${r.route_name}</h3>
      <p style="font-size:12px;color:#4A5073">${total} curso${total!==1?'s':''}</p>
      ${isActive ? '<p style="margin-top:10px;font-size:11px;font-weight:700;color:#3B5BDB">★ Tu ruta asignada</p>' : ''}
    </div>`;
}

// shape: { id_module, title, content, orders }
export function renderModuleCard(mod, open = false) {
  return `
    <div style="background:#fff;border-radius:12px;border:1px solid #D0D9F0;overflow:hidden">
      <button data-toggle="${mod.id_module}" onclick="toggleModule('${mod.id_module}')"
        style="width:100%;display:flex;align-items:center;gap:12px;padding:14px 16px;text-align:left;cursor:pointer;background:transparent;border:none;transition:background .15s"
        onmouseover="this.style.background='#EEF2FB'" onmouseout="this.style.background='transparent'">
        <div style="width:28px;height:28px;border-radius:7px;background:rgba(59,91,219,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;color:#3B5BDB">${mod.orders}</div>
        <p style="flex:1;font-size:13px;font-weight:700;color:#1E3A5F">${mod.title}</p>
        <svg id="arr-${mod.id_module}" style="width:16px;height:16px;color:#4A5073;transition:transform .2s;transform:${open?'rotate(180deg)':''};flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div id="mc-${mod.id_module}" class="${open?'':'hidden'}" style="border-top:1px solid #D0D9F0;padding:20px 22px">
        <div class="md">${renderMd(mod.content || '')}</div>
      </div>
    </div>`;
}
