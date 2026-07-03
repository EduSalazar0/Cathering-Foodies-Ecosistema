using UsersApi.Models;

namespace UsersApi.Data.Repositories.Interfaces
{
    public interface IUsuarioRolRepository
    {
        Task AsignarRolAsync(int usuarioId, int rolId);
        Task<List<UsuarioRol>> GetRolesByUsuarioIdAsync(int usuarioId);
        Task<bool> UsuarioTieneRolAsync(int usuarioId, int rolId);
        Task<UsuarioRol?> GetByUserAndRoleAsync(int usuarioId, int rolId);
        Task<UsuarioRol> CreateAsync(UsuarioRol usuarioRol);
        Task<UsuarioRol> UpdateAsync(UsuarioRol usuarioRol);
        Task<bool> DeleteAsync(int id);
    }
}