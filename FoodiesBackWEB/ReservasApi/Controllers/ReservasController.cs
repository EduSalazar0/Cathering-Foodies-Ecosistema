using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservasApi.Dtos.Request;
using ReservasApi.Services.Interfaces;
using System.Security.Claims;

namespace ReservasApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservasController : ControllerBase
    {
        private readonly IReservaService _reservaService;

        public ReservasController(IReservaService reservaService)
        {
            _reservaService = reservaService;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var reservas = await _reservaService.GetAllReservasAsync();
            return Ok(reservas);
        }

        [HttpGet("mis-reservas")]
        public async Task<IActionResult> GetMisReservas()
        {
            var usuarioId = GetUsuarioIdFromToken();
            if (usuarioId == null)
                return Unauthorized();

            var reservas = await _reservaService.GetReservasByUsuarioAsync(usuarioId.Value);
            return Ok(reservas);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var usuarioId = GetUsuarioIdFromToken();
            if (usuarioId == null)
                return Unauthorized();

            var isAdmin = User.IsInRole("admin") || User.IsInRole("Admin");
            var reserva = isAdmin 
                ? await _reservaService.GetReservaByIdAsync(id)
                : await _reservaService.GetReservaByIdAndUsuarioAsync(id, usuarioId.Value);

            if (reserva == null)
                return NotFound();

            return Ok(reserva);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CrearReservaRequest request)
        {
            var usuarioId = GetUsuarioIdFromToken();
            if (usuarioId == null)
                return Unauthorized();

            var reserva = await _reservaService.CreateReservaAsync(request, usuarioId.Value);
            return CreatedAtAction(nameof(GetById), new { id = reserva.Id }, reserva);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ActualizarReservaRequest request)
        {
            var usuarioId = GetUsuarioIdFromToken();
            if (usuarioId == null)
                return Unauthorized();

            var reserva = await _reservaService.UpdateReservaAsync(id, request, usuarioId.Value);
            if (reserva == null)
                return NotFound();

            return Ok(reserva);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var usuarioId = GetUsuarioIdFromToken();
            if (usuarioId == null)
                return Unauthorized();

            // Verificar si se puede cancelar antes de eliminar
            var puedeCanselar = await _reservaService.PuedeCancelarReservaAsync(id, usuarioId.Value);
            if (!puedeCanselar)
            {
                return BadRequest(new { mensaje = "No se puede cancelar esta reserva. Solo se pueden cancelar reservas antes de la fecha y hora de la visita y que no estén completadas." });
            }

            var eliminada = await _reservaService.DeleteReservaAsync(id, usuarioId.Value);
            if (!eliminada)
                return NotFound();

            return NoContent();
        }

        [HttpGet("{id:int}/puede-cancelar")]
        public async Task<IActionResult> PuedeCancelar(int id)
        {
            var usuarioId = GetUsuarioIdFromToken();
            if (usuarioId == null)
                return Unauthorized();

            var puedeCancelar = await _reservaService.PuedeCancelarReservaAsync(id, usuarioId.Value);
            return Ok(new { puedeCancelar });
        }

        [HttpPost("actualizar-estados")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ActualizarEstados()
        {
            await _reservaService.ActualizarEstadosAutomaticoAsync();
            return Ok(new { mensaje = "Estados actualizados correctamente" });
        }

        [HttpPatch("{id:int}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoRequest request)
        {
            var usuarioId = GetUsuarioIdFromToken();
            if (usuarioId == null)
                return Unauthorized();

            var reserva = await _reservaService.CambiarEstadoReservaAsync(id, request.Estado, usuarioId.Value);
            if (reserva == null)
                return NotFound();

            return Ok(reserva);
        }

        [HttpGet("por-estado/{estado}")]
        public async Task<IActionResult> GetByEstado(string estado)
        {
            var reservas = await _reservaService.GetReservasByEstadoAsync(estado);
            return Ok(reservas);
        }

        [HttpGet("por-restaurante")]
        [Authorize(Roles = "restaurante")]
        public async Task<IActionResult> GetByRestaurante()
        {
            var usuarioId = GetUsuarioIdFromToken();
            if (usuarioId == null)
                return Unauthorized();

            // Obtener todos los roles del usuario
            var userRoles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
            
            Console.WriteLine($"DEBUG GetByRestaurante: Roles del usuario: {string.Join(", ", userRoles)}");
            
            // Buscar un rol que no sea "restaurante" (ese sería el nombre del restaurante)
            var nombreRestaurante = userRoles.FirstOrDefault(role => 
                role != "restaurante" && 
                !role.Equals("Admin", StringComparison.OrdinalIgnoreCase) && 
                role != "usuario" && 
                role != "foodie");
            
            if (string.IsNullOrEmpty(nombreRestaurante))
            {
                Console.WriteLine("DEBUG GetByRestaurante: No se encontró nombre de restaurante en los roles");
                return BadRequest(new { mensaje = "Usuario no tiene un rol de restaurante específico", roles = userRoles });
            }

            Console.WriteLine($"DEBUG GetByRestaurante: Filtrando por restaurante: {nombreRestaurante}");
            
            var reservas = await _reservaService.GetReservasByRestauranteAsync(nombreRestaurante);
            return Ok(reservas);
        }

        [HttpGet("por-fecha")]
        public async Task<IActionResult> GetByFechaRango([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin)
        {
            var reservas = await _reservaService.GetReservasByFechaRangoAsync(fechaInicio, fechaFin);
            return Ok(reservas);
        }

        private int? GetUsuarioIdFromToken()
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (usuarioIdClaim != null && int.TryParse(usuarioIdClaim.Value, out int usuarioId))
            {
                return usuarioId;
            }
            return null;
        }
    }

    public class CambiarEstadoRequest
    {
        public required string Estado { get; set; }
    }
}