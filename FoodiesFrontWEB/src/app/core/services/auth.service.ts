import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, LoginResponse, User, UserResponse } from '../models/auth.model';

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly apiUrl = environment.apiBaseUrl;
  private readonly keycloak = environment.keycloak;
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly expiresAtKey = 'access_token_expires_at';
  private readonly userKey = 'current_user';
  private readonly pkceVerifierKey = 'foodies_pkce_verifier';
  private readonly oauthStateKey = 'foodies_oauth_state';
  private readonly returnUrlKey = 'foodies_post_login_return_url';

  public isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());

  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.handleKeycloakCallback().subscribe({
      next: (handled) => {
        if (handled) {
          this.router.navigateByUrl(this.consumePostLoginRedirect(), { replaceUrl: true });
          return;
        }

        if (this.hasValidToken()) {
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(this.getCurrentUserFromStorage() ?? this.userFromToken());
        }
      },
      error: (error) => {
        console.error('Error procesando callback OIDC:', error);
        this.clearTokens();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  login(returnUrlOrCredentials?: string | LoginRequest): Observable<LoginResponse> {
    if (typeof returnUrlOrCredentials === 'string') {
      this.setPostLoginRedirect(returnUrlOrCredentials);
    }

    return from(this.redirectToKeycloak()).pipe(
      switchMap(() => of({ access_token: '', token_type: 'Bearer', expires_in: 0 }))
    );
  }

  register(_userData?: RegisterRequest): Observable<UserResponse> {
    return from(this.redirectToKeycloak('register')).pipe(
      switchMap(() => throwError(() => new Error('Redireccionando a registro federado')))
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    this.clearTokens();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const logoutUrl = new URL(`${this.keycloak.authority}/protocol/openid-connect/logout`);
    logoutUrl.searchParams.set('client_id', this.keycloak.clientId);
    logoutUrl.searchParams.set('post_logout_redirect_uri', window.location.origin + '/login');
    if (refreshToken) {
      logoutUrl.searchParams.set('refresh_token', refreshToken);
    }
    window.location.href = logoutUrl.toString();
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const token = localStorage.getItem(this.accessTokenKey);
    if (!token || this.isTokenExpired()) {
      this.clearTokens();
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
      return null;
    }
    return token;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value && this.hasValidToken();
  }

  getUserInfo(): Observable<User> {
    const user = this.userFromToken();
    if (!user) {
      return throwError(() => new Error('No hay token de acceso'));
    }

    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
    return of(user);
  }

  updateUser(userId: number | string, userData: any): Observable<User> {
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${userId}`, userData)
      .pipe(
        map(response => this.mapUserResponse(response)),
        tap(user => {
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  getUserRoles(): string[] {
    return this.getCurrentUser()?.roles || [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().some(current => current.toLowerCase() === role.toLowerCase());
  }

  isRestaurante(): boolean {
    return this.hasRole('restaurante');
  }

  setPostLoginRedirect(url?: string | null): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const safeUrl = this.normalizeLocalReturnUrl(url);
    if (safeUrl) {
      sessionStorage.setItem(this.returnUrlKey, safeUrl);
    }
  }

  consumePostLoginRedirect(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '/dashboard';
    }

    const storedUrl = sessionStorage.getItem(this.returnUrlKey);
    sessionStorage.removeItem(this.returnUrlKey);
    return this.normalizeLocalReturnUrl(storedUrl) ?? this.defaultRouteForCurrentUser();
  }

  private handleKeycloakCallback(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = sessionStorage.getItem(this.oauthStateKey);
    const verifier = sessionStorage.getItem(this.pkceVerifierKey);

    if (!code) {
      return of(false);
    }

    if (!state || !storedState || state !== storedState || !verifier) {
      return throwError(() => new Error('Estado OIDC invalido'));
    }

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.keycloak.clientId)
      .set('code', code)
      .set('redirect_uri', window.location.origin + '/login')
      .set('code_verifier', verifier);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<KeycloakTokenResponse>(
      `${this.keycloak.authority}/protocol/openid-connect/token`,
      body.toString(),
      { headers }
    ).pipe(
      tap(response => {
        this.handleLoginSuccess(response);
        sessionStorage.removeItem(this.oauthStateKey);
        sessionStorage.removeItem(this.pkceVerifierKey);
      }),
      map(() => true),
      catchError(error => throwError(() => error))
    );
  }

  private async redirectToKeycloak(mode: 'login' | 'register' = 'login'): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const verifier = this.randomBase64Url(64);
    const challenge = await this.pkceChallenge(verifier);
    const state = this.randomBase64Url(32);

    sessionStorage.setItem(this.pkceVerifierKey, verifier);
    sessionStorage.setItem(this.oauthStateKey, state);

    const authUrl = new URL(`${this.keycloak.authority}/protocol/openid-connect/auth`);
    authUrl.searchParams.set('client_id', this.keycloak.clientId);
    authUrl.searchParams.set('redirect_uri', window.location.origin + '/login');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    if (mode === 'register') {
      authUrl.searchParams.set('kc_action', 'register');
    }

    window.location.href = authUrl.toString();
  }

  private handleLoginSuccess(response: KeycloakTokenResponse): void {
    const expiresAt = Date.now() + (response.expires_in * 1000);

    localStorage.setItem(this.accessTokenKey, response.access_token);
    localStorage.setItem(this.expiresAtKey, expiresAt.toString());
    if (response.refresh_token) {
      localStorage.setItem(this.refreshTokenKey, response.refresh_token);
    }

    const user = this.userFromToken(response.access_token);
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }

    this.isAuthenticatedSubject.next(true);
  }

  private userFromToken(token = localStorage.getItem(this.accessTokenKey)): User | null {
    if (!token) {
      return null;
    }

    const payload = this.decodeJwt(token);
    if (!payload) {
      return null;
    }

    const roles = this.extractFoodiesRoles(payload);
    const fullName = payload.name || payload.preferred_username || 'Usuario Foodies';
    const [nombre, ...apellidoParts] = fullName.split(' ');

    return {
      id: payload.sub,
      nombre: payload.given_name || nombre || 'Usuario',
      apellido: payload.family_name || apellidoParts.join(' '),
      correo: payload.email || `${payload.preferred_username || 'usuario'}@seguro.local`,
      fechaCreacion: new Date(),
      estaActivo: true,
      roles
    };
  }

  private decodeJwt(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private extractFoodiesRoles(payload: any): string[] {
    const roles = new Set<string>([
      ...(payload.realm_access?.roles || []),
      ...(payload.resource_access?.[this.keycloak.clientId]?.roles || []),
      ...(payload.resource_access?.['foodies-backend']?.roles || [])
    ]);

    if (roles.has('foodies_admin')) {
      roles.add('admin');
    }
    if (roles.has('foodies_foodie')) {
      roles.add('foodie');
    }
    if (roles.has('foodies_restaurante')) {
      roles.add('restaurante');
    }

    return Array.from(roles);
  }

  private hasValidToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = localStorage.getItem(this.accessTokenKey);
    return !!token && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.expiresAtKey);
    if (!expiresAt) {
      return true;
    }

    return Date.now() >= parseInt(expiresAt, 10);
  }

  private clearTokens(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.expiresAtKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.pkceVerifierKey);
    sessionStorage.removeItem(this.oauthStateKey);
    sessionStorage.removeItem(this.returnUrlKey);
  }

  private getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.refreshTokenKey);
  }

  private getCurrentUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private mapUserResponse(response: UserResponse): User {
    return {
      id: response.id,
      nombre: response.nombre,
      apellido: response.apellido,
      correo: response.correo,
      fechaCreacion: new Date(response.fechaCreacion),
      estaActivo: response.estaActivo
    };
  }

  private defaultRouteForCurrentUser(): string {
    if (this.hasRole('admin')) {
      return '/admincore';
    }

    if (this.hasRole('restaurante')) {
      return '/restaurantes/dashboard';
    }

    if (this.hasRole('foodie')) {
      return '/dashboard-foodie';
    }

    return '/dashboard';
  }

  private normalizeLocalReturnUrl(url?: string | null): string | null {
    if (!url) {
      return null;
    }

    const trimmed = url.trim();
    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
      return null;
    }

    const path = trimmed.split('#')[0];
    const blockedPaths = ['/login', '/register'];
    if (blockedPaths.some(blocked => path === blocked || path.startsWith(`${blocked}?`))) {
      return null;
    }

    return trimmed;
  }

  private randomBase64Url(length: number): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return this.base64UrlEncode(bytes);
  }

  private async pkceChallenge(verifier: string): Promise<string> {
    const bytes = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
