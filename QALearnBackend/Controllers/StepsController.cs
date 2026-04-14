using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/projects/{projectId:guid}/test-cases/{caseId:guid}/steps"), Authorize]
public class StepsController(StepRepository repo) : ControllerBase
{
    Guid UserId => Guid.Parse(User.FindFirst("id")!.Value);

    async Task<IActionResult?> AssertOwnership(Guid projectId, Guid caseId)
    {
        if (!await repo.ProjectBelongsToUserAsync(projectId, UserId))
            return NotFound(new { error = "Project not found or access denied" });
        if (!await repo.TestCaseBelongsToProjectAsync(caseId, projectId))
            return NotFound(new { error = "Test case not found in this project" });
        return null;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid projectId, Guid caseId, [FromBody] CreateStepDto dto)
    {
        var err = await AssertOwnership(projectId, caseId); if (err != null) return err;
        if (await repo.StepNumberExistsAsync(caseId, dto.StepNumber))
            return Conflict(new { error = $"Step number {dto.StepNumber} already exists" });
        return Created("", await repo.CreateAsync(caseId, dto.StepNumber, dto.Action, dto.ExpectedResult));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid projectId, Guid caseId, [FromQuery] int limit = 100, [FromQuery] int offset = 0)
    {
        var err = await AssertOwnership(projectId, caseId); if (err != null) return err;
        return Ok(await repo.GetByTestCaseAsync(caseId, limit, offset));
    }

    [HttpGet("{stepId:guid}")]
    public async Task<IActionResult> GetById(Guid projectId, Guid caseId, Guid stepId)
    {
        var err = await AssertOwnership(projectId, caseId); if (err != null) return err;
        var step = await repo.GetByIdAsync(stepId);
        if (step == null) return NotFound(new { error = $"Step {stepId} not found" });
        return Ok(step);
    }

    [HttpPut("{stepId:guid}")]
    public async Task<IActionResult> Update(Guid projectId, Guid caseId, Guid stepId, [FromBody] UpdateStepDto dto)
    {
        var err = await AssertOwnership(projectId, caseId); if (err != null) return err;
        var step = await repo.GetByIdAsync(stepId);
        if (step == null) return NotFound(new { error = $"Step {stepId} not found" });
        if (step.StepNumber != dto.StepNumber && await repo.StepNumberExistsAsync(caseId, dto.StepNumber))
            return Conflict(new { error = $"Step number {dto.StepNumber} already exists" });
        return Ok(await repo.UpdateAsync(stepId, dto.StepNumber, dto.Action, dto.ExpectedResult));
    }

    [HttpPatch("{stepId:guid}")]
    public async Task<IActionResult> Patch(Guid projectId, Guid caseId, Guid stepId, [FromBody] PatchStepDto dto)
    {
        var err = await AssertOwnership(projectId, caseId); if (err != null) return err;
        if (dto.StepNumber == null && dto.Action == null && dto.ExpectedResult == null)
            return BadRequest(new { error = "At least one field must be provided" });
        var step = await repo.GetByIdAsync(stepId);
        if (step == null) return NotFound(new { error = $"Step {stepId} not found" });
        if (dto.StepNumber != null && dto.StepNumber != step.StepNumber && await repo.StepNumberExistsAsync(caseId, dto.StepNumber.Value))
            return Conflict(new { error = $"Step number {dto.StepNumber} already exists" });
        return Ok(await repo.PatchAsync(stepId, dto.StepNumber, dto.Action, dto.ExpectedResult));
    }

    [HttpDelete("{stepId:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid caseId, Guid stepId)
    {
        var err = await AssertOwnership(projectId, caseId); if (err != null) return err;
        var step = await repo.GetByIdAsync(stepId);
        if (step == null) return NotFound(new { error = $"Step {stepId} not found" });
        await repo.DeleteAsync(stepId);
        return Ok(new { message = "Step deleted successfully" });
    }
}
