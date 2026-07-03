import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditorModule
  ],
  templateUrl: './editor.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true
    }
  ]
})
export class EditorComponent implements ControlValueAccessor {

  @Input() label: string = '';
  @Input() style: { [key: string]: string } = { 'height': '220px' };

  value: string = '';
  isDisabled: boolean = false;

  onChange: (_: any) => void = () => { };
  onTouch: () => void = () => { };

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onEditorTextChange(event: any) {
    const newValue = event.htmlValue;
    this.value = newValue;
    this.onChange(newValue);
  }
}