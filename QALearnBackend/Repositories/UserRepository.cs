using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class UserRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<IEnumerable<UserEntity>> GetAllAsync(string? status, int page, int limit)
    {
        using var c = Conn();
        var sql = @"SELECT u.id_user, u.first_name, u.last_name, u.email, r.role_name, u.status, u.created_at
                    FROM users u LEFT JOIN roles r ON u.id_role = r.id_role
                    WHERE u.deleted_at IS NULL";
        if (status != null) sql += " AND u.status = @Status";
        sql += " ORDER BY u.created_at DESC LIMIT @Limit OFFSET @Offset";
        return await c.QueryAsync<UserEntity>(sql, new { Status = status, Limit = limit, Offset = (page - 1) * limit });
    }

    public async Task<UserEntity?> GetByIdAsync(Guid id)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<UserEntity>(
            @"SELECT u.id_user, u.first_name, u.last_name, u.email, r.role_name, u.status, u.created_at
              FROM users u LEFT JOIN roles r ON u.id_role = r.id_role
              WHERE u.id_user = @Id AND u.deleted_at IS NULL", new { Id = id });
    }

    public async Task<dynamic?> UpdateStatusAsync(Guid id, string status)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync(
            "UPDATE users SET status = @Status, updated_at = now() WHERE id_user = @Id RETURNING id_user, status",
            new { Status = status, Id = id });
    }

    public async Task SoftDeleteAsync(Guid id)
    {
        using var c = Conn();
        await c.ExecuteAsync("UPDATE users SET deleted_at = now() WHERE id_user = @Id", new { Id = id });
    }
}
