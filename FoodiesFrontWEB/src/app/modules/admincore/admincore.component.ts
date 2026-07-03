import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admincore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admincore.component.html',
  styleUrls: ['./admincore.component.css']
})
export class AdmincoreComponent implements OnInit {
  
  adminSections = [
    {
      id: 'analytics',
      title: 'Dashboard Analytics',
      description: 'Visualiza análisis, tendencias y predicciones del core',
      icon: 'pi-chart-line',
      route: '/admincore/analytics',
      color: '#4CAF50'
    },
    {
      id: 'usuarios',
      title: 'Gestión de Usuarios',
      description: 'Administra usuarios, roles y permisos',
      icon: 'pi-users',
      route: '/admincore/usuarios',
      color: '#2196F3'
    },
    {
      id: 'roles',
      title: 'Gestión de Roles',
      description: 'Crea y asigna roles a usuarios',
      icon: 'pi-shield',
      route: '/admincore/roles',
      color: '#F44336'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
