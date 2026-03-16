const data = JSON.parse(localStorage.getItem("ultimoResultado"));

if (!data) {
  window.location.href = "index.html";
}

const porcentaje = data.porcentaje;

// ==========================
// MÓDULOS POR NIVEL
// Aquí agregarás los módulos reales cuando los creen
// ==========================
const niveles = {
  basico: {
    nombre: "NIVEL BÁSICO",
    badgeColor: "bg-gray-500",
    descripcion: "Estás comenzando tu camino en QA. Aprenderás los fundamentos del testing y construirás una base sólida desde cero.",
    ruta: "Ruta Básica de QA Testing",
    subtitulo: "Aprende desde cero y construye tus bases",
    duracion: "~8 h",
    modulos: [
      { num: 1, titulo: "Introducción al QA y al Testing", detalle: "4 cursos · 2 horas", url: "#modulo-basico-1" },
      { num: 2, titulo: "Fundamentos del Testing Manual", detalle: "5 cursos · 3 horas", url: "#modulo-basico-2" },
      { num: 3, titulo: "Tu primer caso de prueba", detalle: "3 cursos · 3 horas", url: "#modulo-basico-3" },
    ]
  },
  intermedio: {
    nombre: "NIVEL INTERMEDIO",
    badgeColor: "bg-blue-600",
    descripcion: "Tienes conocimientos sólidos sobre fundamentos de testing. Puedes diseñar casos básicos, pero aún puedes profundizar en técnicas avanzadas.",
    ruta: "Ruta Intermedia de QA Testing",
    subtitulo: "Consolida tus bases y alcanza el nivel profesional",
    duracion: "~12 h",
    modulos: [
      { num: 1, titulo: "Fundamentos del Testing Manual", detalle: "5 cursos · 3.5 horas", url: "#modulo-inter-1" },
      { num: 2, titulo: "Diseño de Casos de Prueba", detalle: "6 cursos · 4.5 horas", url: "#modulo-inter-2" },
      { num: 3, titulo: "Gestión de Bugs y Reportes", detalle: "4 cursos · 4 horas", url: "#modulo-inter-3" },
    ]
  },
  avanzado: {
    nombre: "NIVEL AVANZADO",
    badgeColor: "bg-green-600",
    descripcion: "Dominas QA Testing. Estás listo para automatización, estrategias avanzadas y liderazgo de equipos de calidad.",
    ruta: "Ruta Avanzada de QA Testing",
    subtitulo: "Domina la automatización y lleva tu carrera al siguiente nivel",
    duracion: "~20 h",
    modulos: [
      { num: 1, titulo: "Testing Automatizado con Selenium", detalle: "7 cursos · 6 horas", url: "#modulo-avanz-1" },
      { num: 2, titulo: "API Testing con Postman", detalle: "5 cursos · 5 horas", url: "#modulo-avanz-2" },
      { num: 3, titulo: "CI/CD y QA en equipos ágiles", detalle: "6 cursos · 9 horas", url: "#modulo-avanz-3" },
    ]
  }
};

// ==========================
// SELECCIONAR NIVEL POR PORCENTAJE
// 0–39%   → básico
// 40–69%  → intermedio
// 70–100% → avanzado
// ==========================
let nivelKey;
if (porcentaje <= 39) nivelKey = "basico";
else if (porcentaje <= 69) nivelKey = "intermedio";
else nivelKey = "avanzado";

const nivel = niveles[nivelKey];

// ==========================
// LLENAR LA PÁGINA
// ==========================
document.getElementById("porcentajeTexto").textContent = porcentaje + "%";
document.getElementById("nivelTexto").textContent = nivel.nombre;
document.getElementById("nivelDesc").textContent = nivel.descripcion;
document.getElementById("rutaTitulo").textContent = nivel.ruta;
document.getElementById("rutaSubtitulo").textContent = nivel.subtitulo;
document.getElementById("rutaDuracion").textContent = nivel.duracion;


// Círculo de progreso animado
const circunferencia = 263.8;
const offset = circunferencia - (porcentaje / 100) * circunferencia;
const circle = document.getElementById("progressCircle");
circle.style.transition = "stroke-dashoffset 1.2s ease";
setTimeout(() => { circle.style.strokeDashoffset = offset; }, 100);

// Color del badge según nivel
const badge = document.getElementById("nivelBadge");
if (porcentaje <= 39) badge.classList.replace("bg-blue-600", "bg-gray-500");
else if (porcentaje <= 69) badge.classList.replace("bg-blue-600", "bg-blue-600");
else badge.classList.replace("bg-blue-600", "bg-green-600");

// Módulos
const modulosDiv = document.getElementById("modulos");
nivel.modulos.forEach(m => {
  modulosDiv.innerHTML += `
    <div class="flex items-center justify-between bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer transition">
      <div class="flex items-center gap-3">
        <span class="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">${m.num}</span>
        <div>
          <p class="font-semibold text-gray-800 text-sm">${m.titulo}</p>
          <p class="text-xs text-gray-400">${m.detalle}</p>
        </div>
      </div>
      <span class="text-gray-400 text-lg">›</span>
    </div>
  `;
});
