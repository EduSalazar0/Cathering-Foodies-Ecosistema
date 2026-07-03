import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  forwardRef,
  Input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ControlValueAccessorDirective } from '../control-value-accessor.directive';
import { FieldErrorsComponent } from '../field-errors/field-errors.component';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FieldErrorsComponent,
    FloatLabel,
    InputNumberModule,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumberComponent),
      multi: true,
    },
  ],
})
export class InputNumberComponent<T> extends ControlValueAccessorDirective<T> {
  @Input()
  formControlName = '';

  @Input()
  label = '';

  @Input()
  type: 'integer' | 'decimal' | 'currency' | 'percentage' = 'decimal';

  @Input()
  customErrorMessage: Record<string, string> = {};

  @Input()
  minFractionDigits = 2;

  @Input()
  maxFractionDigits = 2;

  isInvalid(controlName: string) {
    const control = this.control?.get(controlName);
    return control?.invalid && (control.touched);
  }
}
