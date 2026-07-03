using Microsoft.EntityFrameworkCore;
using UsersApi.Data.Repositories.Interfaces;
using UsersApi.Models;

namespace UsersApi.Data.Repositories
{
    public class UsuarioRolRepository : IUsuarioRolRepository
    {
        private readonly UsersDbContext _context;

        public UsuarioRolRepository(UsersDbContext context)
        {
            _context = context;
        }

        public async Task AsignarRolAsync(int usuarioId, int rolId)
        {
            var usuarioRol = new UsuarioRol
            {
                UsuarioId = usuarioId,
                RolId = rolId,
                FechaAsignacion = DateTime.UtcNow,
                Activo = true
            };

            _context.UsuarioRoles.Add(usuarioRol);
            await _context.SaveChangesAsync();
        }

        public async Task<List<UsuarioRol>> GetRolesByUsuarioIdAsync(int usuarioId)
        {
            return await _context.UsuarioRoles
                .Include(ur => ur.Rol)
                .Where(ur => ur.UsuarioId == usuarioId && ur.Activo)
                .ToListAsync();
        }

        public async Task<bool> UsuarioTieneRolAsync(int usuarioId, int rolId)
        {
            return await _context.UsuarioRoles
                .AnyAsync(ur => ur.UsuarioId == usuarioId && ur.RolId == rolId && ur.Activo);
        }

        public async Task<UsuarioRol?> GetByUserAndRoleAsync(int usuarioId, int rolId)
        {
            return await _context.UsuarioRoles
                .FirstOrDefaultAsync(ur => ur.UsuarioId == usuarioId && ur.RolId == rolId);
        }

        public async Task<UsuarioRol> CreateAsync(UsuarioRol usuarioRol)
        {
            _context.UsuarioRoles.Add(usuarioRol);
            await _context.SaveChangesAsync();
            return usuarioRol;
        }

        public async Task<UsuarioRol> UpdateAsync(UsuarioRol usuarioRol)
        {
            _context.UsuarioRoles.Update(usuarioRol);
            await _context.SaveChangesAsync();
            return usuarioRol;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var usuarioRol = await _context.UsuarioRoles.FindAsync(id);
            if (usuarioRol == null)
                return false;

            _context.UsuarioRoles.Remove(usuarioRol);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}