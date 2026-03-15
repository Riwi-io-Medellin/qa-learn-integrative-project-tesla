-- ══════════════════════════════════════════════════════════════
-- Tabla: notifications
-- Ejecutar en PostgreSQL antes de levantar el backend
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
    id_notification SERIAL PRIMARY KEY,
    id_user         INT          NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    type            VARCHAR(50)  NOT NULL,   -- 'CASE_APPROVED' | 'CASE_REJECTED' | 'NEW_CASE'
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    related_id      INT,                     -- id_test_case, id_execution, etc.
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Índice para consultas frecuentes por usuario
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(id_user);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(id_user, is_read) WHERE is_read = FALSE;
