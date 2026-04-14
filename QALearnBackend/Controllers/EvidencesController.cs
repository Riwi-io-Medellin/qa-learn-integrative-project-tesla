using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/executions/{executionId:guid}/evidences"), Authorize]
public class EvidencesController(EvidenceRepository repo) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(Guid executionId, [FromBody] CreateEvidenceDto dto)
    {
        if (!await repo.ExecutionExistsAsync(executionId)) return NotFound(new { error = "Ejecución no encontrada" });
        var valid = new[] { "SCREENSHOT", "VIDEO", "DOCUMENT" };
        if (!valid.Contains(dto.Type)) return BadRequest(new { error = "Type must be SCREENSHOT, VIDEO or DOCUMENT" });
        return Created("", new { message = "Evidencia creada correctamente", evidence = await repo.CreateAsync(executionId, dto.Type, dto.FileUrl, dto.Description) });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid executionId)
    {
        if (!await repo.ExecutionExistsAsync(executionId)) return NotFound(new { error = "Ejecución no encontrada" });
        return Ok(new { evidences = await repo.GetByExecutionAsync(executionId) });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid executionId, Guid id)
    {
        var ev = await repo.GetByIdAsync(id);
        if (ev == null) return NotFound(new { error = "Evidencia no encontrada" });
        return Ok(new { evidence = ev });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid executionId, Guid id, [FromBody] UpdateEvidenceDto dto)
    {
        var ev = await repo.GetByIdAsync(id);
        if (ev == null) return NotFound(new { error = "Evidencia no encontrada" });
        var valid = new[] { "SCREENSHOT", "VIDEO", "DOCUMENT" };
        if (dto.Type != null && !valid.Contains(dto.Type)) return BadRequest(new { error = "Type must be SCREENSHOT, VIDEO or DOCUMENT" });
        return Ok(new { message = "Evidencia actualizada correctamente", evidence = await repo.UpdateAsync(id, dto.Type, dto.FileUrl, dto.Description) });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid executionId, Guid id)
    {
        var ev = await repo.GetByIdAsync(id);
        if (ev == null) return NotFound(new { error = "Evidencia no encontrada" });
        await repo.DeleteAsync(id);
        return Ok(new { message = "Evidencia eliminada correctamente" });
    }
}
