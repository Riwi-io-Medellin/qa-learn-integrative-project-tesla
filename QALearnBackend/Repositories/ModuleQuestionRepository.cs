using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class ModuleQuestionRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<IEnumerable<ModuleQuestionEntity>> GetByModuleAsync(Guid moduleId)
    {
        using var c = Conn();
        return await c.QueryAsync<ModuleQuestionEntity>(
            "SELECT id_question, id_module, question, options, correct, orders FROM module_questions WHERE id_module = @Id ORDER BY orders ASC",
            new { Id = moduleId });
    }
}
