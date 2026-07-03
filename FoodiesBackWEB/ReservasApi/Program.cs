using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using ReservasApi.Data;
using ReservasApi.Data.Repositories;
using ReservasApi.Data.Repositories.Interfaces;
using ReservasApi.Services;
using ReservasApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("ConnectionDataBase");
builder.Services.AddHttpContextAccessor();

// Dependency Injection
builder.Services.AddScoped<IReservaRepository, ReservaRepository>();
builder.Services.AddScoped<IEntregableRepository, EntregableRepository>();
builder.Services.AddScoped<IReservaService, ReservaService>();
builder.Services.AddScoped<IEntregableService, EntregableService>();
builder.Services.AddScoped<IUserApiService, UserApiService>();
builder.Services.AddHttpClient<IUserApiService, UserApiService>();

// Database Context
builder.Services.AddDbContext<ReservasDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// JWT Configuration - Siguiendo el patrón de UsersApi
builder.Services.AddFoodiesAuthentication(builder.Configuration);

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("admin") || context.User.IsInRole("Admin")));
});

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Database Migration on startup
// Solo ejecutar migraciones en desarrollo
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ReservasDbContext>();
        try
        {
            context.Database.Migrate();
            Console.WriteLine("Database migrated successfully - ReservasApi");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database migration failed: {ex.Message}");
        }
    }
}

Console.WriteLine("ReservasApi starting on http://localhost:5004");

app.Run();
