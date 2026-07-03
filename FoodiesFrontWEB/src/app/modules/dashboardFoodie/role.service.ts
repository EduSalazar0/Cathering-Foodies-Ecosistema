import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

export interface UserRole {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface UserWithRoles {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  roles: UserRole[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  
  private apiUrl = `${environment.apiBaseUrl}/api/users`;
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtiene el usuario actual con sus roles usando endpoints RESTful estándar
   */
  getCurrentUserWithRoles(): Observable<UserWithRoles> {
    // Obtener el ID del usuario del AuthService y luego usar el endpoint RESTful estándar
    return this.authService.currentUser$.pipe(
      take(1), // Tomar solo el primer valor para evitar múltiples suscripciones
      map((currentUser: any) => {
        if (!currentUser || !currentUser.id) {
          throw new Error('Usuario no autenticado');
        }
        return currentUser.id;
      }),
      switchMap((userId: number) => {
        return this.getUserWithRoles(userId);
      })
    );
  }

  getUserWithRoles(userId: number): Observable<UserWithRoles> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserWithRoles>(`${this.apiUrl}/${userId}`, { headers });
  }

  hasRole(user: UserWithRoles, roleName: string): boolean {
    return user.roles.some(role => role.nombre.toLowerCase() === roleName.toLowerCase());
  }

  hasFoodieRole(user: UserWithRoles): boolean {
    return this.hasRole(user, 'foodie');
  }

  hasUserRole(user: UserWithRoles): boolean {
    return this.hasRole(user, 'usuario');
  }

}