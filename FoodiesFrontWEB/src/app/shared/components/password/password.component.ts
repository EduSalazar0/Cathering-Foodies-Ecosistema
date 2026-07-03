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
import { PasswordModule } from 'primeng/password';

type InputType = 'text';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  imports: [
    ReactiveFormsModule,
    FieldErrorsComponent,
    FloatLabel,
    PasswordModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordComponent),
      multi: true,
    },
  ],
})
export class PasswordComponent<T> extends ControlValueAccessorDirective<T> {
  @Input()
  formControlName = '';

  @Input()
  label = '';

  @Input()
  customErrorMessage: Record<string, string> = {};
}
