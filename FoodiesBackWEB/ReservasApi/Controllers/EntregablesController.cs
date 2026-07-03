using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservasApi.Dtos.Request;
using ReservasApi.Services.Interfaces;

namespace ReservasApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EntregablesController : ControllerBase
    {
        private readonly IEntregableService _entregableService;

        public EntregablesController(IEntregableService entregableService)
        {
            _entregableService = entregableService;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var entregables = await _entregableService.GetAllEntregablesAsync();
            return Ok(entregables);
        }

        [HttpGet("por-reserva/{reservaId:int}")]
        public async Task<IActionResult> GetByReserva(int reservaId)
        {
            var entregables = await _entregableService.GetEntregablesByReservaAsync(reservaId);
            return Ok(entregables);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entregable = await _entregableService.GetEntregableByIdAsync(id);
            if (entregable == null)
                return NotFound();

            return Ok(entregable);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CrearEntregableRequest request)
        {
            var entregable = await _entregableService.CreateEntregableAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = entregable.Id }, entregable);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CrearEntregableRequest request)
        {
            var entregable = await _entregableService.UpdateEntregableAsync(id, request);
            if (entregable == null)
                return NotFound();

            return Ok(entregable);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var eliminado = await _entregableService.DeleteEntregableAsync(id);
            if (!eliminado)
                return NotFound();

            return NoContent();
        }
    }
}