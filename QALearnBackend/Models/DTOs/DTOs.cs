using System.ComponentModel.DataAnnotations;

namespace QALearnAPI.Models.DTOs;

// ── Auth ──────────────────────────────────────────────────────────────────
public record RegisterDto(
    [Required, MinLength(2), MaxLength(50)] string FirstName,
    [Required, MinLength(2), MaxLength(50)] string LastName,
    [Required, EmailAddress]               string Email,
    [Required] string Password);

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required]               string Password);

// ── Users ─────────────────────────────────────────────────────────────────
public record UpdateUserStatusDto([Required] string Status);

// ── Projects ──────────────────────────────────────────────────────────────
public record CreateProjectDto(
    [Required, MinLength(1), MaxLength(200)] string Name,
    [MaxLength(1000)] string? Description);

public record UpdateProjectDto(
    [Required, MinLength(1), MaxLength(200)] string Name,
    [MaxLength(1000)] string? Description);

public record UpdateProjectStatusDto([Required] string Status);

// ── Requirements ──────────────────────────────────────────────────────────
public record CreateRequirementDto(
    [Required, MinLength(1), MaxLength(50)] string Code,
    [Required, MinLength(1)]               string Description,
    string? Priority);

public record UpdateRequirementDto(
    [Required, MinLength(1), MaxLength(50)] string Code,
    [Required, MinLength(1)]               string Description,
    [Required]                             string Priority);

public record UpdateRequirementStatusDto([Required] string Status);

// ── TestCases ─────────────────────────────────────────────────────────────
public record CreateTestCaseDto(
    [Required, MinLength(1), MaxLength(200)] string Title,
    [Required]                               string Type,
    [MaxLength(2000)]                        string? Description,
    [MaxLength(2000)]                        string? Preconditions,
    Guid?                                    IdRequirement);

public record UpdateTestCaseDto(
    [Required, MinLength(1), MaxLength(200)] string Title,
    [Required]                               string Type,
    [MaxLength(2000)]                        string? Description,
    [MaxLength(2000)]                        string? Preconditions);

public record UpdateTestCaseStatusDto([Required] string Status);

public record ApproveLibraryDto(
    [Required, MinLength(1), MaxLength(100)] string Category,
    string[]? Tags);

// ── Steps ─────────────────────────────────────────────────────────────────
public record CreateStepDto(
    [Required, Range(1, int.MaxValue)] int StepNumber,
    [Required, MinLength(1)]           string Action,
    [Required, MinLength(1)]           string ExpectedResult);

public record UpdateStepDto(
    [Required, Range(1, int.MaxValue)] int StepNumber,
    [Required, MinLength(1)]           string Action,
    [Required, MinLength(1)]           string ExpectedResult);

public record PatchStepDto(int? StepNumber, string? Action, string? ExpectedResult);

// ── Executions ────────────────────────────────────────────────────────────
public record CreateExecutionDto(
    [Required] Guid   IdTestCase,
    [Required] string Result,
    string? Observations);

public record UpdateExecutionDto(string? Result, string? Observations);

// ── Evidences ─────────────────────────────────────────────────────────────
public record CreateEvidenceDto(
    [Required]        string Type,
    [Required, Url]   string FileUrl,
    string?           Description);

public record UpdateEvidenceDto(string? Type, string? FileUrl, string? Description);

// ── Courses ───────────────────────────────────────────────────────────────
public record CreateCourseDto(
    [Required, MinLength(1), MaxLength(200)] string Title,
    string? Description,
    string  Status = "ACTIVE");

public record UpdateCourseDto(
    [MinLength(1), MaxLength(200)] string? Title,
    string? Description,
    string? Status);

public record UpdateCourseStatusDto([Required] string Status);

// ── Modules ───────────────────────────────────────────────────────────────
public record CreateModuleDto(
    [Required, MinLength(1), MaxLength(200)] string Title,
    [Required, MinLength(1)]                 string Content,
    [Required, Range(1, int.MaxValue)]       int    Orders);

public record UpdateModuleDto(
    [MinLength(1), MaxLength(200)] string? Title,
    [MinLength(1)]                 string? Content,
    [Range(1, int.MaxValue)]       int?    Orders);

// ── Diagnostic ────────────────────────────────────────────────────────────
public record CreateDiagnosticDto(
    [Required, Range(0, 100)] decimal Score,
    [Required]                Guid    IdLevel,
    [Required]                Guid    IdRoute);

// ── Learning Routes ───────────────────────────────────────────────────────
public record CreateRouteDto(
    [Required, MinLength(1), MaxLength(150)] string RouteName,
    [Required]                               Guid   IdLevel,
    string? Description);

public record UpdateRouteDto(
    [MinLength(1), MaxLength(150)] string? RouteName,
    string? Description);

public record AddCourseToRouteDto(
    [Required]                     Guid IdCourse,
    [Required, Range(1, int.MaxValue)] int  Orders);

// ── Library ───────────────────────────────────────────────────────────────
public record CreateLibraryDto(
    [Required]                               Guid     IdTestCase,
    [Required, MinLength(1), MaxLength(100)] string   Category,
    string[]? Tags);

public record UpdateLibraryDto(
    [MinLength(1), MaxLength(100)] string? Category,
    string[]? Tags);
