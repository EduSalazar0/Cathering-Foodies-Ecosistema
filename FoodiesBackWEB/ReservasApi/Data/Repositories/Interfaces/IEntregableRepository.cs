using ReservasApi.Models;

namespace ReservasApi.Data.Repositories.Interfaces
{
    public interface IEntregableRepository
    {
        Task<IEnumerable<Entregable>> GetAllAsync();
        Task<IEnumerable<Entregable>> GetByReservaIdAsync(int reservaId);
        Task<Entregable?> GetByIdAsync(int id);
        Task<Entregable> CreateAsync(Entregable entregable);
        Task<Entregable> UpdateAsync(Entregable entregable);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}