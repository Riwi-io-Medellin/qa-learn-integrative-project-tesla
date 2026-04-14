using Dapper;
using Npgsql;
using System.Data;

namespace QALearnAPI.Repositories;

public class DbRepository
{
    private readonly string _connStr;
    public DbRepository(IConfiguration cfg) => _connStr = cfg.GetConnectionString("Postgres")!;
    protected IDbConnection Conn() => new NpgsqlConnection(_connStr);
}
