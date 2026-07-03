using AdminCoreApi.Dtos.Response;

namespace AdminCoreApi.Services.Interfaces
{
    public interface IAnalyticsService
    {
        Task<ResumenGeneralDto> GetResumenGeneralAsync();
        Task<List<RestauranteAnalyticsDto>> GetRestaurantesAnalyticsAsync();
        Task<RestauranteAnalyticsDto?> GetRestauranteAnalyticsByNameAsync(string nombreRestaurante);
        Task<List<TendenciaVisitasDto>> GetTendenciasVisitasAsync();
        Task<TendenciaVisitasDto?> GetTendenciaVisitasByRestauranteAsync(string nombreRestaurante);
        Task<ComparativaRestaurantesDto> GetComparativaRestaurantesAsync();
        Task<List<ReservasPorFechaDto>> GetReservasPorFechaAsync();
    }
}
