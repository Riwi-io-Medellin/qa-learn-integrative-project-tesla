using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/diagnostic"), Authorize]
public class DiagnosticController(DiagnosticRepository repo) : ControllerBase
{
    Guid UserId => Guid.Parse(User.FindFirst("id")!.Value);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDiagnosticDto dto)
    {
        if (!await repo.LevelExistsAsync(dto.IdLevel)) return BadRequest(new { error = "Nivel no encontrado" });
        if (!await repo.RouteExistsAsync(dto.IdRoute)) return BadRequest(new { error = "Ruta no encontrada" });
        return Created("", await repo.CreateAsync(UserId, dto.Score, dto.IdLevel, dto.IdRoute));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await repo.GetByUserAsync(UserId));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
        => Ok(await repo.GetByIdAsync(id, UserId) ?? throw new KeyNotFoundException("Diagnóstico no encontrado"));
}
