// ══════════════════════════════════════════
// DATOS MOCK (mover a API cuando haya backend)
// ══════════════════════════════════════════

//esta parte es pa cuando terminemos el backend metamos aca las apis de los cursos y modulos


const MOCK = {
  levels: {
    basico:     { label:'Nivel Básico',     badge:'BÁSICO', ruta:'Ruta Básica de QA Testing' },
    intermedio: { label:'Nivel Intermedio', badge:'INTER',  ruta:'Ruta Intermedia de QA Testing' },
    avanzado:   { label:'Nivel Avanzado',   badge:'AVANZ',  ruta:'Ruta Avanzada de QA Testing' },
  },
  modules: [
    { title:'Fundamentos del Testing',   status:'done',   progress:100, courses: 5 },
    { title:'Diseño de Casos de Prueba', status:'active', progress:50,  courses: 6 },
    { title:'Gestión de Bugs',           status:'locked', progress:0,   courses: 4 },
  ],
  courses: [
    { pill:'2.1 Técnicas de diseño',       label:'Módulo 2 · Curso 2.1', heading:'Técnicas de Diseño de Casos de Prueba', time:'15 min' },
    { pill:'2.2 Partición de equivalencia',label:'Módulo 2 · Curso 2.2', heading:'Partición de Equivalencia',            time:'12 min' },
    { pill:'2.3 Análisis de valores límite',label:'Módulo 2 · Curso 2.3',heading:'Análisis de Valores Límite',           time:'10 min' },
  ],
  testCases: [
    { id:'TC-842', title:'Verificar inicio de sesión con Facebook',       sub:'Act. hace 2 días · por Juan Doe',  prio:'Alto',  req:'REQ-102', status:'Aprobado'    },
    { id:'TC-845', title:'Validación del estado del carrito vacío',        sub:'Act. hace 1 día · por Sarah Lee',  prio:'Alto',  req:'REQ-114', status:'Aprobado'    },
    { id:'TC-850', title:'Verificar validación de vencimiento de tarjeta', sub:'Act. hace 4 días · por Mike Ross', prio:'Bajo',  req:'REQ-205', status:'No probado'  },
    { id:'TC-851', title:'Error al procesar pago con tarjeta expirada',    sub:'Act. hace 5 días · por Ana García',prio:'Alto',  req:'REQ-205', status:'Fallido'     },
  ],
  projects: [
    { name:'App E-commerce v2.4', total:124, pass:82,  fail:12 },
    { name:'API Tests',           total:57,  pass:51,  fail:4  },
    { name:'Login Module',        total:38,  pass:34,  fail:2  },
  ],
  repoCases: [
    { id:'RTC-001', type:'Funcional', title:'Validar login con credenciales correctas',     desc:'Confirmar que un usuario con credenciales válidas accede correctamente.',  nivel:'Intermedio', imports:34 },
    { id:'RTC-002', type:'Funcional', title:'Error por credenciales incorrectas',           desc:'Confirmar que el sistema muestra error sin revelar información de seguridad.', nivel:'Básico', imports:28 },
    { id:'RTC-003', type:'Funcional', title:'Agregar producto al carrito desde listado',    desc:'Verificar que al agregar un producto el contador y contenido del carrito se actualicen.', nivel:'Intermedio', imports:21 },
    { id:'RTC-004', type:'Funcional', title:'Procesar pago con tarjeta válida',             desc:'Confirmar el flujo completo de pago con tarjeta válida hasta la confirmación.', nivel:'Avanzado', imports:15 },
    { id:'RTC-005', type:'Humo',      title:'Smoke test: flujo crítico de registro',        desc:'Prueba rápida del flujo de registro de nuevos usuarios desde inicio.', nivel:'Básico', imports:42 },
    { id:'RTC-006', type:'Regresión', title:'Búsqueda con filtros múltiples',               desc:'Verificar que los filtros combinados muestren únicamente resultados correctos.', nivel:'Intermedio', imports:19 },
  ],
};

// ══════════════════════════════════════════
// ESTADO GLOBAL
// ══════════════════════════════════════════

const state = {
  view:        'ruta',      // ruta | dashboard | lab-pruebas | lab-dashboard | lab-repo | perfil | config
  moduleIdx:   1,
  courseIdx:   0,
  nivelKey:    'intermedio',
  user:        {},
  coursesDone: new Set(),
};
