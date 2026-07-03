import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UsuarioDto,
  RolDto,
  ReservaDto,
  EntregableDto,
  FormularioFoodieDto,
  RestauranteAnalyticsDto,
  TendenciaVisitasDto,
  ResumenGeneralDto,
  ComparativaRestaurantesDto,
  ReservasPorFechaDto,
  CreateRolRequest,
  AsignarRolRequest
} from '../models/admincore.model';

@Injectable({
  providedIn: 'root'
})
export class AdminCoreService {
  // Siempre pasar por el Gateway (localhost en dev, render en prod)
  private readonly apiUrl = `${environment.apiBaseUrl}/admincore`;
  
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token'); // Usar access_token como en AuthService
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Usuarios
  getAllUsers(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(`${this.apiUrl}/Users`, {
      headers: this.getHeaders()
    });
  }

  getUserById(id: number): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.apiUrl}/Users/${id}`, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Users/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Reservas
  getAllReservas(): Observable<ReservaDto[]> {
    return this.http.get<ReservaDto[]>(`${this.apiUrl}/Reservas`, {
      headers: this.getHeaders()
    });
  }

  getReservaById(id: number): Observable<ReservaDto> {
    return this.http.get<ReservaDto>(`${this.apiUrl}/Reservas/${id}`, {
      headers: this.getHeaders()
    });
  }

  deleteReserva(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Reservas/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Formularios
  getAllFormularios(): Observable<FormularioFoodieDto[]> {
    return this.http.get<FormularioFoodieDto[]>(`${this.apiUrl}/Formularios`, {
      headers: this.getHeaders()
    });
  }

  getFormularioById(id: number): Observable<FormularioFoodieDto> {
    return this.http.get<FormularioFoodieDto>(`${this.apiUrl}/Formularios/${id}`, {
      headers: this.getHeaders()
    });
  }

  deleteFormulario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Formularios/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Roles
  getAllRoles(): Observable<RolDto[]> {
    return this.http.get<RolDto[]>(`${this.apiUrl}/Roles`, {
      headers: this.getHeaders()
    });
  }

  createRol(request: CreateRolRequest): Observable<RolDto> {
    return this.http.post<RolDto>(`${this.apiUrl}/Roles`, request, {
      headers: this.getHeaders()
    });
  }

  deleteRol(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Roles/${id}`, {
      headers: this.getHeaders()
    });
  }

  asignarRol(request: AsignarRolRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Roles/asignar`, request, {
      headers: this.getHeaders()
    });
  }

  removerRol(request: AsignarRolRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Roles/remover`, request, {
      headers: this.getHeaders()
    });
  }

  // Analytics
  getResumenGeneral(): Observable<ResumenGeneralDto> {
    console.log('Llamando a:', `${this.apiUrl}/Analytics/resumen-general`);
    console.log('Token:', localStorage.getItem('access_token') ? 'Presente' : 'Ausente');
    return this.http.get<ResumenGeneralDto>(`${this.apiUrl}/Analytics/resumen-general`, {
      headers: this.getHeaders()
    });
  }

  getRestaurantesAnalytics(): Observable<RestauranteAnalyticsDto[]> {
    console.log('Llamando a:', `${this.apiUrl}/Analytics/restaurantes`);
    return this.http.get<RestauranteAnalyticsDto[]>(`${this.apiUrl}/Analytics/restaurantes`, {
      headers: this.getHeaders()
    });
  }

  getRestauranteAnalyticsByName(nombre: string): Observable<RestauranteAnalyticsDto> {
    return this.http.get<RestauranteAnalyticsDto>(`${this.apiUrl}/Analytics/restaurantes/${encodeURIComponent(nombre)}`, {
      headers: this.getHeaders()
    });
  }

  getTendencias(): Observable<TendenciaVisitasDto[]> {
    console.log('Llamando a:', `${this.apiUrl}/Analytics/tendencias`);
    return this.http.get<TendenciaVisitasDto[]>(`${this.apiUrl}/Analytics/tendencias`, {
      headers: this.getHeaders()
    });
  }

  getTendenciaByRestaurante(nombre: string): Observable<TendenciaVisitasDto> {
    return this.http.get<TendenciaVisitasDto>(`${this.apiUrl}/Analytics/tendencias/${encodeURIComponent(nombre)}`, {
      headers: this.getHeaders()
    });
  }

  getComparativa(): Observable<ComparativaRestaurantesDto> {
    return this.http.get<ComparativaRestaurantesDto>(`${this.apiUrl}/Analytics/comparativa`, {
      headers: this.getHeaders()
    });
  }

  getReservasPorFecha(): Observable<ReservasPorFechaDto[]> {
    return this.http.get<ReservasPorFechaDto[]>(`${this.apiUrl}/Analytics/reservas-por-fecha`, {
      headers: this.getHeaders()
    });
  }
}
