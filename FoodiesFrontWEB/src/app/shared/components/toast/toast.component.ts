import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastModule],
  template: `<p-toast
    appendTo="body"
    position="bottom-right"
  ></p-toast> `,
})
export class ToastComponent {}
