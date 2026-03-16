// survey.js — conectado al backend

const API = "http://localhost:3000";
const _user = JSON.parse(localStorage.getItem("currentUser"));
const _token = localStorage.getItem("token");

// Guard
if (!_user || !_token) {
  window.location.href = "../pages/login.html";
} else if (_user.surveyCompleted) {
  window.location.href = "../pages/html/user.html";
}

// ── PREGUNTAS ──
const bloque1 = [
  {question:"¿Qué significa QA?", options:["Quick Access","Quality Assurance","Query Admin","Queue Analysis"], correct:1},
  {question:"¿Cuál es la diferencia entre un bug y un defecto?", options:["Son lo mismo","Un bug es en producción, un defecto en desarrollo","Un defecto es en producción, un bug en desarrollo","Ninguna es correcta"], correct:2},
  {question:"¿Qué es un caso de prueba?", options:["Un error del sistema","Un servidor de pruebas","Escenario que valida una funcionalidad","Un lenguaje de programación"], correct:2},
  {question:"¿Qué es la severidad de un bug?", options:["El orden en que se resuelve","El impacto que tiene en el sistema","El color del reporte","El nombre del tester"], correct:1},
  {question:"¿Qué es un smoke test?", options:["Prueba exhaustiva de todos los módulos","Prueba de rendimiento","Prueba básica para verificar que el sistema arranca","Prueba de seguridad"], correct:2},
  {question:"¿Qué es testing de regresión?", options:["Probar funcionalidades nuevas","Verificar que cambios no rompieron lo que funcionaba","Probar el diseño","Instalar el sistema"], correct:1},
  {question:"¿Qué es UAT?", options:["Unit Access Test","User Admin Tool","User Acceptance Testing","Unified Automated Testing"], correct:2},
  {question:"¿Qué es un test plan?", options:["Lista de bugs encontrados","Documento que describe el alcance y estrategia de pruebas","Reporte de resultados","Código automatizado"], correct:1},
  {question:"¿Qué es la prioridad de un bug?", options:["El impacto en el sistema","El color del reporte","El orden en que debe resolverse","El tamaño del error"], correct:2},
  {question:"¿Qué herramienta se usa para gestión de bugs?", options:["Photoshop","Figma","Word","Jira"], correct:3},
  {question:"¿Qué es testing funcional?", options:["Validar rendimiento del sistema","Validar que las funciones cumplen los requerimientos","Validar el diseño visual","Validar la seguridad"], correct:1},
  {question:"¿Qué es un requerimiento?", options:["Un bug encontrado","Una necesidad o condición que debe cumplir el sistema","Un caso de prueba","Un reporte de error"], correct:1},
  {question:"¿Qué es testing exploratorio?", options:["Pruebas con scripts automatizados","Seguir casos de prueba estrictos","Probar sin guión fijo usando intuición","Probar solo la UI"], correct:2},
  {question:"¿Qué es un ambiente de staging?", options:["El ambiente de desarrollo","Una copia del ambiente de producción para pruebas","El ambiente de producción","Un ambiente sin datos"], correct:1},
  {question:"¿Qué es un criterio de aceptación?", options:["Un bug crítico","Condición que debe cumplirse para aprobar una funcionalidad","Un reporte de pruebas","Un caso de prueba"], correct:1},
  {question:"¿Qué es testing no funcional?", options:["Pruebas de botones","Pruebas de formularios","Pruebas de rendimiento, seguridad y usabilidad","Pruebas de colores"], correct:2},
  {question:"¿Qué es Selenium?", options:["Herramienta de gestión de proyectos","Herramienta de automatización de pruebas web","Base de datos","IDE de desarrollo"], correct:1},
  {question:"¿Qué es un defect lifecycle?", options:["El ciclo de vida de un proyecto","El proceso por el que pasa un bug desde que se encuentra hasta que se cierra","El ciclo de pruebas","El ciclo de desarrollo"], correct:1},
  {question:"¿Qué es BDD?", options:["Bug Driven Development","Backend Development Design","Behavior Driven Development","Build Deploy Design"], correct:2},
  {question:"¿Qué es coverage en testing?", options:["El número de bugs encontrados","El porcentaje del código o funcionalidades cubiertas por pruebas","El tiempo de ejecución","El número de testers"], correct:1},
];

const bloque2 = [
  {question:"¿Qué es testing de integración?", options:["Probar unidades individuales","Probar módulos de forma aislada","Validar que múltiples módulos funcionan juntos","Probar la UI"], correct:2},
  {question:"¿Qué es testing unitario?", options:["Probar el sistema completo","Probar unidades pequeñas de código de forma aislada","Probar la integración","Probar el rendimiento"], correct:1},
  {question:"¿Qué es CI/CD?", options:["Control Interno / Control de Datos","Integración Continua / Entrega Continua","Código Iterativo / Código Dinámico","Control Inicial / Cierre de Datos"], correct:1},
  {question:"¿Qué es Postman?", options:["IDE de desarrollo","Base de datos","Herramienta para probar APIs","Sistema de control de versiones"], correct:2},
  {question:"¿Qué es un mock en testing?", options:["Un bug simulado","Un objeto simulado que reemplaza una dependencia real en pruebas","Un ambiente de producción","Un reporte de pruebas"], correct:1},
  {question:"¿Qué es TDD?", options:["Testing Driven Design","Test Data Development","Test Driven Development","Tracking Development Design"], correct:2},
  {question:"¿Qué es un test suite?", options:["Una herramienta de automatización","Un conjunto de casos de prueba relacionados","Un reporte de bugs","Un ambiente de pruebas"], correct:1},
  {question:"¿Qué es estrés testing?", options:["Probar funcionalidades básicas","Probar el diseño visual","Probar el sistema más allá de sus límites normales","Probar la seguridad"], correct:2},
  {question:"¿Qué es un checklist en QA?", options:["Lista de bugs","Lista de verificación de items a revisar","Lista de testers","Lista de proyectos"], correct:1},
  {question:"¿Qué es validación en QA?", options:["Revisar que el código compile","Confirmar que el sistema cumple los requerimientos del cliente","Revisar el diseño","Revisar la base de datos"], correct:1},
  {question:"¿Qué es un ambiente QA?", options:["El ambiente de producción","El ambiente de desarrollo","Entorno dedicado para realizar pruebas","El ambiente del cliente"], correct:2},
  {question:"¿Qué es pair testing?", options:["Pruebas automatizadas en pareja","Dos testers probando juntos el mismo sistema","Pruebas de dos sistemas","Pruebas en dos ambientes"], correct:1},
  {question:"¿Qué es una historia de usuario?", options:["Documentación técnica","Descripción de una funcionalidad desde la perspectiva del usuario","Un reporte de bug","Un caso de prueba"], correct:1},
  {question:"¿Qué es testing ágil?", options:["Testing al final del proyecto","Testing integrado en metodologías ágiles durante todo el desarrollo","Testing solo manual","Testing solo automatizado"], correct:1},
  {question:"¿Qué es verificación en QA?", options:["Confirmar que cumple los requerimientos del cliente","Revisar que el producto fue construido correctamente según las especificaciones","Probar el rendimiento","Probar la seguridad"], correct:1},
  {question:"¿Qué es un build en software?", options:["Un bug crítico","Una versión compilada del sistema","Un reporte de pruebas","Un caso de prueba"], correct:1},
  {question:"¿Qué es Git en el contexto de QA?", options:["Herramienta de pruebas","Sistema de control de versiones para gestionar cambios del código","Base de datos","IDE"], correct:1},
  {question:"¿Qué es un backlog?", options:["Lista de bugs resueltos","Lista priorizada de tareas o funcionalidades pendientes","Lista de testers","Lista de ambientes"], correct:1},
  {question:"¿Qué es testing de seguridad?", options:["Probar que el sistema es rápido","Probar que el sistema protege datos y resiste ataques","Probar el diseño","Probar la usabilidad"], correct:1},
  {question:"¿Qué es un reporte de bug?", options:["Una lista de casos de prueba","Documento que describe un defecto encontrado con pasos para reproducirlo","Un plan de pruebas","Un ambiente de staging"], correct:1},
];

const bloque3 = [
  {question:"¿Cuándo se considera que un bug es crítico?", options:["Cuando afecta el diseño","Cuando bloquea una funcionalidad principal del sistema","Cuando es difícil de reproducir","Cuando lo reporta el cliente"], correct:1},
  {question:"¿Qué es testing de usabilidad?", options:["Probar el rendimiento","Probar la seguridad","Evaluar qué tan fácil es usar el sistema para el usuario","Probar la base de datos"], correct:2},
  {question:"¿Qué información debe tener un buen reporte de bug?", options:["Solo el título","Solo una captura de pantalla","Título, pasos para reproducir, resultado esperado vs actual y severidad","Solo el nombre del tester"], correct:2},
  {question:"¿Qué es testing de rendimiento?", options:["Probar funcionalidades","Evaluar velocidad, estabilidad y escalabilidad del sistema bajo carga","Probar el diseño","Probar la seguridad"], correct:1},
  {question:"¿Qué es un stub en testing?", options:["Un bug simulado","Un reporte de pruebas","Sustituto simple de una dependencia que devuelve datos fijos","Un ambiente de pruebas"], correct:2},
  {question:"¿Qué es el testing de caja negra?", options:["Probar conociendo el código interno","Probar sin conocer el código interno, solo entradas y salidas","Probar solo la base de datos","Probar solo la UI"], correct:1},
  {question:"¿Qué es el testing de caja blanca?", options:["Probar sin conocer el código","Probar conociendo la estructura interna del código","Probar solo la UI","Probar el diseño"], correct:1},
  {question:"¿Qué es un sprint en Scrum?", options:["Un bug crítico","Un reporte de pruebas","Una iteración de tiempo fijo para completar trabajo","Un ambiente de pruebas"], correct:2},
  {question:"¿Qué es la documentación en QA?", options:["Código automatizado","Registro escrito de procesos, casos de prueba y resultados","Lista de bugs","Ambiente de pruebas"], correct:1},
  {question:"¿Qué es testing de compatibilidad?", options:["Probar el rendimiento","Probar que el sistema funciona en diferentes navegadores, OS y dispositivos","Probar la seguridad","Probar la usabilidad"], correct:1},
  {question:"¿Qué hace un QA Engineer?", options:["Solo reporta bugs","Diseña la UI","Planifica, ejecuta y documenta pruebas para asegurar la calidad del software","Desarrolla el backend"], correct:2},
  {question:"¿Qué es un criterio de salida en testing?", options:["Cuando se acaba el tiempo","Condiciones que deben cumplirse para finalizar las pruebas","Cuando el cliente paga","Cuando el equipo decide parar"], correct:1},
  {question:"¿Qué es testing de aceptación?", options:["Pruebas técnicas del equipo de desarrollo","Pruebas realizadas por el cliente para validar que el sistema cumple sus necesidades","Pruebas de rendimiento","Pruebas de seguridad"], correct:1},
  {question:"¿Qué es un ambiente de producción?", options:["El ambiente de pruebas","El ambiente de desarrollo","El ambiente real donde los usuarios finales usan el sistema","El ambiente de staging"], correct:2},
  {question:"¿Cuál es el objetivo principal del QA?", options:["Encontrar todos los bugs","Asegurar que el software cumple los estándares de calidad definidos","Desarrollar el software","Diseñar la UI"], correct:1},
  {question:"¿Qué es un test case ID?", options:["El nombre del tester","Identificador único que distingue cada caso de prueba","El nombre del proyecto","El número de bugs"], correct:1},
  {question:"¿Qué es la trazabilidad en QA?", options:["El tiempo de ejecución","Capacidad de rastrear casos de prueba hasta sus requerimientos origen","El número de bugs","El ambiente de pruebas"], correct:1},
  {question:"¿Qué es testing de regresión automatizado?", options:["Pruebas manuales repetidas","Usar scripts para ejecutar automáticamente pruebas de regresión","Probar el diseño automáticamente","Probar la seguridad automáticamente"], correct:1},
  {question:"¿Qué es un defecto de diseño en QA?", options:["Un bug en el código","Una falla en la arquitectura o lógica del sistema antes de implementarse","Un error de rendimiento","Un problema de seguridad"], correct:1},
  {question:"¿Qué es testing de API?", options:["Probar la interfaz visual","Probar la comunicación entre servicios a través de sus interfaces de programación","Probar la base de datos","Probar el rendimiento"], correct:1},
];

// ── LÓGICA ──
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function selectQuestions() {
  const b1 = shuffle(bloque1), b2 = shuffle(bloque2), b3 = shuffle(bloque3);
  const selected = [];
  let i = 0;
  while (selected.length < 20) { selected.push([b1,b2,b3][i%3].pop()); i++; }
  return shuffle(selected);
}

const questions = selectQuestions();
let current = 0;
const answers = new Array(20).fill(null);

// ── RENDER ──
function showQuestion() {
  const q = questions[current];
  const num = String(current + 1).padStart(2, '0');

  document.getElementById("questionTitle").textContent = q.question;
  document.getElementById("qLabel").textContent = `Pregunta ${num}`;
  document.getElementById("progressLabel").textContent = `Pregunta ${current + 1} de 20`;
  document.getElementById("progressPct").textContent = `${Math.round(((current + 1) / 20) * 100)}% completado`;
  document.getElementById("progressBar").style.width = `${((current + 1) / 20) * 100}%`;

  const letters = ['A','B','C','D'];
  const opts = document.getElementById("options");
  opts.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn" + (answers[current] === i ? " selected" : "");
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span>${opt}`;
    btn.onclick = () => { answers[current] = i; showQuestion(); };
    opts.appendChild(btn);
  });

  document.getElementById("prevBtn").disabled = current === 0;
  const isLast = current === 19;
  document.getElementById("nextBtn").classList.toggle("hidden", isLast);
  document.getElementById("submitBtn").classList.toggle("hidden", !isLast);

  renderNavigator();
}

function renderNavigator() {
  const nav = document.getElementById("navigator");
  nav.innerHTML = "";
  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn" + (answers[i] !== null ? " done" : i === current ? " current" : "");
    if (answers[i] === null) btn.innerHTML = `<span>${i + 1}</span>`;
    btn.onclick = () => { current = i; showQuestion(); };
    nav.appendChild(btn);
  });
}

// ── BOTONES ──
document.getElementById("nextBtn").onclick = () => { if (current < 19) { current++; showQuestion(); } };
document.getElementById("prevBtn").onclick = () => { if (current > 0)  { current--; showQuestion(); } };
document.getElementById("skipBtn").onclick = () => { if (current < 19) { current++; showQuestion(); } };

// ── SUBMIT: enviar al backend ──
document.getElementById("submitBtn").onclick = async () => {
  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  const porcentaje = Math.round((score / 20) * 100);

  // Determinar nivel e ruta según porcentaje
  const id_level = porcentaje <= 39
    ? "33070531-22ae-4bd6-af5e-e6d1beb1657f"   // BASIC
    : porcentaje <= 69
    ? "94e3c1e1-ef45-4e29-b846-020403648162"   // INTERMEDIATE
    : "169f5154-b152-4e7c-877c-e93fb9e56540";  // ADVANCED

  const id_route = porcentaje <= 39
    ? "b5228685-766f-4cdb-ab6f-6229561b4618"   // Ruta Básica
    : porcentaje <= 69
    ? "b0bb6a45-1320-46e5-af50-89e8d87b4ad3"   // Ruta Intermedia
    : "c51d7c28-471c-484b-9874-fe6f2512fc0e";  // Ruta Avanzada

  try {
    const res = await fetch(`${API}/api/diagnostic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${_token}`
      },
      body: JSON.stringify({ score, id_level, id_route })
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error al guardar el diagnóstico: " + data.error);
      return;
    }

    // Guardar resultado localmente para results.html
    const resultado = {
      email: _user.email,
      score,
      total: 20,
      incorrectas: 20 - score,
      porcentaje,
      fecha: new Date().toLocaleString(),
      id_diagnostic: data.id_diagnostic
    };
    localStorage.setItem("ultimoResultado", JSON.stringify(resultado));

    // Marcar surveyCompleted en currentUser
    _user.surveyCompleted = true;
    localStorage.setItem("currentUser", JSON.stringify(_user));

    window.location.href = "results.html";

  } catch (err) {
    alert("Error de conexión con el servidor");
  }
};

// ── INICIAR ──
showQuestion();

// ── ACTUALIZAR UI con nombre de usuario ──
const _userName = _user?.name || _user?.nombre || "Usuario Demo";
const avatarEl = document.getElementById("avatarInitial");
const nameEl   = document.getElementById("userName");
if (avatarEl) avatarEl.textContent = _userName.charAt(0).toUpperCase();
if (nameEl)   nameEl.textContent   = _userName;