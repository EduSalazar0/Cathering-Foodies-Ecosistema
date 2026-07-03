import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  isLoading = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (!params['error']) return;

      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo iniciar sesion',
        detail: 'Keycloak rechazo la solicitud o la sesion expiro. Intenta nuevamente.',
        life: 6000
      });
    });
  }

  loginWithKeycloak(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.authService.login(returnUrl ?? undefined).subscribe({
      error: (error) => {
        this.isLoading = false;
        console.error('Error redirigiendo a Keycloak:', error);
      }
    });
  }
}
