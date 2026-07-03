import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FieldErrorsComponent } from '../field-errors/field-errors.component';

@Component({
	selector: 'app-autoComplete',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, FormsModule, AutoCompleteModule, FloatLabelModule, FieldErrorsComponent],
	templateUrl: './auto-complete.component.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AutoCompleteComponent),
			multi: true
		}
	]
})
export class AutoCompleteComponent implements ControlValueAccessor {

	@Input()
	public parentForm!: FormGroup;

	@Input()
	public formControlName!: string;

	@Input()
	public label!: string;

	@Input()
	public class!: string;

	@Input()
	public values!: any[];

	@Input()
	public titles!: string[];

	@Input()
	public field!: string;

	@Input()
	public optionLabel: string = 'label';

	@Input()
	public optionValue: string = 'value';

	@Input()
	public minlength: number = 1;

	@Input()
	public cantidadCampos: number = 3;

	@Output()
	complete = new EventEmitter<any>();

	@Output()
	select = new EventEmitter<any>();

	public value: any;
	public isDisabled: boolean = false;
	private onChange = (value: any) => {};
	private onTouched = () => {};

	get formField(): FormControl {
		return this.parentForm?.get(this.formControlName) as FormControl;
	}

	public onComplete(event: AutoCompleteCompleteEvent): void {
		this.complete.emit(event);
	}

	// ControlValueAccessor methods
	writeValue(value: any): void {
		this.value = value;
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}

	onSelectionChange(selectedItem: any): void {
		if (selectedItem) {
			// Si tenemos optionValue, extraer ese valor, sino usar el objeto completo
			const valueToSet = this.optionValue && selectedItem[this.optionValue] !== undefined 
				? selectedItem[this.optionValue] 
				: selectedItem;
			this.value = valueToSet;
			this.onChange(valueToSet);
		} else {
			this.value = null;
			this.onChange(null);
		}
		this.onTouched();
	}
}
