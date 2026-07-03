import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FilterPipe } from './filter.pipe';
import { RoleService } from './role.service';
import { Reserva } from '../../core/models/reserva.model';
import { ReservaService } from '../../core/services/reserva.service';

@Component({
  selector: 'app-dashboard-restaurante',
  standalone: true,
  imports: [CommonModule, RouterModule, FilterPipe],
  templateUrl: './dashboard-restaurante.component.html',
  styleUrls: ['./dashboard-restaurante.component.css']
})
export class DashboardRestauranteComponent implements OnInit {

  reservas: Reserva[] = [];
  loading = false;
  nombreRestaurante = '';
  userRoles: string[] = [];

  constructor(
    private reservaService: ReservaService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarDashboard();
  }

  private inicializarDashboard(): void {
    console.log('Inicializando dashboard...');
    
    // Verificar que el usuario puede acceder al dashboard
    if (!this.roleService.canAccessRestauranteDashboard()) {
      console.error('El usuario no tiene permisos para acceder al dashboard de restaurante');
      return;
    }

    // Obtener roles del usuario
    this.userRoles = this.roleService.getUserRoles();
    console.log('Roles obtenidos:', this.userRoles);
    
    // Obtener el nombre del restaurante específico
    this.nombreRestaurante = this.roleService.getNombreRestaurante();
    console.log('Nombre del restaurante obtenido:', this.nombreRestaurante);
    
    if (this.nombreRestaurante) {
      console.log('Procediendo a cargar reservas...');
      this.cargarReservas();
    } else {
      console.error('No se encontró el rol de restaurante específico');
      console.log('Roles disponibles para análisis:', this.userRoles);
    }
  }

  private obtenerNombreRestaurante(): string {
    return this.roleService.getNombreRestaurante();
  }

  cargarReservas(): void {
    this.loading = true;
    console.log('Iniciando carga de reservas...');
    console.log('Nombre del restaurante actual:', this.nombreRestaurante);
    console.log('Roles del usuario:', this.userRoles);
    
    // Usar el nuevo endpoint que filtra automáticamente por el restaurante del usuario
    this.reservaService.getReservasDelRestaurante().subscribe({
      next: (reservas: Reserva[]) => {
        console.log('Respuesta del servidor:', reservas);
        console.log('Tipo de datos recibidos:', typeof reservas);
        console.log('Es array?', Array.isArray(reservas));
        console.log('Longitud del array:', reservas.length);
        
        if (reservas.length > 0) {
          console.log('Primera reserva completa:', reservas[0]);
          console.log('Propiedades de la primera reserva:', Object.keys(reservas[0]));
          console.log('nombreUsuario:', reservas[0].nombreUsuario);
          console.log('correoUsuario:', reservas[0].correoUsuario);
        }
        
        this.reservas = reservas;
        this.loading = false;
        console.log('Reservas asignadas al componente:', this.reservas);
        console.log('Loading estado:', this.loading);
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        setTimeout(() => {
          console.log('Reservas después del timeout:', this.reservas);
          console.log('Elemento reservas en DOM:', document.querySelector('.reservas-table tbody'));
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error: any) => {
        console.error('Error al cargar reservas del restaurante:', error);
        this.loading = false;
        // Fallback al método anterior si es necesario
        if (this.nombreRestaurante) {
          console.log('Intentando con método alternativo...');
          this.reservaService.getReservasByRestaurante(this.nombreRestaurante).subscribe({
            next: (reservas: Reserva[]) => {
              this.reservas = reservas;
              this.loading = false;
            },
            error: (fallbackError: any) => {
              console.error('Error también en método alternativo:', fallbackError);
              this.loading = false;
            }
          });
        }
      }
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Visita Completada':
        return 'estado-confirmada';
      case 'Por Ir':
        return 'estado-pendiente';
      case 'Falta Grave':
        return 'estado-cancelada';
      default:
        return '';
    }
  }

  formatearFecha(fecha: Date): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    return hora;
  }
}