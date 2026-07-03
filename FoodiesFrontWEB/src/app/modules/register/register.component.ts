import { Component, OnInit, Injector, inject } from '@angular/core';
import { Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { FormularioComun } from '../../shared/components/form/formulario-comun';
import { FORM_SHARED_IMPORTS } from '../../shared/components/form/form_imports';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ...FORM_SHARED_IMPORTS, // imports genéricos de clases
    ToastModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent extends FormularioComun implements OnInit {
  private authService = inject(AuthService);
  protected override router = inject(Router);
  protected override messageService = inject(MessageService);
  isLoading = false;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.registraControl();
  }

  override registraControl(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    // Agregar el validador después de crear el formulario
    this.form.get('confirmPassword')?.setValidators([
      Validators.required,
      this.passwordMatchValidator.bind(this)
    ]);
    
    // Actualizar validación cuando cambie la contraseña principal
    this.form.get('password')?.valueChanges.subscribe(() => {
      this.form.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.form) return null;
    
    const password = this.form.get('password')?.value;
    const confirmPassword = control.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  override async onSubmit(): Promise<void> {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      
      const userData: RegisterRequest = {
        nombre: this.form.get('nombre')?.value,
        apellido: this.form.get('apellido')?.value,
        correo: this.form.get('correo')?.value,
        password: this.form.get('password')?.value
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: '✅ ¡Registro exitoso!',
            detail: '¡Bienvenido a FoodiesBNB! Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión con tus credenciales.',
            life: 4000
          });
          
          // Esperar más tiempo para que el usuario vea el mensaje
          setTimeout(() => {
            // Navegar con parámetros para mostrar mensaje en login
            this.router.navigate(['/login'], { 
              queryParams: { 
                registered: 'true',
                email: userData.correo 
              } 
            });
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Mostrar error específico si está disponible
          let errorMessage = 'Ocurrió un error al crear la cuenta';
          
          if (error.status === 400 && error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.errors) {
              errorMessage = Object.values(error.error.errors).flat().join(', ');
            }
          } else if (error.status === 409) {
            errorMessage = 'Ya existe una cuenta con este correo electrónico';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor. Intente más tarde.';
          }
          
          this.messageService.add({
            severity: 'error',
            summary: '❌ Error en el registro',
            detail: errorMessage,
            life: 6000
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: '⚠️ Formulario incompleto',
        detail: 'Por favor, complete todos los campos requeridos correctamente para continuar.',
        life: 4000
      });
      this.markFormGroupTouched();
    }
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Debe ser un email válido';
      if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nombre': 'El nombre',
      'apellido': 'El apellido',
      'correo': 'El correo electrónico',
      'password': 'La contraseña',
      'confirmPassword': 'La confirmación de contraseña'
    };
    return labels[fieldName] || fieldName;
  }
}