import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FormularioFoodie, FormularioFoodieCreate, FormularioFoodieUpdate, FormularioFoodieSubmissionResponse } from '../models/formulario-foodie.model';

@Injectable({
  providedIn: 'root'
})
export class FormularioFoodieService {
  private readonly apiUrl = `${environment.apiBaseUrl}/formulario-foodie`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los formularios (admin)
   */
  getAll(): Observable<FormularioFoodie[]> {
    return this.http.get<FormularioFoodie[]>(this.apiUrl);
  }

  /**
   * Obtiene un formulario por ID
   */
  getById(id: number): Observable<FormularioFoodie> {
    return this.http.get<FormularioFoodie>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene el formulario del usuario autenticado
   */
  getMyFormulario(): Observable<FormularioFoodie> {
    return this.http.get<FormularioFoodie>(`${this.apiUrl}/mi-formulario`);
  }

  /**
   * Obtiene formularios por estado
   */
  getByEstado(estado: string): Observable<FormularioFoodie[]> {
    return this.http.get<FormularioFoodie[]>(`${this.apiUrl}/estado/${estado}`);
  }

  /**
   * Obtiene formulario por usuario ID
   */
  getByUsuarioId(usuarioId: number): Observable<FormularioFoodie> {
    return this.http.get<FormularioFoodie>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  /**
   * Crea un nuevo formulario para el usuario autenticado
   */
  create(formulario: FormularioFoodieCreate): Observable<FormularioFoodieSubmissionResponse> {
    return this.http.post<FormularioFoodieSubmissionResponse>(this.apiUrl, formulario);
  }

  /**
   * Actualiza un formulario por ID (admin)
   */
  update(id: number, formulario: FormularioFoodieUpdate): Observable<FormularioFoodie> {
    return this.http.put<FormularioFoodie>(`${this.apiUrl}/${id}`, formulario);
  }

  /**
   * Actualiza el formulario del usuario autenticado
   */
  updateMyFormulario(formulario: FormularioFoodieUpdate): Observable<FormularioFoodie> {
    return this.http.put<FormularioFoodie>(`${this.apiUrl}/mi-formulario`, formulario);
  }

  /**
   * Verifica si el usuario ya tiene un formulario
   */
  hasFormulario(): Observable<boolean> {
    return new Observable(observer => {
      this.getMyFormulario().subscribe({
        next: () => observer.next(true),
        error: (error) => {
          if (error.status === 404) {
            observer.next(false);
          } else {
            observer.error(error);
          }
        },
        complete: () => observer.complete()
      });
    });
  }
}