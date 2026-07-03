import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface SidebarMenuItem {
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() menuItems: SidebarMenuItem[] = [];
  @Input() userInfo: { name: string; email?: string } = { name: 'Usuario' };
  @Output() itemClick = new EventEmitter<SidebarMenuItem>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  // Variables para el estado del menú
  openMenu: string | null = null;
  hoveringItem: string | null = null;

  constructor(private router: Router) {}

  // Métodos para manejar el menú
  setOpenMenu(menuName: string | null) {
    this.openMenu = this.openMenu === menuName ? null : menuName;
  }

  setHover(item: string | null) {
    this.hoveringItem = item;
  }

  isHovering(item: string): boolean {
    return this.hoveringItem === item;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Métodos originales
  onItemClick(item: SidebarMenuItem) {
    if (item.route) {
      this.router.navigate([item.route]);
    }
    if (item.action) {
      item.action();
    }
    this.itemClick.emit(item);
  }

  onToggle() {
    this.toggleSidebar.emit();
  }

  onLogout() {
    this.logout.emit();
  }
}
