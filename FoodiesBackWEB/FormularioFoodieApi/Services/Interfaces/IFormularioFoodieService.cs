using FormularioFoodieApi.Dtos.Request;
using FormularioFoodieApi.Dtos.Response;
using System.Security.Claims;

namespace FormularioFoodieApi.Services.Interfaces
{
    public interface IFormularioFoodieService
    {
        Task<FormularioFoodieResponseDto> CreateAsync(ClaimsPrincipal user, FormularioFoodieCreateRequestDto requestDto);
        Task<FormularioFoodieSubmissionResponseDto> CreateWithMessageAsync(ClaimsPrincipal user, FormularioFoodieCreateRequestDto requestDto);
        Task<FormularioFoodieResponseDto> UpdateAsync(int id, FormularioFoodieUpdateRequestDto requestDto);
        Task<FormularioFoodieResponseDto> UpdateMyFormularioAsync(ClaimsPrincipal user, FormularioFoodieUpdateRequestDto requestDto);
        Task<bool> DeleteAsync(int id);
        Task<FormularioFoodieResponseDto?> GetByIdAsync(int id);
        Task<FormularioFoodieResponseDto?> GetByUsuarioIdAsync(int usuarioId);
        Task<FormularioFoodieResponseDto?> GetMyFormularioAsync(ClaimsPrincipal user);
        Task<List<FormularioFoodieResponseDto>> GetAllAsync();
        Task<List<FormularioFoodieResponseDto>> GetByEstadoAsync(string estado);
        Task<object?> GetCurrentUserAsync(ClaimsPrincipal user);
    }
}