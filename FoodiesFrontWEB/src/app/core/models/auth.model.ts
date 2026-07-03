export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface User {
  id: number | string;
  nombre: string;
  apellido: string;
  correo: string;
  fechaCreacion: Date;
  estaActivo: boolean;
  roles?: string[];
}

export interface UserResponse {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  fechaCreacion: string;
  estaActivo: boolean;
}

export interface UpdateUserRequest {
  nombre: string;
  apellido: string;
  correo: string;
}
