import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminCoreService } from '../../../core/services/admin-core.service';
import { UsuarioDto, RolDto } from '../../../core/models/admincore.model';

@Component({
  selector: 'app-usuarios-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './usuarios-manager.component.html',
  styleUrls: ['./usuarios-manager.component.css']
})
export class UsuariosManagerComponent implements OnInit {
  private adminService = inject(AdminCoreService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: UsuarioDto[] = [];
  rolesDisponibles: RolDto[] = [];
  selectedUsuario: UsuarioDto | null = null;
  selectedRol: string | null = null;
  displayRoleDialog = false;
  displayDetailsDialog = false;
  loading = false;
  searchTerm = '';

  ngOnInit() {
    this.loadUsuarios();
    this.loadRoles();
  }

  loadUsuarios() {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar usuarios'
        });
      }
    });
  }

  loadRoles() {
    this.adminService.getAllRoles().subscribe({
      next: (roles) => {
        this.rolesDisponibles = roles.filter(r => r.activo);
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  get filteredUsuarios(): UsuarioDto[] {
    if (!this.searchTerm) {
      return this.usuarios;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u => 
      u.nombre.toLowerCase().includes(term) ||
      u.apellido.toLowerCase().includes(term) ||
      u.correo.toLowerCase().includes(term) ||
      (u.roles && u.roles.some(r => r.nombre.toLowerCase().includes(term)))
    );
  }

  get usuariosActivos(): number {
    return this.usuarios.filter(u => u.activo).length;
  }

  get availableRoles(): RolDto[] {
    if (!this.selectedUsuario || !this.selectedUsuario.roles) {
      return this.rolesDisponibles;
    }
    
    const userRoleNames = this.selectedUsuario.roles.map(r => r.nombre);
    return this.rolesDisponibles.filter(r => !userRoleNames.includes(r.nombre));
  }

  getInitials(nombre: string, apellido: string): string {
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return (n + a).toUpperCase();
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  showRoleDialog(usuario: UsuarioDto) {
    this.selectedUsuario = usuario;
    this.selectedRol = null;
    this.displayRoleDialog = true;
  }

  viewUserDetails(usuario: UsuarioDto) {
    this.selectedUsuario = usuario;
    this.displayDetailsDialog = true;
  }

  assignRole() {
    if (!this.selectedUsuario || !this.selectedRol) return;

    this.adminService.asignarRol({ 
      usuarioId: this.selectedUsuario.id, 
      nombreRol: this.selectedRol 
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Rol "${this.selectedRol}" asignado correctamente`
        });
        this.loadUsuarios();
        this.selectedRol = null;
        setTimeout(() => this.cdr.detectChanges(), 100);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al asignar rol'
        });
      }
    });
  }

  removeRole(usuario: UsuarioDto, rolNombre: string) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de remover el rol "${rolNombre}" de ${usuario.nombre}?`,
      header: 'Confirmar Remoción',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.removerRol({ 
          usuarioId: usuario.id, 
          nombreRol: rolNombre 
        }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Rol removido correctamente'
            });
            this.loadUsuarios();
            setTimeout(() => this.cdr.detectChanges(), 100);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al remover rol'
            });
          }
        });
      }
    });
  }

  confirmDelete(usuario: UsuarioDto) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar al usuario "${usuario.nombre} ${usuario.apellido}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteUsuario(usuario);
      }
    });
  }

  deleteUsuario(usuario: UsuarioDto) {
    this.adminService.deleteUser(usuario.id).subscribe({
      next: (response) => {
        console.log('Usuario eliminado:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario eliminado correctamente'
        });
        this.loadUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        const errorMessage = error.error?.message || error.message || 'Error al eliminar usuario. Puede que tenga datos relacionados.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }
}
