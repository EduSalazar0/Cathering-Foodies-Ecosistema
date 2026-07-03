import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonComponent],
  templateUrl: './dialog.component.html',
})
export class DialogComponent {
  @Input() header: string = '';
  @Input() style: { [key: string]: any } = { width: '70%' };
  @Input() modal: boolean = true;
  @Input() closable: boolean = true;
  @Input() draggable: boolean = true;
  @Input() resizable: boolean = true;
  @Input() visible: boolean = false;
  @Input() isSaving: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onShowChange = new EventEmitter<void>();
  @Output() saveForm = new EventEmitter<void>();
  @Output() cancelForm = new EventEmitter<void>();

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  onShow() {
    this.onShowChange.emit();
  }

  save() {
    this.saveForm.emit();
  }

  cancel() {
    this.cancelForm.emit();
    this.visible = false;
  }
}
