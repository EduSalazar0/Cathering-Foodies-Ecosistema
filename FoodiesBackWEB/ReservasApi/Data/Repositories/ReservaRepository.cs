using Microsoft.EntityFrameworkCore;
using ReservasApi.Data.Repositories.Interfaces;
using ReservasApi.Models;

namespace ReservasApi.Data.Repositories
{
    public class ReservaRepository : IReservaRepository
    {
        private readonly ReservasDbContext _context;

        public ReservaRepository(ReservasDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Reserva>> GetAllAsync()
        {
            return await _context.Reservas
                .Include(r => r.Entregables)
                .OrderByDescending(r => r.FechaCreacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reserva>> GetByUsuarioIdAsync(int usuarioId)
        {
            return await _context.Reservas
                .Include(r => r.Entregables)
                .Where(r => r.UsuarioId == usuarioId)
                .OrderByDescending(r => r.FechaCreacion)
                .ToListAsync();
        }

        public async Task<Reserva?> GetByIdAsync(int id)
        {
            return await _context.Reservas
                .Include(r => r.Entregables)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Reserva?> GetByIdAndUsuarioIdAsync(int id, int usuarioId)
        {
            return await _context.Reservas
                .Include(r => r.Entregables)
                .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == usuarioId);
        }

        public async Task<Reserva> CreateAsync(Reserva reserva)
        {
            _context.Reservas.Add(reserva);
            await _context.SaveChangesAsync();
            return reserva;
        }

        public async Task<Reserva> UpdateAsync(Reserva reserva)
        {
            reserva.FechaActualizacion = DateTime.UtcNow;
            _context.Reservas.Update(reserva);
            await _context.SaveChangesAsync();
            return reserva;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var reserva = await _context.Reservas.FindAsync(id);
            if (reserva == null) return false;

            _context.Reservas.Remove(reserva);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Reservas.AnyAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Reserva>> GetByEstadoAsync(string estado)
        {
            return await _context.Reservas
                .Include(r => r.Entregables)
                .Where(r => r.EstadoReserva == estado)
                .OrderByDescending(r => r.FechaCreacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reserva>> GetByFechaRangoAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            return await _context.Reservas
                .Include(r => r.Entregables)
                .Where(r => r.Fecha >= fechaInicio && r.Fecha <= fechaFin)
                .OrderBy(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reserva>> GetByNombreLocalAsync(string nombreLocal)
        {
            return await _context.Reservas
                .Include(r => r.Entregables)
                .Where(r => r.NombreLocal == nombreLocal)
                .OrderByDescending(r => r.FechaCreacion)
                .ToListAsync();
        }
    }
}