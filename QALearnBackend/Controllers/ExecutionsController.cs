using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/executions"), Authorize]
public class ExecutionsController(ExecutionRepository repo) : ControllerBase
{
    Guid UserId => Guid.Parse(User.FindFirst("id")!.Value);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateExecutionDto dto)
    {
        var valid = new[] { "PASSED", "FAILED", "BLOCKED" };
        if (!valid.Contains(dto.Result)) return BadRequest(new { error = "Result must be PASSED, FAILED or BLOCKED" });
        var exec = await repo.CreateAsync(dto.IdTestCase, UserId, dto.Result, dto.Observations);
        return Created("", new { message = "Ejecución creada correctamente", execution = exec });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(new { executions = await repo.GetAllAsync() });

    [HttpGet("test-case/{tcId:guid}")]
    public async Task<IActionResult> GetByTestCase(Guid tcId) => Ok(new { executions = await repo.GetByTestCaseAsync(tcId) });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var exec = await repo.GetByIdAsync(id);
        if (exec == null) return NotFound(new { error = "Ejecución no encontrada" });
        return Ok(new { execution = exec });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateExecutionDto dto)
    {
        var exec = await repo.GetByIdAsync(id);
        if (exec == null) return NotFound(new { error = "Ejecución no encontrada" });
        var valid = new[] { "PASSED", "FAILED", "BLOCKED" };
        if (dto.Result != null && !valid.Contains(dto.Result)) return BadRequest(new { error = "Result must be PASSED, FAILED or BLOCKED" });
        return Ok(new { message = "Ejecución actualizada correctamente", execution = await repo.UpdateAsync(id, dto.Result, dto.Observations) });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var exec = await repo.GetByIdAsync(id);
        if (exec == null) return NotFound(new { error = "Ejecución no encontrada" });
        await repo.DeleteAsync(id);
        return Ok(new { message = "Ejecución eliminada correctamente" });
    }
}
