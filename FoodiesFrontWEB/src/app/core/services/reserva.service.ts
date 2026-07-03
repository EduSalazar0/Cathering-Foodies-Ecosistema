import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Reserva, 
  CrearReservaRequest, 
  ActualizarReservaRequest, 
  CambiarEstadoRequest,
  Entregable,
  CrearEntregableRequest 
} from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly apiUrl = `${environment.apiBaseUrl}/reservas`;
  private readonly entregablesUrl = `${environment.apiBaseUrl}/entregables`;

  constructor(private http: HttpClient) {}

  // ============ RESERVAS ============

  /**
   * Obtener todas las reservas del usuario autenticado
   */
  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/mis-reservas`);
  }

  /**
   * Obtener una reserva por ID
   */
  getReservaById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva reserva
   */
  crearReserva(request: CrearReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, request);
  }

  /**
   * Actualizar una reserva existente
   */
  actualizarReserva(id: number, request: ActualizarReservaRequest): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Eliminar una reserva
   */
  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cambiar el estado de una reserva
   */
  cambiarEstadoReserva(id: number, request: CambiarEstadoRequest): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/estado`, request);
  }

  /**
   * Obtener reservas por estado
   */
  getReservasByEstado(estado: 'Por Ir' | 'Visita Completada' | 'Falta Grave'): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/por-estado/${estado}`);
  }

  /**
   * Obtener reservas por rango de fechas
   */
  getReservasByFechaRango(fechaInicio: Date, fechaFin: Date): Observable<Reserva[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio.toISOString())
      .set('fechaFin', fechaFin.toISOString());
    
    return this.http.get<Reserva[]>(`${this.apiUrl}/por-fecha`, { params });
  }

  /**
   * Obtener reservas por nombre de local (para restaurantes)
   */
  getReservasByRestaurante(nombreLocal: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/por-restaurante/${encodeURIComponent(nombreLocal)}`);
  }

  /**
   * Obtener reservas del restaurante actual (basado en el rol del usuario)
   */
  getReservasDelRestaurante(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/por-restaurante`);
  }

  /**
   * Confirmar una reserva (para restaurantes)
   */
  confirmarReserva(id: number): Observable<Reserva> {
    return this.cambiarEstadoReserva(id, { estado: 'Visita Completada' });
  }

  /**
   * Cancelar una reserva (para restaurantes)
   */
  cancelarReserva(id: number): Observable<Reserva> {
    return this.cambiarEstadoReserva(id, { estado: 'Falta Grave' });
  }

  // ============ ENTREGABLES ============

  /**
   * Obtener entregables por reserva
   */
  getEntregablesByReserva(reservaId: number): Observable<Entregable[]> {
    return this.http.get<Entregable[]>(`${this.entregablesUrl}/por-reserva/${reservaId}`);
  }

  /**
   * Obtener un entregable por ID
   */
  getEntregableById(id: number): Observable<Entregable> {
    return this.http.get<Entregable>(`${this.entregablesUrl}/${id}`);
  }

  /**
   * Crear un nuevo entregable
   */
  crearEntregable(request: CrearEntregableRequest): Observable<Entregable> {
    return this.http.post<Entregable>(this.entregablesUrl, request);
  }

  /**
   * Actualizar un entregable existente
   */
  actualizarEntregable(id: number, request: CrearEntregableRequest): Observable<Entregable> {
    return this.http.put<Entregable>(`${this.entregablesUrl}/${id}`, request);
  }

  /**
   * Eliminar un entregable
   */
  eliminarEntregable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.entregablesUrl}/${id}`);
  }

  /**
   * Verificar si se puede cancelar una reserva
   */
  puedeCancelarReserva(id: number): Observable<{ puedeCancelar: boolean }> {
    return this.http.get<{ puedeCancelar: boolean }>(`${this.apiUrl}/${id}/puede-cancelar`);
  }

  /**
   * Actualizar estados automáticamente (solo admin)
   */
  actualizarEstados(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/actualizar-estados`, {});
  }

  // ============ MÉTODOS HELPER ============

  /**
   * Completar una visita (cambiar estado y crear entregables)
   */
  completarVisita(reservaId: number, entregableData: CrearEntregableRequest): Observable<{reserva: Reserva, entregable: Entregable}> {
    // Primero cambiar el estado de la reserva
    const cambiarEstado = this.cambiarEstadoReserva(reservaId, { estado: 'Visita Completada' });
    
    // Luego crear el entregable
    const crearEntregable = this.crearEntregable(entregableData);
    
    // Combinar ambas operaciones
    return new Observable(observer => {
      cambiarEstado.subscribe({
        next: (reserva) => {
          crearEntregable.subscribe({
            next: (entregable) => {
              observer.next({ reserva, entregable });
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }
}