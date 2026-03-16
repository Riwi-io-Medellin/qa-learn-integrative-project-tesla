/* ── QA Learn · scripts/ui/ui-shared.js ────────────────────────────────── */

// ── Toast ────────────────────────────────────────────────────────────────
let _toastTimer = null;
export function showToast(msg, type = 'success') {
  document.getElementById('qa-toast')?.remove();
  if (_toastTimer) clearTimeout(_toastTimer);

  const icons = {
    success: `<svg style="width:18px;height:18px;color:#2D9B6F;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    error:   `<svg style="width:18px;height:18px;color:#C0392B;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    info:    `<svg style="width:18px;height:18px;color:#3B5BDB;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  };
  const el = document.createElement('div');
  el.id = 'qa-toast';
  el.className = `qa-toast qa-toast-${type}`;
  el.innerHTML = `${icons[type] || icons.info}<span style="font-size:13px;font-weight:500;color:#1E3A5F">${msg}</span>`;
  document.body.appendChild(el);
  _toastTimer = setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity 0.3s'; setTimeout(()=>el.remove(),300); }, 3500);
}

// ── Botón con loading ────────────────────────────────────────────────────
export function setBtnLoading(btn, loading) {
  if (loading) {
    btn._orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._orig || '';
  }
}

// ── Loading en contenedor ────────────────────────────────────────────────
export function showLoading(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;padding:48px 0;gap:10px">
    <span class="spinner spinner-dark" style="width:22px;height:22px"></span>
    <span style="font-size:13px;color:#4A5073">Cargando...</span>
  </div>`;
}

// ── Error en contenedor ──────────────────────────────────────────────────
export function showError(id, msg = 'Error al cargar.') {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div style="text-align:center;padding:48px 0">
    <p style="font-size:13px;color:#C0392B;font-weight:500">${msg}</p>
    <button onclick="location.reload()" style="margin-top:10px;font-size:12px;color:#3B5BDB;font-weight:600;background:none;border:none;cursor:pointer;text-decoration:underline">Reintentar</button>
  </div>`;
}

// ── Empty state ──────────────────────────────────────────────────────────
export function showEmpty(id, msg = 'Sin datos.', action = '') {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div style="text-align:center;padding:48px 0">
    <p style="font-size:13px;color:#4A5073;margin-bottom:10px">${msg}</p>${action}
  </div>`;
}

// ── Modal de confirmación ────────────────────────────────────────────────
export function showConfirm({ title, message, confirmText = 'Confirmar', onConfirm, danger = false }) {
  document.getElementById('qa-confirm')?.remove();
  const el = document.createElement('div');
  el.id = 'qa-confirm';
  el.className = 'qa-modal-overlay';
  el.innerHTML = `
    <div class="qa-modal-box">
      <div style="display:flex;align-items:start;gap:14px;margin-bottom:20px">
        <div style="width:40px;height:40px;border-radius:10px;background:${danger?'rgba(192,57,43,0.1)':'rgba(59,91,219,0.1)'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg style="width:20px;height:20px;color:${danger?'#C0392B':'#3B5BDB'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            ${danger
              ? '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'
              : '<path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'}
          </svg>
        </div>
        <div><p style="font-weight:700;color:#1E3A5F;font-size:15px">${title}</p><p style="font-size:13px;color:#4A5073;margin-top:4px">${message}</p></div>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button id="cc-cancel" style="padding:9px 18px;border-radius:10px;border:1.5px solid #D0D9F0;font-size:13px;font-weight:600;color:#4A5073;background:#fff;cursor:pointer">Cancelar</button>
        <button id="cc-ok" style="padding:9px 18px;border-radius:10px;border:none;font-size:13px;font-weight:700;color:#fff;background:${danger?'#C0392B':'#3B5BDB'};cursor:pointer">${confirmText}</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  document.getElementById('cc-cancel').onclick = () => el.remove();
  document.getElementById('cc-ok').onclick     = () => { el.remove(); onConfirm?.(); };
  el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
}

// ── Fecha formateada ─────────────────────────────────────────────────────
export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' });
}

// ── Badge de status ──────────────────────────────────────────────────────
export function badge(status) {
  const map = {
    PASSED:     ['#2D9B6F', 'Pasado'],
    FAILED:     ['#C0392B', 'Fallido'],
    BLOCKED:    ['#D4A017', 'Bloqueado'],
    DRAFT:      ['#4A5073', 'Borrador'],
    ACTIVE:     ['#3B5BDB', 'Activo'],
    INACTIVE:   ['#4A5073', 'Inactivo'],
    COMPLETED:  ['#2D9B6F', 'Completado'],
    ARCHIVED:   ['#4A5073', 'Archivado'],
    APPROVED:   ['#2D9B6F', 'Aprobado'],
    DEPRECATED: ['#4A5073', 'Obsoleto'],
  };
  const [c, l] = map[status] || ['#4A5073', status];
  return `<span class="qa-badge" style="background:${c}20;color:${c}">${l}</span>`;
}

// ── Markdown simple → HTML ───────────────────────────────────────────────
export function renderMd(text) {
  if (!text) return '';
  return text
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, m => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^([^<\n].+)$/gm, m => m.trim().startsWith('<') ? m : `<p>${m}</p>`)
    .trim();
}
