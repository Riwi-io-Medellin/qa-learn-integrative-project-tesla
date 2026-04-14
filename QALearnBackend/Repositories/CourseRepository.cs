using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class CourseRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<CourseEntity> CreateAsync(string title, string? description, string status)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<CourseEntity>(
            @"INSERT INTO courses (title, description, status) VALUES (@Title, @Desc, @Status)
              RETURNING id_course, title, description, status, created_at",
            new { Title = title, Desc = description, Status = status });
    }

    public async Task<IEnumerable<CourseEntity>> GetAllAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<CourseEntity>(
            "SELECT id_course, title, description, status, created_at FROM courses ORDER BY created_at DESC");
    }

    public async Task<CourseEntity?> GetByIdAsync(Guid id)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<CourseEntity>(
            "SELECT id_course, title, description, status, created_at FROM courses WHERE id_course = @Id",
            new { Id = id });
    }

    public async Task<bool> TitleExistsAsync(string title)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>("SELECT 1 FROM courses WHERE title = @Title", new { Title = title }) == 1;
    }

    public async Task<CourseEntity?> UpdateAsync(Guid id, string? title, string? description, string? status)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<CourseEntity>(
            @"UPDATE courses SET title = COALESCE(@Title, title), description = COALESCE(@Desc, description),
              status = COALESCE(@Status, status), updated_at = now()
              WHERE id_course = @Id RETURNING id_course, title, description, status, created_at",
            new { Title = title, Desc = description, Status = status, Id = id });
    }

    public async Task DeleteAsync(Guid id)
    {
        using var c = Conn();
        await c.ExecuteAsync("DELETE FROM courses WHERE id_course = @Id", new { Id = id });
    }
}
