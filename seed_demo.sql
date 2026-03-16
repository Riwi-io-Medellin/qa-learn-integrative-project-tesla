-- ═══════════════════════════════════════════════════════════════════════════
-- QA Learn · seed_demo.sql
-- Ejecutar DESPUÉS de script_qa_learn.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── course_routes: vincular cursos a rutas ───────────────────────────────
-- Estos son los UUIDs reales de la BD. Si los tuyos son distintos,
-- consultar con: SELECT id_route, route_name FROM learning_routes;
--               SELECT id_course, title FROM courses;

INSERT INTO course_routes (id_route, id_course, orders)
VALUES
  -- Ruta Básica (BASIC)
  ('b5228685-766f-4cdb-ab6f-6229561b4618', 'f10f58f3-dd22-4d50-b7ed-f0a04dfa0b82', 1),
  ('b5228685-766f-4cdb-ab6f-6229561b4618', '8397ac81-538a-4d29-aaa0-d3510418fb03', 2),
  -- Ruta Intermedia (INTERMEDIATE)
  ('b0bb6a45-1320-46e5-af50-89e8d87b4ad3', '8397ac81-538a-4d29-aaa0-d3510418fb03', 1),
  ('b0bb6a45-1320-46e5-af50-89e8d87b4ad3', 'f10f58f3-dd22-4d50-b7ed-f0a04dfa0b82', 2),
  -- Ruta Avanzada (ADVANCED)
  ('c51d7c28-471c-484b-9874-fe6f2512fc0e', 'f10f58f3-dd22-4d50-b7ed-f0a04dfa0b82', 1),
  ('c51d7c28-471c-484b-9874-fe6f2512fc0e', '8397ac81-538a-4d29-aaa0-d3510418fb03', 2)
ON CONFLICT DO NOTHING;

-- ─── Promover usuario a ADMIN ─────────────────────────────────────────────
-- Registra el usuario desde el frontend, luego ejecuta:
-- UPDATE users
-- SET id_role = (SELECT id_role FROM roles WHERE role_name = 'ADMIN')
-- WHERE email = 'admin@qalearn.com';
