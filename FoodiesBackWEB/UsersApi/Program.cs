using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using UsersApi.Data;
using UsersApi.Data.Repositories;
using UsersApi.Data.Repositories.Interfaces;
using UsersApi.Services;
using UsersApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var connectionString = builder.Configuration.GetConnectionString("ConnectionDataBase");
builder.Services.AddHttpContextAccessor();

// Dependency Injection
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IRolRepository, RolRepository>();
builder.Services.AddScoped<IUsuarioRolRepository, UsuarioRolRepository>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IRolService, RolService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddDbContext<UsersDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddFoodiesAuthentication(builder.Configuration);

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireAssertion(context => 
            context.User.IsInRole("admin") || context.User.IsInRole("Admin")));
});

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, _) =>
    {
        document.Info = new()
        {
            Title = "API de Usuarios",
            Version = "v1",
            Description = "API que permite controlar y manejar la creacion y edicion de usuarios"
        };
        return Task.CompletedTask;
    });
});



var app = builder.Build();

// Solo ejecutar migraciones en desarrollo
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<UsersDbContext>();
        context.Database.Migrate();

        // Ejecutar script inicial para crear roles
        var initialScriptPath = Path.Combine(AppContext.BaseDirectory, "Scripts", "InitialRoles.sql");
        if (File.Exists(initialScriptPath))
        {
            var sql = File.ReadAllText(initialScriptPath);
            using var conn = new NpgsqlConnection(connectionString);
            conn.Open();
            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.ExecuteNonQuery();
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
