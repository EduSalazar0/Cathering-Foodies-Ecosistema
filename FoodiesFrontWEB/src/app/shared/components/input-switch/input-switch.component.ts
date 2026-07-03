import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  forwardRef,
  Input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ControlValueAccessorDirective } from '../control-value-accessor.directive';
import { FieldErrorsComponent } from '../field-errors/field-errors.component';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-input-switch',
  templateUrl: './input-switch.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FieldErrorsComponent,
    ToggleSwitchModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSwitchComponent),
      multi: true,
    },
  ],
})
export class InputSwitchComponent<T> extends ControlValueAccessorDirective<T> {
  @Input()
  formControlName = '';

  @Input()
  label = '';

  @Input()
  customErrorMessage: Record<string, string> = {};

  isInvalid() {
    const control = this.control?.get(this.formControlName);
    return control?.invalid && (control.touched);
  }
}
