using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using FormularioFoodieApi.Data;
using FormularioFoodieApi.Data.Repositories;
using FormularioFoodieApi.Data.Repositories.Interfaces;
using FormularioFoodieApi.Services;
using FormularioFoodieApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var connectionString = builder.Configuration.GetConnectionString("ConnectionDataBase");
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

// Dependency Injection
builder.Services.AddScoped<IFormularioFoodieRepository, FormularioFoodieRepository>();
builder.Services.AddScoped<IFormularioFoodieService, FormularioFoodieService>();
builder.Services.AddScoped<IUsersApiService, UsersApiService>();
builder.Services.AddHttpClient<IUsersApiService, UsersApiService>();

builder.Services.AddDbContext<FormularioFoodieDbContext>(options =>
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
            Title = "API de Formulario Foodie",
            Version = "v1",
            Description = "API que permite manejar formularios de aplicación para foodie bloggers"
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
        var context = scope.ServiceProvider.GetRequiredService<FormularioFoodieDbContext>();
        context.Database.Migrate();
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
