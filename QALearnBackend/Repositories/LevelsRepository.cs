using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class LevelsRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<IEnumerable<LevelEntity>> GetAllLevelsAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<LevelEntity>("SELECT id_level, level_name, description FROM levels ORDER BY level_name ASC");
    }

    public async Task<IEnumerable<RoleEntity>> GetAllRolesAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<RoleEntity>("SELECT id_role, role_name, description FROM roles ORDER BY role_name ASC");
    }
}
