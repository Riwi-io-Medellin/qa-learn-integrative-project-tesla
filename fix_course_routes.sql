-- ============================================================
-- Corrección course_routes — QA Learn
-- Ejecutar en PostgreSQL antes de la presentación
-- ============================================================

-- Limpiar vínculos actuales (los 3 niveles tienen los mismos 2 cursos)
DELETE FROM course_routes;

-- Ruta Básica: solo "Fundamentos del Testing Manual"
INSERT INTO course_routes (id_route, id_course, orders) VALUES
('b5228685-766f-4cdb-ab6f-6229561b4618', 'f10f58f3-dd22-4d50-b7ed-f0a04dfa0b82', 1);

-- Ruta Intermedia: Fundamentos (1°) → Diseño de Casos de Prueba (2°)
INSERT INTO course_routes (id_route, id_course, orders) VALUES
('b0bb6a45-1320-46e5-af50-89e8d87b4ad3', 'f10f58f3-dd22-4d50-b7ed-f0a04dfa0b82', 1),
('b0bb6a45-1320-46e5-af50-89e8d87b4ad3', '8397ac81-538a-4d29-aaa0-d3510418fb03', 2);

-- Ruta Avanzada: Diseño de Casos (1°) → Fundamentos (2°)
INSERT INTO course_routes (id_route, id_course, orders) VALUES
('c51d7c28-471c-484b-9874-fe6f2512fc0e', '8397ac81-538a-4d29-aaa0-d3510418fb03', 1),
('c51d7c28-471c-484b-9874-fe6f2512fc0e', 'f10f58f3-dd22-4d50-b7ed-f0a04dfa0b82', 2);

-- Verificar resultado
SELECT lr.route_name, c.title, cr.orders
FROM course_routes cr
JOIN learning_routes lr ON cr.id_route = lr.id_route
JOIN courses c ON cr.id_course = c.id_course
ORDER BY lr.route_name, cr.orders;
