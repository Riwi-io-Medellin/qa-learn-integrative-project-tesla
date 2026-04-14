using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class RequirementRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<bool> ProjectBelongsToUserAsync(Guid projectId, Guid userId)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT 1 FROM projects WHERE id_project = @P AND id_user = @U AND deleted_at IS NULL",
            new { P = projectId, U = userId }) == 1;
    }

    public async Task<IEnumerable<RequirementEntity>> GetByProjectAsync(Guid projectId, string? status, string? priority)
    {
        using var c = Conn();
        var sql = "SELECT id_requirement, code, description, priority, status FROM requirements WHERE id_project = @P";
        if (status   != null) sql += " AND status = @Status";
        if (priority != null) sql += " AND priority = @Priority";
        sql += " ORDER BY created_at ASC";
        return await c.QueryAsync<RequirementEntity>(sql, new { P = projectId, Status = status, Priority = priority });
    }

    public async Task<RequirementEntity?> GetByIdAsync(Guid reqId, Guid projectId)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<RequirementEntity>(
            "SELECT id_requirement, code, description, priority, status FROM requirements WHERE id_requirement = @R AND id_project = @P",
            new { R = reqId, P = projectId });
    }

    public async Task<bool> CodeExistsAsync(Guid projectId, string code, Guid? excludeId = null)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT 1 FROM requirements WHERE id_project = @P AND code = @Code AND (@ExcludeId::uuid IS NULL OR id_requirement <> @ExcludeId)",
            new { P = projectId, Code = code, ExcludeId = excludeId }) == 1;
    }

    public async Task<RequirementEntity> CreateAsync(Guid projectId, string code, string description, string priority)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<RequirementEntity>(
            @"INSERT INTO requirements (id_project, code, description, priority, status)
              VALUES (@P, @Code, @Desc, @Priority, 'DRAFT')
              RETURNING id_requirement, code",
            new { P = projectId, Code = code, Desc = description, Priority = priority });
    }

    public async Task<RequirementEntity?> UpdateAsync(Guid reqId, Guid projectId, string code, string description, string priority)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<RequirementEntity>(
            @"UPDATE requirements SET code = @Code, description = @Desc, priority = @Priority, updated_at = NOW()
              WHERE id_requirement = @R AND id_project = @P
              RETURNING id_requirement, code",
            new { R = reqId, P = projectId, Code = code, Desc = description, Priority = priority });
    }

    public async Task<dynamic?> UpdateStatusAsync(Guid reqId, Guid projectId, string status)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync(
            @"UPDATE requirements SET status = @Status, updated_at = NOW()
              WHERE id_requirement = @R AND id_project = @P
              RETURNING id_requirement, status",
            new { Status = status, R = reqId, P = projectId });
    }

    public async Task<bool> HasTestCasesAsync(Guid reqId)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT 1 FROM test_cases WHERE id_requirement = @R AND deleted_at IS NULL LIMIT 1",
            new { R = reqId }) == 1;
    }

    public async Task DeleteAsync(Guid reqId, Guid projectId)
    {
        using var c = Conn();
        await c.ExecuteAsync("DELETE FROM requirements WHERE id_requirement = @R AND id_project = @P", new { R = reqId, P = projectId });
    }
}
