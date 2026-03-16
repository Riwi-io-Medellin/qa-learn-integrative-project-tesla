/* ── 04-diagnostico.js ────────────────────────────────────────────────── */
import { diagnostic }        from '../../services/api.js';
import { QAStore }           from '../state/store.js';
import { requireAuth }       from '../../components/auth-guard.js';
import { showToast, setBtnLoading } from '../ui/ui-shared.js';
import { QUESTIONS, scoreToResult, renderQuestion, renderGrid } from '../ui/ui-diagnostico.js';

requireAuth();

const TOTAL = QUESTIONS.length;
let cur       = 1;
let answers   = {};
let sending   = false;

const cardEl  = document.getElementById('question-card');
const gridEl  = document.getElementById('question-grid');
const barEl   = document.getElementById('progress-bar');
const curEl   = document.getElementById('q-current');
const pctEl   = document.getElementById('pct-label');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const modal   = document.getElementById('complete-modal');

// Iniciales en header
document.getElementById('user-badge').textContent = QAStore.initials();

// Exponer al HTML (usados en renderQuestion/renderGrid vía onclick inline)
window.__selectOpt = (id) => { answers[QUESTIONS[cur-1].id] = id; render(); };
window.__goTo      = (n)  => { cur = n; render(); };

function render() {
  const q   = QUESTIONS[cur - 1];
  const sel = answers[q.id] || null;

  renderQuestion(q, sel, cardEl);
  renderGrid(TOTAL, cur, Object.keys(answers).map(Number), gridEl);

  curEl.textContent = cur;
  const pct = Math.round((Object.keys(answers).length / TOTAL) * 100);
  barEl.style.width = pct + '%';
  pctEl.textContent = pct + '% completado';

  const has    = !!answers[q.id];
  const isLast = cur === TOTAL;

  prevBtn.disabled = cur === 1;
  prevBtn.style.opacity = cur === 1 ? '0.4' : '1';

  nextBtn.innerHTML  = isLast
    ? '<span>Finalizar diagnóstico</span>'
    : '<span>Siguiente</span><svg style="width:14px;height:14px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>';
  nextBtn.disabled = !has;
  nextBtn.style.background = has ? (isLast ? '#2D9B6F' : '#3B5BDB') : '#D0D9F0';
  nextBtn.style.color      = has ? 'white' : '#4A5073';
  nextBtn.style.cursor     = has ? 'pointer' : 'not-allowed';
}

prevBtn.addEventListener('click', () => { if (cur > 1) { cur--; render(); } });
nextBtn.addEventListener('click', async () => {
  if (cur < TOTAL) { cur++; render(); }
  else await submit();
});

async function submit() {
  if (sending) return;
  const missing = QUESTIONS.filter(q => !answers[q.id]);
  if (missing.length) {
    showToast(`Tienes ${missing.length} pregunta(s) sin responder.`, 'info');
    cur = missing[0].id; render(); return;
  }

  sending = true;
  setBtnLoading(nextBtn, true);

  let correct = 0;
  QUESTIONS.forEach(q => { if (answers[q.id] === q.opts.find(o => o.correct)?.id) correct++; });
  const score = parseFloat(((correct / TOTAL) * 100).toFixed(2));
  const { level, route } = scoreToResult(score);

  try {
    const result = await diagnostic.create({ score, id_level: level.id, id_route: route.id });
    QAStore.setDiag({ ...result, score, level, route });

    document.getElementById('modal-score').textContent   = Math.round(score) + '%';
    document.getElementById('modal-correct').textContent = `${correct} / ${TOTAL} correctas`;
    document.getElementById('modal-level').textContent   = level.label;
    document.getElementById('modal-route').textContent   = route.name;
    modal.classList.remove('hidden');
  } catch (err) {
    showToast(err.message || 'Error al guardar el diagnóstico.', 'error');
    sending = false;
    setBtnLoading(nextBtn, false);
    nextBtn.innerHTML = '<span>Finalizar diagnóstico</span>';
  }
}

document.getElementById('go-result-btn')?.addEventListener('click', () => {
  window.location.href = '05-recomendacion.html';
});

render();
