# QA Learn Platform

Plataforma educativa para la formación de profesionales en **aseguramiento de calidad (QA)**. Los estudiantes aprenden mediante diagnósticos, rutas de aprendizaje y un laboratorio práctico donde crean y gestionan casos de prueba reales. Los administradores supervisan usuarios, aprueban casos y mantienen el repositorio compartido.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js · Express 5 · ES Modules |
| Base de datos | PostgreSQL (Railway) |
| Autenticación | JWT + bcryptjs |
| Validación | Zod |
| Frontend | HTML · CSS · Tailwind CSS · JavaScript vanilla |

---

## Estructura del proyecto

```
qa-learn/
├── backend/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/          # db.js · env.js
│       ├── middlewares/     # auth · role · validate · error · catchAsync
│       └── modules/
│           ├── auth/
│           ├── users/
│           ├── diagnostic/
│           ├── levels-roles/
│           ├── learning-routes/
│           ├── courses/
│           ├── course-modules/
│           ├── projects/
│           ├── requirements/
│           ├── testCases/
│           ├── steps/
│           ├── executions/
│           ├── evidences/
│           └── library/
└── frontend/
    ├── pages/
    │   ├── index.html · login.html · register.html · survey.html · results.html
    │   └── html/
    │       ├── user.html    # Dashboard del estudiante
    │       └── admin.html   # Panel de administración
    ├── js/
    │   ├── login.js · register.js · survey.js
    │   └── users/
    │       ├── user.js               # Init, navegación, helpers
    │       ├── views-aprendizaje.js  # Ruta de aprendizaje + dashboard
    │       ├── views-laboratorio.js  # Lab de pruebas + repositorio
    │       ├── views-usuario.js      # Perfil + configuración
    │       └── admin.js              # Panel de administración
    └── styles/
        ├── index.css
        └── survey.css
        ├── user.css
```

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/qa-learn.git
cd qa-learn/backend
npm install
```

### 2. Variables de entorno

Crea `backend/.env` basándote en `.env.template`:

```env
PORT=
NODE_ENV=

PG_HOST=
PG_PORT=
PG_DATABASE=
PG_USER=
PG_PASSWORD=

JWT_SECRET=
JWT_EXPIRES_IN=

BCRYPT_SALT_ROUNDS=

FRONTEND_URL=
```

### 3. Arrancar el backend

```bash
npm run dev     //asegurate estar dentro de la carpeta backend antes de iniciarlo
```

El servidor queda escuchando en `http://localhost:3000`.

### 4. Arrancar el frontend

Arranca la parte visual mediante el link desplegado de la plataforma o mediante el usu de live server en vs Code

## API — endpoints principales

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo estudiante |
| POST | `/api/auth/login` | Login — devuelve JWT |

### Usuarios *(solo ADMIN)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar todos los usuarios |
| PATCH | `/api/users/:id/status` | Activar / suspender usuario |

### Proyectos y casos de prueba
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET / POST | `/api/projects` | Proyectos del usuario |
| GET / POST | `/api/projects/:id/requirements` | Requerimientos del proyecto |
| GET / POST | `/api/projects/:id/test-cases` | Casos de prueba |
| PATCH | `/api/projects/:id/test-cases/:caseId/status` | Cambiar estado del caso |

### Admin — revisión de casos *(solo ADMIN)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/test-cases` | Todos los casos DRAFT de todos los usuarios |
| PATCH | `/api/admin/test-cases/:caseId/status` | Aprobar (`ACTIVE`) o rechazar (`DEPRECATED`) |

### Repositorio (library)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/library` | Ver todos los casos validados |
| POST | `/api/library` | Agregar caso al repositorio *(ADMIN)* |
| DELETE | `/api/library/:id` | Quitar caso del repositorio *(ADMIN)* |

### Contenido educativo
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/courses` | Listar cursos |
| GET | `/api/courses/:id/modules` | Módulos de un curso |
| GET | `/api/routes` | Rutas de aprendizaje |
| GET / POST | `/api/diagnostic` | Diagnóstico del estudiante |

---

## Flujo completo de un estudiante

```
Registro → Login → Diagnóstico → Ruta de aprendizaje
    → Crear proyecto → Agregar requerimientos
    → Crear casos de prueba (estado: En revisión)
    → Admin aprueba → Caso disponible en Repositorio
    → Cualquier usuario puede exportar el caso (.txt)
```

## Flujo del administrador

```
Login → Panel Admin
    → Usuarios: activar / suspender cuentas
    → Repositorio: revisar casos DRAFT de todos los estudiantes
        → Aprobar (+ categoría y tags) → pasa a ACTIVE y al repositorio
        → Rechazar → pasa a DEPRECATED
    → Cursos: visualizar cursos activos
```

---

## Roles del sistema

| Rol | Acceso |
|-----|--------|
| `STUDENT` | Se registra por API. Gestiona sus proyectos, casos y ejecuciones. Consulta cursos y repositorio. |
| `ADMIN` | Se crea manualmente en BD. Gestiona usuarios, aprueba casos al repositorio, administra contenido educativo. |

---

## Estados de un caso de prueba

| Estado | Significado | Quién lo asigna |
|--------|-------------|-----------------|
| `DRAFT` | Recién creado — en revisión | Sistema (automático al crear) |
| `ACTIVE` | Aprobado — visible en repositorio | Admin |
| `DEPRECATED` | Rechazado o fuera de vigencia | Admin |

---

## Equipo

Juan Jose Peña 


**Proyecto integrador — Equipo Tesla · RIWI**