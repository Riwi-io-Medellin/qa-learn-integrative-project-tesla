using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/projects"), Authorize]
public class ProjectsController(ProjectRepository repo) : ControllerBase
{
    Guid UserId => Guid.Parse(User.FindFirst("id")!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int limit = 10)
        => Ok(await repo.GetByUserAsync(UserId, status, page, limit));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var proj = await repo.GetByIdAndUserAsync(id, UserId);
        if (proj == null) return NotFound(new { error = "Project not found or access denied" });
        return Ok(proj);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        => Created("", await repo.CreateAsync(UserId, dto.Name, dto.Description));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto dto)
    {
        var proj = await repo.GetByIdAndUserAsync(id, UserId);
        if (proj == null) return NotFound(new { error = "Project not found or access denied" });
        return Ok(await repo.UpdateAsync(id, UserId, dto.Name, dto.Description));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateProjectStatusDto dto)
    {
        var valid = new[] { "ACTIVE", "COMPLETED", "ARCHIVED" };
        if (!valid.Contains(dto.Status)) return BadRequest(new { error = "Status must be ACTIVE, COMPLETED or ARCHIVED" });
        var proj = await repo.GetByIdAndUserAsync(id, UserId);
        if (proj == null) return NotFound(new { error = "Project not found or access denied" });
        return Ok(await repo.UpdateStatusAsync(id, UserId, dto.Status));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await repo.SoftDeleteAsync(id, UserId);
        if (!deleted) return NotFound(new { error = "Project not found or access denied" });
        return Ok(new { message = "Project deleted successfully" });
    }
}
