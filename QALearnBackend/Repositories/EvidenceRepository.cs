using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class EvidenceRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<bool> ExecutionExistsAsync(Guid executionId)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT 1 FROM test_executions WHERE id_execution = @Id", new { Id = executionId }) == 1;
    }

    public async Task<EvidenceEntity> CreateAsync(Guid executionId, string type, string fileUrl, string? description)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<EvidenceEntity>(
            @"INSERT INTO evidences (id_execution, type, file_url, description)
              VALUES (@ExId, @Type, @Url, @Desc)
              RETURNING id_evidence, id_execution, type, file_url, description, uploaded_at",
            new { ExId = executionId, Type = type, Url = fileUrl, Desc = description });
    }

    public async Task<IEnumerable<EvidenceEntity>> GetByExecutionAsync(Guid executionId)
    {
        using var c = Conn();
        return await c.QueryAsync<EvidenceEntity>(
            "SELECT id_evidence, id_execution, type, file_url, description, uploaded_at FROM evidences WHERE id_execution = @ExId ORDER BY uploaded_at DESC",
            new { ExId = executionId });
    }

    public async Task<EvidenceEntity?> GetByIdAsync(Guid id)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<EvidenceEntity>(
            "SELECT id_evidence, id_execution, type, file_url, description, uploaded_at FROM evidences WHERE id_evidence = @Id",
            new { Id = id });
    }

    public async Task<EvidenceEntity?> UpdateAsync(Guid id, string? type, string? fileUrl, string? description)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<EvidenceEntity>(
            @"UPDATE evidences SET type = COALESCE(@Type, type), file_url = COALESCE(@Url, file_url), description = COALESCE(@Desc, description), updated_at = now()
              WHERE id_evidence = @Id RETURNING id_evidence, id_execution, type, file_url, description, uploaded_at",
            new { Type = type, Url = fileUrl, Desc = description, Id = id });
    }

    public async Task DeleteAsync(Guid id)
    {
        using var c = Conn();
        await c.ExecuteAsync("DELETE FROM evidences WHERE id_evidence = @Id", new { Id = id });
    }
}
