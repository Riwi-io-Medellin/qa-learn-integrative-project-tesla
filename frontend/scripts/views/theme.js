let _darkMode = localStorage.getItem('qa_theme') === 'dark';

function applyTheme() {
  document.body.classList.toggle('dark', _darkMode);
}

function setTheme(mode) {
  _darkMode = mode === 'dark';
  localStorage.setItem('qa_theme', mode);
  applyTheme();
}

function toggleTheme() {
  setTheme(_darkMode ? 'light' : 'dark');
}

// 👇 esto hace que TODAS las páginas respeten el tema
document.addEventListener('DOMContentLoaded', applyTheme);