using ReservasApi.Models;

namespace ReservasApi.Data.Repositories.Interfaces
{
    public interface IReservaRepository
    {
        Task<IEnumerable<Reserva>> GetAllAsync();
        Task<IEnumerable<Reserva>> GetByUsuarioIdAsync(int usuarioId);
        Task<Reserva?> GetByIdAsync(int id);
        Task<Reserva?> GetByIdAndUsuarioIdAsync(int id, int usuarioId);
        Task<Reserva> CreateAsync(Reserva reserva);
        Task<Reserva> UpdateAsync(Reserva reserva);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<IEnumerable<Reserva>> GetByEstadoAsync(string estado);
        Task<IEnumerable<Reserva>> GetByFechaRangoAsync(DateTime fechaInicio, DateTime fechaFin);
        Task<IEnumerable<Reserva>> GetByNombreLocalAsync(string nombreLocal);
    }
}