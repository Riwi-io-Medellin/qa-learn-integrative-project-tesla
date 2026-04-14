using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class LibraryRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<bool> TestCaseActiveAsync(Guid tcId) { using var c = Conn(); return await c.ExecuteScalarAsync<int>("SELECT 1 FROM test_cases WHERE id_test_case = @Id AND deleted_at IS NULL", new { Id = tcId }) == 1; }
    public async Task<bool> AlreadyInLibraryAsync(Guid tcId) { using var c = Conn(); return await c.ExecuteScalarAsync<int>("SELECT 1 FROM library_tests WHERE id_test_case = @Id", new { Id = tcId }) == 1; }

    public async Task<LibraryTestEntity> CreateAsync(Guid tcId, Guid adminId, string category, string[]? tags)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<LibraryTestEntity>(
            @"INSERT INTO library_tests (id_test_case, id_admin, category, tags) VALUES (@TcId, @AdminId, @Cat, @Tags)
              RETURNING id_library, id_test_case, id_admin, category, tags, validated_at",
            new { TcId = tcId, AdminId = adminId, Cat = category, Tags = tags });
    }

    public async Task<IEnumerable<LibraryTestEntity>> GetAllAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<LibraryTestEntity>(
            "SELECT id_library, id_test_case, id_admin, category, tags, validated_at FROM library_tests ORDER BY validated_at DESC");
    }

    public async Task<LibraryTestEntity?> GetByIdAsync(Guid id)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<LibraryTestEntity>(
            "SELECT id_library, id_test_case, id_admin, category, tags, validated_at FROM library_tests WHERE id_library = @Id",
            new { Id = id });
    }

    public async Task<LibraryTestEntity?> UpdateAsync(Guid id, string? category, string[]? tags)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<LibraryTestEntity>(
            @"UPDATE library_tests SET category = COALESCE(@Cat, category), tags = COALESCE(@Tags, tags), updated_at = now()
              WHERE id_library = @Id RETURNING id_library, id_test_case, id_admin, category, tags, validated_at",
            new { Cat = category, Tags = tags, Id = id });
    }

    public async Task DeleteAsync(Guid id) { using var c = Conn(); await c.ExecuteAsync("DELETE FROM library_tests WHERE id_library = @Id", new { Id = id }); }
}
