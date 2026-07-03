import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReservaService } from '../../core/services/reserva.service';
import { CrearReservaRequest, Reserva, CrearEntregableRequest } from '../../core/models/reserva.model';

interface Restaurante {
  id: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
  imagen: string;
}

@Component({
  selector: 'app-dashboard-foodie',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-foodie.component.html',
  styleUrls: ['./dashboard-foodie.component.css']
})
export class DashboardFoodieComponent implements OnInit {
  
  // Expose Math to template
  Math = Math;
  
  // Tab management
  activeTab: string = 'restaurantes';
  
  // Search and filters
  searchTerm: string = '';
  selectedUbicacion: string = '';
  selectedTipoCocina: string = '';
  
  // Modal state
  showReservationModal: boolean = false;
  selectedRestaurant: Restaurante | null = null;
  
  // Reservation form data
  reservationData = {
    fecha: '',
    hora: '',
    personas: '2'
  };

  // Entregables data
  entregables = {
    enlaceTikTok: '',
    enlaceInstagram: '',
    cantidadGastada: 0
  };

  // Reserva seleccionada para entregables
  reservaSeleccionadaParaEntregables: Reserva | null = null;
  
  // Data arrays
  restaurantes: Restaurante[] = [
    {
      id: 1,
      nombre: 'Macchiata',
      tipo: 'BRUNCH - PIZZA - PASTA',
      ubicacion: 'La Primavera I en Cumbayá, Ecuador',
      imagen: '/img/Restaurantes/Macchiata.png'
    },
    {
      id: 2,
      nombre: "Michael's",
      tipo: 'GRILL',
      ubicacion: 'Quito, Guayaquil',
      imagen: '/img/Restaurantes/Michaels.png'
    },
    {
      id: 3,
      nombre: 'Roll It',
      tipo: 'SUSHI',
      ubicacion: 'Quito, Cumbayá',
      imagen: '/img/Restaurantes/RollIt.png'
    },
    {
      id: 4,
      nombre: 'The Viet Station',
      tipo: 'COMIDA VIETNAMITA',
      ubicacion: 'Quito, La Floresta',
      imagen: '/img/Restaurantes/The Viet Station.png'
    }
  ];

  restaurantesFiltrados: Restaurante[] = [];
  misReservas: Reserva[] = [];

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.restaurantesFiltrados = [...this.restaurantes];
    this.filtrarRestaurantes();
    this.cargarMisReservas();
  }

  // ============ CARGA DE DATOS ============
  
  cargarMisReservas(): void {
    this.reservaService.getMisReservas().subscribe({
      next: (reservas) => {
        this.misReservas = reservas;
        console.log('Mis reservas cargadas:', reservas);
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
      }
    });
  }

  // Tab management methods
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Search and filter methods
  onSearch() {
    this.filtrarRestaurantes();
  }
  
  onUbicacionChange(event: any) {
    this.selectedUbicacion = event.target.value;
    this.filtrarRestaurantes();
  }
  
  onTipoCocinaChange(event: any) {
    this.selectedTipoCocina = event.target.value;
    this.filtrarRestaurantes();
  }
  
  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    this.filtrarRestaurantes();
  }
  
  filtrarRestaurantes() {
    this.restaurantesFiltrados = this.restaurantes.filter(restaurante => {
      const matchNombre = restaurante.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchUbicacion = !this.selectedUbicacion || restaurante.ubicacion.toLowerCase().includes(this.selectedUbicacion.toLowerCase());
      const matchTipo = !this.selectedTipoCocina || restaurante.tipo.toLowerCase().includes(this.selectedTipoCocina.toLowerCase());
      
      return matchNombre && matchUbicacion && matchTipo;
    });
  }

  // Reservation methods
  onReservar(restaurante: Restaurante) {
    this.selectedRestaurant = restaurante;
    this.showReservationModal = true;
    // Reset form
    this.reservationData = {
      fecha: '',
      hora: '',
      personas: '2'
    };
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeReservationModal(): void {
    this.showReservationModal = false;
    this.selectedRestaurant = null;
    // Restore body scroll
    document.body.style.overflow = '';
  }

  confirmReservation(): void {
    if (!this.selectedRestaurant) return;

    const reservaRequest: CrearReservaRequest = {
      nombreLocal: this.selectedRestaurant.nombre,
      fecha: new Date(this.reservationData.fecha),
      hora: this.reservationData.hora,
      numeroPersonas: parseInt(this.reservationData.personas)
    };

    this.reservaService.crearReserva(reservaRequest).subscribe({
      next: (reserva) => {
        console.log('Reserva creada exitosamente:', reserva);
        this.closeReservationModal();
        this.cargarMisReservas(); // Recargar la lista
        alert('¡Reserva realizada con éxito!');
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        alert('Error al realizar la reserva. Por favor, intenta de nuevo.');
      }
    });
  }

  // ============ GESTIÓN DE ENTREGABLES ============

  // Seleccionar reserva para entregables
  seleccionarReservaParaEntregables(reserva: Reserva): void {
    this.reservaSeleccionadaParaEntregables = reserva;
    console.log('Reserva seleccionada para entregables:', reserva);
  }

  // Verificar si una reserva está seleccionada para entregables
  esReservaSeleccionada(reserva: Reserva): boolean {
    return this.reservaSeleccionadaParaEntregables?.id === reserva.id;
  }

  // Obtener reservas disponibles para entregables
  getReservasDisponiblesParaEntregables(): Reserva[] {
    return this.misReservas.filter(r => this.enPeriodoEntrega(r));
  }

  // Entregables methods
  submitEntregables(): void {
    if (!this.reservaSeleccionadaParaEntregables) {
      alert('Por favor, selecciona una reserva para subir los entregables.');
      return;
    }

    // Validar que se complete al menos un campo
    if (!this.validarEntregables()) {
      alert('Por favor, completa al menos uno de los siguientes campos:\n• Enlace de TikTok\n• Enlace de Instagram\n• Cantidad gastada (mayor a 0)');
      return;
    }

    const entregableRequest: CrearEntregableRequest = {
      reservaId: this.reservaSeleccionadaParaEntregables.id!,
      enlaceTikTok: this.entregables.enlaceTikTok || undefined,
      enlaceInstagram: this.entregables.enlaceInstagram || undefined,
      cantidadGastada: this.entregables.cantidadGastada
    };

    this.reservaService.crearEntregable(entregableRequest).subscribe({
      next: (entregable) => {
        console.log('Entregable creado exitosamente:', entregable);
        this.cargarMisReservas(); // Recargar la lista para ver la reserva completada
        alert(`¡Entregables enviados con éxito para ${this.reservaSeleccionadaParaEntregables!.nombreLocal}! La reserva se ha marcado como completada automáticamente.`);
        this.resetEntregables();
        this.reservaSeleccionadaParaEntregables = null; // Limpiar selección
      },
      error: (error) => {
        console.error('Error al crear entregable:', error);
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Error al enviar entregables. Por favor, intenta de nuevo.');
        }
      }
    });
  }

  // Validar que se complete al menos un campo de entregables
  validarEntregables(): boolean {
    // 1. La cantidad gastada es OBLIGATORIA (debe ser mayor a 0)
    const tieneCantidadValida = this.entregables.cantidadGastada > 0;
    
    // 2. Al menos UNO de los dos enlaces debe estar completo
    const tieneTikTok = !!(this.entregables.enlaceTikTok && this.entregables.enlaceTikTok.trim().length > 0);
    const tieneInstagram = !!(this.entregables.enlaceInstagram && this.entregables.enlaceInstagram.trim().length > 0);
    const tieneAlMenosUnEnlace = tieneTikTok || tieneInstagram;
    
    return tieneCantidadValida && tieneAlMenosUnEnlace;
  }

  // Obtener mensaje de validación específico
  getMensajeValidacion(): string {
    const tieneCantidadValida = this.entregables.cantidadGastada > 0;
    const tieneTikTok = !!(this.entregables.enlaceTikTok && this.entregables.enlaceTikTok.trim().length > 0);
    const tieneInstagram = !!(this.entregables.enlaceInstagram && this.entregables.enlaceInstagram.trim().length > 0);
    const tieneAlMenosUnEnlace = tieneTikTok || tieneInstagram;

    if (!tieneCantidadValida && !tieneAlMenosUnEnlace) {
      return 'La cantidad gastada es obligatoria y debe completar al menos un enlace (TikTok o Instagram)';
    } else if (!tieneCantidadValida) {
      return 'La cantidad gastada es obligatoria y debe ser mayor a $0.00';
    } else if (!tieneAlMenosUnEnlace) {
      return 'Debe completar al menos uno de los enlaces (TikTok o Instagram)';
    }
    
    return '';
  }

  // Verificar si el formulario está completo para habilitar el botón
  formularioEntregablesValido(): boolean {
    return this.reservaSeleccionadaParaEntregables !== null && this.validarEntregables();
  }

  resetEntregables(): void {
    this.entregables = {
      enlaceTikTok: '',
      enlaceInstagram: '',
      cantidadGastada: 0
    };
  }

  // ============ GESTIÓN DE RESERVAS ============
  
  completarVisita(reserva: Reserva): void {
    // Esta función ya no es necesaria porque las reservas se completan automáticamente
    // al subir entregables, pero la mantenemos por compatibilidad
    if (!reserva.id) return;

    this.reservaService.cambiarEstadoReserva(reserva.id, { estado: 'Visita Completada' }).subscribe({
      next: (reservaActualizada) => {
        console.log('Visita completada:', reservaActualizada);
        this.cargarMisReservas(); // Recargar la lista
        alert('¡Visita marcada como completada!');
      },
      error: (error) => {
        console.error('Error al completar visita:', error);
        alert('Error al completar la visita. Por favor, intenta de nuevo.');
      }
    });
  }

  // Cancelar/Eliminar reserva (solo si se puede cancelar)
  cancelarReserva(reserva: Reserva): void {
    if (!reserva.id) return;

    // Primero verificar si se puede cancelar
    this.reservaService.puedeCancelarReserva(reserva.id).subscribe({
      next: (result) => {
        if (!result.puedeCancelar) {
          alert('No se puede cancelar esta reserva. Solo se pueden cancelar reservas antes de la fecha y hora de la visita y que no estén completadas.');
          return;
        }

        // Confirmar cancelación
        if (confirm(`¿Estás seguro que deseas cancelar la reserva en ${reserva.nombreLocal}?`)) {
          this.reservaService.eliminarReserva(reserva.id!).subscribe({
            next: () => {
              console.log('Reserva cancelada exitosamente');
              this.cargarMisReservas(); // Recargar la lista
              alert('Reserva cancelada exitosamente.');
            },
            error: (error) => {
              console.error('Error al cancelar reserva:', error);
              if (error.error?.mensaje) {
                alert(error.error.mensaje);
              } else {
                alert('Error al cancelar la reserva. Por favor, intenta de nuevo.');
              }
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al verificar si se puede cancelar:', error);
        alert('Error al verificar el estado de la reserva.');
      }
    });
  }

  // Verificar si una reserva está en período de entrega
  enPeriodoEntrega(reserva: Reserva): boolean {
    return reserva.enPeriodoEntrega ?? false;
  }

  // Verificar si se puede cancelar una reserva
  puedeCancelar(reserva: Reserva): boolean {
    return reserva.puedeCancelar ?? false;
  }

  // Obtener texto de estado para mostrar en la UI
  getEstadoTexto(reserva: Reserva): string {
    switch (reserva.estadoReserva) {
      case 'Por Ir':
        if (this.enPeriodoEntrega(reserva)) {
          return `Por Subir Evidencia (${Math.round(reserva.horasRestantesParaEntrega ?? 0)}h restantes)`;
        }
        return 'Por Ir';
      case 'Visita Completada':
        return 'Completada ✅';
      case 'Falta Grave':
        return 'Falta Grave ❌';
      default:
        return reserva.estadoReserva;
    }
  }

  // Obtener clase CSS para el estado
  getEstadoClase(reserva: Reserva): string {
    switch (reserva.estadoReserva) {
      case 'Por Ir':
        return this.enPeriodoEntrega(reserva) ? 'estado-urgente' : 'estado-pendiente';
      case 'Visita Completada':
        return 'estado-completado';
      case 'Falta Grave':
        return 'estado-falta';
      default:
        return 'estado-pendiente';
    }
  }
}