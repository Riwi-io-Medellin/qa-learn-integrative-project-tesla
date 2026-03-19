const BASE_URL='http://localhost:3000/api';

// Auth: verifica que el token exista Y no haya expirado
function isTokenValid() {
  const t = localStorage.getItem('qa_token');
  if (!t) return false;
  try { const p = JSON.parse(atob(t.split('.')[1])); return p.exp * 1000 > Date.now(); } catch { return false; }
}
if (!isTokenValid()) {
  localStorage.removeItem('qa_token'); localStorage.removeItem('qa_user'); localStorage.removeItem('qa_last_diagnostic');
  window.location.href = '../public/02-login.html';
}
const TOKEN = localStorage.getItem('qa_token');
const U=JSON.parse(localStorage.getItem('qa_user')||'{}');

document.getElementById('user-initials').textContent=(U.first_name?U.first_name[0]:(U.name||'U')[0]).toUpperCase()+(U.last_name?U.last_name[0]:'');
document.getElementById('user-name').textContent=U.first_name?(U.first_name+' '+(U.last_name||'')).trim():(U.name||'Usuario');
const LV={BASIC:{id:'33070531-22ae-4bd6-af5e-e6d1beb1657f',label:'BASICO'},INTERMEDIATE:{id:'94e3c1e1-ef45-4e29-b846-020403648162',label:'INTERMEDIO'},ADVANCED:{id:'169f5154-b152-4e7c-877c-e93fb9e56540',label:'AVANZADO'}};
const RT={BASIC:{id:'b5228685-766f-4cdb-ab6f-6229561b4618',name:'Ruta Basica de QA Testing'},INTERMEDIATE:{id:'b0bb6a45-1320-46e5-af50-89e8d87b4ad3',name:'Ruta Intermedia de QA Testing'},ADVANCED:{id:'c51d7c28-471c-484b-9874-fe6f2512fc0e',name:'Ruta Avanzada de QA Testing'}};
function getResult(s){if(s<=40)return{level:LV.BASIC,route:RT.BASIC};if(s<=70)return{level:LV.INTERMEDIATE,route:RT.INTERMEDIATE};return{level:LV.ADVANCED,route:RT.ADVANCED};}

const B1=[
  {topic:'Principios de Testing',text:'Cual es el objetivo principal de las pruebas de regresion?',opts:[{id:'A',text:'Verificar requisitos funcionales iniciales'},{id:'B',text:'Asegurar que cambios recientes no introdujeron defectos en funcionalidades previas',c:true},{id:'C',text:'Evaluar rendimiento bajo alta carga'},{id:'D',text:'Documentar errores para el backlog'}]},
  {topic:'Ciclo del Defecto',text:'Estado de un bug corregido por desarrollo pero no verificado por QA todavia:',opts:[{id:'A',text:'Cerrado'},{id:'B',text:'Reabierto'},{id:'C',text:'Resuelto / Pendiente de verificacion',c:true},{id:'D',text:'Diferido'}]},
  {topic:'Tecnicas de Diseno',text:'Tecnica que reduce el numero de casos agrupando entradas con comportamiento similar:',opts:[{id:'A',text:'Analisis de valores limite'},{id:'B',text:'Transicion de estados'},{id:'C',text:'Particion de equivalencia',c:true},{id:'D',text:'Prueba exploratoria'}]},
  {topic:'Tipos de Testing',text:'Que tipo de prueba evalua el sistema bajo condiciones de carga extrema?',opts:[{id:'A',text:'Prueba de rendimiento'},{id:'B',text:'Prueba de estres',c:true},{id:'C',text:'Prueba de usabilidad'},{id:'D',text:'Prueba de seguridad'}]},
  {topic:'Casos de Prueba',text:'Componente OBLIGATORIO en un caso de prueba formalmente documentado:',opts:[{id:'A',text:'Nombre del tester'},{id:'B',text:'Tiempo estimado en milisegundos'},{id:'C',text:'Resultado esperado para cada paso',c:true},{id:'D',text:'Lenguaje de programacion del sistema'}]},
  {topic:'Fundamentos QA',text:'Diferencia entre verificacion y validacion en QA:',opts:[{id:'A',text:'Verificacion al codigo, validacion a requisitos'},{id:'B',text:'Verificacion = expectativas cliente'},{id:'C',text:'Verificacion = producto construido correctamente; validacion = producto correcto segun usuario',c:true},{id:'D',text:'Son terminos sinonimos'}]},
  {topic:'Severidad y Prioridad',text:'Defecto que hace fallar el flujo de pago completamente. Clasificacion correcta:',opts:[{id:'A',text:'Severidad Alta, Prioridad Baja'},{id:'B',text:'Severidad Alta, Prioridad Alta',c:true},{id:'C',text:'Severidad Baja, Prioridad Alta'},{id:'D',text:'Severidad Media, Prioridad Media'}]},
  {topic:'Ciclo de Vida SDLC',text:'En que fase del SDLC es mas economico encontrar un defecto?',opts:[{id:'A',text:'Durante UAT'},{id:'B',text:'En produccion'},{id:'C',text:'Durante integracion'},{id:'D',text:'Durante analisis y diseno de requisitos',c:true}]},
  {topic:'Testing Manual',text:'Prueba que no requiere casos predefinidos y se basa en la experiencia del tester:',opts:[{id:'A',text:'Prueba de regresion'},{id:'B',text:'Prueba exploratoria',c:true},{id:'C',text:'Prueba de humo'},{id:'D',text:'Prueba de aceptacion'}]},
  {topic:'Requisitos',text:'Que significa que un requisito sea testeable?',opts:[{id:'A',text:'Que puede implementarse en un sprint'},{id:'B',text:'Que esta en lenguaje tecnico'},{id:'C',text:'Que es posible definir criterios objetivos para verificar si se cumple',c:true},{id:'D',text:'Que fue aprobado por el cliente'}]},
  {topic:'API Testing',text:'Codigo HTTP que indica que un POST creo exitosamente un recurso:',opts:[{id:'A',text:'200 OK'},{id:'B',text:'201 Created',c:true},{id:'C',text:'204 No Content'},{id:'D',text:'202 Accepted'}]},
  {topic:'Automatizacion',text:'Tipo de caso de prueba NO recomendable para automatizar:',opts:[{id:'A',text:'Casos de alta frecuencia'},{id:'B',text:'Casos tediosos o propensos a error humano'},{id:'C',text:'Casos exploratorios donde la intuicion es fundamental',c:true},{id:'D',text:'Casos con datos predecibles'}]},
  {topic:'Analisis de Valores Limite',text:'Para un campo entre 1 y 100 inclusive, valores correctos para BVA:',opts:[{id:'A',text:'50 y 75'},{id:'B',text:'1 y 100 solamente'},{id:'C',text:'0, 1, 100 y 101',c:true},{id:'D',text:'Todos los valores de 1 a 100'}]},
  {topic:'Agile QA',text:'Rol del QA Engineer en Agile/Scrum:',opts:[{id:'A',text:'Escribir todas las user stories'},{id:'B',text:'Ejecutar pruebas solo al final del sprint'},{id:'C',text:'Colaborar continuamente para asegurar calidad desde la definicion hasta la entrega',c:true},{id:'D',text:'Generar reportes finales al terminar'}]},
  {topic:'Metricas de Calidad',text:'Metrica que indica defectos que escaparon de testing a produccion:',opts:[{id:'A',text:'Cobertura de codigo'},{id:'B',text:'Tasa de escape de defectos',c:true},{id:'C',text:'Densidad de defectos por KLOC'},{id:'D',text:'Tiempo medio entre fallos'}]},
  {topic:'Tablas de Decision',text:'La tecnica de Tablas de Decision es mas apropiada para:',opts:[{id:'A',text:'Sistemas con transiciones de estado'},{id:'B',text:'Navegacion entre paginas'},{id:'C',text:'Combinaciones complejas de condiciones y acciones',c:true},{id:'D',text:'Pruebas de rendimiento'}]},
  {topic:'Reporte de Defectos',text:'Informacion MAS importante en un reporte de defecto:',opts:[{id:'A',text:'Nombre del tester y fecha'},{id:'B',text:'Pasos para reproducir, resultado actual y esperado',c:true},{id:'C',text:'Sistema operativo del tester'},{id:'D',text:'Estimacion de horas para corregir'}]},
  {topic:'Gestion de Testing',text:'Estrategia de priorizacion mas efectiva con tiempo limitado:',opts:[{id:'A',text:'Ejecutar en orden alfabetico'},{id:'B',text:'Ejecutar primero los mas complejos'},{id:'C',text:'Ejecutar primero los de mayor riesgo e impacto de negocio',c:true},{id:'D',text:'Ejecutar primero los mas recientes'}]},
  {topic:'Integracion Continua',text:'Principal beneficio de integrar pruebas automatizadas en CI/CD:',opts:[{id:'A',text:'Eliminar el testing manual'},{id:'B',text:'Detectar defectos rapidamente en cada commit',c:true},{id:'C',text:'Garantizar 100% de cobertura'},{id:'D',text:'Reemplazar al equipo de QA'}]},
  {topic:'Pruebas de Usabilidad',text:'Caracteristica fundamental para que una prueba de usabilidad sea valida:',opts:[{id:'A',text:'Que la ejecute el equipo de QA tecnico'},{id:'B',text:'Que use herramientas de automatizacion'},{id:'C',text:'Que participen usuarios representativos del publico objetivo',c:true},{id:'D',text:'Que se realice en produccion'}]},
];

const B2=[
  {topic:'Fundamentos QA',text:'Que es una prueba de humo (smoke test)?',opts:[{id:'A',text:'Una prueba exhaustiva de todas las funcionalidades'},{id:'B',text:'Una verificacion rapida de las funciones criticas del sistema',c:true},{id:'C',text:'Una prueba de rendimiento bajo carga'},{id:'D',text:'Una prueba de seguridad'}]},
  {topic:'Gestion Defectos',text:'Que informacion es esencial en un reporte de bug?',opts:[{id:'A',text:'El nombre del desarrollador responsable'},{id:'B',text:'Pasos para reproducir, resultado esperado y resultado actual',c:true},{id:'C',text:'El costo estimado de correccion'},{id:'D',text:'La opinion del tester sobre el equipo'}]},
  {topic:'Tipos de Testing',text:'Que es una prueba de caja negra?',opts:[{id:'A',text:'Prueba que examina el codigo fuente internamente'},{id:'B',text:'Prueba basada en la funcionalidad sin conocer la implementacion interna',c:true},{id:'C',text:'Prueba que solo evalua la base de datos'},{id:'D',text:'Prueba automatizada de integracion continua'}]},
  {topic:'Ciclo de Vida',text:'Que es el ciclo de vida del defecto?',opts:[{id:'A',text:'El tiempo que tarda un desarrollador en corregir un bug'},{id:'B',text:'Los estados por los que pasa un defecto desde su deteccion hasta su cierre',c:true},{id:'C',text:'La cantidad de bugs encontrados en un sprint'},{id:'D',text:'El proceso de instalacion del software'}]},
  {topic:'API Testing',text:'Cual codigo HTTP indica un error del lado del cliente?',opts:[{id:'A',text:'200'},{id:'B',text:'500'},{id:'C',text:'404',c:true},{id:'D',text:'302'}]},
  {topic:'Automatizacion',text:'Cual es la principal ventaja de las pruebas automatizadas?',opts:[{id:'A',text:'Eliminan completamente las pruebas manuales'},{id:'B',text:'Permiten ejecutar pruebas repetitivas de forma rapida y consistente',c:true},{id:'C',text:'Son mas baratas de crear'},{id:'D',text:'Pueden detectar todos los errores de usabilidad'}]},
  {topic:'Agile QA',text:'Que es la definicion de Done en Scrum?',opts:[{id:'A',text:'Cuando el Product Owner aprueba la funcionalidad'},{id:'B',text:'Cuando el codigo esta en produccion'},{id:'C',text:'Criterios acordados que debe cumplir una historia para considerarse completada',c:true},{id:'D',text:'Cuando pasa todas las pruebas de regresion'}]},
  {topic:'Tecnicas de Diseno',text:'Para que sirve una tabla de decision en testing?',opts:[{id:'A',text:'Para registrar los resultados de cada prueba'},{id:'B',text:'Para organizar combinaciones de condiciones y sus acciones esperadas',c:true},{id:'C',text:'Para calcular el porcentaje de cobertura'},{id:'D',text:'Para asignar bugs a los desarrolladores'}]},
  {topic:'Fundamentos QA',text:'Que es el testing de aceptacion (UAT)?',opts:[{id:'A',text:'Pruebas realizadas por el equipo de QA antes del lanzamiento'},{id:'B',text:'Pruebas realizadas por usuarios finales para validar que el software cumple sus necesidades',c:true},{id:'C',text:'Pruebas automatizadas de integracion continua'},{id:'D',text:'Pruebas de carga del servidor'}]},
  {topic:'Metricas QA',text:'Que mide la densidad de defectos?',opts:[{id:'A',text:'La velocidad con que se corrigen los bugs'},{id:'B',text:'El numero de defectos por unidad de tamano del software',c:true},{id:'C',text:'El porcentaje de pruebas que fallan'},{id:'D',text:'El tiempo promedio entre fallos'}]},
  {topic:'Requisitos',text:'Que es un requisito no funcional?',opts:[{id:'A',text:'Un requisito que el cliente no considera importante'},{id:'B',text:'Una caracteristica del sistema relacionada con calidad como rendimiento o seguridad',c:true},{id:'C',text:'Un requisito que no puede ser probado'},{id:'D',text:'Un requisito pendiente de aprobacion'}]},
  {topic:'Testing Manual',text:'Cuando es mas apropiado usar pruebas exploratorias?',opts:[{id:'A',text:'Cuando se necesita ejecutar el mismo caso cientos de veces'},{id:'B',text:'Cuando se descubre una nueva funcionalidad y se necesita entenderla rapidamente',c:true},{id:'C',text:'Cuando se requiere cobertura total del codigo'},{id:'D',text:'Cuando el proyecto tiene documentacion completa'}]},
  {topic:'Gestion Defectos',text:'Que significa que un bug tenga severidad critica?',opts:[{id:'A',text:'Que debe corregirse en el proximo sprint'},{id:'B',text:'Que bloquea completamente la funcionalidad principal del sistema',c:true},{id:'C',text:'Que fue reportado por un cliente importante'},{id:'D',text:'Que afecta solo a un usuario especifico'}]},
  {topic:'Fundamentos QA',text:'Que es la cobertura de pruebas?',opts:[{id:'A',text:'El numero de testers asignados al proyecto'},{id:'B',text:'El porcentaje del codigo o requisitos verificados por las pruebas',c:true},{id:'C',text:'La cantidad de bugs encontrados por hora'},{id:'D',text:'El tiempo total dedicado a ejecutar pruebas'}]},
  {topic:'API Testing',text:'Que es un mock en el contexto de pruebas?',opts:[{id:'A',text:'Un tipo de prueba de carga'},{id:'B',text:'Un objeto simulado que reemplaza una dependencia real durante las pruebas',c:true},{id:'C',text:'Un reporte de errores automatizado'},{id:'D',text:'Una herramienta de monitoreo de APIs'}]},
  {topic:'Ciclo de Vida',text:'Que es el plan de pruebas?',opts:[{id:'A',text:'Un documento que lista todos los bugs encontrados'},{id:'B',text:'Un documento que define el alcance, enfoque y cronograma de las actividades de testing',c:true},{id:'C',text:'Un script de automatizacion'},{id:'D',text:'Un reporte de resultados de ejecucion'}]},
  {topic:'Agile QA',text:'Que es el shift-left testing?',opts:[{id:'A',text:'Posponer las pruebas hasta el final del ciclo'},{id:'B',text:'Integrar actividades de testing desde las fases tempranas del desarrollo',c:true},{id:'C',text:'Automatizar todas las pruebas'},{id:'D',text:'Delegar las pruebas al equipo de producto'}]},
  {topic:'Tipos de Testing',text:'Que es testing de regresion selectiva?',opts:[{id:'A',text:'Ejecutar solo las pruebas relacionadas con los cambios realizados',c:true},{id:'B',text:'Ejecutar todas las pruebas sin excepcion'},{id:'C',text:'Ejecutar unicamente pruebas de rendimiento'},{id:'D',text:'Ejecutar pruebas aleatorias'}]},
  {topic:'Metricas QA',text:'Que es el MTTR en el contexto de QA?',opts:[{id:'A',text:'Mean Time To Release'},{id:'B',text:'Mean Time To Repair — tiempo promedio para corregir un defecto',c:true},{id:'C',text:'Maximum Test To Release'},{id:'D',text:'Minimum Test Time Required'}]},
  {topic:'Tecnicas de Diseno',text:'Que es la prueba de transicion de estados?',opts:[{id:'A',text:'Probar cuanto tiempo tarda el sistema en cambiar de estado'},{id:'B',text:'Tecnica que disena casos basados en los estados posibles del sistema y sus transiciones',c:true},{id:'C',text:'Una prueba de rendimiento para cambios de version'},{id:'D',text:'Verificar la transicion entre entornos de prueba y produccion'}]},
];

const B3=[
  {topic:'Testing de Integracion',text:'Que validan las pruebas de integracion?',opts:[{id:'A',text:'Que cada funcion individual funcione correctamente'},{id:'B',text:'Que los modulos del sistema interactuan correctamente entre si',c:true},{id:'C',text:'Que la interfaz sea visualmente atractiva'},{id:'D',text:'Que el sistema soporte alta carga'}]},
  {topic:'Automatizacion',text:'Que es un framework de automatizacion?',opts:[{id:'A',text:'Un lenguaje de programacion para pruebas'},{id:'B',text:'Un conjunto de estandares, herramientas y practicas que guian la creacion de pruebas automatizadas',c:true},{id:'C',text:'Un tipo de prueba manual estructurada'},{id:'D',text:'Una herramienta para reportar bugs'}]},
  {topic:'Fundamentos QA',text:'Que es el principio de testing temprano?',opts:[{id:'A',text:'Comenzar a probar solo cuando el desarrollo este completo'},{id:'B',text:'Iniciar actividades de testing lo antes posible para detectar defectos a menor costo',c:true},{id:'C',text:'Realizar pruebas unicamente en produccion'},{id:'D',text:'Asignar mas testers al inicio del proyecto'}]},
  {topic:'Tipos de Testing',text:'Que es testing de compatibilidad?',opts:[{id:'A',text:'Verificar que el software funcione en diferentes entornos, dispositivos y configuraciones',c:true},{id:'B',text:'Probar que dos versiones del mismo software sean iguales'},{id:'C',text:'Verificar compatibilidad con los requisitos del cliente'},{id:'D',text:'Comparar el software con el de la competencia'}]},
  {topic:'Requisitos',text:'Que es una historia de usuario en metodologias agiles?',opts:[{id:'A',text:'Un documento tecnico detallado de arquitectura'},{id:'B',text:'Una descripcion breve de una funcionalidad desde la perspectiva del usuario final',c:true},{id:'C',text:'Un reporte de bug redactado por el usuario'},{id:'D',text:'Un manual de usuario del sistema'}]},
  {topic:'API Testing',text:'Que metodo HTTP se usa para actualizar parcialmente un recurso?',opts:[{id:'A',text:'PUT'},{id:'B',text:'POST'},{id:'C',text:'PATCH',c:true},{id:'D',text:'DELETE'}]},
  {topic:'Ciclo de Vida',text:'Que es el testing de regresion en un pipeline CI/CD?',opts:[{id:'A',text:'Ejecutar pruebas solo en produccion'},{id:'B',text:'Ejecutar automaticamente las pruebas en cada cambio de codigo para detectar regresiones',c:true},{id:'C',text:'Revisar manualmente cada cambio antes de hacer deploy'},{id:'D',text:'Ejecutar pruebas de carga en cada deploy'}]},
  {topic:'Agile QA',text:'Que es BDD (Behavior Driven Development)?',opts:[{id:'A',text:'Una tecnica de automatizacion de pruebas unitarias'},{id:'B',text:'Un enfoque que describe el comportamiento del sistema en lenguaje natural comprensible para todos',c:true},{id:'C',text:'Una metodologia de desarrollo sin pruebas'},{id:'D',text:'Un tipo de prueba de rendimiento'}]},
  {topic:'Automatizacion',text:'Cuando NO es recomendable automatizar una prueba?',opts:[{id:'A',text:'Cuando se ejecuta frecuentemente en regresion'},{id:'B',text:'Cuando el caso de prueba cambia constantemente y es inestable',c:true},{id:'C',text:'Cuando consume mucho tiempo ejecutarla manualmente'},{id:'D',text:'Cuando los datos de entrada son predecibles'}]},
  {topic:'Metricas QA',text:'Que indica una alta tasa de defectos escapados a produccion?',opts:[{id:'A',text:'Que el equipo de desarrollo es muy productivo'},{id:'B',text:'Que el proceso de testing no esta detectando suficientes defectos antes del release',c:true},{id:'C',text:'Que los usuarios son muy exigentes'},{id:'D',text:'Que el sistema es muy complejo'}]},
  {topic:'Fundamentos QA',text:'Que es el testing basado en riesgo?',opts:[{id:'A',text:'Probar unicamente las funcionalidades mas usadas'},{id:'B',text:'Priorizar las pruebas segun la probabilidad e impacto de los posibles fallos',c:true},{id:'C',text:'Ejecutar pruebas solo cuando hay riesgo de deploy'},{id:'D',text:'Automatizar las pruebas mas riesgosas'}]},
  {topic:'Tipos de Testing',text:'Que evalua una prueba de rendimiento (performance test)?',opts:[{id:'A',text:'Si el sistema tiene bugs funcionales'},{id:'B',text:'La velocidad, escalabilidad y estabilidad del sistema bajo diferentes cargas',c:true},{id:'C',text:'Si la interfaz es facil de usar'},{id:'D',text:'Si los datos se almacenan correctamente'}]},
  {topic:'API Testing',text:'Que es la autenticacion Bearer Token en una API?',opts:[{id:'A',text:'Un tipo de encriptacion de datos'},{id:'B',text:'Un mecanismo de autenticacion donde se envia un token en el header de la solicitud',c:true},{id:'C',text:'Un protocolo de transferencia de archivos'},{id:'D',text:'Una forma de cachear respuestas de la API'}]},
  {topic:'Gestion Defectos',text:'Cual es la diferencia entre prioridad y severidad de un bug?',opts:[{id:'A',text:'Son lo mismo con diferente nombre'},{id:'B',text:'La severidad mide el impacto tecnico; la prioridad indica la urgencia de correccion segun el negocio',c:true},{id:'C',text:'La prioridad la define el tester; la severidad el desarrollador'},{id:'D',text:'La severidad aplica en produccion; la prioridad en testing'}]},
  {topic:'Agile QA',text:'Que es TDD (Test Driven Development)?',opts:[{id:'A',text:'Una tecnica donde se escriben las pruebas despues del codigo'},{id:'B',text:'Una practica donde se escriben las pruebas antes de escribir el codigo de produccion',c:true},{id:'C',text:'Un framework de automatizacion de pruebas'},{id:'D',text:'Una metodologia de gestion de proyectos'}]},
  {topic:'Ciclo de Vida',text:'Que es la matriz de trazabilidad en QA?',opts:[{id:'A',text:'Un reporte de bugs por sprint'},{id:'B',text:'Un documento que mapea los requisitos con los casos de prueba para asegurar cobertura completa',c:true},{id:'C',text:'Un diagrama de arquitectura del sistema'},{id:'D',text:'Un registro de versiones del software'}]},
  {topic:'Tecnicas de Diseno',text:'Que es el testing basado en casos de uso?',opts:[{id:'A',text:'Probar unicamente la base de datos'},{id:'B',text:'Disenar pruebas basadas en los flujos que realizan los actores del sistema',c:true},{id:'C',text:'Automatizar todos los flujos del sistema'},{id:'D',text:'Probar desde la perspectiva del desarrollador'}]},
  {topic:'Testing Manual',text:'Que es un checklist de pruebas?',opts:[{id:'A',text:'Una lista de bugs encontrados en el sprint'},{id:'B',text:'Una lista de verificacion de condiciones o acciones a comprobar durante las pruebas',c:true},{id:'C',text:'Un documento de arquitectura del sistema'},{id:'D',text:'Un reporte de metricas de calidad'}]},
  {topic:'Requisitos',text:'Que significa INVEST en el contexto de historias de usuario?',opts:[{id:'A',text:'Una metodologia de gestion de proyectos agiles'},{id:'B',text:'Acronimo que define: Independiente, Negociable, Valiosa, Estimable, Small, Testeable',c:true},{id:'C',text:'Un framework de automatizacion de pruebas'},{id:'D',text:'Un estandar de documentacion de requisitos'}]},
  {topic:'Fundamentos QA',text:'Que es la verificacion en el proceso de calidad?',opts:[{id:'A',text:'Confirmar que el producto cumple las expectativas del usuario final'},{id:'B',text:'Revisar que el producto fue construido correctamente segun los documentos de diseno',c:true},{id:'C',text:'Ejecutar pruebas en el ambiente de produccion'},{id:'D',text:'Aprobar el software para su lanzamiento'}]},
];

function shuffle(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}
function selectQS(){const bl=shuffle([B1,B2,B3]);return shuffle([...shuffle(bl[0]).slice(0,10),...shuffle(bl[1]).slice(0,10)]).map((q,i)=>({...q,id:i+1}));}
const QS=selectQS();
const TOTAL=QS.length;
let cur=1, ans={}, selectedOpt=null;
function buildGrid(){

  const g=document.getElementById('question-grid');g.innerHTML='';

  for(let i=1;i<=TOTAL;i++){
    const b=document.createElement('button');
    b.onclick=()=>goQ(i);
    b.style.cssText='width:32px;height:32px;border-radius:6px;font-size:11px;font-weight:700;transition:all 0.2s;border:none;cursor:pointer;';
    if(ans[i]){b.innerHTML='V';b.style.background='#3B5BDB';b.style.color='white';}
    else if(i===cur){b.textContent=i;b.style.background='white';b.style.border='2px solid #3B5BDB';b.style.color='#3B5BDB';}
    else{b.textContent=i;b.style.background='#EEF2FB';b.style.color='#4A5073';}
    g.appendChild(b);
  }

  document.getElementById('q-current').textContent=cur;
  const pct=Math.round((Object.keys(ans).length/TOTAL)*100);
  document.getElementById('progress-bar').style.width=pct+'%';
  document.getElementById('pct-label').textContent=pct+'% completado';
}

function renderQ(){
  const q=QS[cur-1];const sel=ans[cur]||null;
  const card=document.getElementById('question-card');
  card.className='bg-white rounded-2xl border border-border p-8 fade-in';
  card.innerHTML=`<div class="flex items-center justify-between mb-6"><span class="text-xs font-bold uppercase tracking-widest" style="color:#3B5BDB">Pregunta ${String(q.id).padStart(2,'0')}</span><span class="text-xs text-muted bg-sky px-3 py-1 rounded-full border border-border">QA - ${q.topic}</span></div><h2 class="text-xl font-bold text-navy leading-snug mb-8">${q.text}</h2><div id="opts" class="space-y-3">${q.opts.map(o=>`<button onclick="selectOption(this,'${o.id}')" data-opt="${o.id}" class="opt-btn w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all" style="border:2px solid ${sel===o.id?'#3B5BDB':'#D0D9F0'};background:${sel===o.id?'#EEF2FB':'white'}"><div class="opt-b w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style="border:2px solid ${sel===o.id?'#3B5BDB':'#D0D9F0'};color:${sel===o.id?'white':'#4A5073'};background:${sel===o.id?'#3B5BDB':'white'}">${o.id}</div><p class="text-sm text-ink leading-relaxed pt-0.5">${o.text}</p></button>`).join('')}</div>`;
  const isLast=cur===TOTAL;
  document.getElementById('next-label').textContent=isLast?'Finalizar diagnostico':'Siguiente pregunta';
  const nb=document.getElementById('next-btn');
  if(sel){selectedOpt=sel;nb.disabled=false;nb.style.cssText=`background:${isLast?'#2D9B6F':'#3B5BDB'};color:white;cursor:pointer;`;}
  else{selectedOpt=null;nb.disabled=true;nb.style.cssText='background:#D0D9F0;color:#4A5073;cursor:not-allowed;';}
}

function selectOption(btn,opt){
  document.querySelectorAll('.opt-btn').forEach(b=>{b.style.borderColor='#D0D9F0';b.style.background='white';const d=b.querySelector('.opt-b');d.style.background='white';d.style.borderColor='#D0D9F0';d.style.color='#4A5073';});
  btn.style.borderColor='#3B5BDB';btn.style.background='#EEF2FB';
  const d=btn.querySelector('.opt-b');d.style.background='#3B5BDB';d.style.borderColor='#3B5BDB';d.style.color='white';
  selectedOpt=opt;ans[cur]=opt;
  const isLast=cur===TOTAL;const nb=document.getElementById('next-btn');
  nb.disabled=false;nb.style.cssText=`background:${isLast?'#2D9B6F':'#3B5BDB'};color:white;cursor:pointer;`;
  document.getElementById('next-label').textContent=isLast?'Finalizar diagnostico':'Siguiente pregunta';
}

function nextQ(){if(!ans[cur])return;if(cur<TOTAL){cur++;buildGrid();renderQ();}else{finalize();}}
function prevQ(){if(cur>1){cur--;buildGrid();renderQ();}}
function skipQ(){if(cur<TOTAL){cur++;buildGrid();renderQ();}}
function goQ(n){cur=n;buildGrid();renderQ();}

async function finalize(){
  let correct=0;
  QS.forEach(q=>{const co=q.opts.find(o=>o.c);if(ans[q.id]===co?.id)correct++;});
  const score=parseFloat(((correct/TOTAL)*100).toFixed(2));
  const {level,route}=getResult(score);
  document.getElementById('modal-score').textContent=Math.round(score)+'% - '+level.label;
  const modal=document.getElementById('complete-modal');modal.classList.remove('hidden');modal.style.display='flex';
  try{
    const r=await fetch(BASE_URL+'/diagnostic',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},body:JSON.stringify({score,id_level:level.id,id_route:route.id})});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error||'Error');
    localStorage.setItem('qa_last_diagnostic',JSON.stringify({...d,score,level,route}));
  }catch(e){
    console.warn('Error saving diagnostic:',e.message);
    localStorage.setItem('qa_last_diagnostic',JSON.stringify({score,level,route}));
  }
  document.getElementById('modal-dots').classList.add('hidden');
}

function goResult(){window.location.href='05-recomendacion.html';}
buildGrid();renderQ();