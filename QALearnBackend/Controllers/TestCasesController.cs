using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Authorize]
public class TestCasesController(TestCaseRepository repo) : ControllerBase
{
    Guid UserId => Guid.Parse(User.FindFirst("id")!.Value);
    bool IsAdmin => User.HasClaim("role", "ADMIN");

    async Task<IActionResult?> AssertOwner(Guid projectId)
    {
        if (!await repo.ProjectBelongsToUserAsync(projectId, UserId))
            return NotFound(new { error = "Project not found or access denied" });
        return null;
    }

    [HttpGet("api/projects/{projectId:guid}/test-cases")]
    public async Task<IActionResult> GetAll(Guid projectId, [FromQuery] string? status, [FromQuery] string? type, [FromQuery] Guid? idRequirement)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        return Ok(await repo.GetByProjectAsync(projectId, status, type, idRequirement));
    }

    [HttpGet("api/projects/{projectId:guid}/test-cases/{caseId:guid}")]
    public async Task<IActionResult> GetById(Guid projectId, Guid caseId)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var tc = await repo.GetByIdAsync(caseId, projectId);
        if (tc == null) return NotFound(new { error = "Test case not found" });
        return Ok(tc);
    }

    [HttpPost("api/projects/{projectId:guid}/test-cases")]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateTestCaseDto dto)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var valid = new[] { "FUNCTIONAL", "NON_FUNCTIONAL", "REGRESSION" };
        if (!valid.Contains(dto.Type)) return BadRequest(new { error = "Type must be FUNCTIONAL, NON_FUNCTIONAL or REGRESSION" });
        return Created("", await repo.CreateAsync(projectId, dto.Title, dto.Type, dto.Description, dto.Preconditions, dto.IdRequirement));
    }

    [HttpPut("api/projects/{projectId:guid}/test-cases/{caseId:guid}")]
    public async Task<IActionResult> Update(Guid projectId, Guid caseId, [FromBody] UpdateTestCaseDto dto)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var tc = await repo.GetByIdAsync(caseId, projectId);
        if (tc == null) return NotFound(new { error = "Test case not found" });
        var valid = new[] { "FUNCTIONAL", "NON_FUNCTIONAL", "REGRESSION" };
        if (!valid.Contains(dto.Type)) return BadRequest(new { error = "Type must be FUNCTIONAL, NON_FUNCTIONAL or REGRESSION" });
        return Ok(await repo.UpdateAsync(caseId, projectId, dto.Title, dto.Type, dto.Description, dto.Preconditions));
    }

    [HttpPatch("api/projects/{projectId:guid}/test-cases/{caseId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid projectId, Guid caseId, [FromBody] UpdateTestCaseStatusDto dto)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var tc = await repo.GetByIdAsync(caseId, projectId);
        if (tc == null) return NotFound(new { error = "Test case not found" });
        var valid = new[] { "DRAFT", "ACTIVE", "DEPRECATED" };
        if (!valid.Contains(dto.Status)) return BadRequest(new { error = "Status must be DRAFT, ACTIVE or DEPRECATED" });
        return Ok(await repo.UpdateStatusAsync(caseId, projectId, dto.Status));
    }

    [HttpPatch("api/projects/{projectId:guid}/test-cases/{caseId:guid}/library-request")]
    public async Task<IActionResult> RequestLibrary(Guid projectId, Guid caseId)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var tc = await repo.GetByIdAsync(caseId, projectId);
        if (tc == null) return NotFound(new { error = "Test case not found" });
        if (tc.LibraryStatus == "PENDING")  return BadRequest(new { error = "Ya está pendiente de aprobación" });
        if (tc.LibraryStatus == "APPROVED") return BadRequest(new { error = "Ya fue aprobado para el repositorio" });
        var result = await repo.UpdateLibraryStatusAsync(caseId, "PENDING");
        return Ok(new { message = "Solicitud enviada. Pendiente de aprobación.", result });
    }

    [HttpPatch("api/projects/{projectId:guid}/test-cases/{caseId:guid}/library-approve")]
    public async Task<IActionResult> ApproveLibrary(Guid projectId, Guid caseId, [FromBody] ApproveLibraryDto dto)
    {
        if (!IsAdmin) return Forbid();
        var tc = await repo.GetByIdAsync(caseId, projectId);
        if (tc == null) return NotFound(new { error = "Test case not found" });
        if (tc.LibraryStatus != "PENDING") return BadRequest(new { error = "El caso no está pendiente de aprobación" });
        await repo.UpdateLibraryStatusAsync(caseId, "APPROVED");
        if (!await repo.ExistsInLibraryAsync(caseId))
            await repo.AddToLibraryAsync(caseId, UserId, dto.Category, dto.Tags);
        return Ok(new { message = "Caso aprobado y enviado al repositorio." });
    }

    [HttpPatch("api/projects/{projectId:guid}/test-cases/{caseId:guid}/library-reject")]
    public async Task<IActionResult> RejectLibrary(Guid projectId, Guid caseId)
    {
        if (!IsAdmin) return Forbid();
        var tc = await repo.GetByIdAsync(caseId, projectId);
        if (tc == null) return NotFound(new { error = "Test case not found" });
        if (tc.LibraryStatus != "PENDING") return BadRequest(new { error = "El caso no está pendiente" });
        await repo.UpdateLibraryStatusAsync(caseId, null);
        return Ok(new { message = "Solicitud rechazada." });
    }

    [HttpGet("api/test-cases/pending-library")]
    public async Task<IActionResult> PendingLibrary()
    {
        if (!IsAdmin) return Forbid();
        return Ok(new { cases = await repo.GetPendingLibraryAsync() });
    }

    [HttpDelete("api/projects/{projectId:guid}/test-cases/{caseId:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid caseId)
    {
        var err = await AssertOwner(projectId); if (err != null) return err;
        var tc = await repo.GetByIdAsync(caseId, projectId);
        if (tc == null) return NotFound(new { error = "Test case not found" });
        await repo.SoftDeleteAsync(caseId, projectId);
        return Ok(new { message = "Test case deleted successfully" });
    }
}
