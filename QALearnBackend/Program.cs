using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using QALearnAPI.Middleware;
using QALearnAPI.Repositories;
using QALearnAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Repositorios ──────────────────────────────────────────────────────────
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<ProjectRepository>();
builder.Services.AddScoped<RequirementRepository>();
builder.Services.AddScoped<TestCaseRepository>();
builder.Services.AddScoped<StepRepository>();
builder.Services.AddScoped<ExecutionRepository>();
builder.Services.AddScoped<EvidenceRepository>();
builder.Services.AddScoped<CourseRepository>();
builder.Services.AddScoped<ModuleRepository>();
builder.Services.AddScoped<DiagnosticRepository>();
builder.Services.AddScoped<RouteRepository>();
builder.Services.AddScoped<LibraryRepository>();
builder.Services.AddScoped<LevelsRepository>();
builder.Services.AddScoped<ReportRepository>();
builder.Services.AddScoped<JwtService>();

// ── Controllers con JSON camelCase ────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        // Acepta tanto camelCase como PascalCase del frontend
        opt.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        // Devuelve camelCase al frontend
        opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });


builder.WebHost.ConfigureKestrel(o => o.AllowSynchronousIO = true);

// ── JWT ───────────────────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(opt => opt.AddDefaultPolicy(policy =>
    policy.WithOrigins(allowedOrigins)
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()));

// ── Swagger ───────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name   = "Authorization",
        Type   = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        In     = Microsoft.OpenApi.Models.ParameterLocation.Header,
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        [new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Reference = new Microsoft.OpenApi.Models.OpenApiReference
            { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
        }] = []
    });
});

// ── Dapper snake_case ─────────────────────────────────────────────────────
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var app = builder.Build();

// ── Pipeline ──────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ErrorMiddleware>();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
