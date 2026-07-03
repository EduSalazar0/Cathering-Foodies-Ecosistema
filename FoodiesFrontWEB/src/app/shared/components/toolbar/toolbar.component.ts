import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule
  ],
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent {
}