// ══════════════════════════════════════════════════════════════
// notifications.js — Sistema de notificaciones QA Learning Lab
// ══════════════════════════════════════════════════════════════

const NOTIF_API = 'http://localhost:3000';

function notifToken() { return localStorage.getItem('token') || ''; }

async function notifFetch(path, options = {}) {
    const res = await fetch(NOTIF_API + path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + notifToken(),
            ...(options.headers || {}),
        },
    });
    if (!res.ok) throw new Error(res.status);
    return res.json();
}

// ── Íconos por tipo de notificación ──────────────────────────
function notifIcon(type) {
    const icons = {
        CASE_APPROVED: { emoji: '✅', color: '#2D9B6F', bg: 'rgba(45,155,111,0.1)' },
        CASE_REJECTED: { emoji: '⚠️', color: '#E67E22', bg: 'rgba(230,126,34,0.1)'  },
        NEW_CASE:      { emoji: '📋', color: '#3B5BDB', bg: 'rgba(59,91,219,0.1)'   },
    };
    return icons[type] || { emoji: '🔔', color: '#4A5073', bg: 'rgba(74,80,115,0.1)' };
}

// ── Formato de tiempo relativo ────────────────────────────────
function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60)   return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400)return `Hace ${Math.floor(diff / 3600)}h`;
    return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

// ── Render de una notificación individual ────────────────────
function renderNotifItem(n) {
    const { emoji, color, bg } = notifIcon(n.type);
    return `
    <div id="notif-${n.id_notification}"
         style="display:flex;gap:12px;align-items:flex-start;padding:12px 16px;
                border-bottom:1px solid var(--border);cursor:pointer;
                background:${n.is_read ? 'white' : 'rgba(59,91,219,0.03)'};
                transition:background .15s;"
         onmouseenter="this.style.background='var(--sky)'"
         onmouseleave="this.style.background='${n.is_read ? 'white' : 'rgba(59,91,219,0.03)'}'"
         onclick="handleNotifClick(${n.id_notification}, ${n.related_id ?? 'null'})">
        <div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;
                    display:flex;align-items:center;justify-content:center;
                    background:${bg};font-size:15px;">
            ${emoji}
        </div>
        <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                <p style="font-size:12px;font-weight:700;color:var(--navy);margin:0;">${n.title}</p>
                ${!n.is_read ? `<span style="width:7px;height:7px;border-radius:50%;background:#E74C3C;flex-shrink:0;"></span>` : ''}
            </div>
            <p style="font-size:11px;color:var(--muted);margin:0 0 3px;line-height:1.5;">${n.message || ''}</p>
            <p style="font-size:10px;color:var(--text-subtle);margin:0;">${timeAgo(n.created_at)}</p>
        </div>
        <button onclick="event.stopPropagation(); deleteNotif(${n.id_notification})"
            style="background:none;border:none;cursor:pointer;color:var(--muted);
                   padding:2px 4px;border-radius:6px;font-size:14px;line-height:1;flex-shrink:0;"
            title="Eliminar"
            onmouseenter="this.style.color='#E74C3C';this.style.background='rgba(231,76,60,0.1)'"
            onmouseleave="this.style.color='var(--muted)';this.style.background='none'">✕</button>
    </div>`;
}

// ── Cargar no leídas y actualizar badge ───────────────────────
async function loadNotifications() {
    try {
        const unread = await notifFetch('/api/notifications/unread');
        const badge  = document.getElementById('notifBadge');
        if (!badge) return;

        if (unread.length > 0) {
            badge.style.display = 'block';
            badge.textContent   = unread.length > 9 ? '9+' : unread.length;
        } else {
            badge.style.display = 'none';
        }
    } catch { /* silencioso — no romper si falla */ }
}

// ── Abrir/cerrar panel ────────────────────────────────────────
async function toggleNotifPanel() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;

    const isOpen = panel.style.display !== 'none';
    if (isOpen) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    await renderNotifPanel();
}

async function renderNotifPanel() {
    const list = document.getElementById('notifList');
    if (!list) return;

    list.innerHTML = `<div style="padding:24px;text-align:center;font-size:12px;color:var(--muted);">
        <div style="width:18px;height:18px;border:2px solid var(--bright);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 8px;"></div>
        Cargando...</div>`;

    try {
        const notifs = await notifFetch('/api/notifications');

        if (!notifs.length) {
            list.innerHTML = `<div style="padding:32px 16px;text-align:center;">
                <div style="font-size:28px;margin-bottom:8px;">🔔</div>
                <p style="font-size:12px;color:var(--muted);font-weight:600;">Sin notificaciones</p>
            </div>`;
            return;
        }

        list.innerHTML = notifs.map(renderNotifItem).join('');
    } catch {
        list.innerHTML = `<div style="padding:20px;text-align:center;font-size:12px;color:#E74C3C;">
            No se pudo cargar. Verifica tu conexión.</div>`;
    }
}

// ── Click en una notificación: marcar leída + navegar ─────────
async function handleNotifClick(id_notification, related_id) {
    try {
        await notifFetch(`/api/notifications/${id_notification}/read`, { method: 'PATCH' });

        // Actualizar visualmente sin recargar
        const item = document.getElementById(`notif-${id_notification}`);
        if (item) {
            item.style.background = 'white';
            const dot = item.querySelector('span[style*="border-radius:50%"]');
            if (dot) dot.remove();
        }

        await loadNotifications(); // actualizar badge

        // Si hay un caso relacionado, cerrar panel e ir al lab
        if (related_id) {
            document.getElementById('notifPanel').style.display = 'none';
            if (typeof navigate === 'function') navigate('lab-pruebas');
        }
    } catch { /* silencioso */ }
}

// ── Eliminar una notificación ─────────────────────────────────
async function deleteNotif(id_notification) {
    try {
        await notifFetch(`/api/notifications/${id_notification}`, { method: 'DELETE' });
        const item = document.getElementById(`notif-${id_notification}`);
        if (item) {
            item.style.opacity  = '0';
            item.style.transform = 'translateX(10px)';
            item.style.transition = 'all .2s ease';
            setTimeout(() => item.remove(), 200);
        }
        await loadNotifications();
    } catch { /* silencioso */ }
}

// ── Marcar todas como leídas ──────────────────────────────────
async function markAllRead() {
    try {
        const notifs = await notifFetch('/api/notifications/unread');
        await Promise.all(
            notifs.map(n =>
                notifFetch(`/api/notifications/${n.id_notification}/read`, { method: 'PATCH' })
            )
        );
        await renderNotifPanel();
        await loadNotifications();
    } catch { /* silencioso */ }
}

// ── Ver todas las notificaciones (recarga el panel) ───────────
async function loadAllNotifications() {
    await renderNotifPanel();
}

// ── Cerrar panel al hacer clic fuera ─────────────────────────
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notifPanel');
    const btn   = document.getElementById('notifBtn');
    if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.style.display = 'none';
    }
});

// ── Animación de spinner ──────────────────────────────────────
if (!document.getElementById('notif-spin-style')) {
    const style = document.createElement('style');
    style.id = 'notif-spin-style';
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
}

// ── Iniciar polling automático cada 10 segundos ───────────────
loadNotifications();
setInterval(loadNotifications, 10000);
