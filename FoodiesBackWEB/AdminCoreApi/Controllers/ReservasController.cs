using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AdminCoreApi.Services.Interfaces;

namespace AdminCoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class ReservasController(IReservasApiService reservasService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reservas = await reservasService.GetAllReservasAsync();
            return Ok(reservas);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var reserva = await reservasService.GetReservaByIdAsync(id);
            return Ok(reserva);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var resultado = await reservasService.DeleteReservaAsync(id);
            return Ok(resultado);
        }
    }
}
