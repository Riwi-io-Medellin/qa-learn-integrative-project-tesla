using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class ExecutionRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<ExecutionEntity> CreateAsync(Guid tcId, Guid userId, string result, string? observations)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<ExecutionEntity>(
            @"INSERT INTO test_executions (id_test_case, id_user, result, observations)
              VALUES (@TcId, @UserId, @Result, @Obs)
              RETURNING id_execution, id_test_case, id_user, result, observations, executed_at",
            new { TcId = tcId, UserId = userId, Result = result, Obs = observations });
    }

    public async Task<IEnumerable<ExecutionEntity>> GetAllAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<ExecutionEntity>(
            "SELECT id_execution, id_test_case, id_user, result, observations, executed_at FROM test_executions ORDER BY executed_at DESC");
    }

    public async Task<ExecutionEntity?> GetByIdAsync(Guid id)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<ExecutionEntity>(
            "SELECT id_execution, id_test_case, id_user, result, observations, executed_at FROM test_executions WHERE id_execution = @Id",
            new { Id = id });
    }

    public async Task<IEnumerable<ExecutionEntity>> GetByTestCaseAsync(Guid tcId)
    {
        using var c = Conn();
        return await c.QueryAsync<ExecutionEntity>(
            "SELECT id_execution, id_test_case, id_user, result, observations, executed_at FROM test_executions WHERE id_test_case = @TcId ORDER BY executed_at DESC",
            new { TcId = tcId });
    }

    public async Task<ExecutionEntity?> UpdateAsync(Guid id, string? result, string? observations)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<ExecutionEntity>(
            @"UPDATE test_executions SET result = COALESCE(@Result, result), observations = COALESCE(@Obs, observations), updated_at = now()
              WHERE id_execution = @Id RETURNING id_execution, id_test_case, id_user, result, observations, executed_at",
            new { Result = result, Obs = observations, Id = id });
    }

    public async Task DeleteAsync(Guid id)
    {
        using var c = Conn();
        await c.ExecuteAsync("DELETE FROM test_executions WHERE id_execution = @Id", new { Id = id });
    }
}
