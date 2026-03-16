/* ── QA Learn · scripts/ui/ui-diagnostico.js ───────────────────────────── */

// UUIDs reales de la BD
export const LEVELS = {
  BASIC:        { id:'33070531-22ae-4bd6-af5e-e6d1beb1657f', label:'BÁSICO',      max:40  },
  INTERMEDIATE: { id:'94e3c1e1-ef45-4e29-b846-020403648162', label:'INTERMEDIO',  max:70  },
  ADVANCED:     { id:'169f5154-b152-4e7c-877c-e93fb9e56540', label:'AVANZADO',    max:100 },
};
export const ROUTES = {
  BASIC:        { id:'b5228685-766f-4cdb-ab6f-6229561b4618', name:'Ruta Básica de QA Testing'      },
  INTERMEDIATE: { id:'b0bb6a45-1320-46e5-af50-89e8d87b4ad3', name:'Ruta Intermedia de QA Testing'  },
  ADVANCED:     { id:'c51d7c28-471c-484b-9874-fe6f2512fc0e', name:'Ruta Avanzada de QA Testing'    },
};

export function scoreToResult(score) {
  if (score <= 40) return { level: LEVELS.BASIC,        route: ROUTES.BASIC        };
  if (score <= 70) return { level: LEVELS.INTERMEDIATE, route: ROUTES.INTERMEDIATE };
  return               { level: LEVELS.ADVANCED,       route: ROUTES.ADVANCED     };
}

export const QUESTIONS = [
  { id:1,  topic:'Fundamentos QA',     text:'¿Cuál es el objetivo principal de las pruebas de regresión?',
    opts:[{id:'A',text:'Verificar que el software cumple todos los requisitos funcionales iniciales.'},{id:'B',text:'Asegurar que cambios recientes no introdujeron defectos en funcionalidades previas.',correct:true},{id:'C',text:'Evaluar el rendimiento bajo condiciones de carga extrema.'},{id:'D',text:'Documentar errores para el backlog del equipo de producto.'}]},
  { id:2,  topic:'Fundamentos QA',     text:'¿Qué diferencia a la verificación de la validación en QA?',
    opts:[{id:'A',text:'La verificación comprueba si el producto cumple expectativas del usuario.'},{id:'B',text:'La verificación revisa el proceso y artefactos; la validación comprueba si el producto satisface necesidades reales.',correct:true},{id:'C',text:'Ambas son sinónimas en la práctica moderna.'},{id:'D',text:'La verificación solo aplica a código; la validación solo a requisitos.'}]},
  { id:3,  topic:'Tipos de Testing',   text:'¿Qué tipo de prueba evalúa el comportamiento bajo condiciones de carga extrema?',
    opts:[{id:'A',text:'Prueba de humo.'},{id:'B',text:'Prueba de usabilidad.'},{id:'C',text:'Prueba de estrés.',correct:true},{id:'D',text:'Prueba de regresión.'}]},
  { id:4,  topic:'Casos de Prueba',    text:'¿Cuál es un componente obligatorio en un caso de prueba bien documentado?',
    opts:[{id:'A',text:'El nombre del tester.'},{id:'B',text:'El resultado esperado para cada paso.',correct:true},{id:'C',text:'El tiempo estimado en milisegundos.'},{id:'D',text:'El lenguaje de programación del sistema.'}]},
  { id:5,  topic:'Técnicas de Diseño', text:'¿Qué técnica reduce pruebas identificando clases de datos equivalentes?',
    opts:[{id:'A',text:'Análisis de valores límite.'},{id:'B',text:'Partición de equivalencia.',correct:true},{id:'C',text:'Prueba de transición de estado.'},{id:'D',text:'Prueba exploratoria.'}]},
  { id:6,  topic:'Gestión Defectos',   text:'Estado de un bug corregido pero aún no re-probado por el tester:',
    opts:[{id:'A',text:'Cerrado.'},{id:'B',text:'Reabierto.'},{id:'C',text:'Resuelto / Pendiente de verificación.',correct:true},{id:'D',text:'Diferido.'}]},
  { id:7,  topic:'Ciclo de Vida',      text:'¿En qué fase del SDLC es más económico encontrar un defecto?',
    opts:[{id:'A',text:'Durante UAT.'},{id:'B',text:'En producción.'},{id:'C',text:'Durante análisis y diseño de requisitos.',correct:true},{id:'D',text:'En la fase de integración.'}]},
  { id:8,  topic:'Testing Manual',     text:'¿Qué prueba no requiere casos predefinidos y se basa en la experiencia del tester?',
    opts:[{id:'A',text:'Prueba de regresión.'},{id:'B',text:'Prueba exploratoria.',correct:true},{id:'C',text:'Prueba de humo.'},{id:'D',text:'Prueba de aceptación.'}]},
  { id:9,  topic:'Severidad/Prioridad',text:'Bug que impide el flujo de pago pero tiene solución alternativa:',
    opts:[{id:'A',text:'Severidad alta, prioridad baja.'},{id:'B',text:'Severidad alta, prioridad alta.',correct:true},{id:'C',text:'Severidad baja, prioridad alta.'},{id:'D',text:'Severidad media, prioridad media.'}]},
  { id:10, topic:'Requisitos',         text:'¿Qué significa que un requisito sea "testeable"?',
    opts:[{id:'A',text:'Que puede implementarse en un sprint.'},{id:'B',text:'Que está escrito en lenguaje técnico comprensible.'},{id:'C',text:'Que es posible diseñar criterios objetivos para verificar si se cumple.',correct:true},{id:'D',text:'Que ha sido aprobado por el cliente.'}]},
  { id:11, topic:'Testing de API',     text:'¿Cuál código HTTP indica que un recurso fue creado exitosamente?',
    opts:[{id:'A',text:'200 OK.'},{id:'B',text:'201 Created.',correct:true},{id:'C',text:'204 No Content.'},{id:'D',text:'301 Moved Permanently.'}]},
  { id:12, topic:'Automatización',     text:'¿Cuál NO es un criterio para seleccionar un caso para automatizar?',
    opts:[{id:'A',text:'Se ejecuta con alta frecuencia.'},{id:'B',text:'Es tedioso o propenso a error humano.'},{id:'C',text:'Es un caso exploratorio donde la intuición es clave.',correct:true},{id:'D',text:'Tiene datos de entrada predecibles.'}]},
  { id:13, topic:'Técnicas de Diseño', text:'¿Qué técnica analiza los valores en los límites de las particiones de equivalencia?',
    opts:[{id:'A',text:'Tabla de decisión.'},{id:'B',text:'Análisis de valores límite.',correct:true},{id:'C',text:'Prueba de transición de estado.'},{id:'D',text:'Prueba basada en casos de uso.'}]},
  { id:14, topic:'Agile QA',           text:'Principal responsabilidad del QA Engineer en Agile/Scrum:',
    opts:[{id:'A',text:'Escribir todas las user stories.'},{id:'B',text:'Solo ejecutar pruebas al final del sprint.'},{id:'C',text:'Colaborar continuamente para asegurar calidad desde el inicio hasta el final del sprint.',correct:true},{id:'D',text:'Generar reportes al finalizar el proyecto.'}]},
  { id:15, topic:'Métricas QA',        text:'¿Qué métrica indica la proporción de defectos en testing vs. producción?',
    opts:[{id:'A',text:'Cobertura de código.'},{id:'B',text:'Tasa de escape de defectos (Defect Escape Rate).',correct:true},{id:'C',text:'Densidad de defectos por KLOC.'},{id:'D',text:'Tiempo medio entre fallos (MTBF).'}]},
];

export function renderQuestion(q, selId, container) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#3B5BDB">Pregunta ${String(q.id).padStart(2,'0')}</span>
      <span style="font-size:11px;color:#4A5073;background:#EEF2FB;padding:4px 12px;border-radius:20px;border:1px solid #D0D9F0">${q.topic}</span>
    </div>
    <h2 style="font-size:17px;font-weight:700;color:#1E3A5F;line-height:1.5;margin-bottom:22px">${q.text}</h2>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${q.opts.map(o => `
        <button data-opt="${o.id}" onclick="__selectOpt('${o.id}')"
          style="display:flex;align-items:start;gap:14px;padding:14px 16px;border-radius:12px;text-align:left;cursor:pointer;transition:all .15s;
                 border:2px solid ${selId===o.id?'#3B5BDB':'#D0D9F0'};
                 background:${selId===o.id?'rgba(59,91,219,0.06)':'#fff'}">
          <div style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;
                      border:2px solid ${selId===o.id?'#3B5BDB':'#D0D9F0'};
                      color:${selId===o.id?'#3B5BDB':'#4A5073'};
                      background:${selId===o.id?'rgba(59,91,219,0.1)':'white'}">${o.id}</div>
          <p style="font-size:13px;line-height:1.6;color:#1A1A2E;padding-top:4px">${o.text}</p>
        </button>`).join('')}
    </div>`;
}

export function renderGrid(total, current, answered, container) {
  container.innerHTML = Array.from({ length:total }, (_, i) => {
    const n = i + 1;
    const done = answered.includes(n), cur = n === current;
    let st = done
      ? 'background:#3B5BDB;color:white;border:none'
      : cur
        ? 'border:2px solid #3B5BDB;color:#3B5BDB;background:white;font-weight:700'
        : 'background:#EEF2FB;color:#4A5073;border:none';
    return `<button onclick="__goTo(${n})"
      style="width:30px;height:30px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;transition:opacity .15s;${st}"
      >${done?'✓':n}</button>`;
  }).join('');
}
