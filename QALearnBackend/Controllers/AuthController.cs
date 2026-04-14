using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;
using QALearnAPI.Services;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(AuthRepository repo, JwtService jwt) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await repo.FindByEmailAsync(dto.Email) != null)
            return BadRequest(new { error = "Email already registered" });
        var roleId = await repo.FindRoleIdByNameAsync("STUDENT")
            ?? throw new Exception("Role STUDENT not found");
        var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = await repo.CreateUserAsync(roleId, dto.FirstName, dto.LastName, dto.Email, hash);
        return Created("", new { message = "User registered successfully", user });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await repo.FindFullByEmailAsync(dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, (string)user.password_hash))
            return BadRequest(new { error = "Invalid credentials" });
        var token = jwt.GenerateToken((Guid)user.id_user, (string)user.role_name);
        return Ok(new { message = "Ingreso correctamente", user = new { user = new { id = user.id_user, name = user.first_name, email = user.email, role = user.role_name }, token } });
    }

    [HttpPost("logout"), Authorize]
    public IActionResult Logout() => Ok(new { message = "Cierre de sesión exitoso. Por favor elimine el token del cliente." });

    [HttpGet("me"), Authorize]
    public async Task<IActionResult> Me()
    {
        var id   = Guid.Parse(User.FindFirst("id")!.Value);
        var user = await repo.FindByIdAsync(id) ?? throw new KeyNotFoundException("User not found");
        return Ok(new { user });
    }
}
