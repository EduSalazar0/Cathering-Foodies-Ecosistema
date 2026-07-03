import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RoleService } from '../dashboard-restaurante/role.service';

@Component({
  selector: 'app-restaurante-router',
  template: `
    <div class="loading-container" *ngIf="loading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Verificando permisos...</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      color: #6c757d;
    }
    
    .loading-spinner {
      font-size: 2rem;
      color: #fe395e;
      margin-bottom: 1rem;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class RestauranteRouterComponent implements OnInit {
  loading = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.redirectBasedOnRole();
  }

  private redirectBasedOnRole(): void {
    console.log('RestauranteRouter: Verificando roles del usuario');
    
    const userRoles = this.authService.getUserRoles();
    console.log('Roles del usuario:', userRoles);
    
    // Verificar si el usuario tiene rol de restaurante
    const isRestaurante = this.roleService.isRestaurante();
    console.log('¿Es restaurante?:', isRestaurante);
    
    if (isRestaurante) {
      // Verificar si tiene un nombre de restaurante específico
      const nombreRestaurante = this.roleService.getNombreRestaurante();
      console.log('Nombre del restaurante:', nombreRestaurante);
      
      if (nombreRestaurante) {
        // Si tiene rol de restaurante Y nombre específico, mostrar dashboard
        console.log('Redirigiendo a dashboard de restaurante:', nombreRestaurante);
        this.router.navigate(['/restaurantes/dashboard']).then(() => {
          this.loading = false;
        });
      } else {
        // Si tiene rol de restaurante pero no nombre específico, mostrar info
        console.log('Usuario es restaurante pero sin local específico, mostrando info');
        this.router.navigate(['/restaurantes/info']).then(() => {
          this.loading = false;
        });
      }
    } else {
      // Si no tiene rol de restaurante, mostrar página de información
      console.log('Usuario no es restaurante, mostrando info');
      this.router.navigate(['/restaurantes/info']).then(() => {
        this.loading = false;
      });
    }
  }
}