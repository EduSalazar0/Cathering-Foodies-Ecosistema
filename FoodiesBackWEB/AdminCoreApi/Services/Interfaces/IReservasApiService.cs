using AdminCoreApi.Dtos.Response;

namespace AdminCoreApi.Services.Interfaces
{
    public interface IReservasApiService
    {
        Task<List<ReservaResponseDto>> GetAllReservasAsync();
        Task<ReservaResponseDto?> GetReservaByIdAsync(int id);
        Task<bool> DeleteReservaAsync(int id);
        Task<List<EntregableResponseDto>> GetAllEntregablesAsync();
        Task<List<EntregableResponseDto>> GetEntregablesByReservaAsync(int reservaId);
    }
}
