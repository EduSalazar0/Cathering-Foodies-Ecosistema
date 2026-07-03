import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ControlValueAccessorDirective } from '../control-value-accessor.directive';
import { FieldErrorsComponent } from '../field-errors/field-errors.component';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-input-checkbox',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckboxModule,
    FieldErrorsComponent,
  ],
  templateUrl: './input-checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCheckboxComponent),
      multi: true,
    },
  ],
})
export class InputCheckboxComponent<T> extends ControlValueAccessorDirective<T> {
  @Input()
  formControlName = '';

  @Input()
  label = '';

  @Input()
  customErrorMessage: Record<string, string> = {};
}