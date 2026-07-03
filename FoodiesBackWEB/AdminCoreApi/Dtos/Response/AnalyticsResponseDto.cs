namespace AdminCoreApi.Dtos.Response
{
    public class RestauranteAnalyticsDto
    {
        public required string NombreRestaurante { get; set; }
        public int TotalReservas { get; set; }
        public int ReservasCompletadas { get; set; }
        public int ReservasPendientes { get; set; }
        public int FaltasGraves { get; set; }
        public decimal IngresoTotal { get; set; }
        public decimal IngresoPromedio { get; set; }
        public double TasaCompletado { get; set; }
        public List<HoraPicoDto> HorasPico { get; set; } = new();
    }

    public class HoraPicoDto
    {
        public required string Hora { get; set; }
        public int CantidadReservas { get; set; }
        public int TotalPersonas { get; set; }
    }

    public class TendenciaVisitasDto
    {
        public required string NombreRestaurante { get; set; }
        public List<VisitaMensualDto> VisitasMensuales { get; set; } = new();
        public PrediccionDto Prediccion { get; set; } = new();
    }

    public class VisitaMensualDto
    {
        public int Año { get; set; }
        public int Mes { get; set; }
        public required string NombreMes { get; set; }
        public int CantidadVisitas { get; set; }
        public decimal IngresoTotal { get; set; }
    }

    public class PrediccionDto
    {
        public int MesSiguiente { get; set; }
        public int AñoSiguiente { get; set; }
        public string NombreMesSiguiente { get; set; } = string.Empty;
        public double VisitasPredichas { get; set; }
        public double Tendencia { get; set; } // Positiva o negativa
        public double PorcentajeCrecimiento { get; set; }
        public string InterpretacionTendencia { get; set; } = string.Empty;
    }

    public class ResumenGeneralDto
    {
        public int TotalUsuarios { get; set; }
        public int TotalFoodies { get; set; }
        public int TotalRestaurantes { get; set; }
        public int TotalReservas { get; set; }
        public int TotalReservasCompletadas { get; set; }
        public decimal IngresoTotalPlataforma { get; set; }
        public RestaurantePopularDto RestauranteMasPopular { get; set; } = new();
        public RestaurantePopularDto RestauranteMenosVisitado { get; set; } = new();
        public List<RestauranteAnalyticsDto> TopRestaurantes { get; set; } = new();
    }

    public class RestaurantePopularDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int TotalReservas { get; set; }
        public decimal IngresoTotal { get; set; }
    }

    public class ComparativaRestaurantesDto
    {
        public List<RestauranteComparativoDto> Restaurantes { get; set; } = new();
    }

    public class RestauranteComparativoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int TotalReservas { get; set; }
        public decimal IngresoTotal { get; set; }
        public double TasaCompletado { get; set; }
        public int PromedioPersonasPorReserva { get; set; }
    }

    public class ReservasPorFechaDto
    {
        public required string NombreRestaurante { get; set; }
        public List<PuntoReservaDto> Puntos { get; set; } = new();
        public FuncionAjusteDto FuncionAjuste { get; set; } = new();
    }

    public class PuntoReservaDto
    {
        public DateTime Fecha { get; set; }
        public int NumeroPersonas { get; set; }
        public int DiaRelativo { get; set; } // Días desde la primera reserva
    }

    public class FuncionAjusteDto
    {
        public double Pendiente { get; set; } // m en y = mx + b
        public double Intercepto { get; set; } // b en y = mx + b
        public double CoeficienteCorrelacion { get; set; } // R²
        public string Interpretacion { get; set; } = string.Empty;
        public double PromedioPersonas { get; set; }
        public double PrediccionProximaSemana { get; set; }
    }
}
