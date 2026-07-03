import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-card',
  imports: [CardModule],
  templateUrl: './card.component.html'
})
export class CardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
}
