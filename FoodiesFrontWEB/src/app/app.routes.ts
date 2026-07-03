import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { foodieGuard } from './core/guards/foodie.guard';

export const routes: Routes = [
  // Ruta raíz - redirigir según el estado de autenticación
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  // Rutas públicas (sin layout) - solo para usuarios NO autenticados
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent)
  },
  // Rutas principales que usan MainLayout - solo para usuarios autenticados
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'restaurantes',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/restaurante-router/restaurante-router.component')
          .then(m => m.RestauranteRouterComponent)
      },
      {
        path: 'info',
        loadComponent: () => import('./modules/inforolrestaurante/info-rol-restaurante.component')
          .then(m => m.InfoRolRestauranteComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard-restaurante/dashboard-restaurante.component')
          .then(m => m.DashboardRestauranteComponent)
      }
    ]
  },
  {
    path: 'configuracion',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'foodies',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/formularioFoodie/formulario-foodie.component').then(m => m.FormularioFoodieComponent)
      }
    ]
  },
  {
    path: 'formulario-foodie',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/formularioFoodie/formulario-foodie.component').then(m => m.FormularioFoodieComponent)
      }
    ]
  },
  {
    path: 'dashboard-foodie',
    canActivate: [authGuard, foodieGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardFoodie/dashboard-foodie.component').then(m => m.DashboardFoodieComponent)
      }
    ]
  },
  {
    path: 'beneficios',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'cuenta',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'admincore',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/admincore/admincore.component').then(m => m.AdmincoreComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./modules/admincore/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./modules/admincore/usuarios-manager/usuarios-manager.component').then(m => m.UsuariosManagerComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./modules/admincore/roles-manager/roles-manager.component').then(m => m.RolesManagerComponent)
      }
    ]
  },
  // Ruta comodín - redirigir a login
  {
    path: '**',
    redirectTo: '/login'
  }
];
