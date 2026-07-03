using Microsoft.EntityFrameworkCore;
using ReservasApi.Data.Repositories.Interfaces;
using ReservasApi.Models;

namespace ReservasApi.Data.Repositories
{
    public class EntregableRepository : IEntregableRepository
    {
        private readonly ReservasDbContext _context;

        public EntregableRepository(ReservasDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Entregable>> GetAllAsync()
        {
            return await _context.Entregables
                .Include(e => e.Reserva)
                .OrderByDescending(e => e.FechaCreacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<Entregable>> GetByReservaIdAsync(int reservaId)
        {
            return await _context.Entregables
                .Where(e => e.ReservaId == reservaId)
                .OrderByDescending(e => e.FechaCreacion)
                .ToListAsync();
        }

        public async Task<Entregable?> GetByIdAsync(int id)
        {
            return await _context.Entregables
                .Include(e => e.Reserva)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Entregable> CreateAsync(Entregable entregable)
        {
            _context.Entregables.Add(entregable);
            await _context.SaveChangesAsync();
            return entregable;
        }

        public async Task<Entregable> UpdateAsync(Entregable entregable)
        {
            entregable.FechaActualizacion = DateTime.UtcNow;
            _context.Entregables.Update(entregable);
            await _context.SaveChangesAsync();
            return entregable;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entregable = await _context.Entregables.FindAsync(id);
            if (entregable == null) return false;

            _context.Entregables.Remove(entregable);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Entregables.AnyAsync(e => e.Id == id);
        }
    }
}