using ReservasApi.Dtos.Request;
using ReservasApi.Dtos.Response;

namespace ReservasApi.Services.Interfaces
{
    public interface IEntregableService
    {
        Task<IEnumerable<EntregableResponse>> GetAllEntregablesAsync();
        Task<IEnumerable<EntregableResponse>> GetEntregablesByReservaAsync(int reservaId);
        Task<EntregableResponse?> GetEntregableByIdAsync(int id);
        Task<EntregableResponse> CreateEntregableAsync(CrearEntregableRequest request);
        Task<EntregableResponse?> UpdateEntregableAsync(int id, CrearEntregableRequest request);
        Task<bool> DeleteEntregableAsync(int id);
    }
}