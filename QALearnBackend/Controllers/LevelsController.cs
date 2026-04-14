using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Authorize]
public class LevelsController(LevelsRepository repo) : ControllerBase
{
    [HttpGet("api/levels")]
    public async Task<IActionResult> GetLevels() => Ok(new { levels = await repo.GetAllLevelsAsync() });

    [HttpGet("api/roles")]
    public async Task<IActionResult> GetRoles()
    {
        if (!User.HasClaim("role", "ADMIN")) return Forbid();
        return Ok(new { roles = await repo.GetAllRolesAsync() });
    }
}
