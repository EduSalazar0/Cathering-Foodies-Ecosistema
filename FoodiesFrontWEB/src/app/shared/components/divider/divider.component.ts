import { Component, Input } from '@angular/core';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-divider',
  standalone: true,
  imports: [DividerModule],
  template: `
    <p-divider 
      [align]="align" 
      [layout]="layout"
      [type]="type">
      <ng-content></ng-content>
    </p-divider>
  `
})
export class DividerComponent {
  @Input() align: 'left' | 'center' | 'right' = 'center';
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() type: 'solid' | 'dashed' | 'dotted' = 'solid';
}