using FormularioFoodieApi.Models;

namespace FormularioFoodieApi.Data.Repositories.Interfaces
{
    public interface IFormularioFoodieRepository
    {
        Task<FormularioFoodie?> GetByIdAsync(int id);
        Task<FormularioFoodie?> GetByUsuarioIdAsync(int usuarioId);
        Task<List<FormularioFoodie>> GetAllAsync();
        Task<List<FormularioFoodie>> GetByEstadoAsync(string estado);
        Task<FormularioFoodie> CreateAsync(FormularioFoodie formulario);
        Task<FormularioFoodie> UpdateAsync(FormularioFoodie formulario);
        Task DeleteAsync(FormularioFoodie formulario);
        Task<bool> ExistsForUserAsync(int usuarioId);
        Task<bool> ExistsByEmailAsync(string email);
        Task<bool> ExistsByInstagramAsync(string usuarioInstagram);
        Task<bool> ExistsByTikTokAsync(string usuarioTikTok);
    }
}