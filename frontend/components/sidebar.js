/* ── QA Learn · components/sidebar.js ─────────────────────────────────── */
import { QAStore } from '../scripts/state/store.js';

export function initSidebar(activeView) {
  const nameEl = document.getElementById('topbar-name');
  const initialsEl = document.getElementById('topbar-initials');
  if (nameEl) nameEl.textContent = QAStore.displayName();
  if (initialsEl) initialsEl.textContent = QAStore.initials();

  const navMap = {
    aprendizaje: { main: 0, sub: 0 },
    ruta: { main: 0, sub: 1 },
    laboratorio: { main: 1, sub: 0 },
    pruebas: { main: 1, sub: 1 },
    repositorio: { main: 1, sub: 2 },
  };
}
