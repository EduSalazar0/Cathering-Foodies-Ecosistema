import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCoreService } from '../../../core/services/admin-core.service';
import { ResumenGeneralDto, RestauranteAnalyticsDto, TendenciaVisitasDto, ReservasPorFechaDto } from '../../../core/models/admincore.model';
import { Chart, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js (gráficos, escalas, leyendas, etc.)
Chart.register(...registerables);

/**
 * Componente principal del dashboard de Analytics para AdminCore
 * 
 * Muestra visualizaciones analíticas de la plataforma incluyendo:
 * - Resumen general de usuarios, restaurantes, reservas e ingresos
 * - Gráfico comparativo de restaurantes (reservas e ingresos)
 * - Gráfico de estado de reservas (completadas vs pendientes)
 * - Análisis de tendencias y predicciones de visitas por restaurante
 * - Análisis de cantidad de personas por reserva con función de ajuste
 * 
 * Utiliza Chart.js para renderizar gráficos interactivos con datos reales del backend
 */
@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  // Datos del resumen general de la plataforma
  resumen: ResumenGeneralDto | null = null;
  
  // Lista de analytics por cada restaurante (reservas, ingresos, tasas)
  restaurantesAnalytics: RestauranteAnalyticsDto[] = [];
  
  // Tendencias mensuales de visitas con predicciones por restaurante
  tendencias: TendenciaVisitasDto[] = [];
  
  // Análisis de reservas por fecha con función de ajuste (regresión lineal)
  reservasPorFecha: ReservasPorFechaDto[] = [];
  
  // Estado de carga de datos
  loading = true;
  hasData = false;
  errorMessage = '';

  constructor(
    private adminService: AdminCoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Carga todos los datos analíticos desde el backend de forma paralela
   * 
   * Realiza 4 peticiones simultáneas:
   * 1. Resumen general (usuarios, restaurantes, reservas, ingresos)
   * 2. Analytics de restaurantes (métricas detalladas por restaurante)
   * 3. Tendencias de visitas (histórico mensual + predicciones)
   * 4. Reservas por fecha (análisis de cantidad de personas con regresión)
   * 
   * Usa un contador para saber cuándo todas las peticiones han terminado
   * y luego renderiza los gráficos en el DOM
   */
  loadData() {
    this.loading = true;
    this.errorMessage = '';
    
    // Contador para sincronizar las 4 peticiones asíncronas
    let completedRequests = 0;
    const totalRequests = 4;
    
    // Función que se ejecuta cada vez que termina una petición
    const checkIfAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        console.log('Todas las peticiones completadas');
        console.log('Resumen:', this.resumen);
        console.log('Restaurantes:', this.restaurantesAnalytics);
        console.log('Tendencias:', this.tendencias);
        console.log('Reservas por Fecha:', this.reservasPorFecha);
        
        // Verificar si hay datos (aunque sean pocos)
        if (this.resumen) {
          this.hasData = true;
          this.loading = false;
          console.log('hasData se estableció en true');
          console.log('loading se estableció en false');
          
          // Forzar detección de cambios de Angular
          this.cdr.detectChanges();
          
          // Dar tiempo al DOM para renderizar los canvas antes de crear gráficos
          setTimeout(() => {
            console.log('Creando gráficos...');
            this.createReservasChart();
            if (this.restaurantesAnalytics.length > 0) {
              this.createRestaurantesChart();
            }
            if (this.tendencias.length > 0) {
              this.createTendenciasChart();
            }
            if (this.reservasPorFecha.length > 0) {
              this.createReservasPorFechaChart();
            }
          }, 200);
        } else {
          this.hasData = false;
          this.loading = false;
          this.cdr.detectChanges();
          console.log('No hay resumen disponible');
        }
      }
    };
    
    // Petición 1: Resumen general de la plataforma
    this.adminService.getResumenGeneral().subscribe({
      next: (data) => {
        console.log('Resumen General recibido:', data);
        this.resumen = data;
        checkIfAllLoaded();
      },
      error: (error) => {
        console.error('Error cargando resumen:', error);
        this.errorMessage = 'Error al cargar los datos. Por favor, intenta nuevamente.';
        checkIfAllLoaded();
      }
    });

    // Petición 2: Analytics detallado de cada restaurante
    this.adminService.getRestaurantesAnalytics().subscribe({
      next: (data) => {
        console.log('Restaurantes Analytics recibido:', data);
        this.restaurantesAnalytics = data;
        checkIfAllLoaded();
      },
      error: (error) => {
        console.error('Error cargando restaurantes:', error);
        checkIfAllLoaded();
      }
    });

    // Petición 3: Tendencias de visitas mensuales con predicciones
    this.adminService.getTendencias().subscribe({
      next: (data) => {
        console.log('Tendencias recibidas:', data);
        this.tendencias = data;
        checkIfAllLoaded();
      },
      error: (error) => {
        console.error('Error cargando tendencias:', error);
        checkIfAllLoaded();
      }
    });

    // Petición 4: Reservas por fecha con análisis de regresión
    this.adminService.getReservasPorFecha().subscribe({
      next: (data) => {
        console.log('Reservas por Fecha recibidas:', data);
        this.reservasPorFecha = data;
        checkIfAllLoaded();
      },
      error: (error) => {
        console.error('Error cargando reservas por fecha:', error);
        checkIfAllLoaded();
      }
    });
  }

  /**
   * Crea el gráfico de estado de reservas (Doughnut Chart)
   * 
   * Muestra una gráfica circular tipo dona con:
   * - Reservas completadas (verde)
   * - Reservas pendientes (amarillo)
   * 
   * Se calcula restando las completadas del total
   */
  createReservasChart() {
    if (!this.resumen) return;

    // Obtener el elemento canvas del DOM
    const ctxReservas = document.getElementById('reservasChart') as HTMLCanvasElement;
    if (ctxReservas) {
      new Chart(ctxReservas, {
        type: 'doughnut',
        data: {
          labels: ['Completadas', 'Pendientes'],
          datasets: [{
            data: [
              this.resumen.totalReservasCompletadas,
              this.resumen.totalReservas - this.resumen.totalReservasCompletadas
            ],
            backgroundColor: ['#4CAF50', '#FFC107'],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }

  /**
   * Crea el gráfico comparativo de restaurantes (Bar Chart)
   * 
   * Muestra un gráfico de barras agrupadas con dos datasets por restaurante:
   * - Barras azules: Cantidad de reservas totales
   * - Barras verdes: Ingresos totales en dólares
   * 
   * Permite comparar visualmente el rendimiento de cada restaurante
   */
  createRestaurantesChart() {
    const ctx = document.getElementById('restaurantesChart') as HTMLCanvasElement;
    if (ctx && this.restaurantesAnalytics.length > 0) {
      const todosRestaurantes = this.restaurantesAnalytics;
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: todosRestaurantes.map(r => r.nombreRestaurante),
          datasets: [{
            label: 'Reservas',
            data: todosRestaurantes.map(r => r.totalReservas),
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1
          }, {
            label: 'Ingresos ($)',
            data: todosRestaurantes.map(r => r.ingresoTotal),
            backgroundColor: '#4CAF50',
            borderColor: '#388E3C',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e0e0e0'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                padding: 15,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }

  /**
   * Crea el gráfico de tendencias y predicciones de visitas (Line Chart con curvas)
   * 
   * Visualiza el histórico mensual de visitas/reservas por restaurante usando:
   * - Líneas curvas suaves (tension: 0.4) que conectan los puntos históricos
   * - Líneas punteadas de extensión hacia la predicción futura
   * - Estrellas doradas para marcar las predicciones del próximo mes
   * 
   * La predicción se calcula mediante regresión lineal en el backend
   * Cada restaurante tiene su propio color distintivo
   */
  createTendenciasChart() {
    const ctx = document.getElementById('tendenciasChart') as HTMLCanvasElement;
    if (ctx && this.tendencias.length > 0) {
      const datasets: any[] = [];
      
      // Paleta de colores para diferenciar restaurantes
      const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#E91E63', '#3F51B5'];
      
      // Crear datasets para cada restaurante
      this.tendencias.forEach((tendencia, index) => {
        const color = colors[index % colors.length];
        
        if (tendencia.visitasMensuales.length === 0) {
          return; // Saltar si no hay datos
        }
        
        // Puntos históricos reales con etiquetas de mes
        const puntosHistoricos = tendencia.visitasMensuales.map((v, i) => ({
          x: i + 1,
          y: v.cantidadVisitas,
          label: v.nombreMes
        }));
        
        // Dataset 1: Línea curva principal con puntos históricos
        datasets.push({
          label: tendencia.nombreRestaurante,
          data: puntosHistoricos,
          backgroundColor: color + '40', // Semi-transparente
          borderColor: color,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBorderWidth: 2,
          borderWidth: 3,
          showLine: true,
          tension: 0.4, // Curva suave tipo Bezier
          fill: false,
          type: 'line'
        });
        
        // Agregar predicción si existe
        if (tendencia.prediccion && tendencia.prediccion.visitasPredichas > 0) {
          const puntoPrediccion = [{
            x: tendencia.visitasMensuales.length + 1,
            y: tendencia.prediccion.visitasPredichas,
            label: tendencia.prediccion.nombreMesSiguiente + ' (Predicción)'
          }];
          
          // Dataset 2: Línea punteada de extensión hacia la predicción
          const lineaExtension = [
            {
              x: tendencia.visitasMensuales.length,
              y: tendencia.visitasMensuales[tendencia.visitasMensuales.length - 1].cantidadVisitas
            },
            {
              x: tendencia.visitasMensuales.length + 1,
              y: tendencia.prediccion.visitasPredichas
            }
          ];
          
          datasets.push({
            label: tendencia.nombreRestaurante + ' (extensión)',
            data: lineaExtension,
            borderColor: color,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [8, 4], // Línea discontinua
            pointRadius: 0,
            showLine: true,
            tension: 0.4,
            fill: false,
            type: 'line'
          });
          
          // Dataset 3: Punto de predicción destacado con estrella dorada
          datasets.push({
            label: tendencia.nombreRestaurante + ' (futuro)',
            data: puntoPrediccion,
            backgroundColor: color,
            borderColor: '#FFD700', // Borde dorado
            borderWidth: 3,
            pointRadius: 10,
            pointHoverRadius: 12,
            pointStyle: 'star', // Icono de estrella
            showLine: false,
            type: 'scatter'
          });
        }
      });

      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 11
                },
                usePointStyle: true,
                filter: function(item) {
                  // Ocultar datasets técnicos de la leyenda
                  return !item.text.includes('(extensión)') && !item.text.includes('(futuro)');
                }
              }
            },
            tooltip: {
              callbacks: {
                title: function(context: any) {
                  const dataPoint = context[0].raw;
                  return dataPoint.label || 'Período ' + dataPoint.x;
                },
                label: function(context: any) {
                  const label = context.dataset.label || '';
                  if (label.includes('(futuro)')) {
                    return '🌟 Predicción: ' + Math.round(context.parsed.y) + ' visitas';
                  }
                  if (label.includes('(extensión)')) {
                    return ''; // No mostrar tooltip para líneas técnicas
                  }
                  return label + ': ' + Math.round(context.parsed.y) + ' visitas';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              },
              ticks: {
                stepSize: 5,
                font: {
                  size: 11
                }
              },
              title: {
                display: true,
                text: 'Cantidad de Visitas/Reservas',
                font: {
                  size: 13,
                  weight: 'bold'
                },
                color: '#2c3e50'
              }
            },
            x: {
              type: 'linear',
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              },
              ticks: {
                stepSize: 1,
                font: {
                  size: 11
                },
                callback: function(value: any) {
                  return 'Mes ' + value;
                }
              },
              title: {
                display: true,
                text: 'Tiempo (Períodos Mensuales)',
                font: {
                  size: 13,
                  weight: 'bold'
                },
                color: '#2c3e50'
              }
            }
          }
        }
      });
    }
  }

  /**
   * Crea el gráfico de análisis de cantidad de personas por reserva (Line Chart con regresión)
   * 
   * Visualiza la relación entre la fecha de las reservas y la cantidad de personas usando:
   * - Puntos de dispersión: Cada reserva real plotteada en el gráfico
   * - Línea de regresión lineal (y = mx + b): Función que mejor se ajusta a los datos
   * - Predicción: Estrella dorada mostrando el tamaño estimado de grupos en 7 días
   * 
   * El eje X representa días desde la primera reserva del restaurante
   * El eje Y representa la cantidad de personas en cada reserva
   * 
   * La regresión lineal se calcula en el backend y se dibuja con solo 2 puntos
   * (es una línea recta, no necesita más puntos intermedios)
   */
  createReservasPorFechaChart() {
    if (!this.reservasPorFecha || this.reservasPorFecha.length === 0) return;

    const ctx = document.getElementById('reservasPorFechaChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Paleta de colores diferenciada para cada restaurante
    const colores = [
      { punto: 'rgba(54, 162, 235, 0.8)', linea: 'rgba(54, 162, 235, 0.3)', prediccion: 'rgba(54, 162, 235, 1)' },
      { punto: 'rgba(255, 99, 132, 0.8)', linea: 'rgba(255, 99, 132, 0.3)', prediccion: 'rgba(255, 99, 132, 1)' },
      { punto: 'rgba(75, 192, 192, 0.8)', linea: 'rgba(75, 192, 192, 0.3)', prediccion: 'rgba(75, 192, 192, 1)' },
      { punto: 'rgba(255, 206, 86, 0.8)', linea: 'rgba(255, 206, 86, 0.3)', prediccion: 'rgba(255, 206, 86, 1)' },
      { punto: 'rgba(153, 102, 255, 0.8)', linea: 'rgba(153, 102, 255, 0.3)', prediccion: 'rgba(153, 102, 255, 1)' }
    ];

    const datasets: any[] = [];

    this.reservasPorFecha.forEach((restaurante, index) => {
      const color = colores[index % colores.length];
      
      // Dataset 1: Puntos de reservas reales (datos históricos)
      const puntosReales = restaurante.puntos.map(p => ({
        x: p.diaRelativo, // Días desde la primera reserva
        y: p.numeroPersonas // Cantidad de personas en esa reserva
      }));

      datasets.push({
        label: restaurante.nombreRestaurante,
        data: puntosReales,
        backgroundColor: color.punto,
        borderColor: color.punto,
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: true, // Conectar puntos con línea curva
        tension: 0.4, // Suavizar la línea entre puntos
        fill: false
      });

      // Dataset 2: Línea de regresión lineal (función de ajuste y = mx + b)
      if (restaurante.puntos.length > 0) {
        const minX = Math.min(...restaurante.puntos.map(p => p.diaRelativo));
        const maxX = Math.max(...restaurante.puntos.map(p => p.diaRelativo));
        
        // Solo 2 puntos necesarios para dibujar una línea recta
        // Punto 1: Inicio de la regresión
        // Punto 2: Fin extendido hasta la predicción (+7 días)
        const puntosRegresion = [
          { 
            x: minX, 
            y: restaurante.funcionAjuste.pendiente * minX + restaurante.funcionAjuste.intercepto 
          },
          { 
            x: maxX + 7, // Extender hasta la predicción
            y: restaurante.funcionAjuste.pendiente * (maxX + 7) + restaurante.funcionAjuste.intercepto 
          }
        ];

        datasets.push({
          label: `${restaurante.nombreRestaurante} (Función de Ajuste)`,
          data: puntosRegresion,
          borderColor: color.linea,
          borderWidth: 2,
          borderDash: [5, 5], // Línea discontinua
          pointRadius: 0, // Sin puntos visibles
          fill: false,
          showLine: true,
          tension: 0 // Línea completamente recta
        });

        // Dataset 3: Punto de predicción para próxima semana
        const ultimoDia = maxX;
        const prediccionDia = ultimoDia + 7; // 7 días después del último dato
        const prediccionPersonas = restaurante.funcionAjuste.prediccionProximaSemana;

        datasets.push({
          label: `${restaurante.nombreRestaurante} (Predicción)`,
          data: [{ x: prediccionDia, y: prediccionPersonas }],
          backgroundColor: color.prediccion,
          borderColor: '#FFD700', // Borde dorado
          borderWidth: 3,
          pointRadius: 10,
          pointStyle: 'star', // Icono de estrella
          pointHoverRadius: 12,
          showLine: false
        });
      }
    });

    new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Permitir altura personalizada
        animation: {
          duration: 500 // Animación rápida para mejor rendimiento
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12 },
              filter: function(item: any) {
                // Ocultar datasets técnicos de la leyenda
                return !item.text.includes('(Función de Ajuste)') && !item.text.includes('(Predicción)');
              }
            }
          },
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || '';
                if (label.includes('(Función de Ajuste)')) {
                  return ''; // No mostrar tooltip para línea de regresión
                }
                if (label.includes('(Predicción)')) {
                  return `Predicción (+7 días): ${context.parsed.y.toFixed(1)} personas`;
                }
                return `${label}: ${context.parsed.y} personas (Día ${context.parsed.x})`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Días desde primera reserva',
              font: { size: 13, weight: 'bold' },
              color: '#2c3e50'
            },
            ticks: {
              stepSize: 5,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Personas por Reserva',
              font: { size: 13, weight: 'bold' },
              color: '#2c3e50'
            },
            ticks: {
              stepSize: 2,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  }
}
