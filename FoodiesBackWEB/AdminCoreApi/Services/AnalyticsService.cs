using AdminCoreApi.Dtos.Response;
using AdminCoreApi.Services.Interfaces;

namespace AdminCoreApi.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IReservasApiService _reservasService;
        private readonly IUsersApiService _usersService;
        private readonly IFormularioFoodieApiService _formularioService;

        public AnalyticsService(
            IReservasApiService reservasService,
            IUsersApiService usersService,
            IFormularioFoodieApiService formularioService)
        {
            _reservasService = reservasService;
            _usersService = usersService;
            _formularioService = formularioService;
        }

        public async Task<ResumenGeneralDto> GetResumenGeneralAsync()
        {
            var usuarios = await _usersService.GetAllUsersAsync();
            var reservas = await _reservasService.GetAllReservasAsync();
            var entregables = await _reservasService.GetAllEntregablesAsync();

            var foodies = usuarios.Count(u => u.Roles.Any(r => r.Nombre.ToLower() == "foodie"));
            var restaurantes = usuarios.Count(u => u.Roles.Any(r => r.Nombre.ToLower() == "restaurante"));
            var reservasCompletadas = reservas.Count(r => r.EstadoReserva == "Visita Completada");
            var ingresoTotal = entregables.Sum(e => e.CantidadGastada);

            var reservasPorRestaurante = reservas
                .GroupBy(r => r.NombreLocal)
                .Select(g => new { Nombre = g.Key, Total = g.Count(), Ingreso = g.Sum(r => r.Entregables.Sum(e => e.CantidadGastada)) })
                .OrderByDescending(r => r.Total)
                .ToList();

            var restauranteMasPopular = reservasPorRestaurante.FirstOrDefault();
            var restauranteMenosVisitado = reservasPorRestaurante.LastOrDefault();

            var topRestaurantes = await GetRestaurantesAnalyticsAsync();

            return new ResumenGeneralDto
            {
                TotalUsuarios = usuarios.Count,
                TotalFoodies = foodies,
                TotalRestaurantes = restaurantes,
                TotalReservas = reservas.Count,
                TotalReservasCompletadas = reservasCompletadas,
                IngresoTotalPlataforma = ingresoTotal,
                RestauranteMasPopular = restauranteMasPopular != null ? new RestaurantePopularDto
                {
                    Nombre = restauranteMasPopular.Nombre,
                    TotalReservas = restauranteMasPopular.Total,
                    IngresoTotal = restauranteMasPopular.Ingreso
                } : new RestaurantePopularDto(),
                RestauranteMenosVisitado = restauranteMenosVisitado != null ? new RestaurantePopularDto
                {
                    Nombre = restauranteMenosVisitado.Nombre,
                    TotalReservas = restauranteMenosVisitado.Total,
                    IngresoTotal = restauranteMenosVisitado.Ingreso
                } : new RestaurantePopularDto(),
                TopRestaurantes = topRestaurantes.Take(10).ToList()
            };
        }

        public async Task<List<RestauranteAnalyticsDto>> GetRestaurantesAnalyticsAsync()
        {
            var reservas = await _reservasService.GetAllReservasAsync();
            var entregables = await _reservasService.GetAllEntregablesAsync();

            var restaurantesAgrupados = reservas.GroupBy(r => r.NombreLocal);
            var resultado = new List<RestauranteAnalyticsDto>();

            foreach (var grupo in restaurantesAgrupados)
            {
                var reservasRestaurante = grupo.ToList();
                var totalReservas = reservasRestaurante.Count;
                var completadas = reservasRestaurante.Count(r => r.EstadoReserva == "Visita Completada");
                var pendientes = reservasRestaurante.Count(r => r.EstadoReserva == "Por Ir");
                var faltas = reservasRestaurante.Count(r => r.EstadoReserva == "Falta Grave");

                var reservaIds = reservasRestaurante.Select(r => r.Id).ToList();
                var entregablesRestaurante = entregables.Where(e => reservaIds.Contains(e.ReservaId)).ToList();

                var ingresoTotal = entregablesRestaurante.Sum(e => e.CantidadGastada);
                var ingresoPromedio = totalReservas > 0 ? ingresoTotal / totalReservas : 0;
                var tasaCompletado = totalReservas > 0 ? (double)completadas / totalReservas * 100 : 0;

                // Calcular horas pico
                var horasPico = reservasRestaurante
                    .GroupBy(r => r.Hora)
                    .Select(g => new HoraPicoDto
                    {
                        Hora = g.Key,
                        CantidadReservas = g.Count(),
                        TotalPersonas = g.Sum(r => r.NumeroPersonas)
                    })
                    .OrderByDescending(h => h.CantidadReservas)
                    .Take(5)
                    .ToList();

                resultado.Add(new RestauranteAnalyticsDto
                {
                    NombreRestaurante = grupo.Key,
                    TotalReservas = totalReservas,
                    ReservasCompletadas = completadas,
                    ReservasPendientes = pendientes,
                    FaltasGraves = faltas,
                    IngresoTotal = ingresoTotal,
                    IngresoPromedio = ingresoPromedio,
                    TasaCompletado = Math.Round(tasaCompletado, 2),
                    HorasPico = horasPico
                });
            }

            return resultado.OrderByDescending(r => r.TotalReservas).ToList();
        }

        public async Task<RestauranteAnalyticsDto?> GetRestauranteAnalyticsByNameAsync(string nombreRestaurante)
        {
            var analytics = await GetRestaurantesAnalyticsAsync();
            return analytics.FirstOrDefault(r => r.NombreRestaurante.Equals(nombreRestaurante, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<List<TendenciaVisitasDto>> GetTendenciasVisitasAsync()
        {
            var reservas = await _reservasService.GetAllReservasAsync();
            var entregables = await _reservasService.GetAllEntregablesAsync();

            var restaurantesAgrupados = reservas.GroupBy(r => r.NombreLocal);
            var resultado = new List<TendenciaVisitasDto>();

            foreach (var grupo in restaurantesAgrupados)
            {
                var tendencia = await CalcularTendenciaRestaurante(grupo.Key, grupo.ToList(), entregables);
                resultado.Add(tendencia);
            }

            return resultado;
        }

        public async Task<TendenciaVisitasDto?> GetTendenciaVisitasByRestauranteAsync(string nombreRestaurante)
        {
            var tendencias = await GetTendenciasVisitasAsync();
            return tendencias.FirstOrDefault(t => t.NombreRestaurante.Equals(nombreRestaurante, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<ComparativaRestaurantesDto> GetComparativaRestaurantesAsync()
        {
            var reservas = await _reservasService.GetAllReservasAsync();
            var entregables = await _reservasService.GetAllEntregablesAsync();

            var restaurantesAgrupados = reservas.GroupBy(r => r.NombreLocal);
            var comparativas = new List<RestauranteComparativoDto>();

            foreach (var grupo in restaurantesAgrupados)
            {
                var reservasRestaurante = grupo.ToList();
                var totalReservas = reservasRestaurante.Count;
                var completadas = reservasRestaurante.Count(r => r.EstadoReserva == "Visita Completada");
                
                var reservaIds = reservasRestaurante.Select(r => r.Id).ToList();
                var entregablesRestaurante = entregables.Where(e => reservaIds.Contains(e.ReservaId)).ToList();
                var ingresoTotal = entregablesRestaurante.Sum(e => e.CantidadGastada);
                
                var tasaCompletado = totalReservas > 0 ? (double)completadas / totalReservas * 100 : 0;
                var promedioPersonas = totalReservas > 0 ? (int)reservasRestaurante.Average(r => r.NumeroPersonas) : 0;

                comparativas.Add(new RestauranteComparativoDto
                {
                    Nombre = grupo.Key,
                    TotalReservas = totalReservas,
                    IngresoTotal = ingresoTotal,
                    TasaCompletado = Math.Round(tasaCompletado, 2),
                    PromedioPersonasPorReserva = promedioPersonas
                });
            }

            return new ComparativaRestaurantesDto
            {
                Restaurantes = comparativas.OrderByDescending(r => r.TotalReservas).ToList()
            };
        }

        private async Task<TendenciaVisitasDto> CalcularTendenciaRestaurante(
            string nombreRestaurante, 
            List<ReservaResponseDto> reservas, 
            List<EntregableResponseDto> todosEntregables)
        {
            // Usar TODAS las reservas para tener más datos de tendencia
            var visitasPorMes = reservas
                .GroupBy(r => new { r.Fecha.Year, r.Fecha.Month })
                .Select(g =>
                {
                    var reservaIds = g.Select(r => r.Id).ToList();
                    var entregablesMes = todosEntregables.Where(e => reservaIds.Contains(e.ReservaId)).ToList();
                    
                    return new VisitaMensualDto
                    {
                        Año = g.Key.Year,
                        Mes = g.Key.Month,
                        NombreMes = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy"),
                        CantidadVisitas = g.Count(),
                        IngresoTotal = entregablesMes.Sum(e => e.CantidadGastada)
                    };
                })
                .OrderBy(v => v.Año)
                .ThenBy(v => v.Mes)
                .ToList();

            // Calcular predicción usando regresión lineal
            var prediccion = CalcularPrediccionRegresionLineal(visitasPorMes);

            return new TendenciaVisitasDto
            {
                NombreRestaurante = nombreRestaurante,
                VisitasMensuales = visitasPorMes,
                Prediccion = prediccion
            };
        }

        private PrediccionDto CalcularPrediccionRegresionLineal(List<VisitaMensualDto> visitasMensuales)
        {
            if (visitasMensuales.Count < 1)
            {
                var proximoMes = DateTime.Now.AddMonths(1);
                return new PrediccionDto
                {
                    MesSiguiente = proximoMes.Month,
                    AñoSiguiente = proximoMes.Year,
                    NombreMesSiguiente = proximoMes.ToString("MMMM yyyy"),
                    VisitasPredichas = 0,
                    Tendencia = 0,
                    PorcentajeCrecimiento = 0,
                    InterpretacionTendencia = "No hay datos disponibles"
                };
            }

            var ultimoMes = visitasMensuales.Last();
            var proximoMesReal = new DateTime(ultimoMes.Año, ultimoMes.Mes, 1).AddMonths(1);
            
            // Si solo hay 1 mes de datos, asumir crecimiento moderado del 5%
            if (visitasMensuales.Count == 1)
            {
                double visitasActuales = visitasMensuales[0].CantidadVisitas;
                double prediccionUnMes = visitasActuales * 1.05; // 5% de crecimiento estimado
                
                return new PrediccionDto
                {
                    MesSiguiente = proximoMesReal.Month,
                    AñoSiguiente = proximoMesReal.Year,
                    NombreMesSiguiente = proximoMesReal.ToString("MMMM yyyy"),
                    VisitasPredichas = Math.Round(prediccionUnMes, 0),
                    Tendencia = 0.05,
                    PorcentajeCrecimiento = 5.0,
                    InterpretacionTendencia = "Estimación basada en un solo mes (crecimiento moderado proyectado)"
                };
            }

            // Regresión lineal simple: y = mx + b
            int n = visitasMensuales.Count;
            double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

            for (int i = 0; i < n; i++)
            {
                double x = i + 1; // Índice del mes (1, 2, 3, ...)
                double y = visitasMensuales[i].CantidadVisitas;

                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumX2 += x * x;
            }

            // Calcular pendiente (m) y ordenada al origen (b)
            double denominador = (n * sumX2 - sumX * sumX);
            double m = 0;
            double b = 0;
            
            // Verificar que el denominador no sea cero para evitar división por cero
            if (Math.Abs(denominador) > 0.0001)
            {
                m = (n * sumXY - sumX * sumY) / denominador;
                b = (sumY - m * sumX) / n;
            }
            else
            {
                // Si el denominador es 0, todos los Y son iguales (línea horizontal)
                m = 0;
                b = sumY / n; // Promedio de Y
            }
            
            // Validar que m y b no sean Infinity o NaN
            if (double.IsInfinity(m) || double.IsNaN(m))
            {
                m = 0;
            }
            if (double.IsInfinity(b) || double.IsNaN(b))
            {
                b = sumY / n;
            }

            // Predicción para el siguiente mes
            double xSiguiente = n + 1;
            double visitasPredichas = m * xSiguiente + b;

            // Asegurar que la predicción no sea negativa, infinita o NaN
            if (double.IsInfinity(visitasPredichas) || double.IsNaN(visitasPredichas) || visitasPredichas < 0)
            {
                visitasPredichas = sumY / n; // Usar promedio como fallback
            }
            visitasPredichas = Math.Max(0, visitasPredichas);

            // Calcular porcentaje de crecimiento
            double porcentajeCrecimiento = 0;
            if (ultimoMes.CantidadVisitas > 0)
            {
                porcentajeCrecimiento = ((visitasPredichas - ultimoMes.CantidadVisitas) / ultimoMes.CantidadVisitas) * 100;
            }
            
            // Validar porcentaje de crecimiento
            if (double.IsInfinity(porcentajeCrecimiento) || double.IsNaN(porcentajeCrecimiento))
            {
                porcentajeCrecimiento = 0;
            }

            // Interpretación de la tendencia
            string interpretacion;
            if (Math.Abs(m) < 0.01)
                interpretacion = "Tendencia estable (sin cambios significativos)";
            else if (m > 0.5)
                interpretacion = "Tendencia de crecimiento fuerte";
            else if (m > 0)
                interpretacion = "Tendencia de crecimiento moderado";
            else if (m > -0.5)
                interpretacion = "Tendencia de leve decrecimiento";
            else
                interpretacion = "Tendencia de decrecimiento fuerte";

            return new PrediccionDto
            {
                MesSiguiente = proximoMesReal.Month,
                AñoSiguiente = proximoMesReal.Year,
                NombreMesSiguiente = proximoMesReal.ToString("MMMM yyyy"),
                VisitasPredichas = Math.Round(visitasPredichas, 0),
                Tendencia = Math.Round(m, 2),
                PorcentajeCrecimiento = Math.Round(porcentajeCrecimiento, 2),
                InterpretacionTendencia = interpretacion
            };
        }

        public async Task<List<ReservasPorFechaDto>> GetReservasPorFechaAsync()
        {
            var reservas = await _reservasService.GetAllReservasAsync();
            
            if (!reservas.Any())
                return new List<ReservasPorFechaDto>();

            var resultado = new List<ReservasPorFechaDto>();

            var reservasPorRestaurante = reservas
                .GroupBy(r => r.NombreLocal)
                .Where(g => g.Count() >= 2); // Necesitamos al menos 2 puntos para regresión

            foreach (var grupo in reservasPorRestaurante)
            {
                var nombreRestaurante = grupo.Key;
                var reservasOrdenadas = grupo.OrderBy(r => r.Fecha).ToList();
                
                if (!reservasOrdenadas.Any())
                    continue;

                var primeraFecha = reservasOrdenadas.First().Fecha;
                var puntos = new List<PuntoReservaDto>();

                foreach (var reserva in reservasOrdenadas)
                {
                    var diasDesdeInicio = (reserva.Fecha - primeraFecha).Days;
                    puntos.Add(new PuntoReservaDto
                    {
                        Fecha = reserva.Fecha,
                        NumeroPersonas = reserva.NumeroPersonas,
                        DiaRelativo = diasDesdeInicio
                    });
                }

                // Calcular función de ajuste (regresión lineal)
                var funcion = CalcularRegresionPersonasPorFecha(puntos);

                resultado.Add(new ReservasPorFechaDto
                {
                    NombreRestaurante = nombreRestaurante,
                    Puntos = puntos,
                    FuncionAjuste = funcion
                });
            }

            return resultado;
        }

        private FuncionAjusteDto CalcularRegresionPersonasPorFecha(List<PuntoReservaDto> puntos)
        {
            if (puntos.Count < 2)
            {
                var promedio = puntos.Any() ? puntos.Average(p => p.NumeroPersonas) : 0;
                return new FuncionAjusteDto
                {
                    Pendiente = 0,
                    Intercepto = promedio,
                    CoeficienteCorrelacion = 0,
                    PromedioPersonas = promedio,
                    PrediccionProximaSemana = promedio,
                    Interpretacion = "Datos insuficientes para calcular tendencia"
                };
            }

            int n = puntos.Count;
            double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

            foreach (var punto in puntos)
            {
                double x = punto.DiaRelativo;
                double y = punto.NumeroPersonas;
                
                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumX2 += x * x;
                sumY2 += y * y;
            }

            // Calcular pendiente (m) e intercepto (b) para y = mx + b
            double denominador = (n * sumX2 - sumX * sumX);
            double m = 0;
            double b = sumY / n;

            if (Math.Abs(denominador) > 0.0001)
            {
                m = (n * sumXY - sumX * sumY) / denominador;
                b = (sumY - m * sumX) / n;
            }

            // Validar que no haya valores infinitos o NaN
            if (double.IsInfinity(m) || double.IsNaN(m))
                m = 0;
            if (double.IsInfinity(b) || double.IsNaN(b))
                b = sumY / n;

            // Calcular coeficiente de correlación R²
            double r2 = 0;
            if (sumY2 > 0)
            {
                double ssTotal = sumY2 - (sumY * sumY) / n;
                double ssResidual = 0;
                
                foreach (var punto in puntos)
                {
                    double prediccion = m * punto.DiaRelativo + b;
                    double residuo = punto.NumeroPersonas - prediccion;
                    ssResidual += residuo * residuo;
                }

                if (ssTotal > 0)
                    r2 = 1 - (ssResidual / ssTotal);
                
                if (double.IsNaN(r2) || double.IsInfinity(r2))
                    r2 = 0;
            }

            // Calcular promedio de personas
            double promedioPersonas = sumY / n;

            // Predecir para 7 días después del último punto
            int ultimoDia = puntos.Max(p => p.DiaRelativo);
            double prediccionProximaSemana = m * (ultimoDia + 7) + b;
            
            if (double.IsNaN(prediccionProximaSemana) || double.IsInfinity(prediccionProximaSemana))
                prediccionProximaSemana = promedioPersonas;

            // Asegurar que la predicción sea razonable (mínimo 1 persona)
            prediccionProximaSemana = Math.Max(1, prediccionProximaSemana);

            // Generar interpretación
            string interpretacion;
            if (Math.Abs(m) < 0.01)
                interpretacion = $"Tamaño de grupo estable (~{Math.Round(promedioPersonas, 1)} personas)";
            else if (m > 0.1)
                interpretacion = $"Tendencia creciente: grupos más grandes con el tiempo (+{Math.Round(m, 2)} personas/día)";
            else if (m < -0.1)
                interpretacion = $"Tendencia decreciente: grupos más pequeños con el tiempo ({Math.Round(m, 2)} personas/día)";
            else if (m > 0)
                interpretacion = $"Ligero crecimiento en tamaño de grupos (+{Math.Round(m, 3)} personas/día)";
            else
                interpretacion = $"Ligera disminución en tamaño de grupos ({Math.Round(m, 3)} personas/día)";

            return new FuncionAjusteDto
            {
                Pendiente = Math.Round(m, 4),
                Intercepto = Math.Round(b, 2),
                CoeficienteCorrelacion = Math.Round(r2, 4),
                PromedioPersonas = Math.Round(promedioPersonas, 1),
                PrediccionProximaSemana = Math.Round(prediccionProximaSemana, 1),
                Interpretacion = interpretacion
            };
        }
    }
}
