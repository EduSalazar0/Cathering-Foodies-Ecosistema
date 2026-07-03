using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

// Asegurar que use el puerto correcto en producción
if (builder.Environment.IsProduction())
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddFoodiesAuthentication(builder.Configuration);

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAuthenticatedUser", policy =>
    {
        policy.RequireAuthenticatedUser();
    });

// Configurar CORS con orígenes desde variables de entorno
var frontendOrigin = Environment.GetEnvironmentVariable("FRONTEND_ORIGIN") ?? "https://foodies-frontend-42bd.onrender.com";
var allowedOrigins = new List<string> { frontendOrigin };

// Siempre permitir localhost para desarrollo
if (!allowedOrigins.Contains("http://localhost:4200"))
    allowedOrigins.Add("http://localhost:4200");
if (!allowedOrigins.Contains("http://localhost:3000"))
    allowedOrigins.Add("http://localhost:3000");
if (!allowedOrigins.Contains("http://localhost:5173"))
    allowedOrigins.Add("http://localhost:5173");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowConfiguredOrigins", policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowConfiguredOrigins");

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ErrorAuthMiddleware>();
app.MapReverseProxy();
app.Run();
