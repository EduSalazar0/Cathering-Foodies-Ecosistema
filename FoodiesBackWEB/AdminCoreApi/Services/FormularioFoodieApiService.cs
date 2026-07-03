using AdminCoreApi.Dtos.Response;
using AdminCoreApi.Services.Interfaces;
using System.Net.Http.Headers;
using System.Text.Json;

namespace AdminCoreApi.Services
{
    public class FormularioFoodieApiService : IFormularioFoodieApiService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly JsonSerializerOptions _jsonOptions;

        public FormularioFoodieApiService(IHttpClientFactory httpClientFactory, IHttpContextAccessor httpContextAccessor)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        public async Task<List<FormularioFoodieResponseDto>> GetAllFormulariosAsync()
        {
            var client = CreateAuthorizedClient("FormularioFoodieApi");
            var response = await client.GetAsync("api/FormularioFoodie");
            
            if (!response.IsSuccessStatusCode)
                return new List<FormularioFoodieResponseDto>();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<FormularioFoodieResponseDto>>(content, _jsonOptions) ?? new List<FormularioFoodieResponseDto>();
        }

        public async Task<FormularioFoodieResponseDto?> GetFormularioByIdAsync(int id)
        {
            var client = CreateAuthorizedClient("FormularioFoodieApi");
            var response = await client.GetAsync($"api/FormularioFoodie/{id}");
            
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<FormularioFoodieResponseDto>(content, _jsonOptions);
        }

        public async Task<bool> DeleteFormularioAsync(int id)
        {
            var client = CreateAuthorizedClient("FormularioFoodieApi");
            var response = await client.DeleteAsync($"api/FormularioFoodie/{id}");
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
