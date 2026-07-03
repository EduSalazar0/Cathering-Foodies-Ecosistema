import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  forwardRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ControlValueAccessorDirective } from '../control-value-accessor.directive';
import { FieldErrorsComponent } from '../field-errors/field-errors.component';
import { FloatLabel } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FieldErrorsComponent,
    FloatLabel,
    SelectModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<T> extends ControlValueAccessorDirective<T> {
  @Input()
  formControlName = '';

  @Input()
  label = '';

  @Input()
  optionLabel = 'label';

  @Input()
  options: any[] = [];

  @Input()
  optionValue = 'value';

  @Input()
  customErrorMessage: Record<string, string> = {};

  @Output()
  change = new EventEmitter<any>()

  onChange(event: any): void {
    this.change.emit(event)
  }

  isInvalid(controlName: string) {
    const control = this.control?.get(controlName);
    return control?.invalid && (control.touched);
  }
}
