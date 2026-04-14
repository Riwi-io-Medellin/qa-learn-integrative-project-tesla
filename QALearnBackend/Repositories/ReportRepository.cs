using Dapper;

namespace QALearnAPI.Repositories;

public class ReportRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<object?> GetProjectReportAsync(Guid projectId, Guid userId)
    {
        using var c = Conn();
        var proj = await c.QueryFirstOrDefaultAsync(
            "SELECT id_project, name, description, status, created_at FROM projects WHERE id_project = @P AND id_user = @U AND deleted_at IS NULL",
            new { P = projectId, U = userId });
        if (proj == null) return null;

        var reqs = await c.QueryAsync(
            "SELECT id_requirement, code, description, priority, status FROM requirements WHERE id_project = @P AND deleted_at IS NULL ORDER BY created_at ASC",
            new { P = projectId });

        var requirements = new List<object>();
        foreach (var req in reqs)
        {
            var cases = await c.QueryAsync(
                @"SELECT tc.id_test_case, tc.title, tc.type, tc.status,
                         (SELECT COUNT(*) FROM test_steps ts WHERE ts.id_test_case = tc.id_test_case) AS step_count,
                         (SELECT COUNT(*) FROM test_executions te WHERE te.id_test_case = tc.id_test_case) AS exec_count,
                         (SELECT te2.result FROM test_executions te2 WHERE te2.id_test_case = tc.id_test_case ORDER BY te2.executed_at DESC LIMIT 1) AS last_result
                  FROM test_cases tc WHERE tc.id_requirement = @ReqId AND tc.deleted_at IS NULL ORDER BY tc.created_at ASC",
                new { ReqId = (Guid)req.id_requirement });

            var caseList = new List<object>();
            foreach (var tc in cases)
            {
                var steps = await c.QueryAsync(
                    "SELECT id_step, step_number, action, expected_result FROM test_steps WHERE id_test_case = @TcId ORDER BY step_number ASC",
                    new { TcId = (Guid)tc.id_test_case });
                caseList.Add(new { tc.id_test_case, tc.title, tc.type, tc.status, tc.last_result, steps });
            }
            requirements.Add(new { req.id_requirement, req.code, req.description, req.priority, req.status, cases = caseList });
        }

        var allCases = requirements.SelectMany(r => ((dynamic)r).cases as IEnumerable<dynamic> ?? []);
        var results  = allCases.Select(c2 => (string?)((dynamic)c2).last_result).Where(r => r != null).ToList();
        var stats = new {
            total   = results.Count,
            passed  = results.Count(r => r == "PASSED"),
            failed  = results.Count(r => r == "FAILED"),
            blocked = results.Count(r => r == "BLOCKED"),
            pending = allCases.Count(c2 => ((dynamic)c2).last_result == null)
        };

        return new { proj.id_project, proj.name, proj.description, proj.status, requirements, stats };
    }
}
