// auth.js — lógica compartida de autenticación
// Usado por: login.js y register.js

const AUTH_VERSION = "v2"; // Cambia esto si vuelves a cambiar el formato

function hashPassword(password) {
  return btoa(password);
}

const DEFAULT_USERS = [
  { id:1, nombre:"Admin",   email:"admin@test.com",   password:hashPassword("12345678"), role:"admin",   surveyCompleted:false, answers:{} },
  { id:2, nombre:"Student", email:"student@test.com", password:hashPassword("12345678"), role:"student", surveyCompleted:false, answers:{} },
];

function initUsers() {
  // Si la versión guardada no coincide, resetea todo para evitar datos viejos inconsistentes
  if (localStorage.getItem("authVersion") !== AUTH_VERSION) {
    localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
    localStorage.setItem("authVersion", AUTH_VERSION);
  }
}

function getUsers()        { return JSON.parse(localStorage.getItem("users")) || []; }
function saveUsers(users)  { localStorage.setItem("users", JSON.stringify(users)); }
function setCurrentUser(u) { localStorage.setItem("currentUser", JSON.stringify(u)); }

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}