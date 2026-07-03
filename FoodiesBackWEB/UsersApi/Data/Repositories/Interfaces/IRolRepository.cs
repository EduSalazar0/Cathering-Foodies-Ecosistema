using UsersApi.Models;

namespace UsersApi.Data.Repositories.Interfaces
{
    public interface IRolRepository
    {
        Task<Rol?> GetByIdAsync(int id);
        Task<Rol?> GetByNombreAsync(string nombre);
        Task<Rol?> GetByNameAsync(string nombre);
        Task<List<Rol>> GetAllAsync();
        Task<Rol> CreateAsync(Rol rol);
        Task<bool> DeleteAsync(int id);
    }
}