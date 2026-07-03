using Microsoft.EntityFrameworkCore;
using FormularioFoodieApi.Data.Repositories.Interfaces;
using FormularioFoodieApi.Models;

namespace FormularioFoodieApi.Data.Repositories
{
    public class FormularioFoodieRepository : IFormularioFoodieRepository
    {
        private readonly FormularioFoodieDbContext _context;

        public FormularioFoodieRepository(FormularioFoodieDbContext context)
        {
            _context = context;
        }

        public async Task<FormularioFoodie?> GetByIdAsync(int id)
        {
            return await _context.FormulariosFoodie
                .FirstOrDefaultAsync(f => f.Id == id && f.Activo);
        }

        public async Task<FormularioFoodie?> GetByUsuarioIdAsync(int usuarioId)
        {
            return await _context.FormulariosFoodie
                .FirstOrDefaultAsync(f => f.UsuarioId == usuarioId && f.Activo);
        }

        public async Task<List<FormularioFoodie>> GetAllAsync()
        {
            return await _context.FormulariosFoodie
                .Where(f => f.Activo)
                .OrderByDescending(f => f.FechaAplicacion)
                .ToListAsync();
        }

        public async Task<List<FormularioFoodie>> GetByEstadoAsync(string estado)
        {
            return await _context.FormulariosFoodie
                .Where(f => f.Estado == estado && f.Activo)
                .OrderByDescending(f => f.FechaAplicacion)
                .ToListAsync();
        }

        public async Task<FormularioFoodie> CreateAsync(FormularioFoodie formulario)
        {
            _context.FormulariosFoodie.Add(formulario);
            await _context.SaveChangesAsync();
            return formulario;
        }

        public async Task<FormularioFoodie> UpdateAsync(FormularioFoodie formulario)
        {
            formulario.FechaActualizacion = DateTime.UtcNow;
            _context.FormulariosFoodie.Update(formulario);
            await _context.SaveChangesAsync();
            return formulario;
        }

        public async Task DeleteAsync(FormularioFoodie formulario)
        {
            _context.FormulariosFoodie.Remove(formulario);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsForUserAsync(int usuarioId)
        {
            return await _context.FormulariosFoodie
                .AnyAsync(f => f.UsuarioId == usuarioId && f.Activo);
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.FormulariosFoodie
                .AnyAsync(f => f.Email == email && f.Activo);
        }

        public async Task<bool> ExistsByInstagramAsync(string usuarioInstagram)
        {
            return await _context.FormulariosFoodie
                .AnyAsync(f => f.UsuarioInstagram == usuarioInstagram && f.Activo);
        }

        public async Task<bool> ExistsByTikTokAsync(string usuarioTikTok)
        {
            return await _context.FormulariosFoodie
                .AnyAsync(f => f.UsuarioTikTok == usuarioTikTok && f.Activo);
        }
    }
}