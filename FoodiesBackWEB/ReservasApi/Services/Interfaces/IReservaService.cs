using ReservasApi.Dtos.Request;
using ReservasApi.Dtos.Response;

namespace ReservasApi.Services.Interfaces
{
    public interface IReservaService
    {
        Task<IEnumerable<ReservaResponse>> GetAllReservasAsync();
        Task<IEnumerable<ReservaResponse>> GetReservasByUsuarioAsync(int usuarioId);
        Task<ReservaResponse?> GetReservaByIdAsync(int id);
        Task<ReservaResponse?> GetReservaByIdAndUsuarioAsync(int id, int usuarioId);
        Task<ReservaResponse> CreateReservaAsync(CrearReservaRequest request, int usuarioId);
        Task<ReservaResponse?> UpdateReservaAsync(int id, ActualizarReservaRequest request, int usuarioId);
        Task<bool> DeleteReservaAsync(int id, int usuarioId);
        Task<IEnumerable<ReservaResponse>> GetReservasByEstadoAsync(string estado);
        Task<IEnumerable<ReservaResponse>> GetReservasByFechaRangoAsync(DateTime fechaInicio, DateTime fechaFin);
        Task<IEnumerable<ReservaResponse>> GetReservasByRestauranteAsync(string nombreRestaurante);
        Task<ReservaResponse?> CambiarEstadoReservaAsync(int id, string nuevoEstado, int usuarioId);
        Task<bool> PuedeCancelarReservaAsync(int id, int usuarioId);
        Task<ReservaResponse?> MarcarComoCompletadaAsync(int reservaId);
        Task ActualizarEstadosAutomaticoAsync();
    }
}