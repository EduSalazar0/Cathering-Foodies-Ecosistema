import { Component, Input, Output, EventEmitter, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = 'FoodiesBNB';
  @Input() showMenuButton: boolean = true;
  @Output() menuClick = new EventEmitter<void>();

  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private subscription: Subscription = new Subscription();
  currentUser: any = null;

  ngOnInit() {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.cdr.detectChanges(); // Force change detection
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getUserDisplayName(): string {
    if (this.currentUser?.nombre) {
      const apellido = this.currentUser.apellido || '';
      return `${this.currentUser.nombre} ${apellido}`.trim();
    }
    return 'Usuario Foodie';
  }

  onMenuClick() {
    this.menuClick.emit();
  }
}
