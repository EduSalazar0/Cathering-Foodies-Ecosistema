import { Injectable } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  
  constructor(private authService: AuthService) {}

  /**
   * Verificar si el usuario tiene rol de restaurante
   */
  isRestaurante(): boolean {
    return this.authService.hasRole('restaurante');
  }

  /**
   * Obtener el nombre del restaurante específico del usuario
   * Busca en los roles un nombre que no sea un rol del sistema
   */
  getNombreRestaurante(): string {
    const roles = this.authService.getUserRoles();
    const rolesDelSistema = [
      'restaurante', 
      'usuario', 
      'foodie', 
      'admin', 
      'microinfluencer'
    ];
    
    const nombreRestaurante = roles.find(rol => 
      !rolesDelSistema.includes(rol.toLowerCase())
    );
    
    return nombreRestaurante || '';
  }

  /**
   * Verificar si el usuario puede acceder al dashboard de restaurante
   */
  canAccessRestauranteDashboard(): boolean {
    return this.isRestaurante() && this.getNombreRestaurante() !== '';
  }

  /**
   * Verificar si el usuario debe ver la página de información de restaurante
   */
  shouldShowRestauranteInfo(): boolean {
    return !this.isRestaurante();
  }

  /**
   * Obtener todos los roles del usuario
   */
  getUserRoles(): string[] {
    return this.authService.getUserRoles();
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }
}