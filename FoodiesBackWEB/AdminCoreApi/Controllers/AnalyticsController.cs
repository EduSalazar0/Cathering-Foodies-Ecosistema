using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AdminCoreApi.Services.Interfaces;

namespace AdminCoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class AnalyticsController(IAnalyticsService analyticsService) : ControllerBase
    {
        [HttpGet("resumen-general")]
        public async Task<IActionResult> GetResumenGeneral()
        {
            var resumen = await analyticsService.GetResumenGeneralAsync();
            return Ok(resumen);
        }

        [HttpGet("restaurantes")]
        public async Task<IActionResult> GetRestaurantesAnalytics()
        {
            var analytics = await analyticsService.GetRestaurantesAnalyticsAsync();
            return Ok(analytics);
        }

        [HttpGet("restaurantes/{nombreRestaurante}")]
        public async Task<IActionResult> GetRestauranteAnalytics(string nombreRestaurante)
        {
            var analytics = await analyticsService.GetRestauranteAnalyticsByNameAsync(nombreRestaurante);
            return Ok(analytics);
        }

        [HttpGet("tendencias")]
        public async Task<IActionResult> GetTendencias()
        {
            var tendencias = await analyticsService.GetTendenciasVisitasAsync();
            return Ok(tendencias);
        }

        [HttpGet("tendencias/{nombreRestaurante}")]
        public async Task<IActionResult> GetTendenciaRestaurante(string nombreRestaurante)
        {
            var tendencia = await analyticsService.GetTendenciaVisitasByRestauranteAsync(nombreRestaurante);
            return Ok(tendencia);
        }

        [HttpGet("comparativa")]
        public async Task<IActionResult> GetComparativa()
        {
            var comparativa = await analyticsService.GetComparativaRestaurantesAsync();
            return Ok(comparativa);
        }

        [HttpGet("reservas-por-fecha")]
        public async Task<IActionResult> GetReservasPorFecha()
        {
            var datos = await analyticsService.GetReservasPorFechaAsync();
            return Ok(datos);
        }
    }
}
