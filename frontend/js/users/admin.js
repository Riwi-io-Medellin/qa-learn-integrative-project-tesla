const users = JSON.parse(localStorage.getItem("users")) || [];

const table = document.getElementById("usersTable");

users.forEach(u=>{
 const row = document.createElement("tr");

 row.innerHTML = `
  <td>${u.nombre}</td>
  <td>${u.email}</td>
  <td>${u.role}</td>
 `;

 table.appendChild(row);
});