using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Models.DTOs;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/library"), Authorize]
public class LibraryController(LibraryRepository repo) : ControllerBase
{
    Guid UserId  => Guid.Parse(User.FindFirst("id")!.Value);
    bool IsAdmin => User.HasClaim("role", "ADMIN");

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(new { libraryTests = await repo.GetAllAsync() });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var lt = await repo.GetByIdAsync(id);
        if (lt == null) return NotFound(new { error = "Test case no encontrado en la librería" });
        return Ok(new { libraryTest = lt });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLibraryDto dto)
    {
        if (!IsAdmin) return Forbid();
        if (!await repo.TestCaseActiveAsync(dto.IdTestCase)) return BadRequest(new { error = "Test case not found or has been deleted" });
        if (await repo.AlreadyInLibraryAsync(dto.IdTestCase)) return BadRequest(new { error = "Este test case ya está en la librería" });
        return Created("", new { message = "Test case agregado a la librería correctamente", libraryTest = await repo.CreateAsync(dto.IdTestCase, UserId, dto.Category, dto.Tags) });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLibraryDto dto)
    {
        if (!IsAdmin) return Forbid();
        var lt = await repo.GetByIdAsync(id);
        if (lt == null) return NotFound(new { error = "Test case no encontrado en la librería" });
        return Ok(new { message = "Test case actualizado correctamente", libraryTest = await repo.UpdateAsync(id, dto.Category, dto.Tags) });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!IsAdmin) return Forbid();
        var lt = await repo.GetByIdAsync(id);
        if (lt == null) return NotFound(new { error = "Test case no encontrado en la librería" });
        await repo.DeleteAsync(id);
        return Ok(new { message = "Test case eliminado de la librería correctamente" });
    }
}
