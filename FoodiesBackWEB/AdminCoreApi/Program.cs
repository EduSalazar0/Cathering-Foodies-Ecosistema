using Microsoft.AspNetCore.Authentication.JwtBearer;
using AdminCoreApi.Services;
using AdminCoreApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Configurar puerto según ambiente
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://localhost:5005");
}
else if (builder.Environment.IsProduction())
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

// Configurar HttpClient para comunicación con otras APIs
builder.Services.AddHttpClient("UsersApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiUrls:UsersApi"] ?? "http://localhost:5001");
});

builder.Services.AddHttpClient("ReservasApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiUrls:ReservasApi"] ?? "http://localhost:5002");
});

builder.Services.AddHttpClient("FormularioFoodieApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiUrls:FormularioFoodieApi"] ?? "http://localhost:5003");
});

// Dependency Injection
builder.Services.AddScoped<IUsersApiService, UsersApiService>();
builder.Services.AddScoped<IReservasApiService, ReservasApiService>();
builder.Services.AddScoped<IFormularioFoodieApiService, FormularioFoodieApiService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IRolesService, RolesService>();

// Configuración de JWT
builder.Services.AddFoodiesAuthentication(builder.Configuration);

// Configurar autorización con política personalizada para Admin (case-insensitive)
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
            Title = "Admin Core API",
            Version = "v1",
            Description = "API de administración central para gestión completa del core de FoodiesBNB"
        };
        return Task.CompletedTask;
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
