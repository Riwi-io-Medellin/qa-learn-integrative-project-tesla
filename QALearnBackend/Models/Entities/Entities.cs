namespace QALearnAPI.Models.Entities;

public record UserEntity(Guid IdUser, string FirstName, string LastName, string Email, string? RoleName, string Status, DateTime? CreatedAt);
public record ProjectEntity(Guid IdProject, string Name, string? Description, string Status, DateTime CreatedAt, long TotalRequirements = 0, long TotalTestCases = 0);
public record RequirementEntity(Guid IdRequirement, string Code, string Description, string Priority, string Status);
public class TestCaseEntity
{
    public Guid IdTestCase { get; set; }
    public string Title { get; set; } = "";
    public string Type { get; set; } = "";
    public string Status { get; set; } = "";
    public string? LibraryStatus { get; set; }
    public string? Description { get; set; }
    public string? Preconditions { get; set; }
    public Guid? IdRequirement { get; set; }
    public List<StepEntity>? Steps { get; set; }
}
public record StepEntity(Guid IdStep, int StepNumber, string Action, string ExpectedResult);
public record ExecutionEntity(Guid IdExecution, Guid IdTestCase, Guid IdUser, string Result, string? Observations, DateTime ExecutedAt);
public record EvidenceEntity(Guid IdEvidence, Guid IdExecution, string Type, string FileUrl, string? Description, DateTime UploadedAt);
public record CourseEntity(Guid IdCourse, string Title, string? Description, string Status, DateTime CreatedAt);
public record ModuleEntity(Guid IdModule, Guid IdCourse, string Title, string Content, int Orders, DateTime CreatedAt);
public record ModuleQuestionEntity(Guid IdQuestion, Guid IdModule, string Question, string Options, string Correct, int Orders);
public record LevelEntity(Guid IdLevel, string LevelName, string? Description);
public record RoleEntity(Guid IdRole, string RoleName, string? Description);
public class DiagnosticEntity
{
    public Guid IdDiagnostic { get; set; }
    public decimal Score { get; set; }
    public string? LevelName { get; set; }
    public string? RouteName { get; set; }
    public DateTime PerformedAt { get; set; }
}
public class RouteEntity
{
    public Guid IdRoute { get; set; }
    public string RouteName { get; set; } = "";
    public string? LevelName { get; set; }
    public string? Description { get; set; }
    public int TotalCourses { get; set; }
    public List<RouteCourseItem>? Courses { get; set; }
}
public class RouteSummary {
    public Guid IdRoute { get; set; }
    public string RouteName { get; set; } = "";
    public string? LevelName { get; set; }
    public int TotalCourses { get; set; }
}
public record RouteCourseItem(Guid? IdCourse, string? Title, int Orders);
public record LibraryTestEntity(Guid IdLibrary, Guid IdTestCase, Guid IdAdmin, string Category, string[]? Tags, DateTime ValidatedAt);
public record PendingCaseEntity(Guid IdTestCase, Guid IdProject, string Title, string ProjectName, string UserName);
public record UserLoginEntity(Guid IdUser, string FirstName, string LastName, string Email, string PasswordHash, string RoleName);
