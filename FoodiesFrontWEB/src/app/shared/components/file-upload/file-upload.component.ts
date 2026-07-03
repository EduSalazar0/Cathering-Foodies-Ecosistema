import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { FieldErrorsComponent } from '../field-errors/field-errors.component';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadModule, FieldErrorsComponent],
  templateUrl: './file-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() public parentForm!: FormGroup;
  @Input() public formControlName!: string;
  @Input() public format: string = '';
  @Input() public label: string = 'Seleccionar archivo';
  @Input() public multiple: boolean = false;
  @Input() public class: string = '';

  @Output() upload = new EventEmitter<any>();

  public value: File[] | null = null;
  public changed: (value: File[] | null) => void = () => {};
  public touched: () => void = () => {};
  public isDisabled: boolean = false;
  public nombreArchivos: string = '';

  get formField(): FormControl {
    return this.parentForm.get(this.formControlName) as FormControl;
  }

  public uploadSelected(event: any, form: any): void {
    const files: File[] = event.files;
    this.changed(files);
    this.upload.emit(event);
    form.clear();
    if (files.length === 1) {
      this.nombreArchivos = files[0].name;
    } else if (files.length > 1) {
      this.nombreArchivos = `${files.length} archivos seleccionados`;
    } else {
      this.nombreArchivos = '';
    }
  }

  public writeValue(value: File[] | null): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: File[] | null) => void): void {
    this.changed = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
