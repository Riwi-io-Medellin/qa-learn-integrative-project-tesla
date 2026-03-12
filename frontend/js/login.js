// login.js — conectado al backend

const API = "http://localhost:3000";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showError("error", "Completa todos los campos");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showError("error", data.error || "Correo o contraseña incorrectos");
        return;
      }

      const token = data.user.token;
      const user  = data.user.user;

      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Verificar si ya tiene diagnóstico
      const diagRes = await fetch(`${API}/api/diagnostic`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const diags = await diagRes.json();

      if (diags.length > 0) {
        window.location.href = "./html/user.html";
      } else {
        window.location.href = "./survey.html";
      }

    } catch (err) {
      showError("error", "Error de conexión con el servidor");
    }
  });
}