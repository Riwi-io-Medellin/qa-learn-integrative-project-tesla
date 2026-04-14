using Dapper;
using QALearnAPI.Models.Entities;

namespace QALearnAPI.Repositories;

public class RouteRepository(IConfiguration cfg) : DbRepository(cfg)
{
    public async Task<RouteEntity> CreateAsync(Guid levelId, string routeName, string? description)
    {
        using var c = Conn();
        return await c.QueryFirstAsync<RouteEntity>(
            @"INSERT INTO learning_routes (id_level, route_name, description) VALUES (@LId, @Name, @Desc)
              RETURNING id_route, route_name, description",
            new { LId = levelId, Name = routeName, Desc = description });
    }

    public async Task<IEnumerable<RouteEntity>> GetAllAsync(Guid? levelId)
    {
        using var c = Conn();
        var sql = @"SELECT lr.id_route, lr.route_name, l.level_name, COUNT(cr.id_course) AS total_courses
                    FROM learning_routes lr
                    LEFT JOIN levels l ON lr.id_level = l.id_level
                    LEFT JOIN course_routes cr ON lr.id_route = cr.id_route";
        if (levelId != null) sql += " WHERE lr.id_level = @LId";
        sql += " GROUP BY lr.id_route, lr.route_name, l.level_name ORDER BY lr.created_at DESC";
        return await c.QueryAsync<RouteEntity>(sql, new { LId = levelId });
    }

    public async Task<RouteEntity?> GetByIdAsync(Guid id)
    {
        using var c = Conn();
        var rows = await c.QueryAsync<RouteEntity, RouteCourseItem, RouteEntity>(
            @"SELECT lr.id_route, lr.route_name, l.level_name, lr.description,
                     c.id_course, c.title, cr.orders
              FROM learning_routes lr
              LEFT JOIN levels l ON lr.id_level = l.id_level
              LEFT JOIN course_routes cr ON lr.id_route = cr.id_route
              LEFT JOIN courses c ON cr.id_course = c.id_course
              WHERE lr.id_route = @Id ORDER BY cr.orders",
            (route, course) => { route = route with { Courses = route.Courses ?? [] }; if (course?.IdCourse != null) route.Courses.Add(course); return route; },
            new { Id = id }, splitOn: "id_course");
        return rows.GroupBy(r => r.IdRoute).Select(g => g.First() with { Courses = g.SelectMany(r => r.Courses ?? []).ToList() }).FirstOrDefault();
    }

    public async Task<bool> NameExistsAsync(string name) { using var c = Conn(); return await c.ExecuteScalarAsync<int>("SELECT 1 FROM learning_routes WHERE route_name = @Name", new { Name = name }) == 1; }

    public async Task<RouteEntity?> UpdateAsync(Guid id, string? routeName, string? description)
    {
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<RouteEntity>(
            @"UPDATE learning_routes SET route_name = COALESCE(@Name, route_name), description = COALESCE(@Desc, description), updated_at = now()
              WHERE id_route = @Id RETURNING id_route, route_name, description",
            new { Name = routeName, Desc = description, Id = id });
    }

    public async Task DeleteAsync(Guid id) { using var c = Conn(); await c.ExecuteAsync("DELETE FROM learning_routes WHERE id_route = @Id", new { Id = id }); }

    public async Task<bool> CourseInRouteAsync(Guid routeId, Guid courseId) { using var c = Conn(); return await c.ExecuteScalarAsync<int>("SELECT 1 FROM course_routes WHERE id_route = @R AND id_course = @C", new { R = routeId, C = courseId }) == 1; }

    public async Task AddCourseAsync(Guid routeId, Guid courseId, int orders)
    {
        using var c = Conn();
        await c.ExecuteAsync("INSERT INTO course_routes (id_route, id_course, orders) VALUES (@R, @C, @Orders)", new { R = routeId, C = courseId, Orders = orders });
    }

    public async Task RemoveCourseAsync(Guid routeId, Guid courseId) { using var c = Conn(); await c.ExecuteAsync("DELETE FROM course_routes WHERE id_route = @R AND id_course = @C", new { R = routeId, C = courseId }); }
}
