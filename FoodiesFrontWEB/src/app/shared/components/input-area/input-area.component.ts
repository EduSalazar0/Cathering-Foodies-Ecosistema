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
import { TextareaModule } from 'primeng/textarea';

@Component({
	selector: 'app-input-area',
	standalone: true,
	templateUrl: './input-area.component.html',
	imports: [
		ReactiveFormsModule,
		FieldErrorsComponent,
		FloatLabel,
		TextareaModule,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => InputAreaComponent),
			multi: true,
		},
	],
})
export class InputAreaComponent<T> extends ControlValueAccessorDirective<T> {
	@Input()
	formControlName = '';

	@Input()
	label = '';

	@Input()
	rows = 5;

	@Input()
	cols = 30;

	@Input()
	customErrorMessage: Record<string, string> = {};

	@Input()
	maxLength: number | null = null;

	isInvalid(controlName: string) {
		const control = this.control?.get(controlName);
		return control?.invalid && (control.touched);
	}
}
