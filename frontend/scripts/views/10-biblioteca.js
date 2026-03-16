/* ── 10-biblioteca.js ─────────────────────────────────────────────────── */
import { library }     from '../../services/api.js';
import { QAStore }     from '../state/store.js';
import { requireAuth } from '../../components/auth-guard.js';
import { initSidebar } from '../../components/sidebar.js';
import { showLoading, showError, showEmpty, fmtDate } from '../ui/ui-shared.js';

requireAuth();
initSidebar('repositorio');

document.getElementById('topbar-name').textContent     = QAStore.displayName();
document.getElementById('topbar-initials').textContent = QAStore.initials();

let allItems   = [];
let activeCat  = 'all';

async function load() {
  showLoading('lib-grid');
  try {
    // GET /api/library → { libraryTests: [...] }
    const data = await library.getAll();
    allItems   = data?.libraryTests || [];

    document.getElementById('stat-total').textContent = allItems.length;

    const cats = ['all', ...[...new Set(allItems.map(i => i.category).filter(Boolean))]];
    renderFilters(cats);
    renderGrid(allItems);
  } catch {
    showError('lib-grid', 'No se pudieron cargar los casos de la biblioteca.');
  }
}

function renderFilters(cats) {
  document.getElementById('cat-filters').innerHTML = cats.map(c => `
    <button onclick="filterCat('${c}')"
      style="padding:6px 14px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;
             border:1.5px solid ${c===activeCat?'#3B5BDB':'#D0D9F0'};
             background:${c===activeCat?'#3B5BDB':'#fff'};
             color:${c===activeCat?'white':'#4A5073'}">
      ${c === 'all' ? 'Todos' : c}
    </button>`).join('');
}

window.filterCat = (cat) => {
  activeCat = cat;
  const cats = ['all', ...[...new Set(allItems.map(i => i.category).filter(Boolean))]];
  renderFilters(cats);
  renderGrid(cat === 'all' ? allItems : allItems.filter(i => i.category === cat));
};

window.filterSearch = () => {
  const q = document.getElementById('search-input').value.toLowerCase();
  renderGrid(allItems.filter(i =>
    (i.category || '').toLowerCase().includes(q) ||
    (i.tags || []).some(t => t.toLowerCase().includes(q))
  ));
};

function renderGrid(items) {
  if (!items.length) { showEmpty('lib-grid', 'No hay resultados para esta búsqueda.'); return; }

  document.getElementById('lib-grid').innerHTML =
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
      ${items.map(item => `
        <div class="card-hover" style="background:#fff;border-radius:16px;border:1px solid #D0D9F0;padding:20px;cursor:pointer"
             onclick="openDetail('${item.id_library}')">
          <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:12px">
            <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:rgba(59,91,219,0.1);color:#3B5BDB">${item.category || 'General'}</span>
            <span style="font-size:11px;color:#4A5073">${fmtDate(item.validated_at)}</span>
          </div>
          <p style="font-size:11px;font-family:'DM Mono',monospace;color:#4A5073;margin-bottom:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">ID: ${item.id_test_case}</p>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${(item.tags || []).map(t => `<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:#EEF2FB;color:#4A5073">${t}</span>`).join('')}
          </div>
          <div style="margin-top:14px;padding-top:12px;border-top:1px solid #D0D9F0;text-align:right">
            <span style="font-size:12px;font-weight:600;color:#3B5BDB">Ver detalles →</span>
          </div>
        </div>`).join('')}
     </div>`;
}

// Drawer detalle
window.openDetail = (id) => {
  const item = allItems.find(i => i.id_library === id);
  if (!item) return;

  document.getElementById('dd-category').textContent = item.category || '—';
  document.getElementById('dd-tcid').textContent     = item.id_test_case || '—';
  document.getElementById('dd-date').textContent     = fmtDate(item.validated_at);
  document.getElementById('dd-tags').innerHTML       =
    (item.tags || []).map(t => `<span style="font-size:12px;padding:3px 10px;border-radius:20px;background:#EEF2FB;color:#4A5073">${t}</span>`).join('')
    || '<span style="font-size:12px;color:#4A5073">Sin etiquetas</span>';

  document.getElementById('detail-drawer').classList.add('open');
  document.getElementById('detail-overlay').classList.remove('hidden');
};

window.closeDetail = () => {
  document.getElementById('detail-drawer').classList.remove('open');
  document.getElementById('detail-overlay').classList.add('hidden');
};
document.getElementById('detail-overlay')?.addEventListener('click', window.closeDetail);

load();
