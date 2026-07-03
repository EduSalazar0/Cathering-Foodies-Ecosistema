import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminCoreService } from '../../../core/services/admin-core.service';
import { RolDto } from '../../../core/models/admincore.model';

@Component({
  selector: 'app-roles-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './roles-manager.component.html',
  styleUrls: ['./roles-manager.component.css']
})
export class RolesManagerComponent implements OnInit {
  private adminService = inject(AdminCoreService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  roles: RolDto[] = [];
  selectedRol: RolDto | null = null;
  displayCreateDialog = false;
  displayDetailsDialog = false;
  loading = false;
  searchTerm = '';
  
  nuevoRol = {
    nombre: '',
    descripcion: ''
  };

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    this.adminService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar roles'
        });
      }
    });
  }

  get filteredRoles(): RolDto[] {
    if (!this.searchTerm) {
      return this.roles;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.roles.filter(r => 
      r.nombre.toLowerCase().includes(term) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(term))
    );
  }

  get rolesActivos(): number {
    return this.roles.filter(r => r.activo).length;
  }

  getRolBadgeClass(nombre: string): string {
    const lowerName = nombre.toLowerCase();
    if (lowerName === 'admin') return 'admin';
    if (lowerName === 'foodie') return 'foodie';
    if (lowerName === 'restaurante') return 'restaurante';
    return 'default';
  }

  showCreateDialog() {
    this.nuevoRol = {
      nombre: '',
      descripcion: ''
    };
    this.displayCreateDialog = true;
  }

  viewRolDetails(rol: RolDto) {
    this.selectedRol = rol;
    this.displayDetailsDialog = true;
  }

  createRol() {
    if (!this.nuevoRol.nombre.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre del rol es requerido'
      });
      return;
    }

    const rolData = {
      nombre: this.nuevoRol.nombre.trim(), // Mantener mayúsculas y minúsculas originales
      descripcion: this.nuevoRol.descripcion.trim()
    };

    this.adminService.createRol(rolData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Rol "${rolData.nombre}" creado correctamente`
        });
        this.displayCreateDialog = false;
        this.loadRoles();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensaje || 'Error al crear rol'
        });
      }
    });
  }

  toggleRolStatus(rol: RolDto) {
    const action = rol.activo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Estás seguro de ${action} el rol "${rol.nombre}"?`,
      header: `Confirmar ${action}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        rol.activo = !rol.activo;
        this.messageService.add({
          severity: 'info',
          summary: 'Información',
          detail: `Rol ${action}do correctamente`
        });
      }
    });
  }

  confirmDeleteRol(rol: RolDto) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteRol(rol);
      }
    });
  }

  deleteRol(rol: RolDto) {
    this.adminService.deleteRol(rol.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Rol "${rol.nombre}" eliminado correctamente`
        });
        this.loadRoles();
      },
      error: (error) => {
        console.error('Error al eliminar rol:', error);
        const errorMessage = error.error?.message || error.message || 'Error al eliminar rol. Puede que tenga usuarios asignados.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }
}
