using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class DiagnosticRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<bool> LevelExistsAsync(Guid id) { using var c = Conn(); return await c.ExecuteScalarAsync<int>("SELECT 1 FROM levels WHERE id_level = @Id", new { Id = id }) == 1; }
    public async Task<bool> RouteExistsAsync(Guid id) { using var c = Conn(); return await c.ExecuteScalarAsync<int>("SELECT 1 FROM learning_routes WHERE id_route = @Id", new { Id = id }) == 1; }

    public async Task<DiagnosticEntity> CreateAsync(Guid userId, decimal score, Guid levelId, Guid routeId)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<DiagnosticEntity>(
            @"INSERT INTO diagnostic (id_user, score, id_level, id_route, performed_at)
              VALUES (@UserId, @Score, @LevelId, @RouteId, NOW())
              RETURNING id_diagnostic, score, performed_at",
            new { UserId = userId, Score = score, LevelId = levelId, RouteId = routeId });
    }

    public async Task<IEnumerable<DiagnosticEntity>> GetByUserAsync(Guid userId)
    {
        using var c = Conn();
        return await c.QueryAsync<DiagnosticEntity>(
            @"SELECT d.id_diagnostic, d.score, d.performed_at, l.level_name, r.route_name
              FROM diagnostic d
              JOIN levels l ON d.id_level = l.id_level
              JOIN learning_routes r ON d.id_route = r.id_route
              WHERE d.id_user = @UserId ORDER BY d.performed_at DESC",
            new { UserId = userId });
    }

    public async Task<DiagnosticEntity?> GetByIdAsync(Guid diagId, Guid userId)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<DiagnosticEntity>(
            "SELECT id_diagnostic, score, performed_at FROM diagnostic WHERE id_diagnostic = @DiagId AND id_user = @UserId",
            new { DiagId = diagId, UserId = userId });
    }
}
