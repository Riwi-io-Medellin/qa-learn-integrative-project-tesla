// auth.js
function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.color = '#ef4444';
  el.style.fontSize = '13px';
  el.style.marginTop = '4px';
}

function hideError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
  el.textContent = '';
}