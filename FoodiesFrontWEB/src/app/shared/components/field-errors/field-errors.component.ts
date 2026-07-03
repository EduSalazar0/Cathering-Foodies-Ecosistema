import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-field-errors',
  standalone: true,
  imports: [MessageModule, CommonModule],
  templateUrl: './field-errors.component.html',
})
export class FieldErrorsComponent {
  @Input()
  errors: Record<string, ValidationErrors> | null | undefined = {};

  @Input()
  customErrorMessage: Record<string, string> = {};

  get entryErrors() {
    return Object.entries(this.errors ?? {});
  }

  getErrorMessage(errorKey: string, errorValue: any): string {
    if (this.customErrorMessage[errorKey]) {
      return this.customErrorMessage[errorKey];
    }

    switch (errorKey) {
      case 'required':
        return 'Campo requerido';
      case 'minlength':
        return `Longitud mínima no alcanzada (${errorValue.requiredLength} caracteres)`;
      case 'passwordMismatch':
        return 'Las contraseñas no coinciden';
      default:
        return this.customErrorMessage[errorKey] || 'Error desconocido';
    }
  }

}
