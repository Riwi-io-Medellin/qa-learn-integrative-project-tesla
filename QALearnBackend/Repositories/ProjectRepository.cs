using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class ProjectRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<ProjectEntity> CreateAsync(Guid userId, string name, string? description)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<ProjectEntity>(
            @"INSERT INTO projects (id_user, name, description, status)
              VALUES (@UserId, @Name, @Desc, 'ACTIVE')
              RETURNING id_project, name, status, created_at",
            new { UserId = userId, Name = name, Desc = description });
    }

    public async Task<IEnumerable<ProjectEntity>> GetByUserAsync(Guid userId, string? status, int page, int limit)
    {
        using var c = Conn();
        var sql = "SELECT id_project, name, status, created_at FROM projects WHERE id_user = @UserId AND deleted_at IS NULL";
        if (status != null) sql += " AND status = @Status";
        sql += " ORDER BY created_at DESC LIMIT @Limit OFFSET @Offset";
        return await c.QueryAsync<ProjectEntity>(sql, new { UserId = userId, Status = status, Limit = limit, Offset = (page - 1) * limit });
    }

    public async Task<ProjectEntity?> GetByIdAndUserAsync(Guid projectId, Guid userId)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<ProjectEntity>(
            @"SELECT p.id_project, p.name, p.description, p.status, p.created_at,
                     COUNT(DISTINCT r.id_requirement) AS total_requirements,
                     COUNT(DISTINCT tc.id_test_case)  AS total_test_cases
              FROM projects p
              LEFT JOIN requirements r ON r.id_project = p.id_project
              LEFT JOIN test_cases tc  ON tc.id_project = p.id_project AND tc.deleted_at IS NULL
              WHERE p.id_project = @ProjectId AND p.id_user = @UserId AND p.deleted_at IS NULL
              GROUP BY p.id_project",
            new { ProjectId = projectId, UserId = userId });
    }

    public async Task<ProjectEntity?> UpdateAsync(Guid projectId, Guid userId, string name, string? description)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<ProjectEntity>(
            @"UPDATE projects SET name = @Name, description = @Desc, updated_at = NOW()
              WHERE id_project = @ProjectId AND id_user = @UserId AND deleted_at IS NULL
              RETURNING id_project, name",
            new { Name = name, Desc = description, ProjectId = projectId, UserId = userId });
    }

    public async Task<dynamic?> UpdateStatusAsync(Guid projectId, Guid userId, string status)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync(
            @"UPDATE projects SET status = @Status, updated_at = NOW()
              WHERE id_project = @ProjectId AND id_user = @UserId AND deleted_at IS NULL
              RETURNING id_project, status",
            new { Status = status, ProjectId = projectId, UserId = userId });
    }

    public async Task<bool> SoftDeleteAsync(Guid projectId, Guid userId)
    {
        using var c = Conn();
        var rows = await c.ExecuteAsync(
            "UPDATE projects SET deleted_at = NOW() WHERE id_project = @ProjectId AND id_user = @UserId AND deleted_at IS NULL",
            new { ProjectId = projectId, UserId = userId });
        return rows > 0;
    }
}
