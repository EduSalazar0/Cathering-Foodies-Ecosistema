using AdminCoreApi.Dtos.Request;
using AdminCoreApi.Dtos.Response;
using AdminCoreApi.Services.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace AdminCoreApi.Services
{
    public class RolesService : IRolesService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly JsonSerializerOptions _jsonOptions;

        public RolesService(IHttpClientFactory httpClientFactory, IHttpContextAccessor httpContextAccessor)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
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

        public async Task<RolResponseDto?> CreateRolAsync(CreateRolRequestDto request)
        {
            var client = CreateAuthorizedClient("UsersApi");
            var jsonContent = new StringContent(
                JsonSerializer.Serialize(request),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync("api/Roles", jsonContent);
            
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<RolResponseDto>(content, _jsonOptions);
        }

        public async Task<bool> AsignarRolToUsuarioAsync(AsignarRolRequestDto request)
        {
            var client = CreateAuthorizedClient("UsersApi");
            var jsonContent = new StringContent(
                JsonSerializer.Serialize(new { RoleName = request.NombreRol }),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync($"api/Users/{request.UsuarioId}/roles", jsonContent);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> RemoverRolDeUsuarioAsync(RemoverRolRequestDto request)
        {
            var client = CreateAuthorizedClient("UsersApi");
            var response = await client.DeleteAsync($"api/Users/{request.UsuarioId}/roles/{request.NombreRol}");
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> DeleteRolAsync(int id)
        {
            var client = CreateAuthorizedClient("UsersApi");
            var response = await client.DeleteAsync($"api/Roles/{id}");
            return response.IsSuccessStatusCode;
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
