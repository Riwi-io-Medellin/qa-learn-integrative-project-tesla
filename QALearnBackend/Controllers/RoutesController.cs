using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/routes"), Authorize]
public class RoutesController(RouteRepository repo) : ControllerBase
{
    bool IsAdmin => User.HasClaim("role", "ADMIN");

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? idLevel) => Ok(new { routes = await repo.GetAllAsync(idLevel) });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var route = await repo.GetByIdAsync(id);
        if (route == null) return NotFound(new { error = "Ruta no encontrada" });
        return Ok(new { route });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRouteDto dto)
    {
        if (!IsAdmin) return Forbid();
        if (await repo.NameExistsAsync(dto.RouteName)) return BadRequest(new { error = "Ya existe una ruta con ese nombre" });
        return Created("", new { message = "Ruta creada correctamente", route = await repo.CreateAsync(dto.IdLevel, dto.RouteName, dto.Description) });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRouteDto dto)
    {
        if (!IsAdmin) return Forbid();
        var route = await repo.GetByIdAsync(id);
        if (route == null) return NotFound(new { error = "Ruta no encontrada" });
        return Ok(new { message = "Ruta actualizada correctamente", route = await repo.UpdateAsync(id, dto.RouteName, dto.Description) });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!IsAdmin) return Forbid();
        var route = await repo.GetByIdAsync(id);
        if (route == null) return NotFound(new { error = "Ruta no encontrada" });
        await repo.DeleteAsync(id);
        return Ok(new { message = "Ruta eliminada correctamente" });
    }

    [HttpPost("{id:guid}/courses")]
    public async Task<IActionResult> AddCourse(Guid id, [FromBody] AddCourseToRouteDto dto)
    {
        if (!IsAdmin) return Forbid();
        var route = await repo.GetByIdAsync(id);
        if (route == null) return NotFound(new { error = "Ruta no encontrada" });
        if (await repo.CourseInRouteAsync(id, dto.IdCourse)) return BadRequest(new { error = "El curso ya está en esta ruta" });
        await repo.AddCourseAsync(id, dto.IdCourse, dto.Orders);
        return Created("", new { message = "Curso agregado a la ruta correctamente" });
    }

    [HttpDelete("{id:guid}/courses/{courseId:guid}")]
    public async Task<IActionResult> RemoveCourse(Guid id, Guid courseId)
    {
        if (!IsAdmin) return Forbid();
        if (!await repo.CourseInRouteAsync(id, courseId)) return BadRequest(new { error = "El curso no está en esta ruta" });
        await repo.RemoveCourseAsync(id, courseId);
        return Ok(new { message = "Curso eliminado de la ruta correctamente" });
    }
}
