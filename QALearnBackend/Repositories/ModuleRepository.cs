using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class ModuleRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<ModuleEntity> CreateAsync(Guid courseId, string title, string content, int orders)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<ModuleEntity>(
            @"INSERT INTO modules (id_course, title, content, orders) VALUES (@CId, @Title, @Content, @Orders)
              RETURNING id_module, id_course, title, content, orders, created_at",
            new { CId = courseId, Title = title, Content = content, Orders = orders });
    }

    public async Task<IEnumerable<ModuleEntity>> GetByCourseAsync(Guid courseId)
    {
        using var c = Conn();
        return await c.QueryAsync<ModuleEntity>(
            "SELECT id_module, id_course, title, content, orders, created_at FROM modules WHERE id_course = @CId ORDER BY orders ASC",
            new { CId = courseId });
    }

    public async Task<ModuleEntity?> GetByIdAsync(Guid id)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<ModuleEntity>(
            "SELECT id_module, id_course, title, content, orders, created_at FROM modules WHERE id_module = @Id",
            new { Id = id });
    }

    public async Task<ModuleEntity?> UpdateAsync(Guid id, string? title, string? content, int? orders)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<ModuleEntity>(
            @"UPDATE modules SET title = COALESCE(@Title, title), content = COALESCE(@Content, content),
              orders = COALESCE(@Orders, orders), updated_at = now()
              WHERE id_module = @Id RETURNING id_module, id_course, title, content, orders, created_at",
            new { Title = title, Content = content, Orders = orders, Id = id });
    }

    public async Task DeleteAsync(Guid id)
    {
        using var c = Conn();
        await c.ExecuteAsync("DELETE FROM modules WHERE id_module = @Id", new { Id = id });
    }
}
