import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (isKeycloakRequest(req.url) || isPublicEndpoint(req.url)) {
    return next(req);
  }

  const token = getValidAccessToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};

function isKeycloakRequest(url: string): boolean {
  return url.startsWith(environment.keycloak.authority);
}

function isPublicEndpoint(url: string): boolean {
  return ['/auth/login', '/users'].some(endpoint => url.includes(endpoint));
}

function getValidAccessToken(): string | null {
  const token = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('access_token_expires_at');

  if (!token || !expiresAt || Date.now() >= parseInt(expiresAt, 10)) {
    return null;
  }

  return token;
}
