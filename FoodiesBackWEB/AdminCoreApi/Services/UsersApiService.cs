using AdminCoreApi.Dtos.Response;
using AdminCoreApi.Services.Interfaces;
using System.Net.Http.Headers;
using System.Text.Json;

namespace AdminCoreApi.Services
{
    public class UsersApiService : IUsersApiService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IReservasApiService _reservasService;
        private readonly JsonSerializerOptions _jsonOptions;

        public UsersApiService(
            IHttpClientFactory httpClientFactory, 
            IHttpContextAccessor httpContextAccessor,
            IReservasApiService reservasService)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _reservasService = reservasService;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        public async Task<List<UsuarioResponseDto>> GetAllUsersAsync()
        {
            var client = CreateAuthorizedClient("UsersApi");
            var response = await client.GetAsync("api/Users");
            
            if (!response.IsSuccessStatusCode)
                return new List<UsuarioResponseDto>();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<UsuarioResponseDto>>(content, _jsonOptions) ?? new List<UsuarioResponseDto>();
        }

        public async Task<UsuarioResponseDto?> GetUserByIdAsync(int id)
        {
            var client = CreateAuthorizedClient("UsersApi");
            var response = await client.GetAsync($"api/Users/{id}");
            
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<UsuarioResponseDto>(content, _jsonOptions);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            try
            {
                // Primero obtener todas las reservas del usuario
                var todasReservas = await _reservasService.GetAllReservasAsync();
                var reservasDelUsuario = todasReservas.Where(r => r.UsuarioId == id).ToList();

                // Eliminar todas las reservas del usuario primero
                foreach (var reserva in reservasDelUsuario)
                {
                    await _reservasService.DeleteReservaAsync(reserva.Id);
                }

                // Luego eliminar el usuario
                var client = CreateAuthorizedClient("UsersApi");
                var response = await client.DeleteAsync($"api/Users/{id}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al eliminar usuario {id}: {ex.Message}");
                return false;
            }
        }

        public async Task<List<RolResponseDto>> GetAllRolesAsync()
        {
            var client = CreateAuthorizedClient("UsersApi");
            var response = await client.GetAsync("api/Roles");
            
            if (!response.IsSuccessStatusCode)
                return new List<RolResponseDto>();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<RolResponseDto>>(content, _jsonOptions) ?? new List<RolResponseDto>();
        }

        private HttpClient CreateAuthorizedClient(string clientName)
        {
            var client = _httpClientFactory.CreateClient(clientName);
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString()?.Replace("Bearer ", "");
            
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            return client;
        }
    }
}
