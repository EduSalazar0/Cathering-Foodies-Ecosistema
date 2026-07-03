using UsersApi.Dtos.Request;
using UsersApi.Services.Interfaces;
using UsersApi.Data.Repositories.Interfaces;
using UsersApi.Helpers;

namespace UsersApi.Services
{
    public class AuthService(IUsuarioRepository usuarioRepository, IJwtService jwtService) : IAuthService
    {
        public async Task<object> LoginAsync(LoginRequest request)
        {
            Console.WriteLine($"DEBUG LOGIN: Intentando login para email: {request.Email}");
            
            var usuario = await usuarioRepository.GetByCorreoAsync(request.Email);
            if (usuario == null || !usuario.Activo)
            {
                Console.WriteLine($"DEBUG LOGIN: Usuario no encontrado o inactivo para email: {request.Email}");
                throw new UnauthorizedAccessException("Credenciales inválidas");
            }

            Console.WriteLine($"DEBUG LOGIN: Usuario encontrado - ID: {usuario.Id}, Email: {usuario.Correo}, Nombre: {usuario.Nombre}");

            if (!PasswordHelper.VerifyPassword(request.Password, usuario.PasswordHash))
            {
                Console.WriteLine($"DEBUG LOGIN: Password incorrecto para usuario ID: {usuario.Id}");
                throw new UnauthorizedAccessException("Credenciales inválidas");
            }

            Console.WriteLine($"DEBUG LOGIN: Login exitoso para usuario ID: {usuario.Id}, generando token...");
            var token = jwtService.GenerateToken(usuario);
            
            Console.WriteLine($"DEBUG LOGIN: Token generado exitosamente para usuario ID: {usuario.Id}");
            
            return new
            {
                access_token = token,
                token_type = "Bearer",
                expires_in = 3600
            };
        }

        public async Task<object> GetUserInfoAsync(string authorizationHeader)
        {
            Console.WriteLine($"DEBUG GetUserInfo: Authorization header recibido: {authorizationHeader}");
            
            if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            {
                Console.WriteLine("DEBUG GetUserInfo: Token requerido - header inválido");
                throw new UnauthorizedAccessException("Token requerido");
            }

            var token = authorizationHeader.Substring("Bearer ".Length);
            Console.WriteLine($"DEBUG GetUserInfo: Token extraído: {token.Substring(0, Math.Min(20, token.Length))}...");
            
            var claimsPrincipal = jwtService.ValidateToken(token);
            
            if (claimsPrincipal == null)
            {
                Console.WriteLine("DEBUG GetUserInfo: Token inválido - no se pudo validar");
                throw new UnauthorizedAccessException("Token inválido");
            }

            var userId = claimsPrincipal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"DEBUG GetUserInfo: UserId extraído del token: {userId}");
            
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var id))
            {
                Console.WriteLine("DEBUG GetUserInfo: Token inválido - no se pudo extraer userId");
                throw new UnauthorizedAccessException("Token inválido");
            }

            var usuario = await usuarioRepository.GetByIdAsync(id);
            if (usuario == null)
            {
                Console.WriteLine($"DEBUG GetUserInfo: Usuario no encontrado para ID: {id}");
                throw new UnauthorizedAccessException("Usuario no encontrado");
            }

            Console.WriteLine($"DEBUG GetUserInfo: Usuario encontrado - ID: {usuario.Id}, Email: {usuario.Correo}, Nombre: {usuario.Nombre} {usuario.Apellido}");

            return new
            {
                id = usuario.Id,
                name = $"{usuario.Nombre} {usuario.Apellido}",
                email = usuario.Correo,
                roles = usuario.Roles.Select(r => r.Nombre).ToArray()
            };
        }
    }
}