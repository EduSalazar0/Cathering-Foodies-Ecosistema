import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form>
      <div class="flex flex-wrap md:flex-col gap-6">
        <ng-content></ng-content>
      </div>
    </form>
  `,
})
export class FormComponent {}
