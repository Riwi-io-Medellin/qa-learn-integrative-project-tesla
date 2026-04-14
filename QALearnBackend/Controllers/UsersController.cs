using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/users"), Authorize]
public class UsersController(UserRepository repo) : ControllerBase
{
    bool IsAdmin => User.HasClaim("role", "ADMIN");

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        if (!IsAdmin) return Forbid();
        return Ok(new { users = await repo.GetAllAsync(status, page, limit) });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        if (!IsAdmin) return Forbid();
        var user = await repo.GetByIdAsync(id);
        if (user == null) return NotFound(new { error = "Usuario no encontrado" });
        return Ok(new { user });
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateUserStatusDto dto)
    {
        if (!IsAdmin) return Forbid();
        var validStatuses = new[] { "ACTIVE", "INACTIVE" };
        if (!validStatuses.Contains(dto.Status)) return BadRequest(new { error = "Status must be ACTIVE or INACTIVE" });
        var user = await repo.GetByIdAsync(id);
        if (user == null) return NotFound(new { error = "Usuario no encontrado" });
        var updated = await repo.UpdateStatusAsync(id, dto.Status);
        return Ok(new { message = "Status actualizado correctamente", user = updated });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!IsAdmin) return Forbid();
        var user = await repo.GetByIdAsync(id);
        if (user == null) return NotFound(new { error = "Usuario no encontrado" });
        await repo.SoftDeleteAsync(id);
        return Ok(new { message = "Usuario eliminado correctamente" });
    }
}
