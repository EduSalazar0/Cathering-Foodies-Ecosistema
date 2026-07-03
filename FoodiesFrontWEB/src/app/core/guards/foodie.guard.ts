import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { RoleService } from '../../modules/dashboardFoodie/role.service';

export const foodieGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  return roleService.getCurrentUserWithRoles().pipe(
    map(userWithRoles => {
      const hasFoodieRole = roleService.hasFoodieRole(userWithRoles);
      
      if (!hasFoodieRole) {
        // Si no tiene el rol de foodie, redirigir al formulario
        router.navigate(['/formulario-foodie']);
        return false;
      }
      
      return true;
    }),
    catchError(error => {
      console.error('Error verificando rol de foodie:', error);
      router.navigate(['/dashboard']);
      return of(false);
    })
  );
};