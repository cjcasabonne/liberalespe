import { FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { dniToAuthEmail, isValidDni, legacyDniToAuthEmail, maskDni, normalizeDni } from './lib/auth';
import { supabase, supabaseConfigReady } from './lib/supabase';
import { ContactActions } from './ContactActions';
import { RegisterScreen } from './RegisterScreen';
import type { AuditLog, Perfil, SolicitudAfiliacion, SolicitudDesafiliacion, SolicitudRecuperacion } from './types';
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

const pageSize = 10;
const perfilSelectColumns =
  'id,user_id,dni,nombres,telefono,correo_contacto,rol_sistema,tipo_miembro,estado,validado_manualmente';
const perfilSelectColumnsWithCreated = `${perfilSelectColumns},creado_en`;
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

  const isAdmin = profile?.estado === 'activo' && ['administrador', 'fundador'].includes(profile.rol_sistema);
  const isFounder = profile?.estado === 'activo' && profile.rol_sistema === 'fundador';
  const selectedUser = adminUsers.find((user) => user.id === selectedUserId) ?? null;

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

    const motivo = window.prompt('Motivo de desafiliación')?.trim();
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
        ? { usuario_id: usuarioId, motivo: window.prompt('Motivo de anulación')?.trim() }
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
        ? { solicitud_id: solicitudId, comentario: window.prompt('Comentario de rechazo')?.trim() }
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
      action === 'rechazar_desafiliacion' ? window.prompt('Comentario de rechazo')?.trim() : null;

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

    const motivo = window.prompt('Motivo de corrección operativa')?.trim();
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
          {isAdmin ? (
          <section className="panel admin-panel">
            <div className="panel-heading">
              <h2>Panel operativo</h2>
              <span>{panelLoading ? 'Cargando...' : `${adminUserCount} registros`}</span>
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
