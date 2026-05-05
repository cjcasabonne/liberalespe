import { FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { dniToAuthEmail, isValidDni, legacyDniToAuthEmail, maskDni, normalizeDni } from './lib/auth';
import { supabase, supabaseConfigReady } from './lib/supabase';
import { ContactActions } from './ContactActions';
import { RegisterScreen } from './RegisterScreen';
import type {
  AuditLog,
  EstadoTema,
  OpcionVoto,
  Perfil,
  SolicitudAfiliacion,
  SolicitudDesafiliacion,
  SolicitudRecuperacion,
  Tema,
  VoteSummary,
  Voto,
} from './types';
import './styles.css';

type Mode = 'login' | 'register' | 'recover';
type AdminEstadoFilter = 'todos' | 'activo' | 'anulado' | 'desafiliado';
type AdminTipoFilter = 'todos' | 'adherente' | 'afiliado';
type AdminRolFilter = 'todos' | 'usuario' | 'administrador' | 'fundador';
type AdminValidationFilter = 'todos' | 'validado' | 'pendiente';

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
const temaSelectColumns = 'id,titulo,descripcion,estado,creado_por,creado_en,actualizado_en,abre_en,cierra_en';
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

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    actualizar_perfil_operativo: 'Actualizar perfil operativo',
    actualizar_telefono: 'Actualizar teléfono',
    anular_usuario: 'Anular usuario',
    aprobar_afiliacion: 'Aprobar afiliación',
    aprobar_desafiliacion: 'Aprobar desafiliación',
    cambiar_rol_sistema: 'Cambiar rol del sistema',
    rechazar_afiliacion: 'Rechazar afiliación',
    rechazar_desafiliacion: 'Rechazar desafiliación',
    resolver_recuperacion: 'Resolver recuperación',
    exportar_usuarios_filtrados: 'Exportar usuarios filtrados',
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

function formatVoteOption(option: OpcionVoto) {
  const labels: Record<OpcionVoto, string> = {
    si: 'Sí',
    no: 'No',
    abstencion: 'Abstención',
  };

  return labels[option];
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

function topicStateDetail(topic: Tema) {
  if (topic.estado === 'abierto' && topic.cierra_en) {
    return `Cierra ${new Date(topic.cierra_en).toLocaleString('es-PE')}`;
  }

  if (topic.estado === 'borrador') {
    return 'Pendiente de apertura administrativa.';
  }

  if (topic.estado === 'cerrado') {
    return 'Resultados disponibles.';
  }

  return 'Tema anulado.';
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

  const isAdmin = profile?.estado === 'activo' && ['administrador', 'fundador'].includes(profile.rol_sistema);
  const isFounder = profile?.estado === 'activo' && profile.rol_sistema === 'fundador';
  const selectedUser = adminUsers.find((user) => user.id === selectedUserId) ?? null;
  const operationalAlerts = buildOperationalAlerts(operationalStats, auditLogs);

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
      setError('No se encontró un perfil operativo asociado a esta cuenta.');
      return;
    }

    setProfile(data as Perfil);
  }

  async function loadVotingData() {
    if (!supabase || !profile) {
      return;
    }

    const client = supabase;
    setVotingLoading(true);
    const [topicsResult, ownVotesResult] = await Promise.all([
      client.from('temas').select(temaSelectColumns).order('creado_en', { ascending: false }).limit(30),
      client
        .from('votos')
        .select('id,tema_id,usuario_id,opcion,creado_en')
        .eq('usuario_id', profile.id)
        .order('creado_en', { ascending: false }),
    ]);
    setVotingLoading(false);

    if (topicsResult.error || ownVotesResult.error) {
      setTopics([]);
      setOwnVotes([]);
      setVoteSummaries({});
      return;
    }

    const nextTopics = (topicsResult.data ?? []) as Tema[];
    setTopics(nextTopics);
    setOwnVotes((ownVotesResult.data ?? []) as Voto[]);

    const summaries = await Promise.all(
      nextTopics
        .filter((topic) => isAdmin || topic.estado === 'cerrado')
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

    const confirmed = window.confirm('Confirmar cambio de rol del usuario seleccionado.');
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

  async function handleVote(topicId: string, option: OpcionVoto) {
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
    const confirmed = window.confirm('Crear tema en estado borrador.');
    if (!confirmed) {
      return;
    }

    setError('');
    setStatus('');
    setVotingLoading(true);
    const { error: topicError } = await supabase.rpc('crear_tema_controlado', {
      p_titulo: title,
      p_descripcion: description,
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
        <div>
          <h1>Liberales PE</h1>
          <p>Padrón operativo</p>
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
                  <dd>{profile.estado}</dd>
                </div>
                <div>
                  <dt>Validación</dt>
                  <dd>{profile.validado_manualmente ? 'validación manual' : 'pendiente'}</dd>
                </div>
              </dl>
              {profile.estado === 'activo' ? (
                <button className="secondary section-action" type="button" disabled={loading} onClick={handleUpdatePhone}>
                  Actualizar teléfono
                </button>
              ) : null}
              {profile.estado === 'activo' && profile.tipo_miembro === 'adherente' ? (
                <button className="secondary section-action" type="button" disabled={loading} onClick={handleSolicitarAfiliacion}>
                  Solicitar afiliación
                </button>
              ) : null}
              {profile.estado === 'activo' ? (
                <button className="secondary section-action" type="button" disabled={loading} onClick={handleSolicitarDesafiliacion}>
                  Solicitar desafiliación
                </button>
              ) : null}
            </>
          ) : (
            <p className="muted">Cargando perfil...</p>
          )}
          </section>

          <section className="panel voting-panel">
            <div className="panel-heading">
              <h2>Votaciones</h2>
              <span>{votingLoading ? 'Cargando...' : `${topics.length} tema(s)`}</span>
            </div>
            {profile?.tipo_miembro !== 'afiliado' || profile.estado !== 'activo' ? (
              <p className="hint">Solo afiliados activos pueden emitir voto. Los temas cerrados pueden consultarse segÃºn permisos.</p>
            ) : null}
            <div className="topic-list">
              {topics.length > 0 ? (
                topics.map((topic) => {
                  const vote = ownVotes.find((currentVote) => currentVote.tema_id === topic.id);
                  const summary = voteSummaries[topic.id] ?? [];
                  const canVote = profile?.estado === 'activo' && profile.tipo_miembro === 'afiliado' && topic.estado === 'abierto' && !vote;

                  return (
                    <article className="topic-item" key={topic.id}>
                      <div className="topic-main">
                        <div className="topic-title-row">
                          <h3>{topic.titulo}</h3>
                          <span className={`state-pill state-${topic.estado}`}>{formatTopicState(topic.estado)}</span>
                        </div>
                        {topic.descripcion ? <p className="muted">{topic.descripcion}</p> : null}
                        <p className="hint">{topicStateDetail(topic)}</p>
                        {vote ? (
                          <p className="hint">Tu voto: {formatVoteOption(vote.opcion)} - {new Date(vote.creado_en).toLocaleString('es-PE')}</p>
                        ) : null}
                      </div>

                      {canVote ? (
                        <div className="vote-actions">
                          <button type="button" disabled={votingLoading} onClick={() => handleVote(topic.id, 'si')}>
                            SÃ­
                          </button>
                          <button className="secondary" type="button" disabled={votingLoading} onClick={() => handleVote(topic.id, 'no')}>
                            No
                          </button>
                          <button
                            className="secondary"
                            type="button"
                            disabled={votingLoading}
                            onClick={() => handleVote(topic.id, 'abstencion')}
                          >
                            AbstenciÃ³n
                          </button>
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
                <p className="muted">No hay temas de votaciÃ³n disponibles.</p>
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

            <section className="admin-voting-panel">
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
                          {formatTopicState(topic.estado)} - {new Date(topic.creado_en).toLocaleString('es-PE')}
                        </p>
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
                  {adminUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.dni}</td>
                      <td>{user.nombres}</td>
                      <td>{user.rol_sistema}</td>
                      <td>{user.tipo_miembro}</td>
                      <td>{user.estado}</td>
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

            {selectedUser ? (
              <section className="detail-panel">
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
                    <dd>{selectedUser.estado}</dd>
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
          ) : null}
        </>
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
