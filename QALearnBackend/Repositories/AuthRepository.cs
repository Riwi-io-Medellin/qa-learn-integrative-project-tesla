using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class AuthRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<UserEntity?> FindByEmailAsync(string email)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<UserEntity>(
            @"SELECT u.id_user, u.first_name, u.last_name, u.email,
                     r.role_name, u.status, u.created_at, u.password_hash
              FROM users u LEFT JOIN roles r ON u.id_role = r.id_role
              WHERE u.email = @Email", new { Email = email });
    }

    public async Task<UserEntity?> FindByIdAsync(Guid id)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<UserEntity>(
            @"SELECT u.id_user, u.first_name, u.last_name, u.email,
                     r.role_name, u.status, u.created_at
              FROM users u LEFT JOIN roles r ON u.id_role = r.id_role
              WHERE u.id_user = @Id AND u.deleted_at IS NULL", new { Id = id });
    }

    public async Task<Guid?> FindRoleIdByNameAsync(string roleName)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<Guid?>(
            "SELECT id_role FROM roles WHERE role_name = @Name", new { Name = roleName });
    }

    public async Task<UserEntity> CreateUserAsync(Guid idRole, string firstName, string lastName, string email, string passwordHash)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<UserEntity>(
            @"INSERT INTO users (id_role, first_name, last_name, email, password_hash)
              VALUES (@IdRole, @FirstName, @LastName, @Email, @Hash)
              RETURNING id_user, first_name, last_name, email",
            new { IdRole = idRole, FirstName = firstName, LastName = lastName, Email = email, Hash = passwordHash });
    }

    // Se usa para leer password_hash al login
    public async Task<dynamic?> FindFullByEmailAsync(string email)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync(
            @"SELECT u.id_user, u.first_name, u.last_name, u.email,
                     u.password_hash, r.role_name
              FROM users u LEFT JOIN roles r ON u.id_role = r.id_role
              WHERE u.email = @Email", new { Email = email });
    }
}
