export interface Reserva {
  id?: number;
  usuarioId: number;
  nombreLocal: string;
  fecha: Date;
  hora: string;
  numeroPersonas: number;
  estadoReserva: 'Por Ir' | 'Visita Completada' | 'Falta Grave';
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  entregables?: Entregable[];
  
  // Información del usuario/foodie
  nombreUsuario?: string;
  correoUsuario?: string;
  
  // Propiedades calculadas del backend
  puedeCancelar?: boolean;
  enPeriodoEntrega?: boolean;
  debeMarcarFaltaGrave?: boolean;
  horasRestantesParaEntrega?: number;
}

export interface Entregable {
  id?: number;
  reservaId: number;
  enlaceTikTok?: string;
  enlaceInstagram?: string;
  cantidadGastada: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface CrearReservaRequest {
  nombreLocal: string;
  fecha: Date;
  hora: string;
  numeroPersonas: number;
}

export interface ActualizarReservaRequest {
  nombreLocal?: string;
  fecha?: Date;
  hora?: string;
  numeroPersonas?: number;
  estadoReserva?: 'Por Ir' | 'Visita Completada' | 'Falta Grave';
}

export interface CrearEntregableRequest {
  reservaId: number;
  enlaceTikTok?: string;
  enlaceInstagram?: string;
  cantidadGastada: number;
}

export interface CambiarEstadoRequest {
  estado: 'Por Ir' | 'Visita Completada' | 'Falta Grave';
}