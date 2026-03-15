// register.js — conectado al backend

const API = "http://localhost:3000";

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre          = document.getElementById("nombre")?.value.trim() || "";
    const email           = document.getElementById("email").value.trim();
    const password        = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword")?.value || password;

    // Validaciones locales
    if (!nombre || !email || !password) {
      showError("error", "Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      showError("error", "La contraseña debe tener mínimo 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      showError("error", "Las contraseñas no coinciden");
      return;
    }

    // Separar nombre en first_name y last_name
    const parts      = nombre.split(" ");
    const first_name = parts[0];
    const last_name = parts.slice(1).join(" ") || "";


    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showError("error", data.error || "Error al registrar");
        return;
      }

      alert("Cuenta creada ✅");
      window.location.href = "./login.html";

    } catch (err) {
      showError("error", "Error de conexión con el servidor");
    }
  });
}