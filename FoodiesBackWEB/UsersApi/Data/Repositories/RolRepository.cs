using Microsoft.EntityFrameworkCore;
using UsersApi.Data.Repositories.Interfaces;
using UsersApi.Models;

namespace UsersApi.Data.Repositories
{
    public class RolRepository : IRolRepository
    {
        private readonly UsersDbContext _context;

        public RolRepository(UsersDbContext context)
        {
            _context = context;
        }

        public async Task<Rol?> GetByIdAsync(int id)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == id && r.Activo);
        }

        public async Task<Rol?> GetByNombreAsync(string nombre)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(r => r.Nombre == nombre && r.Activo);
        }

        public async Task<Rol?> GetByNameAsync(string nombre)
        {
            return await GetByNombreAsync(nombre);
        }

        public async Task<List<Rol>> GetAllAsync()
        {
            return await _context.Roles
                .Where(r => r.Activo)
                .OrderBy(r => r.Id)
                .ToListAsync();
        }

        public async Task<Rol> CreateAsync(Rol rol)
        {
            _context.Roles.Add(rol);
            await _context.SaveChangesAsync();
            return rol;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var rol = await _context.Roles.FindAsync(id);
            if (rol == null)
                return false;

            _context.Roles.Remove(rol);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}