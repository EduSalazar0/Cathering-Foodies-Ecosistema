using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

public class DebugTokenMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length);
            Console.WriteLine($"DEBUG GATEWAY: Token recibido en path: {context.Request.Path}");
            
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(token);
                
                var userIdClaim = jsonToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                var emailClaim = jsonToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email);
                
                Console.WriteLine($"DEBUG GATEWAY: Usuario ID del token: {userIdClaim?.Value}");
                Console.WriteLine($"DEBUG GATEWAY: Email del token: {emailClaim?.Value}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DEBUG GATEWAY: Error al leer token: {ex.Message}");
            }
        }
        else
        {
            Console.WriteLine($"DEBUG GATEWAY: No hay token en path: {context.Request.Path}");
        }

        await next(context);
    }
}