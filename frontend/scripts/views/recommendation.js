/* ── 05-recomendacion.js ──────────────────────────────────────────────── */
import { routes }      from '../../services/api.js';
import { QAStore }     from '../state/store.js';
import { requireAuth } from '../../components/auth-guard.js';

requireAuth();

const user = QAStore.getUser();
const diag = QAStore.getDiag();

document.getElementById('user-name').textContent =
  user?.first_name || user?.name || 'Usuario';

const DESCS = {
  'BÁSICO':     'Tienes una base inicial en QA. Esta ruta te llevará desde los fundamentos hasta dominar el testing manual con confianza.',
  'INTERMEDIO': 'Tienes conocimientos sólidos. Profundizarás en técnicas avanzadas y mejores prácticas profesionales.',
  'AVANZADO':   'Dominas las bases del QA. Esta ruta te llevará a técnicas avanzadas, automatización y liderazgo.',
};

async function init() {
  if (!diag) {
    document.getElementById('no-diag').classList.remove('hidden');
    return;
  }

  document.getElementById('result-content').classList.remove('hidden');

  const score = diag.score || 0;
  document.getElementById('score-value').textContent = Math.round(score) + '%';

  // Animar arco SVG
  setTimeout(() => {
    const arc = document.getElementById('score-arc');
    if (arc) arc.style.strokeDashoffset = String(339 - (score / 100) * 339);
  }, 150);

  const level = diag.level;
  const route = diag.route;

  document.getElementById('level-badge').textContent  = level?.label || '—';
  document.getElementById('level-desc').textContent   = DESCS[level?.label] || '';
  document.getElementById('correct-stat').textContent = `${Math.round((score/100)*20)} / 20 correctas`;
  document.getElementById('route-name').textContent   = route?.name || '—';

  const coursesEl = document.getElementById('route-courses');
  try {
    // { route: { courses: [{id_course,title,orders}|null] } }
    const data     = await routes.getById(route.id);
    const routeObj = data.route || data;
    const list     = (routeObj.courses || []).filter(c => c && c.id_course);
    list.sort((a, b) => (a.orders || 0) - (b.orders || 0));

    coursesEl.innerHTML = list.length
      ? list.map((c, i) => `
          <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:12px;background:#EEF2FB;border:1px solid #D0D9F0">
            <div style="width:34px;height:34px;border-radius:9px;background:#3B5BDB;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white;font-size:13px;font-weight:700">${i+1}</div>
            <p style="font-size:13px;font-weight:700;color:#1E3A5F">${c.title}</p>
          </div>`).join('')
      : '<p style="font-size:13px;color:#4A5073">Cursos próximamente disponibles.</p>';
  } catch {
    coursesEl.innerHTML = '<p style="font-size:13px;color:#4A5073">No se pudieron cargar los cursos.</p>';
  }
}

document.getElementById('start-btn')?.addEventListener('click', () => {
  window.location.href = 'learning-dashboard.html';
});

init();
