using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/courses"), Authorize]
public class CoursesController(CourseRepository repo) : ControllerBase
{
    bool IsAdmin => User.HasClaim("role", "ADMIN");

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(new { courses = await repo.GetAllAsync() });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var course = await repo.GetByIdAsync(id);
        if (course == null) return NotFound(new { error = "Curso no encontrado" });
        return Ok(new { course });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourseDto dto)
    {
        if (!IsAdmin) return Forbid();
        var validStatus = new[] { "ACTIVE", "INACTIVE" };
        if (!validStatus.Contains(dto.Status)) return BadRequest(new { error = "Status must be ACTIVE or INACTIVE" });
        if (await repo.TitleExistsAsync(dto.Title)) return BadRequest(new { error = "Ya existe un curso con ese título" });
        return Created("", new { message = "Curso creado correctamente", course = await repo.CreateAsync(dto.Title, dto.Description, dto.Status) });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCourseDto dto)
    {
        if (!IsAdmin) return Forbid();
        var course = await repo.GetByIdAsync(id);
        if (course == null) return NotFound(new { error = "Curso no encontrado" });
        return Ok(new { message = "Curso actualizado correctamente", course = await repo.UpdateAsync(id, dto.Title, dto.Description, dto.Status) });
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateCourseStatusDto dto)
    {
        if (!IsAdmin) return Forbid();
        var course = await repo.GetByIdAsync(id);
        if (course == null) return NotFound(new { error = "Curso no encontrado" });
        var valid = new[] { "ACTIVE", "INACTIVE" };
        if (!valid.Contains(dto.Status)) return BadRequest(new { error = "Status must be ACTIVE or INACTIVE" });
        return Ok(new { message = "Status actualizado correctamente", course = await repo.UpdateAsync(id, null, null, dto.Status) });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!IsAdmin) return Forbid();
        var course = await repo.GetByIdAsync(id);
        if (course == null) return NotFound(new { error = "Curso no encontrado" });
        await repo.DeleteAsync(id);
        return Ok(new { message = "Curso eliminado correctamente" });
    }
}
