export type RolSistema = 'usuario' | 'administrador' | 'fundador';
export type TipoMiembro = 'adherente' | 'afiliado';
export type EstadoUsuario = 'activo' | 'anulado' | 'desafiliado';

export interface Perfil {
  id: string;
  user_id: string;
  dni: string;
  nombres: string;
  telefono: string | null;
  correo_contacto: string | null;
  rol_sistema: RolSistema;
  tipo_miembro: TipoMiembro;
  estado: EstadoUsuario;
  validado_manualmente: boolean;
  creado_en?: string;
}

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';

export interface SolicitudAfiliacion {
  id: string;
  usuario_id: string;
  estado: EstadoSolicitud;
  comentario_usuario: string | null;
  creado_en: string;
}

export interface SolicitudDesafiliacion {
  id: string;
  usuario_id: string;
  estado: EstadoSolicitud;
  motivo: string | null;
  creado_en: string;
}

export interface SolicitudRecuperacion {
  id: string;
  dni: string;
  telefono_contacto: string;
  comentario_usuario: string | null;
  perfil_id: string | null;
  estado: EstadoSolicitud;
  creado_en: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  sujeto_id: string | null;
  accion: string;
  tabla: string;
  registro_id: string | null;
  creado_en: string;
  antes?: unknown;
  despues?: unknown;
}

export type EstadoTema = 'borrador' | 'abierto' | 'cerrado' | 'anulado' | 'archivado';
export type PublicoObjetivoTema = 'afiliados' | 'fundadores';
export type OpcionVoto = 'si' | 'no' | 'abstencion';
export type TipoVotacionSugerido = 'binaria' | 'opciones';
export type EstadoTemaSugerencia = 'pendiente' | 'aprobado' | 'rechazado' | 'convertido';

export interface Tema {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: EstadoTema;
  publico_objetivo: PublicoObjetivoTema;
  tipo_votacion: 'binaria' | 'opciones';
  opciones: string[];
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
  abre_en: string | null;
  cierra_en: string | null;
}

export interface Voto {
  id: string;
  tema_id: string;
  usuario_id: string;
  opcion: string;
  creado_en: string;
}

export interface VoteSummary {
  opcion: string;
  total: number;
}

export interface TemaSugerencia {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo_votacion_sugerido: TipoVotacionSugerido;
  opciones_sugeridas: string[];
  created_by: string;
  estado: EstadoTemaSugerencia;
  revision_comentario: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  tema_id_generado: string | null;
  created_at: string;
}
