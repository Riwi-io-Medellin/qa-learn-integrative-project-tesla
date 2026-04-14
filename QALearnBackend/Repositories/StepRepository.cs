using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class StepRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<bool> ProjectBelongsToUserAsync(Guid projectId, Guid userId)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT 1 FROM projects WHERE id_project = @P AND id_user = @U AND deleted_at IS NULL",
            new { P = projectId, U = userId }) == 1;
    }

    public async Task<bool> TestCaseBelongsToProjectAsync(Guid tcId, Guid projectId)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT 1 FROM test_cases WHERE id_test_case = @TcId AND id_project = @P AND deleted_at IS NULL",
            new { TcId = tcId, P = projectId }) == 1;
    }

    public async Task<bool> StepNumberExistsAsync(Guid tcId, int stepNumber)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT 1 FROM test_steps WHERE id_test_case = @TcId AND step_number = @Num",
            new { TcId = tcId, Num = stepNumber }) == 1;
    }

    public async Task<StepEntity> CreateAsync(Guid tcId, int stepNumber, string action, string expectedResult)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<StepEntity>(
            @"INSERT INTO test_steps (id_test_case, step_number, action, expected_result)
              VALUES (@TcId, @Num, @Action, @Expected)
              RETURNING id_step, step_number, action, expected_result",
            new { TcId = tcId, Num = stepNumber, Action = action, Expected = expectedResult });
    }

    public async Task<IEnumerable<StepEntity>> GetByTestCaseAsync(Guid tcId, int limit = 100, int offset = 0)
    {
        using var c = Conn();
        return await c.QueryAsync<StepEntity>(
            "SELECT id_step, step_number, action, expected_result FROM test_steps WHERE id_test_case = @TcId ORDER BY step_number LIMIT @L OFFSET @O",
            new { TcId = tcId, L = limit, O = offset });
    }

    public async Task<StepEntity?> GetByIdAsync(Guid stepId)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<StepEntity>(
            "SELECT id_step, step_number, action, expected_result FROM test_steps WHERE id_step = @StepId",
            new { StepId = stepId });
    }

    public async Task<StepEntity?> UpdateAsync(Guid stepId, int stepNumber, string action, string expectedResult)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<StepEntity>(
            @"UPDATE test_steps SET step_number = @Num, action = @Action, expected_result = @Expected
              WHERE id_step = @StepId RETURNING id_step, step_number, action, expected_result",
            new { Num = stepNumber, Action = action, Expected = expectedResult, StepId = stepId });
    }

    public async Task<StepEntity?> PatchAsync(Guid stepId, int? stepNumber, string? action, string? expectedResult)
    {
        var parts  = new List<string>();
        var p      = new DynamicParameters();
        p.Add("StepId", stepId);
        if (stepNumber    != null) { parts.Add("step_number = @Num");      p.Add("Num",      stepNumber); }
        if (action        != null) { parts.Add("action = @Action");         p.Add("Action",   action); }
        if (expectedResult != null) { parts.Add("expected_result = @Exp"); p.Add("Exp",      expectedResult); }
        if (parts.Count == 0) throw new ArgumentException("No fields to update");
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<StepEntity>(
            $"UPDATE test_steps SET {string.Join(", ", parts)} WHERE id_step = @StepId RETURNING id_step, step_number, action, expected_result", p);
    }

    public async Task DeleteAsync(Guid stepId)
    {
        using var c = Conn();
        await c.ExecuteAsync("DELETE FROM test_steps WHERE id_step = @StepId", new { StepId = stepId });
    }
}
