# QA Learn — Plataforma Educativa de QA Testing

Plataforma que combina diagnóstico personalizado, rutas de aprendizaje y laboratorio real de pruebas de software.

## Estructura del proyecto

```
QA Learn/
├── backend/          → API REST con Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   └── modules/  → auth, diagnostic, courses, projects, etc.
│   ├── server.js
│   ├── package.json
│   └── .env          → ⚠️  Crear desde .env.example
│
├── frontend/         → Interfaz de usuario (HTML + JS ES Modules)
│   ├── public/       → Vistas sin autenticación (01-03)
│   ├── user/         → Vistas privadas (04-12)
│   ├── components/   → auth-guard.js · sidebar.js
│   ├── services/     → api.js (fetch centralizado)
│   ├── styles/       → custom.css
│   └── scripts/
│       ├── state/    → store.js (QAStore)
│       ├── ui/       → ui-shared · ui-diagnostico · ui-aprendizaje · ui-laboratorio
│       └── views/    → orquestadores por vista (02 al 12)
│
├── package.json
└── README.md
```

## Puesta en marcha

### 1. Configurar el backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL y JWT_SECRET
npm install
```

### 2. Preparar la base de datos

Ejecutar en PostgreSQL en este orden:
1. `script_qa_learn.sql` — crea todas las tablas y enums
2. `seed_demo.sql` — inserta las relaciones `course_routes` y datos de demo

### 3. Levantar el servidor

```bash
cd backend
npm run dev
# Servidor en http://localhost:3000
```

### 4. Abrir el frontend

**Opción A — Directamente en el navegador** (más simple):
```
Abrir: frontend/public/01-pagina-inicial.html
```
El CORS está configurado para aceptar `null` (file://), por lo que funciona sin servidor.

**Opción B — Con Live Server** (VSCode):
- Instalar extensión Live Server
- Click derecho sobre `frontend/public/01-pagina-inicial.html` → "Open with Live Server"
- El servidor arranca en `http://127.0.0.1:5500`
- En `backend/.env` ajustar: `FRONTEND_URL=http://127.0.0.1:5500`

**Opción C — Con http-server**:
```bash
npx http-server frontend -p 8080
# Abrir: http://localhost:8080/public/01-pagina-inicial.html
# En backend/.env: FRONTEND_URL=http://localhost:8080
```

### 5. Flujo de demo

1. `01-pagina-inicial.html` → Registrarse (crea cuenta real en BD)
2. `04-diagnostico.html` → 15 preguntas QA → POST /api/diagnostic
3. `05-recomendacion.html` → Ver ruta asignada con cursos reales
4. `06-dashboard-aprendizaje.html` → Explorar rutas disponibles
5. `07-ruta.html` → Ver cursos y módulos con contenido Markdown
6. `08-dashboard-laboratorio.html` → Crear proyectos
7. `09-pruebas.html` → CRUD: requerimientos, casos de prueba, pasos, ejecuciones

## Variables de entorno (backend/.env)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `PG_HOST` | Host de PostgreSQL | `localhost` |
| `PG_PORT` | Puerto PostgreSQL | `5432` |
| `PG_DATABASE` | Nombre de la BD | `qa_learn` |
| `PG_USER` | Usuario PostgreSQL | `postgres` |
| `PG_PASSWORD` | Contraseña PostgreSQL | `tu_password` |
| `JWT_SECRET` | Secreto para JWT | `cadena_larga_aleatoria` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `BCRYPT_SALT_ROUNDS` | Rondas de hash | `10` |
| `FRONTEND_URL` | URL del frontend para CORS | `http://127.0.0.1:5500` |

## Notas técnicas

- El frontend usa **ES Modules** (`type="module"`) — requiere servirse desde HTTP o file://
- El `BASE_URL` del API está en `frontend/services/api.js` — ajustar si el backend corre en otro puerto
- La autenticación usa **JWT en localStorage** — el token se envía automáticamente en cada request
- Los UUIDs de niveles y rutas están **hardcodeados** en `ui-diagnostico.js` y deben coincidir con los de la BD
