using System.Net;
using System.Text.Json;

namespace QALearnAPI.Middleware;

public class ErrorMiddleware(RequestDelegate next, ILogger<ErrorMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try { await next(ctx); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            ctx.Response.StatusCode  = ex is KeyNotFoundException ? 404 : ex is UnauthorizedAccessException ? 403 : 400;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { error = ex.Message }));
        }
    }
}
