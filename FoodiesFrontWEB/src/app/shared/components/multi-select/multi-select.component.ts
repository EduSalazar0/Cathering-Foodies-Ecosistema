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
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FieldErrorsComponent,
    FloatLabel,
    MultiSelectModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent<T> extends ControlValueAccessorDirective<T> {
  @Input() formControlName = '';
  @Input() label = '';
  @Input() optionLabel = 'label';
  @Input() options: any[] = [];
  @Input() optionValue = 'value';
  @Input() placeholder = 'Seleccionar...';
  @Input() customErrorMessage: Record<string, string> = {};
  @Input() scrollHeight = '300px';
  @Input() showToggleAll = false;
  @Input() filter = false;

  @Output()
  selectionChange = new EventEmitter<any>();

  onChange(event: any) {
    this.selectionChange.emit(event);
  }

  isInvalid(controlName: string) {
    const control = this.control?.get(controlName);
    return control?.invalid && (control.touched);
  }
}