using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/courses/{courseId:guid}/modules"), Authorize]
public class ModulesController(ModuleRepository moduleRepo, CourseRepository courseRepo) : ControllerBase
{
    bool IsAdmin => User.HasClaim("role", "ADMIN");

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid courseId)
    {
        if (await courseRepo.GetByIdAsync(courseId) == null) return NotFound(new { error = "Curso no encontrado" });
        return Ok(new { modules = await moduleRepo.GetByCourseAsync(courseId) });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid courseId, Guid id)
    {
        var module = await moduleRepo.GetByIdAsync(id);
        if (module == null) return NotFound(new { error = "Módulo no encontrado" });
        return Ok(new { module });
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid courseId, [FromBody] CreateModuleDto dto)
    {
        if (!IsAdmin) return Forbid();
        if (await courseRepo.GetByIdAsync(courseId) == null) return NotFound(new { error = "Curso no encontrado" });
        return Created("", new { message = "Módulo creado correctamente", module = await moduleRepo.CreateAsync(courseId, dto.Title, dto.Content, dto.Orders) });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid courseId, Guid id, [FromBody] UpdateModuleDto dto)
    {
        if (!IsAdmin) return Forbid();
        var module = await moduleRepo.GetByIdAsync(id);
        if (module == null) return NotFound(new { error = "Módulo no encontrado" });
        return Ok(new { message = "Módulo actualizado correctamente", module = await moduleRepo.UpdateAsync(id, dto.Title, dto.Content, dto.Orders) });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid courseId, Guid id)
    {
        if (!IsAdmin) return Forbid();
        var module = await moduleRepo.GetByIdAsync(id);
        if (module == null) return NotFound(new { error = "Módulo no encontrado" });
        await moduleRepo.DeleteAsync(id);
        return Ok(new { message = "Módulo eliminado correctamente" });
    }
}
