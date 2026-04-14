using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QALearnAPI.Repositories;

namespace QALearnAPI.Controllers;

[ApiController, Route("api/projects/{id:guid}/report"), Authorize]
public class ReportController(ReportRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetReport(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst("id")!.Value);
        var report = await repo.GetProjectReportAsync(id, userId);
        if (report == null) return NotFound(new { error = "Proyecto no encontrado." });
        return Ok(report);
    }
}
