using Microsoft.EntityFrameworkCore;
using UsersApi.Data.Repositories.Interfaces;
using UsersApi.Models;

namespace UsersApi.Data.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly UsersDbContext _context;

        public UsuarioRepository(UsersDbContext context)
        {
            _context = context;
        }

        public async Task<List<Usuario>> GetAllAsync()
        {
            return await _context.Usuarios
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .Where(u => u.Activo)
                .OrderBy(u => u.Id)
                .ToListAsync();
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            return await _context.Usuarios
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .FirstOrDefaultAsync(u => u.Id == id && u.Activo);
        }

        public async Task<Usuario?> GetByCorreoAsync(string correo)
        {
            return await _context.Usuarios
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .FirstOrDefaultAsync(u => u.Correo == correo && u.Activo);
        }

        public async Task<Usuario> CreateAsync(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<Usuario> UpdateAsync(Usuario usuario)
        {
            usuario.FechaActualizacion = DateTime.UtcNow;
            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.UsuarioRoles)
                .FirstOrDefaultAsync(u => u.Id == id);
            
            if (usuario == null)
                return false;

            // Eliminar primero las relaciones UsuarioRol (aunque el cascade debería hacerlo)
            if (usuario.UsuarioRoles.Any())
            {
                _context.UsuarioRoles.RemoveRange(usuario.UsuarioRoles);
            }

            // Luego eliminar el usuario
            _context.Usuarios.Remove(usuario);
            
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                // Log the exception (en producción usar un logger real)
                Console.WriteLine($"Error al eliminar usuario {id}: {ex.Message}");
                throw new InvalidOperationException($"No se puede eliminar el usuario. Puede tener datos relacionados en otras tablas.", ex);
            }
        }

        public async Task<bool> ExisteCorreoAsync(string correo)
        {
            return await _context.Usuarios
                .AnyAsync(u => u.Correo == correo && u.Activo);
        }

        public async Task<bool> ExisteCorreoAsync(string correo, int excludeId)
        {
            return await _context.Usuarios
                .AnyAsync(u => u.Correo == correo && u.Id != excludeId && u.Activo);
        }
    }
}