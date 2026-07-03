export interface FormularioFoodie {
  id?: number;
  usuarioId?: number;
  nombreCompleto: string;
  email: string;
  numeroPersonal: string;
  fechaNacimiento: Date;
  genero: string;
  pais: string;
  ciudad: string;
  frecuenciaContenido: string;
  usuarioInstagram: string;
  seguidoresInstagram: number;
  cuentaPublica: boolean;
  usuarioTikTok: string;
  seguidoresTikTok: number;
  sobreTi: string;
  aceptaBeneficios: string;
  aceptaTerminos: boolean;
  fechaAplicacion?: Date;
  fechaActualizacion?: Date;
  estado?: string;
  comentarios?: string;
  activo?: boolean;
}

export interface FormularioFoodieSubmissionResponse {
  success: boolean;
  message: string;
  formularioData?: FormularioFoodie;
  rolFoodieAsignado: boolean;
  rolMessage?: string;
}

export interface FormularioFoodieCreate {
  nombreCompleto: string;
  email: string;
  numeroPersonal: string;
  fechaNacimiento: Date;
  genero: string;
  pais: string;
  ciudad: string;
  frecuenciaContenido: string;
  usuarioInstagram: string;
  seguidoresInstagram: number;
  cuentaPublica: boolean;
  usuarioTikTok: string;
  seguidoresTikTok: number;
  sobreTi: string;
  aceptaBeneficios: string;
  aceptaTerminos: boolean;
}

export interface FormularioFoodieUpdate {
  nombreCompleto?: string;
  email?: string;
  numeroPersonal?: string;
  fechaNacimiento?: Date;
  genero?: string;
  pais?: string;
  ciudad?: string;
  frecuenciaContenido?: string;
  usuarioInstagram?: string;
  seguidoresInstagram?: number;
  cuentaPublica?: boolean;
  usuarioTikTok?: string;
  seguidoresTikTok?: number;
  sobreTi?: string;
  aceptaBeneficios?: string;
  aceptaTerminos?: boolean;
  estado?: string;
  comentarios?: string;
}