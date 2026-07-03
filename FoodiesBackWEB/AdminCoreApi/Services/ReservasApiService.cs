using AdminCoreApi.Dtos.Response;
using AdminCoreApi.Services.Interfaces;
using System.Net.Http.Headers;
using System.Text.Json;

namespace AdminCoreApi.Services
{
    public class ReservasApiService : IReservasApiService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly JsonSerializerOptions _jsonOptions;

        public ReservasApiService(IHttpClientFactory httpClientFactory, IHttpContextAccessor httpContextAccessor)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        public async Task<List<ReservaResponseDto>> GetAllReservasAsync()
        {
            var client = CreateAuthorizedClient("ReservasApi");
            var response = await client.GetAsync("api/Reservas");
            
            if (!response.IsSuccessStatusCode)
                return new List<ReservaResponseDto>();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<ReservaResponseDto>>(content, _jsonOptions) ?? new List<ReservaResponseDto>();
        }

        public async Task<ReservaResponseDto?> GetReservaByIdAsync(int id)
        {
            var client = CreateAuthorizedClient("ReservasApi");
            var response = await client.GetAsync($"api/Reservas/{id}");
            
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ReservaResponseDto>(content, _jsonOptions);
        }

        public async Task<bool> DeleteReservaAsync(int id)
        {
            var client = CreateAuthorizedClient("ReservasApi");
            var response = await client.DeleteAsync($"api/Reservas/{id}");
            return response.IsSuccessStatusCode;
        }

        public async Task<List<EntregableResponseDto>> GetAllEntregablesAsync()
        {
            var client = CreateAuthorizedClient("ReservasApi");
            var response = await client.GetAsync("api/Entregables");
            
            if (!response.IsSuccessStatusCode)
                return new List<EntregableResponseDto>();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<EntregableResponseDto>>(content, _jsonOptions) ?? new List<EntregableResponseDto>();
        }

        public async Task<List<EntregableResponseDto>> GetEntregablesByReservaAsync(int reservaId)
        {
            var client = CreateAuthorizedClient("ReservasApi");
            var response = await client.GetAsync($"api/Entregables/por-reserva/{reservaId}");
            
            if (!response.IsSuccessStatusCode)
                return new List<EntregableResponseDto>();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<EntregableResponseDto>>(content, _jsonOptions) ?? new List<EntregableResponseDto>();
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
