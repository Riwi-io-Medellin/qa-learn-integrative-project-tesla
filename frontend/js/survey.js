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
  {question:"¿Qué significa QA?", options:["Quality Assurance","Quick Access","Query Admin","None"], correct:0},
  {question:"¿Qué es testing manual?", options:["Pruebas sin automatización","Programar robots","Diseñar UI","Crear bases de datos"], correct:0},
  {question:"¿Qué es un bug?", options:["Error del sistema","Un usuario","Un servidor","Un software"], correct:0},
  {question:"¿Qué es un caso de prueba?", options:["Escenario para validar","Un servidor","Un bug","Un lenguaje"], correct:0},
  {question:"¿Qué herramienta es de testing?", options:["Selenium","Photoshop","Excel","Word"], correct:0},
  {question:"¿Qué es testing automatizado?", options:["Pruebas con scripts","Probar manualmente","Instalar Windows","Hacer backups"], correct:0},
  {question:"¿Qué es un sprint?", options:["Iteración en Scrum","Error","Servidor","Bug"], correct:0},
  {question:"¿Qué es Scrum?", options:["Metodología ágil","Lenguaje","Base de datos","IDE"], correct:0},
  {question:"¿Qué es un requerimiento?", options:["Necesidad del cliente","Error","Bug","Pantalla"], correct:0},
  {question:"¿Qué es un test plan?", options:["Plan de pruebas","Servidor","IDE","Bug"], correct:0},
  {question:"¿Qué es regresión?", options:["Reprobar funcionalidades","Diseñar","Programar","Eliminar código"], correct:0},
  {question:"¿Qué es smoke test?", options:["Prueba básica inicial","Error grave","Base de datos","Bug visual"], correct:0},
  {question:"¿Qué es test case ID?", options:["Identificador único","Usuario","Error","Pantalla"], correct:0},
  {question:"¿Qué es un reporte de bug?", options:["Documento de error","Servidor","Usuario","Login"], correct:0},
  {question:"¿Qué es severidad?", options:["Impacto del bug","Color","Diseño","Usuario"], correct:0},
  {question:"¿Qué es prioridad?", options:["Orden de solución","Pantalla","Bug","Servidor"], correct:0},
  {question:"¿Qué es UAT?", options:["User Acceptance Testing","Unit Access Test","User Admin Tool","None"], correct:0},
  {question:"¿Qué es testing funcional?", options:["Validar funciones","Validar diseño","Validar color","Validar logo"], correct:0},
  {question:"¿Qué es testing no funcional?", options:["Rendimiento","Botón","Color","Texto"], correct:0},
  {question:"¿Qué es rendimiento?", options:["Performance","Bug","Pantalla","Usuario"], correct:0},
];

const bloque2 = [
  {question:"¿Qué es estrés testing?", options:["Probar límites","Dormir","Actualizar","Formatear"], correct:0},
  {question:"¿Qué es testing exploratorio?", options:["Probar sin guión fijo","Instalar","Borrar","Diseñar"], correct:0},
  {question:"¿Qué es documentación?", options:["Registro escrito","Error","Servidor","Bug"], correct:0},
  {question:"¿Qué es Jira?", options:["Herramienta de gestión","Lenguaje","IDE","Servidor"], correct:0},
  {question:"¿Qué es backlog?", options:["Lista de tareas","Bug","Pantalla","IDE"], correct:0},
  {question:"¿Qué es CI/CD?", options:["Integración continua","Color","Diseño","Pantalla"], correct:0},
  {question:"¿Qué es Git?", options:["Control de versiones","Bug","Servidor","Pantalla"], correct:0},
  {question:"¿Qué es API?", options:["Interfaz de programación","Bug","Pantalla","Usuario"], correct:0},
  {question:"¿Qué es Postman?", options:["Herramienta API","IDE","Servidor","Bug"], correct:0},
  {question:"¿Qué es base de datos?", options:["Almacén de datos","Bug","Pantalla","Usuario"], correct:0},
  {question:"¿Qué es SQL?", options:["Lenguaje de consultas","Bug","Pantalla","IDE"], correct:0},
  {question:"¿Qué es HTML?", options:["Lenguaje de marcado","Base de datos","Bug","Servidor"], correct:0},
  {question:"¿Qué es CSS?", options:["Estilos web","Servidor","Bug","Pantalla"], correct:0},
  {question:"¿Qué es JavaScript?", options:["Lenguaje web","Servidor","Bug","Pantalla"], correct:0},
  {question:"¿Qué es navegador?", options:["Browser","Bug","Servidor","Pantalla"], correct:0},
  {question:"¿Qué es Chrome?", options:["Navegador","Bug","Servidor","Pantalla"], correct:0},
  {question:"¿Qué es Firefox?", options:["Navegador","Bug","Servidor","Pantalla"], correct:0},
  {question:"¿Qué es Edge?", options:["Navegador","Bug","Servidor","Pantalla"], correct:0},
  {question:"¿Qué es testing móvil?", options:["Probar apps móviles","Diseñar logos","Instalar Windows","Vender software"], correct:0},
  {question:"¿Qué es testing web?", options:["Probar páginas web","Configurar redes","Diseñar logos","Vender software"], correct:0},
];

const bloque3 = [
  {question:"¿Qué es testing de integración?", options:["Validar módulos juntos","Diseñar UI","Bug","Servidor"], correct:0},
  {question:"¿Qué es testing unitario?", options:["Probar unidades pequeñas","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es defect lifecycle?", options:["Ciclo de vida del bug","Pantalla","Servidor","IDE"], correct:0},
  {question:"¿Qué es ambiente QA?", options:["Entorno de pruebas","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es producción?", options:["Ambiente real","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es validación?", options:["Confirmar requerimientos","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es verificación?", options:["Revisar cumplimiento","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es checklist?", options:["Lista de verificación","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es testing ágil?", options:["Pruebas en metodologías ágiles","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es un ambiente de staging?", options:["Copia del ambiente real","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es un mock?", options:["Objeto simulado para pruebas","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es un stub?", options:["Sustituto de una función","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es BDD?", options:["Behavior Driven Development","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es TDD?", options:["Test Driven Development","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es coverage?", options:["Cobertura de pruebas","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es un test suite?", options:["Conjunto de casos de prueba","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es una historia de usuario?", options:["Descripción de funcionalidad","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es un criterio de aceptación?", options:["Condición para aprobar","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es pair testing?", options:["Pruebas en pareja","Bug","Pantalla","Servidor"], correct:0},
  {question:"¿Qué es un build?", options:["Versión compilada del sistema","Bug","Pantalla","Servidor"], correct:0},
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