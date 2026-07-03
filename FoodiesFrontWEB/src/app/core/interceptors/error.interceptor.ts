import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (isKeycloakRequest(req.url)) {
        return throwError(() => error);
      }

      let summary;
      let detail = 'Ha ocurrido un error inesperado.';
      let severity: 'error' | 'warn' | 'info' = 'error';

      if (error instanceof HttpErrorResponse) {
        messageService.clear();
        switch (error.status) {
          case 0:
            summary = 'Sin conexion';
            detail = 'No se puede conectar con el servidor.';
            break;
          case 400:
            summary = 'Solicitud invalida';
            detail = formatearDetalle(error) || 'Revisa los datos enviados.';
            severity = 'warn';
            break;
          case 401:
            if (!getValidAccessToken()) {
              clearLocalSession();
              window.location.href = '/login';
            }
            break;
          case 403:
            summary = 'Acceso denegado';
            detail = 'No tienes permisos para esta accion.';
            break;
          case 404:
            summary = 'No encontrado';
            detail = 'El recurso solicitado no existe.';
            severity = 'warn';
            break;
          case 409:
            summary = 'Conflicto';
            detail =
              formatearDetalle(error) ||
              'Conflicto con el estado actual del recurso.';
            severity = 'warn';
            break;
          case 422:
            summary = 'Datos invalidos';
            detail =
              formatearDetalle(error) || 'Algunos campos no son validos.';
            severity = 'warn';
            break;
          case 500:
            summary = 'Error del servidor';
            detail =
              formatearDetalle(error) ||
              'Ocurrio un problema interno. Intenta mas tarde.';
            break;
          default:
            summary = `Error ${error.status}`;
            detail = formatearDetalle(error) || error.message || detail;
            break;
        }
      }

      if (summary) {
        messageService.add({ severity, summary, detail, life: 6000 });
      }
      return throwError(() => error);
    })
  );
};

function isKeycloakRequest(url: string): boolean {
  return url.startsWith(environment.keycloak.authority);
}

function getValidAccessToken(): string | null {
  const token = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('access_token_expires_at');

  if (!token || !expiresAt || Date.now() >= parseInt(expiresAt, 10)) {
    return null;
  }

  return token;
}

function clearLocalSession(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('access_token_expires_at');
  localStorage.removeItem('current_user');
  sessionStorage.removeItem('foodies_pkce_verifier');
  sessionStorage.removeItem('foodies_oauth_state');
}

function formatearDetalle(error: HttpErrorResponse): string | null {
  if (!error.error) return null;
  if (typeof error.error === 'string') return error.error;
  if (error.error.message) return error.error.message;
  if (error.error.errors) {
    if (Array.isArray(error.error.errors)) {
      return error.error.errors.join('\n');
    }
    return Object.values(error.error.errors).flat().join('\n');
  }
  return null;
}
