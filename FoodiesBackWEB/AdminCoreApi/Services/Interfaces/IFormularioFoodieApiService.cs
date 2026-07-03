using AdminCoreApi.Dtos.Response;

namespace AdminCoreApi.Services.Interfaces
{
    public interface IFormularioFoodieApiService
    {
        Task<List<FormularioFoodieResponseDto>> GetAllFormulariosAsync();
        Task<FormularioFoodieResponseDto?> GetFormularioByIdAsync(int id);
        Task<bool> DeleteFormularioAsync(int id);
    }
}
