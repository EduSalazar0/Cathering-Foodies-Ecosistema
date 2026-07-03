// Modelos para AdminCore

export interface UsuarioDto {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
  roles: RolDto[];
}

export interface RolDto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface ReservaDto {
  id: number;
  usuarioId: number;
  nombreLocal: string;
  fecha: Date;
  hora: string;
  numeroPersonas: number;
  estadoReserva: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  entregables: EntregableDto[];
}

export interface EntregableDto {
  id: number;
  reservaId: number;
  enlaceTikTok?: string;
  enlaceInstagram?: string;
  cantidadGastada: number;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

export interface FormularioFoodieDto {
  id: number;
  usuarioId: number;
  nombreLocal?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  tipoComida?: string;
  descripcion?: string;
  estado: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface RestauranteAnalyticsDto {
  nombreRestaurante: string;
  totalReservas: number;
  reservasCompletadas: number;
  reservasPendientes: number;
  faltasGraves: number;
  ingresoTotal: number;
  ingresoPromedio: number;
  tasaCompletado: number;
  horasPico: HoraPicoDto[];
}

export interface HoraPicoDto {
  hora: string;
  cantidadReservas: number;
  totalPersonas: number;
}

export interface TendenciaVisitasDto {
  nombreRestaurante: string;
  visitasMensuales: VisitaMensualDto[];
  prediccion: PrediccionDto;
}

export interface VisitaMensualDto {
  año: number;
  mes: number;
  nombreMes: string;
  cantidadVisitas: number;
  ingresoTotal: number;
}

export interface PrediccionDto {
  mesSiguiente: number;
  añoSiguiente: number;
  nombreMesSiguiente: string;
  visitasPredichas: number;
  tendencia: number;
  porcentajeCrecimiento: number;
  interpretacionTendencia: string;
}

export interface ResumenGeneralDto {
  totalUsuarios: number;
  totalFoodies: number;
  totalRestaurantes: number;
  totalReservas: number;
  totalReservasCompletadas: number;
  ingresoTotalPlataforma: number;
  restauranteMasPopular: RestaurantePopularDto;
  restauranteMenosVisitado: RestaurantePopularDto;
  topRestaurantes: RestauranteAnalyticsDto[];
}

export interface RestaurantePopularDto {
  nombre: string;
  totalReservas: number;
  ingresoTotal: number;
}

export interface ComparativaRestaurantesDto {
  restaurantes: RestauranteComparativoDto[];
}

export interface RestauranteComparativoDto {
  nombre: string;
  totalReservas: number;
  ingresoTotal: number;
  tasaCompletado: number;
  promedioPersonasPorReserva: number;
}

export interface ReservasPorFechaDto {
  nombreRestaurante: string;
  puntos: PuntoReservaDto[];
  funcionAjuste: FuncionAjusteDto;
}

export interface PuntoReservaDto {
  fecha: string;
  numeroPersonas: number;
  diaRelativo: number;
}

export interface FuncionAjusteDto {
  pendiente: number;
  intercepto: number;
  coeficienteCorrelacion: number;
  interpretacion: string;
  promedioPersonas: number;
  prediccionProximaSemana: number;
}

export interface CreateRolRequest {
  nombre: string;
  descripcion?: string;
}

export interface AsignarRolRequest {
  usuarioId: number;
  nombreRol: string;
}
