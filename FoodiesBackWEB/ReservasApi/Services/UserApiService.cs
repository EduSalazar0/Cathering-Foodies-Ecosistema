using ReservasApi.Services.Interfaces;
using System.Text.Json;

namespace ReservasApi.Services
{
    public class UserApiService : IUserApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public UserApiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            
            // Configurar la URL base de la UserApi
            var userApiUrl = _configuration["Services:UserApi"] ?? "http://localhost:5001";
            _httpClient.BaseAddress = new Uri(userApiUrl);
        }

        public async Task<UserInfo?> GetUserByIdAsync(int userId)
        {
            try
            {
                Console.WriteLine($"Intentando obtener usuario {userId} desde {_httpClient.BaseAddress}/api/users/public/{userId}");
                
                var response = await _httpClient.GetAsync($"/api/users/public/{userId}");
                
                Console.WriteLine($"Respuesta de UserApi para usuario {userId}: {response.StatusCode}");
                
                if (response.IsSuccessStatusCode)
                {
                    var jsonContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Contenido de respuesta para usuario {userId}: {jsonContent}");
                    
                    var userResponse = JsonSerializer.Deserialize<UserApiResponse>(jsonContent, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (userResponse != null)
                    {
                        var userInfo = new UserInfo
                        {
                            Id = userResponse.Id,
                            Nombre = userResponse.Nombre,
                            Apellido = userResponse.Apellido,
                            Correo = userResponse.Correo
                        };
                        
                        Console.WriteLine($"Usuario {userId} mapeado: {userInfo.Nombre} {userInfo.Apellido} - {userInfo.Correo}");
                        return userInfo;
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error al obtener usuario {userId}: {response.StatusCode} - {errorContent}");
                }
                
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Excepción al obtener usuario {userId}: {ex.Message}");
                return null;
            }
        }
    }

    // DTO para la respuesta de la UserApi
    public class UserApiResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public bool EstaActivo { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}