/* ── QA Learn · services/api.js ────────────────────────────────────────── */

export const BASE_URL = 'http://localhost:3000/api';

// ── Fetch autenticado ───────────────────────────────────────────────────
async function req(path, opts = {}) {
  const token = localStorage.getItem('qa_token');
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res  = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    localStorage.removeItem('qa_token');
    localStorage.removeItem('qa_user');
    if (!window.location.pathname.includes('02-login')) {
      window.location.href = '/frontend/public/login.html';
    }
    return null;
  }

  if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────
// POST /api/auth/login    → { message, user: { user:{id,name,email,role}, token } }
// POST /api/auth/register → { message, user: {id_user,first_name,last_name,email} }
// GET  /api/auth/me       → { user: {id_user,first_name,last_name,email,role_name,status,created_at} }
export const auth = {
  login:    (b) => req('/auth/login',    { method:'POST', body:JSON.stringify(b) }),
  register: (b) => req('/auth/register', { method:'POST', body:JSON.stringify(b) }),
  logout:   ()  => req('/auth/logout',   { method:'POST' }),
  me:       ()  => req('/auth/me'),
};

// ── Users ────────────────────────────────────────────────────────────────
export const users = {
  getAll:       ()           => req('/users'),
  getById:      (id)         => req(`/users/${id}`),
  updateStatus: (id, status) => req(`/users/${id}/status`, { method:'PATCH', body:JSON.stringify({ status }) }),
  delete:       (id)         => req(`/users/${id}`, { method:'DELETE' }),
};

// ── Diagnostic ───────────────────────────────────────────────────────────
// POST /api/diagnostic → objeto directo { id_diagnostic, score, id_level, id_route, performed_at }
// GET  /api/diagnostic → array directo  [{ id_diagnostic, score, performed_at, level_name, route_name }]
export const diagnostic = {
  create:  (b)  => req('/diagnostic', { method:'POST', body:JSON.stringify(b) }),
  getAll:  ()   => req('/diagnostic'),
  getById: (id) => req(`/diagnostic/${id}`),
};

// ── Levels ───────────────────────────────────────────────────────────────
// GET /api/levels → { levels: [...] }
export const levels = { getAll: () => req('/levels') };

// ── Learning Routes ──────────────────────────────────────────────────────
// GET /api/routes     → { routes: [{ id_route, route_name, level_name, total_courses }] }
// GET /api/routes/:id → { route: { id_route, route_name, level_name, description, courses:[{id_course,title,orders}|null] } }
export const routes = {
  getAll:       ()             => req('/routes'),
  getById:      (id)           => req(`/routes/${id}`),
  create:       (b)            => req('/routes', { method:'POST', body:JSON.stringify(b) }),
  update:       (id, b)        => req(`/routes/${id}`, { method:'PUT', body:JSON.stringify(b) }),
  delete:       (id)           => req(`/routes/${id}`, { method:'DELETE' }),
  addCourse:    (id, b)        => req(`/routes/${id}/courses`, { method:'POST', body:JSON.stringify(b) }),
  removeCourse: (id, courseId) => req(`/routes/${id}/courses/${courseId}`, { method:'DELETE' }),
};

// ── Courses ──────────────────────────────────────────────────────────────
// GET /api/courses     → { courses: [{ id_course, title, description, status }] }
// GET /api/courses/:id → { course: { ... } }
export const courses = {
  getAll:       ()           => req('/courses'),
  getById:      (id)         => req(`/courses/${id}`),
  create:       (b)          => req('/courses', { method:'POST', body:JSON.stringify(b) }),
  update:       (id, b)      => req(`/courses/${id}`, { method:'PUT', body:JSON.stringify(b) }),
  updateStatus: (id, status) => req(`/courses/${id}/status`, { method:'PATCH', body:JSON.stringify({ status }) }),
  delete:       (id)         => req(`/courses/${id}`, { method:'DELETE' }),
};

// ── Modules ──────────────────────────────────────────────────────────────
// GET /api/courses/:id/modules → { modules: [{ id_module, title, content, orders }] }
export const modules = {
  getAll:  (cId)         => req(`/courses/${cId}/modules`),
  getById: (cId, id)     => req(`/courses/${cId}/modules/${id}`),
  create:  (cId, b)      => req(`/courses/${cId}/modules`, { method:'POST', body:JSON.stringify(b) }),
  update:  (cId, id, b)  => req(`/courses/${cId}/modules/${id}`, { method:'PUT', body:JSON.stringify(b) }),
  delete:  (cId, id)     => req(`/courses/${cId}/modules/${id}`, { method:'DELETE' }),
};

// ── Projects ─────────────────────────────────────────────────────────────
// GET /api/projects     → array directo [{ id_project, name, status, created_at }]
// GET /api/projects/:id → objeto directo { id_project, name, description, status, ... }
// POST /api/projects    → objeto directo { id_project, name, status }
export const projects = {
  getAll:       ()           => req('/projects'),
  getById:      (id)         => req(`/projects/${id}`),
  create:       (b)          => req('/projects', { method:'POST', body:JSON.stringify(b) }),
  update:       (id, b)      => req(`/projects/${id}`, { method:'PUT', body:JSON.stringify(b) }),
  updateStatus: (id, status) => req(`/projects/${id}/status`, { method:'PATCH', body:JSON.stringify({ status }) }),
  delete:       (id)         => req(`/projects/${id}`, { method:'DELETE' }),
};

// ── Requirements ─────────────────────────────────────────────────────────
// GET /api/projects/:id/requirements → array directo [{ id_requirement, code, description, priority, status }]
export const requirements = {
  getAll:  (pId)          => req(`/projects/${pId}/requirements`),
  getById: (pId, rId)     => req(`/projects/${pId}/requirements/${rId}`),
  create:  (pId, b)       => req(`/projects/${pId}/requirements`, { method:'POST', body:JSON.stringify(b) }),
  update:  (pId, rId, b)  => req(`/projects/${pId}/requirements/${rId}`, { method:'PUT', body:JSON.stringify(b) }),
  delete:  (pId, rId)     => req(`/projects/${pId}/requirements/${rId}`, { method:'DELETE' }),
};

// ── Test Cases ───────────────────────────────────────────────────────────
// GET /api/projects/:id/test-cases       → array directo [{ id_test_case, title, type, status }]
// GET /api/projects/:id/test-cases/:cId  → objeto directo { id_test_case, title, type, status, description, preconditions }
export const testCases = {
  getAll:  (pId)          => req(`/projects/${pId}/test-cases`),
  getById: (pId, cId)     => req(`/projects/${pId}/test-cases/${cId}`),
  create:  (pId, b)       => req(`/projects/${pId}/test-cases`, { method:'POST', body:JSON.stringify(b) }),
  update:  (pId, cId, b)  => req(`/projects/${pId}/test-cases/${cId}`, { method:'PUT', body:JSON.stringify(b) }),
  delete:  (pId, cId)     => req(`/projects/${pId}/test-cases/${cId}`, { method:'DELETE' }),
};

// ── Steps ────────────────────────────────────────────────────────────────
// GET /api/projects/:id/test-cases/:cId/steps → array directo [{ id_step, step_number, action, expected_result }]
export const steps = {
  getAll:  (pId, cId)          => req(`/projects/${pId}/test-cases/${cId}/steps`),
  create:  (pId, cId, b)       => req(`/projects/${pId}/test-cases/${cId}/steps`, { method:'POST', body:JSON.stringify(b) }),
  update:  (pId, cId, sId, b)  => req(`/projects/${pId}/test-cases/${cId}/steps/${sId}`, { method:'PUT', body:JSON.stringify(b) }),
  delete:  (pId, cId, sId)     => req(`/projects/${pId}/test-cases/${cId}/steps/${sId}`, { method:'DELETE' }),
};

// ── Executions ───────────────────────────────────────────────────────────
// GET /api/executions                    → { executions: [...] }
// GET /api/executions/test-case/:id      → { executions: [...] }
// POST /api/executions                   → { message, execution: { id_execution, ... } }
export const executions = {
  getAll:        ()     => req('/executions'),
  getById:       (id)   => req(`/executions/${id}`),
  getByTestCase: (tcId) => req(`/executions/test-case/${tcId}`),
  create:        (b)    => req('/executions', { method:'POST', body:JSON.stringify(b) }),
  update:        (id,b) => req(`/executions/${id}`, { method:'PUT', body:JSON.stringify(b) }),
  delete:        (id)   => req(`/executions/${id}`, { method:'DELETE' }),
};

// ── Evidences ────────────────────────────────────────────────────────────
export const evidences = {
  getAll:  (eId)     => req(`/executions/${eId}/evidences`),
  create:  (eId, b)  => req(`/executions/${eId}/evidences`, { method:'POST', body:JSON.stringify(b) }),
  delete:  (eId, id) => req(`/executions/${eId}/evidences/${id}`, { method:'DELETE' }),
};

// ── Library ──────────────────────────────────────────────────────────────
// GET /api/library     → { libraryTests: [{ id_library, id_test_case, category, tags, validated_at }] }
// GET /api/library/:id → { libraryTest: { ... } }
export const library = {
  getAll:  ()        => req('/library'),
  getById: (id)      => req(`/library/${id}`),
  create:  (b)       => req('/library', { method:'POST', body:JSON.stringify(b) }),
  update:  (id, b)   => req(`/library/${id}`, { method:'PUT', body:JSON.stringify(b) }),
  delete:  (id)      => req(`/library/${id}`, { method:'DELETE' }),
};
