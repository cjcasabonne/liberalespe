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
