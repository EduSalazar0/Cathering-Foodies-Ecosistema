using ReservasApi.Data.Repositories.Interfaces;
using ReservasApi.Dtos.Request;
using ReservasApi.Dtos.Response;
using ReservasApi.Models;
using ReservasApi.Services.Interfaces;

namespace ReservasApi.Services
{
    public class EntregableService : IEntregableService
    {
        private readonly IEntregableRepository _entregableRepository;
        private readonly IReservaRepository _reservaRepository;

        public EntregableService(IEntregableRepository entregableRepository, IReservaRepository reservaRepository)
        {
            _entregableRepository = entregableRepository;
            _reservaRepository = reservaRepository;
        }

        public async Task<IEnumerable<EntregableResponse>> GetAllEntregablesAsync()
        {
            var entregables = await _entregableRepository.GetAllAsync();
            return entregables.Select(MapToResponse);
        }

        public async Task<IEnumerable<EntregableResponse>> GetEntregablesByReservaAsync(int reservaId)
        {
            var entregables = await _entregableRepository.GetByReservaIdAsync(reservaId);
            return entregables.Select(MapToResponse);
        }

        public async Task<EntregableResponse?> GetEntregableByIdAsync(int id)
        {
            var entregable = await _entregableRepository.GetByIdAsync(id);
            return entregable != null ? MapToResponse(entregable) : null;
        }

        public async Task<EntregableResponse> CreateEntregableAsync(CrearEntregableRequest request)
        {
            // Verificar que la reserva existe
            var reserva = await _reservaRepository.GetByIdAsync(request.ReservaId);
            if (reserva == null)
            {
                throw new ArgumentException("La reserva especificada no existe");
            }

            // Verificar que la reserva está en período de entrega
            var fechaHoraVisita = reserva.Fecha.Add(TimeSpan.Parse(reserva.Hora));
            var ahora = DateTime.Now;
            var limitePlazo = fechaHoraVisita.AddHours(48);

            if (ahora > limitePlazo)
            {
                throw new InvalidOperationException("El plazo para subir entregables ha expirado (48 horas después de la visita)");
            }

            if (ahora < fechaHoraVisita)
            {
                throw new InvalidOperationException("Solo se pueden subir entregables después de la fecha y hora de la visita");
            }

            // Validar campos obligatorios según las nuevas reglas
            // 1. La cantidad gastada es OBLIGATORIA
            if (request.CantidadGastada <= 0)
            {
                throw new ArgumentException("La cantidad gastada es obligatoria y debe ser mayor a $0.00");
            }

            // 2. Al menos UNO de los dos enlaces debe estar presente
            var tieneTikTok = !string.IsNullOrWhiteSpace(request.EnlaceTikTok);
            var tieneInstagram = !string.IsNullOrWhiteSpace(request.EnlaceInstagram);

            if (!tieneTikTok && !tieneInstagram)
            {
                throw new ArgumentException("Debe proporcionar al menos un enlace (TikTok o Instagram)");
            }

            var entregable = new Entregable
            {
                ReservaId = request.ReservaId,
                EnlaceTikTok = request.EnlaceTikTok,
                EnlaceInstagram = request.EnlaceInstagram,
                CantidadGastada = request.CantidadGastada
            };

            var entregableCreado = await _entregableRepository.CreateAsync(entregable);

            // Auto-completar la reserva cuando se sube el primer entregable
            if (reserva.EstadoReserva == "Por Ir")
            {
                reserva.EstadoReserva = "Visita Completada";
                reserva.FechaActualizacion = DateTime.UtcNow;
                await _reservaRepository.UpdateAsync(reserva);
            }

            return MapToResponse(entregableCreado);
        }

        public async Task<EntregableResponse?> UpdateEntregableAsync(int id, CrearEntregableRequest request)
        {
            var entregable = await _entregableRepository.GetByIdAsync(id);
            if (entregable == null) return null;

            entregable.EnlaceTikTok = request.EnlaceTikTok;
            entregable.EnlaceInstagram = request.EnlaceInstagram;
            entregable.CantidadGastada = request.CantidadGastada;

            var entregableActualizado = await _entregableRepository.UpdateAsync(entregable);
            return MapToResponse(entregableActualizado);
        }

        public async Task<bool> DeleteEntregableAsync(int id)
        {
            return await _entregableRepository.DeleteAsync(id);
        }

        private static EntregableResponse MapToResponse(Entregable entregable)
        {
            return new EntregableResponse
            {
                Id = entregable.Id,
                ReservaId = entregable.ReservaId,
                EnlaceTikTok = entregable.EnlaceTikTok,
                EnlaceInstagram = entregable.EnlaceInstagram,
                CantidadGastada = entregable.CantidadGastada,
                FechaCreacion = entregable.FechaCreacion,
                FechaActualizacion = entregable.FechaActualizacion
            };
        }
    }
}