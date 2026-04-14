using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/projects/{projectId:guid}/requirements"), Authorize]
public class RequirementsController(RequirementRepository repo) : ControllerBase
{
    Guid UserId => Guid.Parse(User.FindFirst("id")!.Value);

    async Task<IActionResult?> AssertOwner(Guid projectId)
    {
        if (!await repo.ProjectBelongsToUserAsync(projectId, UserId))
            return NotFound(new { error = "Project not found or access denied" });
        return null;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid projectId, [FromQuery] string? status, [FromQuery] string? priority)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        return Ok(await repo.GetByProjectAsync(projectId, status, priority));
    }

    [HttpGet("{reqId:guid}")]
    public async Task<IActionResult> GetById(Guid projectId, Guid reqId)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var req = await repo.GetByIdAsync(reqId, projectId);
        if (req == null) return NotFound(new { error = "Requirement not found" });
        return Ok(req);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateRequirementDto dto)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var validPriorities = new[] { "HIGH", "MEDIUM", "LOW" };
        var priority = dto.Priority ?? "MEDIUM";
        if (!validPriorities.Contains(priority)) return BadRequest(new { error = "Priority must be HIGH, MEDIUM or LOW" });
        if (await repo.CodeExistsAsync(projectId, dto.Code)) return BadRequest(new { error = $"Code \"{dto.Code}\" already exists in this project" });
        return Created("", await repo.CreateAsync(projectId, dto.Code, dto.Description, priority));
    }

    [HttpPut("{reqId:guid}")]
    public async Task<IActionResult> Update(Guid projectId, Guid reqId, [FromBody] UpdateRequirementDto dto)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var req = await repo.GetByIdAsync(reqId, projectId);
        if (req == null) return NotFound(new { error = "Requirement not found" });
        var validPriorities = new[] { "HIGH", "MEDIUM", "LOW" };
        if (!validPriorities.Contains(dto.Priority)) return BadRequest(new { error = "Priority must be HIGH, MEDIUM or LOW" });
        if (await repo.CodeExistsAsync(projectId, dto.Code, reqId)) return BadRequest(new { error = $"Code \"{dto.Code}\" already exists in this project" });
        return Ok(await repo.UpdateAsync(reqId, projectId, dto.Code, dto.Description, dto.Priority));
    }

    [HttpPatch("{reqId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid projectId, Guid reqId, [FromBody] UpdateRequirementStatusDto dto)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var req = await repo.GetByIdAsync(reqId, projectId);
        if (req == null) return NotFound(new { error = "Requirement not found" });
        var valid = new[] { "DRAFT", "APPROVED", "DEPRECATED" };
        if (!valid.Contains(dto.Status)) return BadRequest(new { error = "Status must be DRAFT, APPROVED or DEPRECATED" });
        return Ok(await repo.UpdateStatusAsync(reqId, projectId, dto.Status));
    }

    [HttpDelete("{reqId:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid reqId)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var req = await repo.GetByIdAsync(reqId, projectId);
        if (req == null) return NotFound(new { error = "Requirement not found" });
        if (await repo.HasTestCasesAsync(reqId)) return BadRequest(new { error = "Requirement has associated test cases and cannot be deleted" });
        await repo.DeleteAsync(reqId, projectId);
        return Ok(new { message = "Requirement deleted successfully" });
    }
}
