namespace QALearnAPI.Models.Entities;

public record UserEntity(Guid IdUser, string FirstName, string LastName, string Email, string? RoleName, string Status, DateTime? CreatedAt);
public record ProjectEntity(Guid IdProject, string Name, string? Description, string Status, DateTime CreatedAt, long TotalRequirements = 0, long TotalTestCases = 0);
public record RequirementEntity(Guid IdRequirement, string Code, string Description, string Priority, string Status);
public record TestCaseEntity(Guid IdTestCase, string Title, string Type, string Status, string? LibraryStatus, string? Description, string? Preconditions, Guid? IdRequirement, List<StepEntity>? Steps = null);
public record StepEntity(Guid IdStep, int StepNumber, string Action, string ExpectedResult);
public record ExecutionEntity(Guid IdExecution, Guid IdTestCase, Guid IdUser, string Result, string? Observations, DateTime ExecutedAt);
public record EvidenceEntity(Guid IdEvidence, Guid IdExecution, string Type, string FileUrl, string? Description, DateTime UploadedAt);
public record CourseEntity(Guid IdCourse, string Title, string? Description, string Status, DateTime CreatedAt);
public record ModuleEntity(Guid IdModule, Guid IdCourse, string Title, string Content, int Orders, DateTime CreatedAt);
public record LevelEntity(Guid IdLevel, string LevelName, string? Description);
public record RoleEntity(Guid IdRole, string RoleName, string? Description);
public record DiagnosticEntity(Guid IdDiagnostic, decimal Score, string? LevelName, string? RouteName, DateTime PerformedAt);
public record RouteEntity(Guid IdRoute, string RouteName, string? LevelName, string? Description, int TotalCourses = 0, List<RouteCourseItem>? Courses = null);
public record RouteCourseItem(Guid? IdCourse, string? Title, int Orders);
public record LibraryTestEntity(Guid IdLibrary, Guid IdTestCase, Guid IdAdmin, string Category, string[]? Tags, DateTime ValidatedAt);
public record PendingCaseEntity(Guid IdTestCase, Guid IdProject, string Title, string ProjectName, string UserName);
