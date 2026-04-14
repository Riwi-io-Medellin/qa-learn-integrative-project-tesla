using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class TestCaseRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<bool> ProjectBelongsToUserAsync(Guid projectId, Guid userId)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT 1 FROM projects WHERE id_project = @P AND id_user = @U AND deleted_at IS NULL",
            new { P = projectId, U = userId }) == 1;
    }

    public async Task<IEnumerable<TestCaseEntity>> GetByProjectAsync(Guid projectId, string? status, string? type, Guid? reqId)
    {
        using var c = Conn();
        var sql = "SELECT tc.id_test_case, tc.title, tc.type, tc.status, tc.library_status, tc.id_requirement FROM test_cases tc WHERE tc.id_project = @P AND tc.deleted_at IS NULL";
        if (status != null) sql += " AND tc.status = @Status";
        if (type   != null) sql += " AND tc.type = @Type";
        if (reqId  != null) sql += " AND tc.id_requirement = @ReqId";
        sql += " ORDER BY tc.created_at ASC";
        return await c.QueryAsync<TestCaseEntity>(sql, new { P = projectId, Status = status, Type = type, ReqId = reqId });
    }

    public async Task<TestCaseEntity?> GetByIdAsync(Guid testCaseId, Guid projectId)
    {
        using var c = Conn();
        var lookup = new Dictionary<Guid, TestCaseEntity>();
        await c.QueryAsync<TestCaseEntity, StepEntity, TestCaseEntity>(
            @"SELECT tc.id_test_case, tc.title, tc.type, tc.status, tc.library_status,
                     tc.description, tc.preconditions, tc.id_requirement,
                     ts.id_step, ts.step_number, ts.action, ts.expected_result
              FROM test_cases tc
              LEFT JOIN test_steps ts ON ts.id_test_case = tc.id_test_case
              WHERE tc.id_test_case = @TcId AND tc.id_project = @P AND tc.deleted_at IS NULL
              ORDER BY ts.step_number",
            (tc, step) =>
            {
                if (!lookup.TryGetValue(tc.IdTestCase, out var existing))
                {
                    existing = tc with { Steps = new List<StepEntity>() };
                    lookup[tc.IdTestCase] = existing;
                }
                if (step != null && step.IdStep != Guid.Empty)
                    existing.Steps!.Add(step);
                return existing;
            },
            new { TcId = testCaseId, P = projectId },
            splitOn: "id_step");
        return lookup.Values.FirstOrDefault();
    }

    public async Task<TestCaseEntity> CreateAsync(Guid projectId, string title, string type, string? description, string? preconditions, Guid? reqId)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<TestCaseEntity>(
            @"INSERT INTO test_cases (id_project, id_requirement, title, description, preconditions, type, status)
              VALUES (@P, @ReqId, @Title, @Desc, @Pre, @Type, 'DRAFT')
              RETURNING id_test_case, title",
            new { P = projectId, ReqId = reqId, Title = title, Desc = description, Pre = preconditions, Type = type });
    }

    public async Task<TestCaseEntity?> UpdateAsync(Guid tcId, Guid projectId, string title, string type, string? description, string? preconditions)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<TestCaseEntity>(
            @"UPDATE test_cases SET title = @Title, description = @Desc, preconditions = @Pre, type = @Type, updated_at = NOW()
              WHERE id_test_case = @TcId AND id_project = @P AND deleted_at IS NULL
              RETURNING id_test_case, title",
            new { Title = title, Desc = description, Pre = preconditions, Type = type, TcId = tcId, P = projectId });
    }

    public async Task<dynamic?> UpdateStatusAsync(Guid tcId, Guid projectId, string status)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync(
            @"UPDATE test_cases SET status = @Status, updated_at = NOW()
              WHERE id_test_case = @TcId AND id_project = @P AND deleted_at IS NULL
              RETURNING id_test_case, status",
            new { Status = status, TcId = tcId, P = projectId });
    }

    public async Task<dynamic?> UpdateLibraryStatusAsync(Guid tcId, string? libraryStatus)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync(
            @"UPDATE test_cases SET library_status = @LibStatus, updated_at = NOW()
              WHERE id_test_case = @TcId AND deleted_at IS NULL
              RETURNING id_test_case, library_status",
            new { LibStatus = libraryStatus, TcId = tcId });
    }

    public async Task<IEnumerable<PendingCaseEntity>> GetPendingLibraryAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<PendingCaseEntity>(
            @"SELECT tc.id_test_case, tc.id_project, tc.title,
                     p.name AS project_name,
                     u.first_name || ' ' || u.last_name AS user_name
              FROM test_cases tc
              JOIN projects p ON p.id_project = tc.id_project
              JOIN users u    ON u.id_user    = p.id_user
              WHERE tc.library_status = 'PENDING' AND tc.deleted_at IS NULL
              ORDER BY tc.updated_at DESC");
    }

    public async Task SoftDeleteAsync(Guid tcId, Guid projectId)
    {
        using var c = Conn();
        await c.ExecuteAsync(
            "UPDATE test_cases SET deleted_at = NOW() WHERE id_test_case = @TcId AND id_project = @P AND deleted_at IS NULL",
            new { TcId = tcId, P = projectId });
    }

    public async Task<bool> ExistsInLibraryAsync(Guid tcId)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>("SELECT 1 FROM library_tests WHERE id_test_case = @TcId", new { TcId = tcId }) == 1;
    }

    public async Task AddToLibraryAsync(Guid tcId, Guid adminId, string category, string[]? tags)
    {
        using var c = Conn();
        await c.ExecuteAsync(
            "INSERT INTO library_tests (id_test_case, id_admin, category, tags) VALUES (@TcId, @AdminId, @Category, @Tags)",
            new { TcId = tcId, AdminId = adminId, Category = category, Tags = tags });
    }
}
