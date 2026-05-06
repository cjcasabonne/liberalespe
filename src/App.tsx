import { FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { dniToAuthEmail, isValidDni, legacyDniToAuthEmail, maskDni, normalizeDni } from './lib/auth';
import { supabase, supabaseConfigReady } from './lib/supabase';
import { ContactActions } from './ContactActions';
import { RegisterScreen } from './RegisterScreen';
import type {
  AuditLog,
  EstadoTema,
  EstadoTemaSugerencia,
  PublicoObjetivoTema,
  Perfil,
  SolicitudAfiliacion,
  SolicitudDesafiliacion,
  SolicitudRecuperacion,
  Tema,
  TemaSugerencia,
  TipoVotacionSugerido,
  VoteSummary,
  Voto,
} from './types';
import './styles.css';

type Mode = 'login' | 'register' | 'recover';
type AdminEstadoFilter = 'todos' | 'activo' | 'anulado' | 'desafiliado';
type AdminTipoFilter = 'todos' | 'adherente' | 'afiliado';
type AdminRolFilter = 'todos' | 'usuario' | 'administrador' | 'fundador';
type AdminValidationFilter = 'todos' | 'validado' | 'pendiente';
type AdminSection = 'resumen' | 'usuarios' | 'votaciones' | 'sugerencias' | 'solicitudes' | 'password' | 'auditoria';

type OperationalStats = {
  pendingValidation: number;
  pendingAffiliation: number;
  pendingDisaffiliation: number;
  pendingRecovery: number;
  activeUsers: number;
  activeAffiliates: number;
};

type OperationalAlert = {
  label: string;
  detail: string;
};

const pageSize = 10;
const perfilSelectColumns =
  'id,user_id,dni,nombres,telefono,correo_contacto,rol_sistema,tipo_miembro,estado,validado_manualmente';
const perfilSelectColumnsWithCreated = `${perfilSelectColumns},creado_en`;
const temaSelectColumns = 'id,titulo,descripcion,estado,publico_objetivo,tipo_votacion,opciones,creado_por,creado_en,actualizado_en,abre_en,cierra_en';
const temaSugerenciaSelectColumns =
  'id,titulo,descripcion,tipo_votacion_sugerido,opciones_sugeridas,created_by,estado,revision_comentario,reviewed_by,reviewed_at,tema_id_generado,created_at';
const emptyOperationalStats: OperationalStats = {
  pendingValidation: 0,
  pendingAffiliation: 0,
  pendingDisaffiliation: 0,
  pendingRecovery: 0,
  activeUsers: 0,
  activeAffiliates: 0,
};

function emptyRecoveryForm() {
  return {
    dni: '',
    telefono: '',
    comentario: '',
  };
}

function emptyTopicSuggestionForm() {
  return {
    titulo: '',
    descripcion: '',
    tipo: 'binaria' as TipoVotacionSugerido,
    opciones: ['', ''],
  };
}

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    actualizar_perfil_operativo: 'Actualizar perfil operativo',
    actualizar_telefono: 'Actualizar teléfono',
    anular_usuario: 'Anular usuario',
    aprobar_afiliacion: 'Aprobar afiliación',
    aprobar_desafiliacion: 'Aprobar desafiliación',
    cambiar_rol_sistema: 'Cambiar rol del sistema',
    reactivar_usuario: 'Reactivar usuario',
    rechazar_afiliacion: 'Rechazar afiliación',
    rechazar_desafiliacion: 'Rechazar desafiliación',
    resolver_recuperacion: 'Resolver recuperación',
    exportar_usuarios_filtrados: 'Exportar usuarios filtrados',
    aprobar_sugerencia_tema: 'Aprobar sugerencia de tema',
    convertir_sugerencia_tema: 'Convertir sugerencia en tema',
    crear_sugerencia_tema: 'Crear sugerencia de tema',
    rechazar_sugerencia_tema: 'Rechazar sugerencia de tema',
    validar_usuario: 'Validar usuario',
  };

  return labels[action] ?? action.replace(/_/g, ' ');
}

function formatAuditTable(table: string) {
  const labels: Record<string, string> = {
    audit_log: 'Auditoría',
    perfiles: 'Perfiles',
    solicitudes_afiliacion: 'Solicitudes de afiliación',
    solicitudes_desafiliacion: 'Solicitudes de desafiliación',
    solicitudes_recuperacion: 'Solicitudes de recuperación',
    tema_sugerencias: 'Sugerencias de temas',
    temas: 'Temas',
    votos: 'Votos',
  };

  return labels[table] ?? table.replace(/_/g, ' ');
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function buildUsersCsv(users: Perfil[]) {
  const headers = [
    'DNI',
    'Nombres',
    'Teléfono',
    'Correo de contacto',
    'Rol',
    'Tipo',
    'Estado',
    'Validación manual',
    'Creado en',
  ];
  const rows = users.map((user) => [
    user.dni,
    user.nombres,
    user.telefono ?? '',
    user.correo_contacto ?? '',
    user.rol_sistema,
    user.tipo_miembro,
    user.estado,
    user.validado_manualmente ? 'validado' : 'pendiente',
    user.creado_en ? new Date(user.creado_en).toLocaleString('es-PE') : '',
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type ReasonOption = {
  label: string;
  detailLabel?: string;
};

const disaffiliationReasonOptions: ReasonOption[] = [
  { label: 'Solicitud voluntaria del usuario', detailLabel: 'Detalle opcional de la solicitud' },
  { label: 'Registro creado por error', detailLabel: 'Detalle opcional del error' },
  { label: 'Cambio de situación personal', detailLabel: 'Detalle opcional' },
  { label: 'Otro motivo', detailLabel: 'Describe el motivo' },
];

const annulmentReasonOptions: ReasonOption[] = [
  { label: 'Datos inconsistentes', detailLabel: 'Detalle de la inconsistencia' },
  { label: 'Registro duplicado', detailLabel: 'DNI o referencia del duplicado' },
  { label: 'Uso indebido de cuenta', detailLabel: 'Detalle operativo' },
  { label: 'Solicitud administrativa interna', detailLabel: 'Detalle de la solicitud' },
  { label: 'Otro motivo', detailLabel: 'Describe el motivo' },
];

const reactivationReasonOptions: ReasonOption[] = [
  { label: 'Corrección de anulación previa', detailLabel: 'Detalle de la corrección' },
  { label: 'Revisión documental favorable', detailLabel: 'Documento o referencia' },
  { label: 'Regularización administrativa', detailLabel: 'Detalle de la regularización' },
  { label: 'Otro motivo', detailLabel: 'Describe el motivo' },
];

const rejectionReasonOptions: ReasonOption[] = [
  { label: 'Información insuficiente', detailLabel: 'Qué información falta' },
  { label: 'No cumple criterio operativo', detailLabel: 'Detalle del criterio' },
  { label: 'Solicitud duplicada', detailLabel: 'Referencia opcional' },
  { label: 'Solicitud enviada por error', detailLabel: 'Detalle opcional' },
  { label: 'Otro motivo', detailLabel: 'Describe el motivo' },
];

const operationalCorrectionReasonOptions: ReasonOption[] = [
  { label: 'Corrección solicitada por el usuario', detailLabel: 'Detalle de la solicitud' },
  { label: 'Corrección por validación documental', detailLabel: 'Documento o referencia' },
  { label: 'Corrección de digitación', detailLabel: 'Detalle del campo corregido' },
  { label: 'Otro motivo', detailLabel: 'Describe el motivo' },
];

function promptNormalizedReason(title: string, options: ReasonOption[]) {
  const choices = options.map((option, index) => `${index + 1}. ${option.label}`).join('\n');
  const selected = window.prompt(`${title}\n\n${choices}\n\nEscribe el número de motivo.`)?.trim();

  if (!selected) {
    return null;
  }

  const selectedIndex = Number(selected) - 1;
  const option = Number.isInteger(selectedIndex) ? options[selectedIndex] : null;

  if (!option) {
    return null;
  }

  const detail = window.prompt(option.detailLabel ?? 'Detalle opcional')?.trim();
  return detail ? `${option.label}: ${detail}` : option.label;
}

function isToday(dateValue: string) {
  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function buildOperationalAlerts(stats: OperationalStats, auditLogs: AuditLog[]): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  if (stats.pendingValidation > 20) {
    alerts.push({
      label: 'Validaciones pendientes',
      detail: `${stats.pendingValidation} usuarios esperan revisión manual.`,
    });
  }

  if (stats.pendingRecovery > 5) {
    alerts.push({
      label: 'Recuperaciones pendientes',
      detail: `${stats.pendingRecovery} solicitudes requieren atención operativa.`,
    });
  }

  if (stats.pendingAffiliation > 10) {
    alerts.push({
      label: 'Afiliaciones pendientes',
      detail: `${stats.pendingAffiliation} solicitudes esperan decisión.`,
    });
  }

  if (stats.pendingDisaffiliation > 10) {
    alerts.push({
      label: 'Desafiliaciones pendientes',
      detail: `${stats.pendingDisaffiliation} solicitudes esperan decisión.`,
    });
  }

  const todayLogs = auditLogs.filter((log) => isToday(log.creado_en));
  const roleChanges = auditLogs.filter((log) => log.accion === 'cambiar_rol_sistema').length;
  const annulmentsToday = todayLogs.filter((log) => log.accion === 'anular_usuario').length;
  const rejectionsToday = todayLogs.filter((log) =>
    ['rechazar_afiliacion', 'rechazar_desafiliacion'].includes(log.accion),
  ).length;

  if (roleChanges > 0) {
    alerts.push({
      label: 'Cambios de rol recientes',
      detail: `${roleChanges} cambio(s) de rol aparecen en la auditoría reciente.`,
    });
  }

  if (annulmentsToday >= 3) {
    alerts.push({
      label: 'Anulaciones del día',
      detail: `${annulmentsToday} anulaciones registradas hoy.`,
    });
  }

  if (rejectionsToday >= 5) {
    alerts.push({
      label: 'Rechazos del día',
      detail: `${rejectionsToday} rechazos registrados hoy.`,
    });
  }

  return alerts;
}

function formatVoteOption(option: string) {
  const labels: Record<string, string> = {
    si: 'Sí',
    no: 'No',
    abstencion: 'Abstención',
  };

  return labels[option] ?? option;
}

function formatTopicType(tipo: 'binaria' | 'opciones') {
  return tipo === 'opciones' ? 'Por opciones' : 'Binaria';
}

function formatTopicState(state: EstadoTema) {
  const labels: Record<EstadoTema, string> = {
    borrador: 'Borrador',
    abierto: 'Abierto',
    cerrado: 'Cerrado',
    anulado: 'Anulado',
  };

  return labels[state];
}

function formatTopicAudience(audience: PublicoObjetivoTema) {
  const labels: Record<PublicoObjetivoTema, string> = {
    afiliados: 'Afiliados',
    fundadores: 'Fundadores',
  };
  return labels[audience];
}

function formatSuggestionType(type: TipoVotacionSugerido) {
  const labels: Record<TipoVotacionSugerido, string> = {
    binaria: 'Binaria',
    opciones: 'Opciones',
  };
  return labels[type];
}

function formatSuggestionState(state: TemaSugerencia['estado']) {
  const labels: Record<TemaSugerencia['estado'], string> = {
    pendiente: 'Pendiente',
    aprobado: 'Aprobada',
    rechazado: 'Rechazada',
    convertido: 'Convertida',
  };
  return labels[state];
}

function canSuggestTopics(p: Perfil | null): boolean {
  return p !== null && p.estado === 'activo' && p.tipo_miembro === 'afiliado';
}

function canVote(p: Perfil | null, topic: Tema, vote: Voto | undefined): boolean {
  if (!p || vote || p.estado !== 'activo' || p.tipo_miembro !== 'afiliado' || topic.estado !== 'abierto') {
    return false;
  }
  return topic.publico_objetivo === 'afiliados' || p.rol_sistema === 'fundador';
}

function canManageSuggestions(p: Perfil | null): boolean {
  return p !== null && p.estado === 'activo' && ['administrador', 'fundador'].includes(p.rol_sistema);
}

function topicStateDetail(topic: Tema) {
  if (topic.estado === 'abierto' && topic.cierra_en) {
    return `Cierra ${new Date(topic.cierra_en).toLocaleString('es-PE')}`;
  }

  if (topic.estado === 'abierto') {
    return 'Votación abierta.';
  }

  if (topic.estado === 'borrador') {
    return 'Pendiente de apertura administrativa.';
  }

  if (topic.estado === 'cerrado') {
    return 'Resultados disponibles.';
  }

  return 'Tema anulado.';
}

function generateTemporaryPassword() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `Temporal${suffix}7!`;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [mode, setMode] = useState<Mode>('login');
  const [loginDni, setLoginDni] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [recoveryForm, setRecoveryForm] = useState(emptyRecoveryForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState(false);
  const [adminUsers, setAdminUsers] = useState<Perfil[]>([]);
  const [adminUserCount, setAdminUserCount] = useState(0);
  const [adminPage, setAdminPage] = useState(0);
  const [adminDniFilter, setAdminDniFilter] = useState('');
  const [adminEstadoFilter, setAdminEstadoFilter] = useState<AdminEstadoFilter>('todos');
  const [adminTipoFilter, setAdminTipoFilter] = useState<AdminTipoFilter>('todos');
  const [adminRolFilter, setAdminRolFilter] = useState<AdminRolFilter>('todos');
  const [adminValidationFilter, setAdminValidationFilter] = useState<AdminValidationFilter>('todos');
  const [affiliationRequests, setAffiliationRequests] = useState<SolicitudAfiliacion[]>([]);
  const [disaffiliationRequests, setDisaffiliationRequests] = useState<SolicitudDesafiliacion[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<SolicitudRecuperacion[]>([]);
  const [requestProfiles, setRequestProfiles] = useState<Record<string, Perfil>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserLogs, setSelectedUserLogs] = useState<AuditLog[]>([]);
  const [operationalStats, setOperationalStats] = useState<OperationalStats>(emptyOperationalStats);
  const [panelLoading, setPanelLoading] = useState(false);
  const [topics, setTopics] = useState<Tema[]>([]);
  const [ownVotes, setOwnVotes] = useState<Voto[]>([]);
  const [voteSummaries, setVoteSummaries] = useState<Record<string, VoteSummary[]>>({});
  const [votingLoading, setVotingLoading] = useState(false);
  const [topicSuggestions, setTopicSuggestions] = useState<TemaSugerencia[]>([]);
  const [suggestionForm, setSuggestionForm] = useState(emptyTopicSuggestionForm);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [adminSuggestionFilter, setAdminSuggestionFilter] = useState<'todos' | EstadoTemaSugerencia>('todos');
  const [suggestionProfiles, setSuggestionProfiles] = useState<Record<string, Perfil>>({});
  const [adminSection, setAdminSection] = useState<AdminSection>('resumen');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [passwordResetUserId, setPasswordResetUserId] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState(generateTemporaryPassword);

  const isAdmin = canManageSuggestions(profile);
  const isFounder = profile?.estado === 'activo' && profile.rol_sistema === 'fundador';
  const selectedUser = adminUsers.find((user) => user.id === selectedUserId) ?? null;
  const passwordResetUser = adminUsers.find((user) => user.user_id === passwordResetUserId) ?? null;
  const operationalAlerts = buildOperationalAlerts(operationalStats, auditLogs);
  const pendingRequestsTotal = operationalStats.pendingAffiliation + operationalStats.pendingDisaffiliation + operationalStats.pendingRecovery;
  const pendingTopicSuggestions = topicSuggestions.filter((suggestion) => ['pendiente', 'aprobado'].includes(suggestion.estado)).length;
  const adminFilteredSuggestions = adminSuggestionFilter === 'todos'
    ? topicSuggestions
    : topicSuggestions.filter((s) => s.estado === adminSuggestionFilter);
  const isPasswordRecoveryPath = window.location.pathname === '/recuperar-password';
  const adminNavItems: Array<{ key: AdminSection; label: string; count?: number }> = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'usuarios', label: 'Usuarios', count: adminUserCount },
    { key: 'votaciones', label: 'Votaciones', count: topics.length },
    { key: 'sugerencias', label: 'Sugerencias', count: pendingTopicSuggestions },
    { key: 'solicitudes', label: 'Solicitudes', count: pendingRequestsTotal },
    { key: 'password', label: 'Contraseña' },
    { key: 'auditoria', label: 'Auditoría', count: auditLogs.length },
  ];
  const passwordResetMessage =
    passwordResetUser && temporaryPassword
      ? `Hola ${passwordResetUser.nombres},

Se restableció manualmente tu contraseña de acceso a Liberales PE.

Contraseña temporal: ${temporaryPassword}

Ingresa con tu DNI y esta contraseña temporal.`
      : '';

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setProfileLoadError(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    void loadProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isAdmin) {
      setAdminUsers([]);
      setAffiliationRequests([]);
      setDisaffiliationRequests([]);
      setRecoveryRequests([]);
      setRequestProfiles({});
      setAuditLogs([]);
      setSelectedUserId('');
      setSelectedUserLogs([]);
      setOperationalStats(emptyOperationalStats);
      return;
    }

    void loadPanelData();
  }, [isAdmin, adminPage, adminDniFilter, adminEstadoFilter, adminTipoFilter, adminRolFilter, adminValidationFilter]);

  useEffect(() => {
    if (!isAdmin || !selectedUserId) {
      setSelectedUserLogs([]);
      return;
    }

    void loadSelectedUserLogs(selectedUserId);
  }, [isAdmin, selectedUserId]);

  useEffect(() => {
    if (!profile) {
      setTopics([]);
      setOwnVotes([]);
      setVoteSummaries({});
      setTopicSuggestions([]);
      setSuggestionProfiles({});
      return;
    }

    void loadVotingData();
  }, [profile?.id, isAdmin]);

  async function loadProfile() {
    if (!supabase) {
      return;
    }

    setError('');
    const { data, error: profileError } = await supabase
      .from('perfiles')
      .select(perfilSelectColumns)
      .eq('user_id', session?.user.id)
      .single();

    if (profileError) {
      setProfile(null);
      setProfileLoadError(true);
      setError('No se encontró un perfil operativo asociado a esta cuenta.');
      return;
    }

    setProfileLoadError(false);
    setProfile(data as Perfil);
  }

  async function loadVotingData() {
    if (!supabase || !profile) {
      return;
    }

    const client = supabase;
    setVotingLoading(true);
    const [topicsResult, ownVotesResult, suggestionsResult] = await Promise.all([
      client.from('temas').select(temaSelectColumns).order('creado_en', { ascending: false }).limit(30),
      client
        .from('votos')
        .select('id,tema_id,usuario_id,opcion,creado_en')
        .eq('usuario_id', profile.id)
        .order('creado_en', { ascending: false }),
      client.from('tema_sugerencias').select(temaSugerenciaSelectColumns).order('created_at', { ascending: false }).limit(isAdmin ? 50 : 10),
    ]);
    setVotingLoading(false);

    if (topicsResult.error || ownVotesResult.error) {
      setTopics([]);
      setOwnVotes([]);
      setVoteSummaries({});
      setTopicSuggestions([]);
      return;
    }

    const nextTopics = (topicsResult.data ?? []) as Tema[];
    setTopics(nextTopics);
    setOwnVotes((ownVotesResult.data ?? []) as Voto[]);
    const nextSuggestions = suggestionsResult.error ? [] : ((suggestionsResult.data ?? []) as TemaSugerencia[]);
    setTopicSuggestions(nextSuggestions);

    if (isAdmin && nextSuggestions.length > 0) {
      const createdByIds = [...new Set(nextSuggestions.map((s) => s.created_by))];
      const { data: profData } = await client.from('perfiles').select(perfilSelectColumns).in('id', createdByIds);
      setSuggestionProfiles(
        ((profData ?? []) as Perfil[]).reduce<Record<string, Perfil>>((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {}),
      );
    } else {
      setSuggestionProfiles({});
    }

    const summaries = await Promise.all(
      nextTopics
        .filter((topic) => isAdmin || ['abierto', 'cerrado'].includes(topic.estado))
        .map(async (topic) => {
          const { data, error: summaryError } = await client.rpc('resumen_votos_tema', { p_tema_id: topic.id });
          return [topic.id, summaryError ? [] : ((data ?? []) as VoteSummary[])] as const;
        }),
    );

    setVoteSummaries(
      summaries.reduce<Record<string, VoteSummary[]>>((nextSummaries, [topicId, summary]) => {
        nextSummaries[topicId] = summary;
        return nextSummaries;
      }, {}),
    );
  }

  async function loadPanelData() {
    if (!supabase) {
      return;
    }

    setPanelLoading(true);
    setError('');

    let usersQuery = supabase
      .from('perfiles')
      .select(perfilSelectColumnsWithCreated, {
        count: 'exact',
      })
      .order('creado_en', { ascending: false })
      .range(adminPage * pageSize, adminPage * pageSize + pageSize - 1);

    const dniFilter = normalizeDni(adminDniFilter);
    if (dniFilter.length === 8) {
      usersQuery = usersQuery.eq('dni', dniFilter);
    }

    if (adminEstadoFilter !== 'todos') {
      usersQuery = usersQuery.eq('estado', adminEstadoFilter);
    }

    if (adminTipoFilter !== 'todos') {
      usersQuery = usersQuery.eq('tipo_miembro', adminTipoFilter);
    }

    if (adminRolFilter !== 'todos') {
      usersQuery = usersQuery.eq('rol_sistema', adminRolFilter);
    }

    if (adminValidationFilter !== 'todos') {
      usersQuery = usersQuery.eq('validado_manualmente', adminValidationFilter === 'validado');
    }

    const [
      usersResult,
      affiliationResult,
      disaffiliationResult,
      recoveryResult,
      auditResult,
      pendingValidationResult,
      activeUsersResult,
      activeAffiliatesResult,
    ] = await Promise.all([
      usersQuery,
      supabase
        .from('solicitudes_afiliacion')
        .select('id,usuario_id,estado,comentario_usuario,creado_en', { count: 'exact' })
        .eq('estado', 'pendiente')
        .order('creado_en', { ascending: true })
        .limit(10),
      supabase
        .from('solicitudes_desafiliacion')
        .select('id,usuario_id,estado,motivo,creado_en', { count: 'exact' })
        .eq('estado', 'pendiente')
        .order('creado_en', { ascending: true })
        .limit(10),
      supabase
        .from('solicitudes_recuperacion')
        .select('id,dni,telefono_contacto,comentario_usuario,perfil_id,estado,creado_en', { count: 'exact' })
        .eq('estado', 'pendiente')
        .order('creado_en', { ascending: true })
        .limit(10),
      supabase
        .from('audit_log')
        .select('id,actor_id,sujeto_id,accion,tabla,registro_id,creado_en')
        .order('creado_en', { ascending: false })
        .limit(20),
      supabase
        .from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'activo')
        .eq('validado_manualmente', false),
      supabase.from('perfiles').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
      supabase
        .from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'activo')
        .eq('tipo_miembro', 'afiliado'),
    ]);

    setPanelLoading(false);

    if (usersResult.error || affiliationResult.error || disaffiliationResult.error || recoveryResult.error || auditResult.error) {
      setError('No se pudo cargar el panel operativo.');
      return;
    }

    setAdminUsers((usersResult.data ?? []) as Perfil[]);
    const affiliationRequestsData = (affiliationResult.data ?? []) as SolicitudAfiliacion[];
    const disaffiliationRequestsData = (disaffiliationResult.data ?? []) as SolicitudDesafiliacion[];
    const recoveryRequestsData = (recoveryResult.data ?? []) as SolicitudRecuperacion[];
    const requestProfileIds = [
      ...affiliationRequestsData.map((request) => request.usuario_id),
      ...disaffiliationRequestsData.map((request) => request.usuario_id),
      ...recoveryRequestsData.map((request) => request.perfil_id).filter((perfilId): perfilId is string => Boolean(perfilId)),
    ];
    setAdminUserCount(usersResult.count ?? 0);
    setAffiliationRequests(affiliationRequestsData);
    setDisaffiliationRequests(disaffiliationRequestsData);
    setRecoveryRequests(recoveryRequestsData);
    setAuditLogs((auditResult.data ?? []) as AuditLog[]);
    setOperationalStats({
      pendingValidation: pendingValidationResult.count ?? 0,
      pendingAffiliation: affiliationResult.count ?? affiliationRequestsData.length,
      pendingDisaffiliation: disaffiliationResult.count ?? disaffiliationRequestsData.length,
      pendingRecovery: recoveryResult.count ?? recoveryRequestsData.length,
      activeUsers: activeUsersResult.count ?? 0,
      activeAffiliates: activeAffiliatesResult.count ?? 0,
    });

    if (requestProfileIds.length === 0) {
      setRequestProfiles({});
      return;
    }

    const { data: requestProfileData, error: requestProfileError } = await supabase
      .from('perfiles')
      .select(perfilSelectColumnsWithCreated)
      .in('id', requestProfileIds);

    if (requestProfileError) {
      setRequestProfiles({});
      return;
    }

    setRequestProfiles(
      ((requestProfileData ?? []) as Perfil[]).reduce<Record<string, Perfil>>((profilesById, requestProfile) => {
        profilesById[requestProfile.id] = requestProfile;
        return profilesById;
      }, {}),
    );
  }

  async function loadSelectedUserLogs(usuarioId: string) {
    if (!supabase) {
      return;
    }

    const selectedUser = adminUsers.find((user) => user.id === usuarioId);
    if (!selectedUser) {
      setSelectedUserLogs([]);
      return;
    }

    const { data, error: auditError } = await supabase
      .from('audit_log')
      .select('id,actor_id,sujeto_id,accion,tabla,registro_id,antes,despues,creado_en')
      .or(`sujeto_id.eq.${selectedUser.user_id},registro_id.eq.${selectedUser.id}`)
      .order('creado_en', { ascending: false })
      .limit(20);

    if (auditError) {
      setSelectedUserLogs([]);
      return;
    }

    setSelectedUserLogs((data ?? []) as AuditLog[]);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const dni = normalizeDni(loginDni);
    if (!isValidDni(dni)) {
      setError('Ingresa un DNI válido de 8 dígitos.');
      return;
    }

    setLoading(true);
    const authEmails = [dniToAuthEmail(dni), legacyDniToAuthEmail(dni)];
    let signInError: unknown = null;

    for (const email of authEmails) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword,
      });

      signInError = authError;
      if (!authError) {
        signInError = null;
        break;
      }
    }

    setLoading(false);

    if (signInError) {
      setError('No se pudo iniciar sesión con las credenciales ingresadas.');
      return;
    }

    setStatus('Sesión iniciada.');
  }

  async function handleRecoveryRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const dni = normalizeDni(recoveryForm.dni);
    const telefono = recoveryForm.telefono.trim();
    const comentario = recoveryForm.comentario.trim();

    if (!isValidDni(dni)) {
      setError('Ingresa un DNI válido de 8 dígitos.');
      return;
    }

    if (telefono.length < 6) {
      setError('Ingresa un teléfono de contacto válido.');
      return;
    }

    setLoading(true);
    const { error: recoveryError } = await supabase.from('solicitudes_recuperacion').insert({
      dni,
      telefono_contacto: telefono,
      comentario_usuario: comentario || null,
    });
    setLoading(false);

    if (recoveryError) {
      setError('No se pudo registrar la solicitud de revisión manual.');
      return;
    }

    setRecoveryForm(emptyRecoveryForm());
    setMode('login');
    setStatus('Solicitud registrada para revisión manual.');
  }

  async function handleUpdatePhone() {
    if (!profile || !supabase) {
      return;
    }

    const nextPhone = window.prompt('Nuevo teléfono de contacto', profile.telefono ?? '')?.trim();
    if (nextPhone === undefined) {
      return;
    }

    if (nextPhone && nextPhone.length < 6) {
      setError('Ingresa un teléfono de contacto válido.');
      return;
    }

    const confirmed = window.confirm('Confirmar actualización del teléfono de contacto.');
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');
    const { error: updateError } = await supabase
      .from('perfiles')
      .update({ telefono: nextPhone || null })
      .eq('id', profile.id);
    setLoading(false);

    if (updateError) {
      setError('No se pudo actualizar el teléfono.');
      return;
    }

    setStatus('Teléfono actualizado.');
    await loadProfile();
  }

  async function handleSolicitarAfiliacion() {
    if (!profile || !supabase) {
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');
    const { error: requestError } = await supabase.from('solicitudes_afiliacion').insert({
      usuario_id: profile.id,
      comentario_usuario: null,
    });
    setLoading(false);

    if (requestError) {
      setError('No se pudo registrar la solicitud de afiliación.');
      return;
    }

    setStatus('Solicitud de afiliación registrada para revisión manual.');
  }

  async function handleSolicitarDesafiliacion() {
    if (!profile || !supabase) {
      return;
    }

    const motivo = promptNormalizedReason('Motivo de desafiliación', disaffiliationReasonOptions);
    if (!motivo) {
      setError('La solicitud de desafiliación requiere motivo.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');
    const { error: requestError } = await supabase.from('solicitudes_desafiliacion').insert({
      usuario_id: profile.id,
      motivo,
    });
    setLoading(false);

    if (requestError) {
      setError('No se pudo registrar la solicitud de desafiliación.');
      return;
    }

    setStatus('Solicitud de desafiliación registrada para revisión manual.');
  }

  async function runProfileRpc(action: 'validar_usuario' | 'anular_usuario', usuarioId: string) {
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const params =
      action === 'anular_usuario'
        ? { usuario_id: usuarioId, motivo: promptNormalizedReason('Motivo de anulación', annulmentReasonOptions) }
        : { usuario_id: usuarioId, observacion: null };

    if (action === 'anular_usuario' && !params.motivo) {
      setError('La anulación requiere motivo.');
      return;
    }

    const confirmed = window.confirm(
      action === 'validar_usuario'
        ? 'Confirmar validación manual del usuario seleccionado.'
        : 'Confirmar anulación del usuario seleccionado. Esta acción cambia su estado operativo.',
    );

    if (!confirmed) {
      return;
    }

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc(action, params);
    setPanelLoading(false);

    if (rpcError) {
      setError('La acción administrativa no pudo completarse.');
      return;
    }

    setStatus(action === 'validar_usuario' ? 'Usuario validado manualmente.' : 'Usuario anulado.');
    await loadPanelData();
    if (selectedUserId) {
      await loadSelectedUserLogs(selectedUserId);
    }
    await loadProfile();
  }

  async function runReactivateUserRpc(usuarioId: string) {
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const motivo = promptNormalizedReason('Motivo de reactivación', reactivationReasonOptions);
    if (!motivo) {
      setError('La reactivación requiere motivo.');
      return;
    }

    const confirmed = window.confirm('Confirmar reactivación del usuario seleccionado.');
    if (!confirmed) {
      return;
    }

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc('reactivar_usuario', { usuario_id: usuarioId, motivo });
    setPanelLoading(false);

    if (rpcError) {
      setError('El usuario no pudo reactivarse.');
      return;
    }

    setStatus('Usuario reactivado.');
    await loadPanelData();
    if (selectedUserId) {
      await loadSelectedUserLogs(selectedUserId);
    }
    await loadProfile();
  }

  async function runAffiliationRpc(action: 'aprobar_afiliacion' | 'rechazar_afiliacion', solicitudId: string) {
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const params =
      action === 'rechazar_afiliacion'
        ? { solicitud_id: solicitudId, comentario: promptNormalizedReason('Motivo de rechazo de afiliación', rejectionReasonOptions) }
        : { solicitud_id: solicitudId };

    if (action === 'rechazar_afiliacion' && !params.comentario) {
      setError('El rechazo requiere comentario.');
      return;
    }

    const confirmed = window.confirm(
      action === 'aprobar_afiliacion'
        ? 'Confirmar aprobación de afiliación. El usuario quedará como afiliado.'
        : 'Confirmar rechazo de afiliación.',
    );

    if (!confirmed) {
      return;
    }

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc(action, params);
    setPanelLoading(false);

    if (rpcError) {
      setError('La solicitud no pudo procesarse.');
      return;
    }

    setStatus(action === 'aprobar_afiliacion' ? 'Afiliación aprobada.' : 'Afiliación rechazada.');
    await loadPanelData();
    if (selectedUserId) {
      await loadSelectedUserLogs(selectedUserId);
    }
  }

  async function runDisaffiliationRpc(action: 'aprobar_desafiliacion' | 'rechazar_desafiliacion', solicitudId: string) {
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const comentario =
      action === 'rechazar_desafiliacion'
        ? promptNormalizedReason('Motivo de rechazo de desafiliación', rejectionReasonOptions)
        : null;

    if (action === 'rechazar_desafiliacion' && !comentario) {
      setError('El rechazo de desafiliación requiere comentario.');
      return;
    }

    const confirmed = window.confirm(
      action === 'aprobar_desafiliacion'
        ? 'Confirmar aprobación de desafiliación. El usuario quedará desafiliado.'
        : 'Confirmar rechazo de desafiliación.',
    );

    if (!confirmed) {
      return;
    }

    const params =
      action === 'aprobar_desafiliacion'
        ? { solicitud_id: solicitudId, observacion: window.prompt('Observación operativa opcional')?.trim() || null }
        : { solicitud_id: solicitudId, comentario };

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc(action, params);
    setPanelLoading(false);

    if (rpcError) {
      setError('La desafiliación no pudo procesarse.');
      return;
    }

    setStatus(action === 'aprobar_desafiliacion' ? 'Desafiliación aprobada.' : 'Desafiliación rechazada.');
    await loadPanelData();
    if (selectedUserId) {
      await loadSelectedUserLogs(selectedUserId);
    }
    await loadProfile();
  }

  async function runRecoveryRpc(solicitudId: string, nuevoEstado: 'aprobada' | 'rechazada' | 'cancelada') {
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const comentario = window.prompt(
      nuevoEstado === 'aprobada'
        ? 'Comentario del restablecimiento administrativo realizado'
        : 'Comentario de cierre de la solicitud',
    )?.trim();

    if (!comentario) {
      setError('La solicitud de recuperación requiere comentario del operador.');
      return;
    }

    const confirmed = window.confirm('Confirmar cierre de solicitud de recuperación.');
    if (!confirmed) {
      return;
    }

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc('resolver_recuperacion', {
      solicitud_id: solicitudId,
      nuevo_estado: nuevoEstado,
      comentario,
    });
    setPanelLoading(false);

    if (rpcError) {
      setError('La solicitud de recuperación no pudo procesarse.');
      return;
    }

    setStatus('Solicitud de recuperación actualizada.');
    await loadPanelData();
    if (selectedUserId) {
      await loadSelectedUserLogs(selectedUserId);
    }
  }

  async function handleManualPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !session?.access_token || !isAdmin) {
      return;
    }

    setError('');
    setStatus('');

    if (!passwordResetUserId) {
      setError('Selecciona un usuario.');
      return;
    }

    const confirmed = window.confirm('Confirmar restablecimiento manual de contraseña.');
    if (!confirmed) {
      return;
    }

    try {
      setPanelLoading(true);
      const response = await fetch('/api/restablecer-password', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${session.access_token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          userId: passwordResetUserId,
          password: temporaryPassword,
        }),
      });
      const result = (await response.json().catch(() => null)) as { error?: string; success?: boolean } | null;

      if (!response.ok) {
        const errorMessages: Record<string, string> = {
          not_authorized: 'Tu sesión no tiene permisos para esta acción',
          weak_password: 'La contraseña generada no cumple la política',
          user_not_found: 'Usuario no encontrado',
        };
        setError(errorMessages[result?.error ?? ''] ?? 'No se pudo restablecer la contraseña.');
        return;
      }

      if (result?.success !== true) {
        setError('No se pudo restablecer la contraseña.');
        return;
      }

      setStatus('Contraseña temporal actualizada. Usa los botones de contacto del usuario seleccionado para comunicarla.');
      await loadPanelData();
    } catch {
      setError('No se pudo restablecer la contraseña.');
    } finally {
      setPanelLoading(false);
    }
  }

  async function runRoleRpc(usuarioId: string) {
    if (!supabase || profile?.rol_sistema !== 'fundador') {
      return;
    }

    setError('');
    setStatus('');

    const nuevoRol = window.prompt('Nuevo rol: usuario, administrador o fundador')?.trim() as
      | 'usuario'
      | 'administrador'
      | 'fundador'
      | undefined;

    if (!nuevoRol || !['usuario', 'administrador', 'fundador'].includes(nuevoRol)) {
      setError('Rol no válido.');
      return;
    }

    const confirmed = window.confirm(
      nuevoRol === 'fundador'
        ? 'Confirmar cambio de rol a fundador. El usuario también quedará como afiliado.'
        : 'Confirmar cambio de rol del usuario seleccionado.',
    );
    if (!confirmed) {
      return;
    }

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc('cambiar_rol_sistema', { usuario_id: usuarioId, nuevo_rol: nuevoRol });
    setPanelLoading(false);

    if (rpcError) {
      setError('El rol no pudo cambiarse.');
      return;
    }

    setStatus('Rol actualizado.');
    await loadPanelData();
    if (selectedUserId) {
      await loadSelectedUserLogs(selectedUserId);
    }
  }

  async function runOperationalProfileUpdate(user: Perfil) {
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const nombres = window.prompt('Nombres completos', user.nombres)?.trim().replace(/\s+/g, ' ');
    if (!nombres || nombres.length < 3) {
      setError('Ingresa nombres válidos.');
      return;
    }

    const telefono = window.prompt('Teléfono de contacto', user.telefono ?? '')?.trim() ?? '';
    if (telefono && telefono.length < 6) {
      setError('Ingresa un teléfono de contacto válido.');
      return;
    }

    const motivo = promptNormalizedReason('Motivo de corrección operativa', operationalCorrectionReasonOptions);
    if (!motivo) {
      setError('La corrección operativa requiere motivo.');
      return;
    }

    const confirmed = window.confirm('Confirmar corrección auditada del perfil seleccionado.');
    if (!confirmed) {
      return;
    }

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc('actualizar_perfil_operativo', {
      usuario_id: user.id,
      nuevos_nombres: nombres,
      nuevo_telefono: telefono,
      motivo,
    });
    setPanelLoading(false);

    if (rpcError) {
      setError('No se pudo actualizar el perfil.');
      return;
    }

    setStatus('Perfil actualizado.');
    await loadPanelData();
    await loadSelectedUserLogs(user.id);
    await loadProfile();
  }

  async function handleFilteredUsersExport() {
    if (!supabase || !isFounder || !session?.user) {
      return;
    }

    setError('');
    setStatus('');

    if (adminUsers.length === 0) {
      setError('No hay usuarios visibles para exportar.');
      return;
    }

    const justificacion = window.prompt('Justificación de la exportación')?.trim();
    if (!justificacion) {
      setError('La exportación requiere justificación.');
      return;
    }

    const confirmed = window.confirm(
      `Confirmar exportación de ${adminUsers.length} usuario(s) visibles en la página actual.`,
    );
    if (!confirmed) {
      return;
    }

    const filters = {
      dni: normalizeDni(adminDniFilter) || 'todos',
      estado: adminEstadoFilter,
      tipo: adminTipoFilter,
      rol: adminRolFilter,
      validacion: adminValidationFilter,
      pagina: adminPage + 1,
      registros_visibles: adminUsers.length,
      total_filtrado: adminUserCount,
    };

    setPanelLoading(true);
    const { error: auditError } = await supabase.rpc('registrar_exportacion_usuarios', {
      justificacion,
      filtros: filters,
      cantidad: adminUsers.length,
    });
    setPanelLoading(false);

    if (auditError) {
      setError('No se pudo auditar la exportación. No se descargó ningún archivo.');
      return;
    }

    const csv = buildUsersCsv(adminUsers);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`usuarios-filtrados-${date}.csv`, csv);
    setStatus('Exportación auditada y descargada.');
    await loadPanelData();
  }

  async function handleVote(topicId: string, option: string) {
    if (!supabase || !profile) {
      return;
    }

    const confirmed = window.confirm(`Confirmar voto: ${formatVoteOption(option)}.`);
    if (!confirmed) {
      return;
    }

    setError('');
    setStatus('');
    setVotingLoading(true);
    const { error: voteError } = await supabase.rpc('emitir_voto_controlado', {
      p_tema_id: topicId,
      p_opcion: option,
    });
    setVotingLoading(false);

    if (voteError) {
      setError('No se pudo emitir el voto. Verifica que el tema siga abierto y que tu perfil esté habilitado.');
      return;
    }

    setStatus('Voto registrado.');
    await loadVotingData();
  }

  function updateSuggestionOption(index: number, value: string) {
    setSuggestionForm((current) => ({
      ...current,
      opciones: current.opciones.map((option, optionIndex) => (optionIndex === index ? value : option)),
    }));
  }

  async function handleCreateTopicSuggestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !profile) {
      return;
    }

    if (!canSuggestTopics(profile)) {
      setError('Solo afiliados activos pueden sugerir temas.');
      return;
    }

    const options = suggestionForm.opciones.map((option) => option.trim()).filter(Boolean);
    if (suggestionForm.tipo === 'opciones' && options.length < 2) {
      setError('Agrega al menos dos opciones sugeridas.');
      return;
    }

    setError('');
    setStatus('');
    setSuggestionLoading(true);
    const { error: suggestionError } = await supabase.rpc('crear_sugerencia_tema', {
      p_titulo: suggestionForm.titulo,
      p_descripcion: suggestionForm.descripcion,
      p_tipo_votacion_sugerido: suggestionForm.tipo,
      p_opciones_sugeridas: suggestionForm.tipo === 'opciones' ? options : [],
    });
    setSuggestionLoading(false);

    if (suggestionError) {
      setError('No se pudo registrar la sugerencia.');
      return;
    }

    setSuggestionForm(emptyTopicSuggestionForm());
    setStatus('Sugerencia registrada para revisión.');
    await loadVotingData();
  }

  async function handleReviewTopicSuggestion(suggestion: TemaSugerencia, action: 'aprobar' | 'rechazar' | 'convertir') {
    if (!supabase || !isAdmin) {
      return;
    }

    const comentario =
      action === 'rechazar'
        ? window.prompt('Comentario de rechazo (obligatorio)')?.trim()
        : action === 'convertir'
          ? window.prompt('Comentario de conversión (opcional, Enter para omitir)')?.trim() ?? null
          : window.prompt('Comentario de aprobación (opcional)')?.trim() ?? null;

    if (action === 'rechazar' && !comentario) {
      setError('El rechazo requiere comentario.');
      return;
    }

    let publicoObjetivo: PublicoObjetivoTema = 'afiliados';
    if (action === 'convertir') {
      const audienceInput = window.prompt('Público objetivo del tema oficial: afiliados o fundadores', 'afiliados')?.trim().toLowerCase() as
        | PublicoObjetivoTema
        | undefined;
      if (!audienceInput || !['afiliados', 'fundadores'].includes(audienceInput)) {
        setError('El público objetivo debe ser afiliados o fundadores.');
        return;
      }
      publicoObjetivo = audienceInput;
    }

    const confirmed = window.confirm(
      action === 'convertir'
        ? 'Convertir esta sugerencia en un tema oficial en borrador.'
        : `Confirmar ${action} sugerencia.`,
    );
    if (!confirmed) {
      return;
    }

    setError('');
    setStatus('');
    setSuggestionLoading(true);
    const result =
      action === 'aprobar'
        ? await supabase.rpc('aprobar_sugerencia_tema', {
            p_sugerencia_id: suggestion.id,
            p_revision_comentario: comentario,
          })
        : action === 'rechazar'
          ? await supabase.rpc('rechazar_sugerencia_tema', {
              p_sugerencia_id: suggestion.id,
              p_revision_comentario: comentario,
            })
          : await supabase.rpc('convertir_sugerencia_tema', {
              p_sugerencia_id: suggestion.id,
              p_publico_objetivo: publicoObjetivo,
              p_revision_comentario: comentario,
            });
    setSuggestionLoading(false);

    if (result.error) {
      setError('No se pudo procesar la sugerencia.');
      return;
    }

    setStatus(action === 'convertir' ? 'Sugerencia convertida en tema oficial.' : 'Sugerencia actualizada.');
    await loadVotingData();
    await loadPanelData();
  }

  async function handleCreateTopic() {
    if (!supabase || !isAdmin || !session?.user) {
      return;
    }

    const title = window.prompt('Título del tema de votación')?.trim();
    if (!title || title.length < 4) {
      setError('El tema requiere un título válido.');
      return;
    }

    const description = window.prompt('Descripción opcional del tema')?.trim() || null;
    const audienceInput = window.prompt('Público objetivo: afiliados o fundadores', 'afiliados')?.trim().toLowerCase() as
      | PublicoObjetivoTema
      | undefined;
    if (!audienceInput || !['afiliados', 'fundadores'].includes(audienceInput)) {
      setError('El público objetivo debe ser afiliados o fundadores.');
      return;
    }

    const tipoVotacion = window.prompt('Tipo de votación: binaria u opciones', 'binaria')?.trim().toLowerCase();
    if (!tipoVotacion || !['binaria', 'opciones'].includes(tipoVotacion)) {
      setError('El tipo de votación debe ser binaria u opciones.');
      return;
    }

    let topicOpciones: string[] = [];
    if (tipoVotacion === 'opciones') {
      const opcionesStr = window.prompt('Opciones de votación, separadas por coma (mínimo 2):')?.trim();
      if (!opcionesStr) {
        setError('Ingresa las opciones de votación.');
        return;
      }
      topicOpciones = opcionesStr.split(',').map((o) => o.trim()).filter(Boolean);
      if (topicOpciones.length < 2) {
        setError('Se requieren al menos 2 opciones de votación.');
        return;
      }
    }

    const confirmed = window.confirm(
      `Crear tema ${tipoVotacion} para ${formatTopicAudience(audienceInput).toLowerCase()} en estado borrador.`,
    );
    if (!confirmed) {
      return;
    }

    setError('');
    setStatus('');
    setVotingLoading(true);
    const { error: topicError } = await supabase.rpc('crear_tema_controlado', {
      p_titulo: title,
      p_descripcion: description,
      p_publico_objetivo: audienceInput,
      p_tipo_votacion: tipoVotacion,
      p_opciones: topicOpciones,
    });
    setVotingLoading(false);

    if (topicError) {
      setError('No se pudo crear el tema.');
      return;
    }

    setStatus('Tema creado en borrador.');
    await loadVotingData();
    await loadPanelData();
  }

  async function handleTopicState(topic: Tema, nextState: EstadoTema) {
    if (!supabase || !isAdmin) {
      return;
    }

    const confirmed = window.confirm(`Confirmar cambio de estado a ${formatTopicState(nextState)}.`);
    if (!confirmed) {
      return;
    }

    setError('');
    setStatus('');
    setVotingLoading(true);
    const { error: topicError } = await supabase.rpc('cambiar_estado_tema_controlado', {
      p_tema_id: topic.id,
      p_estado: nextState,
    });
    setVotingLoading(false);

    if (topicError) {
      setError('No se pudo cambiar el estado del tema.');
      return;
    }

    setStatus('Tema actualizado.');
    await loadVotingData();
    await loadPanelData();
  }

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setLoginPassword('');
    setStatus('Sesión cerrada.');
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div className="topbar-brand">
          <img src="/logo_cs.svg" alt="Logo Cs" />
          <div>
          <h1>Liberales PE</h1>
          <p>Padrón operativo</p>
          </div>
        </div>
        {session ? (
          <button className="secondary" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        ) : null}
      </section>

      {!supabaseConfigReady ? (
        <section className="panel">
          <h2>Configuración incompleta</h2>
          <p className="muted">
            Falta configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el entorno de despliegue.
          </p>
        </section>
      ) : null}

      {supabaseConfigReady && session ? (
        <>
          <section className="panel">
          <h2>Perfil</h2>
          {profile ? (
            <>
              <dl className="profile-grid">
                <div>
                  <dt>DNI</dt>
                  <dd>{profile.dni}</dd>
                </div>
                <div>
                  <dt>Nombres</dt>
                  <dd>{profile.nombres}</dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>{profile.telefono ?? '-'}</dd>
                </div>
                <div>
                  <dt>Rol</dt>
                  <dd>{profile.rol_sistema}</dd>
                </div>
                <div>
                  <dt>Tipo</dt>
                  <dd>{profile.tipo_miembro}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd><span className={`state-pill state-${profile.estado}`}>{profile.estado}</span></dd>
                </div>
                <div>
                  <dt>Validación</dt>
                  <dd>{profile.validado_manualmente ? 'validación manual' : 'pendiente'}</dd>
                </div>
              </dl>
              {profile.estado === 'activo' ? (
                <div className="section-actions">
                  <button className="secondary" type="button" disabled={loading} onClick={handleUpdatePhone}>
                    Actualizar teléfono
                  </button>
                  {profile.tipo_miembro === 'adherente' ? (
                    <button className="secondary" type="button" disabled={loading} onClick={handleSolicitarAfiliacion}>
                      Solicitar afiliación
                    </button>
                  ) : null}
                  <button className="secondary" type="button" disabled={loading} onClick={handleSolicitarDesafiliacion}>
                    Solicitar desafiliación
                  </button>
                </div>
              ) : null}
            </>
          ) : profileLoadError ? (
            <p className="muted">No se pudo cargar el perfil operativo. Cierra sesión e intenta nuevamente.</p>
          ) : (
            <p className="muted">Cargando perfil...</p>
          )}
          </section>

          <section className="panel voting-panel">
            <div className="panel-heading">
              <h2>Votaciones</h2>
              <span>{votingLoading ? 'Cargando...' : `${topics.length} tema(s)`}</span>
            </div>
            {!canSuggestTopics(profile) ? (
              <p className="hint">Puedes ver las votaciones y sus resultados, pero solo afiliados activos pueden votar.</p>
            ) : null}
            <div className="topic-list">
              {topics.length > 0 ? (
                topics.map((topic) => {
                  const vote = ownVotes.find((currentVote) => currentVote.tema_id === topic.id);
                  const summary = voteSummaries[topic.id] ?? [];
                  const eligible = canVote(profile, topic, vote);

                  return (
                    <article className="topic-item" key={topic.id}>
                      <div className="topic-main">
                        <div className="topic-title-row">
                          <h3>{topic.titulo}</h3>
                          <span className={`state-pill state-${topic.estado}`}>{formatTopicState(topic.estado)}</span>
                        </div>
                        {topic.descripcion ? <p className="muted">{topic.descripcion}</p> : null}
                        <p className="hint">Dirigida a: {formatTopicAudience(topic.publico_objetivo)} — {formatTopicType(topic.tipo_votacion)}</p>
                        {topic.tipo_votacion === 'opciones' && topic.opciones.length > 0 ? (
                          <p className="hint">Opciones: {topic.opciones.join(' / ')}</p>
                        ) : null}
                        <p className="hint">{topicStateDetail(topic)}</p>
                        {vote ? (
                          <p className="hint">Tu voto: {formatVoteOption(vote.opcion)} - {new Date(vote.creado_en).toLocaleString('es-PE')}</p>
                        ) : null}
                      </div>

                      {eligible ? (
                        <div className="vote-actions">
                          {topic.tipo_votacion === 'opciones' ? (
                            topic.opciones.map((opcion) => (
                              <button
                                key={opcion}
                                className="secondary"
                                type="button"
                                disabled={votingLoading}
                                onClick={() => handleVote(topic.id, opcion)}
                              >
                                {opcion}
                              </button>
                            ))
                          ) : (
                            <>
                              <button type="button" disabled={votingLoading} onClick={() => handleVote(topic.id, 'si')}>
                                Sí
                              </button>
                              <button className="secondary" type="button" disabled={votingLoading} onClick={() => handleVote(topic.id, 'no')}>
                                No
                              </button>
                              <button className="secondary" type="button" disabled={votingLoading} onClick={() => handleVote(topic.id, 'abstencion')}>
                                Abstención
                              </button>
                            </>
                          )}
                        </div>
                      ) : null}

                      {summary.length > 0 ? (
                        <div className="vote-summary" aria-label={`Resultados de ${topic.titulo}`}>
                          {summary.map((item) => (
                            <div key={`${topic.id}-${item.opcion}`}>
                              <span>{formatVoteOption(item.opcion)}</span>
                              <strong>{item.total}</strong>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <p className="muted">No hay temas de votación disponibles.</p>
              )}
            </div>
          </section>

          <section className="panel suggestion-panel">
            <div className="panel-heading">
              <h2>Sugerir tema</h2>
              <span>{suggestionLoading ? 'Guardando...' : `${topicSuggestions.length} sugerencia(s)`}</span>
            </div>
            {canSuggestTopics(profile) ? (
              <form className="form" onSubmit={handleCreateTopicSuggestion}>
                <label>
                  Título
                  <input
                    value={suggestionForm.titulo}
                    onChange={(event) => setSuggestionForm((current) => ({ ...current, titulo: event.target.value }))}
                    minLength={4}
                    required
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    value={suggestionForm.descripcion}
                    onChange={(event) => setSuggestionForm((current) => ({ ...current, descripcion: event.target.value }))}
                    rows={3}
                  />
                </label>
                <fieldset className="radio-group">
                  <legend>Tipo de votación</legend>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tipo_votacion"
                      value="binaria"
                      checked={suggestionForm.tipo === 'binaria'}
                      onChange={() => setSuggestionForm((current) => ({ ...current, tipo: 'binaria', opciones: ['', ''] }))}
                    />
                    Binaria
                    <span className="radio-hint">el órgano decide las opciones al aprobarla</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tipo_votacion"
                      value="opciones"
                      checked={suggestionForm.tipo === 'opciones'}
                      onChange={() => setSuggestionForm((current) => ({ ...current, tipo: 'opciones', opciones: ['', ''] }))}
                    />
                    Opciones libres
                    <span className="radio-hint">especifica las alternativas tú mismo</span>
                  </label>
                </fieldset>
                {suggestionForm.tipo === 'opciones' ? (
                  <div className="suggestion-options">
                    <p className="hint">Escribe cada opción que el afiliado podrá elegir al votar.</p>
                    {suggestionForm.opciones.map((option, index) => (
                      <label key={`suggestion-option-${index}`}>
                        Opción {index + 1}
                        <input
                          value={option}
                          onChange={(event) => updateSuggestionOption(index, event.target.value)}
                          placeholder={`Opción ${index + 1}`}
                        />
                      </label>
                    ))}
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => setSuggestionForm((current) => ({ ...current, opciones: [...current.opciones, ''] }))}
                    >
                      Agregar opción
                    </button>
                  </div>
                ) : null}
                <button type="submit" disabled={suggestionLoading}>
                  Enviar sugerencia
                </button>
              </form>
            ) : (
              <p className="hint">Solo afiliados activos pueden sugerir temas. Las sugerencias no se convierten automáticamente en votaciones.</p>
            )}

            <div className="request-list">
              {topicSuggestions.length > 0 ? (
                topicSuggestions.map((suggestion) => {
                  const convertedTopic = suggestion.tema_id_generado
                    ? topics.find((t) => t.id === suggestion.tema_id_generado)
                    : null;
                  return (
                    <div className="request-item" key={suggestion.id}>
                      <div>
                        <strong>{suggestion.titulo}</strong>
                        <p className="muted">
                          <span className={`state-pill state-${suggestion.estado}`}>{formatSuggestionState(suggestion.estado)}</span>
                          {' '}{formatSuggestionType(suggestion.tipo_votacion_sugerido)} — {new Date(suggestion.created_at).toLocaleString('es-PE')}
                        </p>
                        {suggestion.opciones_sugeridas.length > 0 ? (
                          <p className="hint">Opciones sugeridas: {suggestion.opciones_sugeridas.join(' / ')}</p>
                        ) : null}
                        {suggestion.estado === 'pendiente' ? (
                          <p className="hint">En revisión por el equipo operativo.</p>
                        ) : suggestion.estado === 'aprobado' ? (
                          <p className="hint">Aprobada. Puede convertirse en tema oficial de votación.</p>
                        ) : suggestion.estado === 'rechazado' ? (
                          <p className="hint">Rechazada por el equipo operativo.</p>
                        ) : null}
                        {suggestion.revision_comentario ? (
                          <p className="hint">Comentario: {suggestion.revision_comentario}</p>
                        ) : null}
                        {convertedTopic ? (
                          <p className="hint">Convertida en tema oficial: <strong>{convertedTopic.titulo}</strong></p>
                        ) : suggestion.tema_id_generado ? (
                          <p className="hint">Convertida en tema oficial.</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="muted">No hay sugerencias registradas.</p>
              )}
            </div>
          </section>

          {isAdmin ? (
          <section className="panel admin-panel">
            <div className="panel-heading">
              <h2>Panel operativo</h2>
              <div className="panel-heading-actions">
                <span>{panelLoading ? 'Cargando...' : `${adminUserCount} registros`}</span>
                {isFounder ? (
                  <button
                    className="secondary"
                    type="button"
                    disabled={panelLoading || adminUsers.length === 0}
                    onClick={handleFilteredUsersExport}
                  >
                    Exportar CSV
                  </button>
                ) : null}
              </div>
            </div>

            <div className="admin-nav-wrap">
              <button
                className="secondary admin-menu-button"
                type="button"
                aria-expanded={adminMenuOpen}
                aria-label="Abrir menú del panel"
                onClick={() => setAdminMenuOpen((open) => !open)}
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </button>
              <nav className={`admin-nav ${adminMenuOpen ? 'open' : ''}`} aria-label="Secciones del panel operativo">
                {adminNavItems.map((item) => (
                  <button
                    className={adminSection === item.key ? 'active' : ''}
                    type="button"
                    key={item.key}
                    onClick={() => {
                      setAdminSection(item.key);
                      setAdminMenuOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    {typeof item.count === 'number' ? <strong>{item.count}</strong> : null}
                  </button>
                ))}
              </nav>
            </div>

            <section className={adminSection === 'resumen' ? 'admin-section active' : 'admin-section'} aria-label="Resumen operativo">
            <div className="stats-grid" aria-label="Resumen operativo">
              <div>
                <span>Validación</span>
                <strong>{operationalStats.pendingValidation}</strong>
              </div>
              <div>
                <span>Afiliación</span>
                <strong>{operationalStats.pendingAffiliation}</strong>
              </div>
              <div>
                <span>Desafiliación</span>
                <strong>{operationalStats.pendingDisaffiliation}</strong>
              </div>
              <div>
                <span>Recuperación</span>
                <strong>{operationalStats.pendingRecovery}</strong>
              </div>
              <div>
                <span>Activos</span>
                <strong>{operationalStats.activeUsers}</strong>
              </div>
              <div>
                <span>Afiliados</span>
                <strong>{operationalStats.activeAffiliates}</strong>
              </div>
            </div>

            {operationalAlerts.length > 0 ? (
              <div className="alert-list" aria-label="Alertas operativas">
                {operationalAlerts.map((alert) => (
                  <div key={alert.label}>
                    <strong>{alert.label}</strong>
                    <span>{alert.detail}</span>
                  </div>
                ))}
              </div>
            ) : null}
            </section>

            <section className={adminSection === 'votaciones' ? 'admin-section admin-voting-panel active' : 'admin-section admin-voting-panel'}>
              <div className="panel-heading">
                <h2>Control de votaciones</h2>
                <button className="secondary" type="button" disabled={votingLoading} onClick={handleCreateTopic}>
                  Crear tema
                </button>
              </div>
              <div className="request-list">
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <div className="request-item" key={`admin-${topic.id}`}>
                      <div>
                        <strong>{topic.titulo}</strong>
                        <p className="muted">
                          <span className={`state-pill state-${topic.estado}`}>{formatTopicState(topic.estado)}</span>
                          {' '}{formatTopicAudience(topic.publico_objetivo)} — {formatTopicType(topic.tipo_votacion)} — {new Date(topic.creado_en).toLocaleString('es-PE')}
                        </p>
                        {topic.tipo_votacion === 'opciones' && topic.opciones.length > 0 ? (
                          <p className="hint">Opciones: {topic.opciones.join(' / ')}</p>
                        ) : null}
                      </div>
                      <div className="row-actions">
                        {topic.estado === 'borrador' ? (
                          <button type="button" disabled={votingLoading} onClick={() => handleTopicState(topic, 'abierto')}>
                            Abrir
                          </button>
                        ) : null}
                        {topic.estado === 'abierto' ? (
                          <button type="button" disabled={votingLoading} onClick={() => handleTopicState(topic, 'cerrado')}>
                            Cerrar
                          </button>
                        ) : null}
                        {topic.estado !== 'anulado' && topic.estado !== 'cerrado' ? (
                          <button className="danger" type="button" disabled={votingLoading} onClick={() => handleTopicState(topic, 'anulado')}>
                            Anular
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="muted">No hay temas creados.</p>
                )}
              </div>
            </section>

            <section className={adminSection === 'sugerencias' ? 'admin-section active' : 'admin-section'} aria-label="Sugerencias de temas">
              <div className="panel-heading">
                <h2>Sugerencias de temas</h2>
                <span>{pendingTopicSuggestions} por revisar</span>
              </div>
              <label>
                Filtrar por estado
                <select
                  value={adminSuggestionFilter}
                  onChange={(event) => setAdminSuggestionFilter(event.target.value as 'todos' | EstadoTemaSugerencia)}
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobada</option>
                  <option value="rechazado">Rechazada</option>
                  <option value="convertido">Convertida</option>
                </select>
              </label>
              <div className="request-list">
                {adminFilteredSuggestions.length > 0 ? (
                  adminFilteredSuggestions.map((suggestion) => {
                    const submitter = suggestionProfiles[suggestion.created_by];
                    return (
                      <div className="request-item" key={`admin-suggestion-${suggestion.id}`}>
                        <div>
                          <strong>{suggestion.titulo}</strong>
                          <p className="muted">
                            <span className={`state-pill state-${suggestion.estado}`}>{formatSuggestionState(suggestion.estado)}</span>
                            {' '}{formatSuggestionType(suggestion.tipo_votacion_sugerido)} — {new Date(suggestion.created_at).toLocaleString('es-PE')}
                          </p>
                          {submitter ? (
                            <p className="hint">Enviada por: {submitter.nombres} ({maskDni(submitter.dni)})</p>
                          ) : null}
                          {suggestion.descripcion ? <p className="hint">{suggestion.descripcion}</p> : null}
                          {suggestion.opciones_sugeridas.length > 0 ? (
                            <p className="hint">Opciones sugeridas: {suggestion.opciones_sugeridas.join(' / ')}</p>
                          ) : null}
                          {suggestion.revision_comentario ? <p className="hint">Comentario: {suggestion.revision_comentario}</p> : null}
                          {suggestion.tema_id_generado ? (
                            <p className="hint">
                              Tema generado:{' '}
                              {topics.find((t) => t.id === suggestion.tema_id_generado)?.titulo ?? suggestion.tema_id_generado}
                            </p>
                          ) : null}
                        </div>
                        <div className="row-actions">
                          {suggestion.estado === 'pendiente' ? (
                            <button
                              type="button"
                              disabled={suggestionLoading}
                              onClick={() => handleReviewTopicSuggestion(suggestion, 'aprobar')}
                            >
                              Aprobar
                            </button>
                          ) : null}
                          {suggestion.estado === 'pendiente' || suggestion.estado === 'aprobado' ? (
                            <>
                              <button
                                className="secondary"
                                type="button"
                                disabled={suggestionLoading}
                                onClick={() => handleReviewTopicSuggestion(suggestion, 'convertir')}
                              >
                                Convertir
                              </button>
                              <button
                                className="danger"
                                type="button"
                                disabled={suggestionLoading}
                                onClick={() => handleReviewTopicSuggestion(suggestion, 'rechazar')}
                              >
                                Rechazar
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="muted">
                    {adminSuggestionFilter === 'todos'
                      ? 'No hay sugerencias registradas.'
                      : 'No hay sugerencias con ese estado.'}
                  </p>
                )}
              </div>
            </section>

            <section className={adminSection === 'usuarios' ? 'admin-section active' : 'admin-section'} aria-label="Usuarios">
            <label>
              Buscar por DNI
              <input
                inputMode="numeric"
                maxLength={8}
                value={adminDniFilter}
                onChange={(event) => {
                  setAdminPage(0);
                  setAdminDniFilter(normalizeDni(event.target.value));
                }}
              />
            </label>

            <div className="filter-grid">
              <label>
                Estado
                <select
                  value={adminEstadoFilter}
                  onChange={(event) => {
                    setAdminPage(0);
                    setAdminEstadoFilter(event.target.value as AdminEstadoFilter);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activo</option>
                  <option value="anulado">Anulado</option>
                  <option value="desafiliado">Desafiliado</option>
                </select>
              </label>
              <label>
                Tipo
                <select
                  value={adminTipoFilter}
                  onChange={(event) => {
                    setAdminPage(0);
                    setAdminTipoFilter(event.target.value as AdminTipoFilter);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="adherente">Adherente</option>
                  <option value="afiliado">Afiliado</option>
                </select>
              </label>
              <label>
                Rol
                <select
                  value={adminRolFilter}
                  onChange={(event) => {
                    setAdminPage(0);
                    setAdminRolFilter(event.target.value as AdminRolFilter);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="usuario">Usuario</option>
                  <option value="administrador">Administrador</option>
                  <option value="fundador">Fundador</option>
                </select>
              </label>
              <label>
                Validación
                <select
                  value={adminValidationFilter}
                  onChange={(event) => {
                    setAdminPage(0);
                    setAdminValidationFilter(event.target.value as AdminValidationFilter);
                  }}
                >
                  <option value="todos">Todas</option>
                  <option value="validado">Validado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </label>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombres</th>
                    <th>Rol</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Validación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="table-empty">
                        {panelLoading ? 'Cargando usuarios...' : 'No se encontraron usuarios con los filtros actuales.'}
                      </td>
                    </tr>
                  ) : null}
                  {adminUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.dni}</td>
                      <td>{user.nombres}</td>
                      <td>{user.rol_sistema}</td>
                      <td>{user.tipo_miembro}</td>
                      <td><span className={`state-pill state-${user.estado}`}>{user.estado}</span></td>
                      <td>{user.validado_manualmente ? 'validado' : 'pendiente'}</td>
                      <td className="row-actions">
                        <button
                          className="secondary"
                          type="button"
                          disabled={panelLoading}
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          Ver
                        </button>
                        <button
                          className="secondary"
                          type="button"
                          disabled={panelLoading || user.validado_manualmente || user.estado !== 'activo'}
                          onClick={() => runProfileRpc('validar_usuario', user.id)}
                        >
                          Validar
                        </button>
                        <button
                          className="danger"
                          type="button"
                          disabled={panelLoading || user.user_id === session.user.id || user.estado === 'anulado'}
                          onClick={() => runProfileRpc('anular_usuario', user.id)}
                        >
                          Anular
                        </button>
                        <button
                          className="secondary"
                          type="button"
                          disabled={panelLoading || user.user_id === session.user.id || user.estado === 'activo'}
                          onClick={() => runReactivateUserRpc(user.id)}
                        >
                          Reactivar
                        </button>
                        {profile?.rol_sistema === 'fundador' ? (
                          <button
                            className="secondary"
                            type="button"
                            disabled={panelLoading || user.user_id === session.user.id || user.estado !== 'activo'}
                            onClick={() => runRoleRpc(user.id)}
                          >
                            Rol
                          </button>
                        ) : null}
                        {isFounder ? <ContactActions email={user.correo_contacto} phone={user.telefono} /> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pager">
              <button className="secondary" type="button" disabled={adminPage === 0} onClick={() => setAdminPage((page) => page - 1)}>
                Anterior
              </button>
              <span>Página {adminPage + 1}</span>
              <button
                className="secondary"
                type="button"
                disabled={(adminPage + 1) * pageSize >= adminUserCount}
                onClick={() => setAdminPage((page) => page + 1)}
              >
                Siguiente
              </button>
            </div>
            </section>

            {selectedUser ? (
              <section className={adminSection === 'usuarios' ? 'detail-panel active' : 'detail-panel'}>
                <div className="panel-heading">
                  <h2>Detalle de usuario</h2>
                  <div className="row-actions">
                    <button
                      className="secondary"
                      type="button"
                      disabled={panelLoading}
                      onClick={() => runOperationalProfileUpdate(selectedUser)}
                    >
                      Editar
                    </button>
                    <button className="secondary" type="button" onClick={() => setSelectedUserId('')}>
                      Cerrar
                    </button>
                  </div>
                </div>
                <dl className="profile-grid">
                  <div>
                    <dt>DNI</dt>
                    <dd>{selectedUser.dni}</dd>
                  </div>
                  <div>
                    <dt>Nombres</dt>
                    <dd>{selectedUser.nombres}</dd>
                  </div>
                  <div>
                    <dt>Teléfono</dt>
                    <dd>{selectedUser.telefono ?? '-'}</dd>
                  </div>
                  {isFounder && (selectedUser.correo_contacto || selectedUser.telefono) ? (
                    <div>
                      <dt>Contacto</dt>
                      <dd>
                        <ContactActions email={selectedUser.correo_contacto} phone={selectedUser.telefono} />
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Creado</dt>
                    <dd>{selectedUser.creado_en ? new Date(selectedUser.creado_en).toLocaleString() : '-'}</dd>
                  </div>
                  <div>
                    <dt>Rol</dt>
                    <dd>{selectedUser.rol_sistema}</dd>
                  </div>
                  <div>
                    <dt>Tipo</dt>
                    <dd>{selectedUser.tipo_miembro}</dd>
                  </div>
                  <div>
                    <dt>Estado</dt>
                    <dd><span className={`state-pill state-${selectedUser.estado}`}>{selectedUser.estado}</span></dd>
                  </div>
                  <div>
                    <dt>Validación</dt>
                    <dd>{selectedUser.validado_manualmente ? 'validado' : 'pendiente'}</dd>
                  </div>
                </dl>

                <h2>Auditoría del usuario</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Acción</th>
                        <th>Tabla</th>
                        <th>Cambio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserLogs.length > 0 ? (
                        selectedUserLogs.map((log) => (
                          <tr key={log.id}>
                            <td>{new Date(log.creado_en).toLocaleString()}</td>
                            <td>{formatAuditAction(log.accion)}</td>
                            <td>{formatAuditTable(log.tabla)}</td>
                            <td>
                              <code>{JSON.stringify(log.despues ?? log.antes ?? {})}</code>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4}>Sin eventos recientes.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <section className={adminSection === 'solicitudes' ? 'admin-section active' : 'admin-section'} aria-label="Solicitudes">
            <h2>Solicitudes de afiliación</h2>
            <div className="request-list">
              {affiliationRequests.length > 0 ? (
                affiliationRequests.map((request) => (
                  <div className="request-item" key={request.id}>
                    <div>
                      <strong>{requestProfiles[request.usuario_id]?.nombres ?? request.usuario_id}</strong>
                      <p className="muted">
                        {maskDni(requestProfiles[request.usuario_id]?.dni)} -{' '}
                        {new Date(request.creado_en).toLocaleString()}
                      </p>
                    </div>
                    <div className="row-actions">
                      <button type="button" disabled={panelLoading} onClick={() => runAffiliationRpc('aprobar_afiliacion', request.id)}>
                        Aprobar
                      </button>
                      <button
                        className="secondary"
                        type="button"
                        disabled={panelLoading}
                        onClick={() => runAffiliationRpc('rechazar_afiliacion', request.id)}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">No hay solicitudes pendientes.</p>
              )}
            </div>

            <h2>Solicitudes de desafiliación</h2>
            <div className="request-list">
              {disaffiliationRequests.length > 0 ? (
                disaffiliationRequests.map((request) => (
                  <div className="request-item" key={request.id}>
                    <div>
                      <strong>{requestProfiles[request.usuario_id]?.nombres ?? request.usuario_id}</strong>
                      <p className="muted">
                        {maskDni(requestProfiles[request.usuario_id]?.dni)} -{' '}
                        {new Date(request.creado_en).toLocaleString()}
                      </p>
                    </div>
                    <div className="row-actions">
                      <button
                        type="button"
                        disabled={panelLoading}
                        onClick={() => runDisaffiliationRpc('aprobar_desafiliacion', request.id)}
                      >
                        Aprobar
                      </button>
                      <button
                        className="secondary"
                        type="button"
                        disabled={panelLoading}
                        onClick={() => runDisaffiliationRpc('rechazar_desafiliacion', request.id)}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">No hay solicitudes pendientes.</p>
              )}
            </div>

            <h2>Recuperación de acceso</h2>
            <div className="request-list">
              {recoveryRequests.length > 0 ? (
                recoveryRequests.map((request) => {
                  const linkedProfile = request.perfil_id ? requestProfiles[request.perfil_id] : null;

                  return (
                    <div className="request-item" key={request.id}>
                      <div>
                        <strong>{linkedProfile?.nombres ?? 'Revisión manual'}</strong>
                        <p className="muted">
                          DNI {maskDni(request.dni)} - Teléfono {request.telefono_contacto} - {new Date(request.creado_en).toLocaleString()}
                        </p>
                        {request.comentario_usuario ? <p className="hint">{request.comentario_usuario}</p> : null}
                      </div>
                      <div className="row-actions">
                        <button type="button" disabled={panelLoading} onClick={() => runRecoveryRpc(request.id, 'aprobada')}>
                          Resuelto
                        </button>
                        <button
                          className="secondary"
                          type="button"
                          disabled={panelLoading}
                          onClick={() => runRecoveryRpc(request.id, 'rechazada')}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="muted">No hay solicitudes pendientes.</p>
              )}
            </div>

            </section>

            <section className={adminSection === 'password' ? 'admin-section active' : 'admin-section'} aria-label="Restablecer contraseña">
              <form className="form" onSubmit={handleManualPasswordReset}>
                <h2>Restablecer contraseña</h2>
                <label>
                  Usuario visible
                  <select value={passwordResetUserId} onChange={(event) => setPasswordResetUserId(event.target.value)}>
                    <option value="">Seleccionar</option>
                    {adminUsers.map((user) => (
                      <option value={user.user_id} key={user.id}>
                        {user.dni} - {user.nombres}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Contraseña temporal generada
                  <input type="text" value={temporaryPassword} readOnly />
                </label>
                <button className="secondary" type="button" onClick={() => setTemporaryPassword(generateTemporaryPassword())}>
                  Generar otra
                </button>
                <p className="hint">Comunica la contraseña temporal por el correo o WhatsApp registrado. No se guarda en el sistema.</p>
                {passwordResetUser ? (
                  <div className="request-item">
                    <div>
                      <strong>{passwordResetUser.nombres}</strong>
                      <p className="muted">DNI {maskDni(passwordResetUser.dni)}</p>
                    </div>
                    <ContactActions
                      email={passwordResetUser.correo_contacto}
                      phone={passwordResetUser.telefono}
                      subject="Contraseña temporal Liberales PE"
                      message={passwordResetMessage}
                    />
                  </div>
                ) : null}
                <button type="submit" disabled={panelLoading || !passwordResetUserId}>
                  Restablecer contraseña
                </button>
              </form>
            </section>

            <section className={adminSection === 'auditoria' ? 'admin-section active' : 'admin-section'} aria-label="Auditoría reciente">
            <h2>Auditoría reciente</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Acción</th>
                    <th>Tabla</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        {panelLoading ? 'Cargando auditoría...' : 'Sin eventos registrados.'}
                      </td>
                    </tr>
                  ) : null}
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.creado_en).toLocaleString()}</td>
                      <td>{formatAuditAction(log.accion)}</td>
                      <td>{formatAuditTable(log.tabla)}</td>
                      <td>{log.registro_id ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </section>
          </section>
          ) : null}
        </>
      ) : supabaseConfigReady && isPasswordRecoveryPath ? (
        <section className="auth-grid">
          <form className="panel form" onSubmit={handleRecoveryRequest}>
            <h2>Recuperar contraseña</h2>
            <p className="muted">Solicita al fundador o administrador que restablezca tu contraseña.</p>
            <label>
              DNI
              <input
                inputMode="numeric"
                maxLength={8}
                value={recoveryForm.dni}
                onChange={(event) => setRecoveryForm((current) => ({ ...current, dni: normalizeDni(event.target.value) }))}
                autoComplete="username"
              />
            </label>
            <label>
              Teléfono de contacto
              <input
                inputMode="tel"
                value={recoveryForm.telefono}
                onChange={(event) => setRecoveryForm((current) => ({ ...current, telefono: event.target.value }))}
                autoComplete="tel"
              />
            </label>
            <label>
              Mensaje opcional
              <textarea
                value={recoveryForm.comentario}
                onChange={(event) => setRecoveryForm((current) => ({ ...current, comentario: event.target.value }))}
                rows={4}
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Solicitar ayuda'}
            </button>
            <a className="link-button" href="/">
              Volver al login
            </a>
          </form>
        </section>
      ) : supabaseConfigReady ? (
        <section className="auth-grid">
          <div className="tabs" aria-label="Modo de acceso">
            <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>
              Ingresar
            </button>
            <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>
              Registrar
            </button>
            <button className={mode === 'recover' ? 'active' : ''} type="button" onClick={() => setMode('recover')}>
              Recuperar
            </button>
          </div>

          {mode === 'login' ? (
            <form className="panel form" onSubmit={handleLogin}>
              <h2>Ingreso</h2>
              <label>
                DNI
                <input
                  inputMode="numeric"
                  maxLength={8}
                  value={loginDni}
                  onChange={(event) => setLoginDni(normalizeDni(event.target.value))}
                  autoComplete="username"
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? 'Validando...' : 'Ingresar'}
              </button>
              <a className="link-button" href="/recuperar-password">
                ¿Olvidaste tu contraseña?
              </a>
            </form>
          ) : null}

          {mode === 'register' ? (
            <RegisterScreen
              onRegistered={() => {
                setError('');
                setMode('login');
                setStatus('Cuenta registrada. Ingresa con tu DNI y contraseña.');
              }}
              onLogin={() => setMode('login')}
            />
          ) : null}

          {mode === 'recover' ? (
            <form className="panel form" onSubmit={handleRecoveryRequest}>
              <h2>Revisión manual</h2>
              <label>
                DNI
                <input
                  inputMode="numeric"
                  maxLength={8}
                  value={recoveryForm.dni}
                  onChange={(event) =>
                    setRecoveryForm((current) => ({ ...current, dni: normalizeDni(event.target.value) }))
                  }
                  autoComplete="username"
                />
              </label>
              <label>
                Teléfono de contacto
                <input
                  inputMode="tel"
                  value={recoveryForm.telefono}
                  onChange={(event) => setRecoveryForm((current) => ({ ...current, telefono: event.target.value }))}
                  autoComplete="tel"
                />
              </label>
              <label>
                Comentario
                <textarea
                  value={recoveryForm.comentario}
                  onChange={(event) => setRecoveryForm((current) => ({ ...current, comentario: event.target.value }))}
                  rows={4}
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Solicitar revisión'}
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      {status ? <p className="status">{status}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
