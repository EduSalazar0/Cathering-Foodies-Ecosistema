using System.Text;
using System.Text.Json;
using FormularioFoodieApi.Services.Interfaces;

namespace FormularioFoodieApi.Services
{
    public class UsersApiService : IUsersApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UsersApiService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UsersApiService(HttpClient httpClient, IConfiguration configuration, ILogger<UsersApiService> logger, IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        private void SetAuthorizationHeader()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context?.Request.Headers.ContainsKey("Authorization") == true)
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = 
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authHeader.Replace("Bearer ", ""));
                }
            }
        }

        public async Task<bool> AddRoleToUserAsync(int usuarioId, string roleName)
        {
            try
            {
                var usersApiUrl = _configuration["ApiSettings:UsersApiBaseUrl"] ?? "http://localhost:5001";
                var requestUrl = $"{usersApiUrl}/api/users/{usuarioId}/roles";

                _logger.LogInformation($"Intentando agregar rol '{roleName}' al usuario {usuarioId} en {requestUrl}");

                var requestBody = new { RoleName = roleName };
                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Configurar timeout
                _httpClient.Timeout = TimeSpan.FromSeconds(10);

                var response = await _httpClient.PostAsync(requestUrl, content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"Rol '{roleName}' agregado exitosamente al usuario {usuarioId}");
                    return true;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning($"Error al agregar rol '{roleName}' al usuario {usuarioId}. StatusCode: {response.StatusCode}, Error: {errorContent}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Excepción al agregar rol '{roleName}' al usuario {usuarioId}");
                return false;
            }
        }

        public async Task<bool> ValidateUserExistsAsync(int usuarioId)
        {
            try
            {
                var usersApiUrl = _configuration["ApiSettings:UsersApiBaseUrl"];
                var requestUrl = $"{usersApiUrl}/api/users/{usuarioId}";

                var token = await GetUserTokenAsync();
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = 
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.GetAsync(requestUrl);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al validar la existencia del usuario {usuarioId}");
                return false;
            }
        }

        public async Task<string> GetUserTokenAsync()
        {
            return await Task.FromResult(string.Empty);
        }

        public async Task<object?> GetCurrentUserAsync()
        {
            try
            {
                SetAuthorizationHeader();
                
                var usersApiUrl = _configuration["ApiSettings:UsersApiBaseUrl"];
                var requestUrl = $"{usersApiUrl}/api/auth/userinfo";

                var response = await _httpClient.GetAsync(requestUrl);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                _logger.LogInformation($"GetCurrentUserAsync - Response Status: {response.StatusCode}");
                _logger.LogInformation($"GetCurrentUserAsync - Response Content: {responseContent}");
                
                if (response.IsSuccessStatusCode)
                {
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var userResponse = JsonSerializer.Deserialize<JsonElement>(responseContent, options);
                    
                    // Convertir la respuesta a un objeto con las propiedades correctas
                    var result = new
                    {
                        id = userResponse.TryGetProperty("id", out var idProp) ? idProp.GetInt32() : 0,
                        nombre = userResponse.TryGetProperty("name", out var nameProp) ? 
                            nameProp.GetString()?.Split(' ')[0] ?? "Usuario" : "Usuario",
                        apellido = userResponse.TryGetProperty("name", out var fullNameProp) ? 
                            string.Join(" ", fullNameProp.GetString()?.Split(' ').Skip(1) ?? Array.Empty<string>()) : "",
                        correo = userResponse.TryGetProperty("email", out var emailProp) ? 
                            emailProp.GetString() ?? "sin-email@foodiesbnb.com" : "sin-email@foodiesbnb.com",
                        fechaCreacion = DateTime.UtcNow,
                        estaActivo = true,
                        roles = userResponse.TryGetProperty("roles", out var rolesProp) && rolesProp.ValueKind == JsonValueKind.Array ?
                            rolesProp.EnumerateArray().Select(r => r.GetString()).Where(r => r != null).ToArray() :
                            Array.Empty<string>()
                    };
                    
                    _logger.LogInformation($"GetCurrentUserAsync - Mapped result: {JsonSerializer.Serialize(result)}");
                    return result;
                }
                else
                {
                    _logger.LogWarning($"GetCurrentUserAsync - API returned error status: {response.StatusCode}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al obtener usuario actual");
                return null;
            }
        }
    }
}