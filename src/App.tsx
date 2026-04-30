import { FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { dniToAuthEmail, isValidDni, normalizeDni } from './lib/auth';
import { buscarDni } from './lib/dniService';
import { supabase, supabaseConfigReady } from './lib/supabase';
import type { AuditLog, Perfil, SolicitudAfiliacion, SolicitudDesafiliacion } from './types';
import './styles.css';

type Mode = 'login' | 'register';

const neutralRegisterError =
  'No se pudo completar el registro. Si ya tienes una cuenta o necesitas recuperar acceso, solicita revision manual.';
const pageSize = 10;

function emptyRegisterForm() {
  return {
    dni: '',
    nombres: '',
    telefono: '',
    password: '',
  };
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [mode, setMode] = useState<Mode>('login');
  const [loginDni, setLoginDni] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dniLookupLoading, setDniLookupLoading] = useState(false);
  const [dniLookupMessage, setDniLookupMessage] = useState('');
  const [adminUsers, setAdminUsers] = useState<Perfil[]>([]);
  const [adminUserCount, setAdminUserCount] = useState(0);
  const [adminPage, setAdminPage] = useState(0);
  const [adminDniFilter, setAdminDniFilter] = useState('');
  const [affiliationRequests, setAffiliationRequests] = useState<SolicitudAfiliacion[]>([]);
  const [disaffiliationRequests, setDisaffiliationRequests] = useState<SolicitudDesafiliacion[]>([]);
  const [requestProfiles, setRequestProfiles] = useState<Record<string, Perfil>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

  const isAdmin = profile?.estado === 'activo' && ['administrador', 'fundador'].includes(profile.rol_sistema);

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
      setRequestProfiles({});
      setAuditLogs([]);
      return;
    }

    void loadPanelData();
  }, [isAdmin, adminPage, adminDniFilter]);

  async function loadProfile() {
    if (!supabase) {
      return;
    }

    setError('');
    const { data, error: profileError } = await supabase
      .from('perfiles')
      .select('id,user_id,dni,nombres,telefono,rol_sistema,tipo_miembro,estado,validado_manualmente')
      .eq('user_id', session?.user.id)
      .single();

    if (profileError) {
      setProfile(null);
      setError('No se encontro un perfil operativo asociado a esta cuenta.');
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
      .select('id,user_id,dni,nombres,telefono,rol_sistema,tipo_miembro,estado,validado_manualmente', {
        count: 'exact',
      })
      .order('creado_en', { ascending: false })
      .range(adminPage * pageSize, adminPage * pageSize + pageSize - 1);

    const dniFilter = normalizeDni(adminDniFilter);
    if (dniFilter.length === 8) {
      usersQuery = usersQuery.eq('dni', dniFilter);
    }

    const [usersResult, affiliationResult, disaffiliationResult, auditResult] = await Promise.all([
      usersQuery,
      supabase
        .from('solicitudes_afiliacion')
        .select('id,usuario_id,estado,comentario_usuario,creado_en')
        .eq('estado', 'pendiente')
        .order('creado_en', { ascending: true })
        .limit(10),
      supabase
        .from('solicitudes_desafiliacion')
        .select('id,usuario_id,estado,motivo,creado_en')
        .eq('estado', 'pendiente')
        .order('creado_en', { ascending: true })
        .limit(10),
      supabase
        .from('audit_log')
        .select('id,actor_id,sujeto_id,accion,tabla,registro_id,creado_en')
        .order('creado_en', { ascending: false })
        .limit(20),
    ]);

    setPanelLoading(false);

    if (usersResult.error || affiliationResult.error || disaffiliationResult.error || auditResult.error) {
      setError('No se pudo cargar el panel operativo.');
      return;
    }

    setAdminUsers((usersResult.data ?? []) as Perfil[]);
    const affiliationRequestsData = (affiliationResult.data ?? []) as SolicitudAfiliacion[];
    const disaffiliationRequestsData = (disaffiliationResult.data ?? []) as SolicitudDesafiliacion[];
    const requests = [...affiliationRequestsData, ...disaffiliationRequestsData];
    setAdminUserCount(usersResult.count ?? 0);
    setAffiliationRequests(affiliationRequestsData);
    setDisaffiliationRequests(disaffiliationRequestsData);
    setAuditLogs((auditResult.data ?? []) as AuditLog[]);

    if (requests.length === 0) {
      setRequestProfiles({});
      return;
    }

    const { data: requestProfileData, error: requestProfileError } = await supabase
      .from('perfiles')
      .select('id,user_id,dni,nombres,telefono,rol_sistema,tipo_miembro,estado,validado_manualmente')
      .in(
        'id',
        requests.map((request) => request.usuario_id),
      );

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

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const dni = normalizeDni(loginDni);
    if (!isValidDni(dni)) {
      setError('Ingresa un DNI valido de 8 digitos.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: dniToAuthEmail(dni),
      password: loginPassword,
    });
    setLoading(false);

    if (signInError) {
      setError('No se pudo iniciar sesion con las credenciales ingresadas.');
      return;
    }

    setStatus('Sesion iniciada.');
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const dni = normalizeDni(registerForm.dni);
    const nombres = registerForm.nombres.trim().replace(/\s+/g, ' ');
    const telefono = registerForm.telefono.trim();

    if (!isValidDni(dni)) {
      setError('Ingresa un DNI valido de 8 digitos.');
      return;
    }

    if (nombres.length < 3) {
      setError('Ingresa nombres validos.');
      return;
    }

    if (registerForm.password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: dniToAuthEmail(dni),
      password: registerForm.password,
      options: {
        data: { dni },
      },
    });

    if (signUpError || !signUpData.user) {
      setLoading(false);
      setError(neutralRegisterError);
      return;
    }

    const { error: profileError } = await supabase.from('perfiles').insert({
      user_id: signUpData.user.id,
      dni,
      nombres,
      telefono: telefono || null,
    });

    setLoading(false);

    if (profileError) {
      setError(neutralRegisterError);
      return;
    }

    setRegisterForm(emptyRegisterForm());
    setMode('login');
    setStatus('Cuenta registrada. Ingresa con tu DNI y contrasena.');
  }

  async function handleBuscarDni() {
    const dni = normalizeDni(registerForm.dni);
    setError('');
    setDniLookupMessage('');

    if (!isValidDni(dni)) {
      setError('Ingresa un DNI valido de 8 digitos antes de buscar.');
      return;
    }

    setDniLookupLoading(true);
    setDniLookupMessage('Buscando nombre...');
    const result = await buscarDni(dni);
    setDniLookupLoading(false);

    if (result.ok) {
      setRegisterForm((current) => ({ ...current, nombres: result.nombreCompleto.toUpperCase() }));
      setDniLookupMessage('Nombre autocompletado. Confirma los datos antes de registrar.');
      return;
    }

    if (result.reason === 'rate_limit') {
      setDniLookupMessage('Servicio ocupado por muchas solicitudes. Ingresa el nombre manualmente.');
      return;
    }

    setDniLookupMessage('No se pudo autocompletar. Ingresa el nombre manualmente.');
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
      setError('No se pudo registrar la solicitud de afiliacion.');
      return;
    }

    setStatus('Solicitud de afiliacion registrada para revision manual.');
  }

  async function handleSolicitarDesafiliacion() {
    if (!profile || !supabase) {
      return;
    }

    const motivo = window.prompt('Motivo de desafiliacion')?.trim();
    if (!motivo) {
      setError('La solicitud de desafiliacion requiere motivo.');
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
      setError('No se pudo registrar la solicitud de desafiliacion.');
      return;
    }

    setStatus('Solicitud de desafiliacion registrada para revision manual.');
  }

  async function runProfileRpc(action: 'validar_usuario' | 'anular_usuario', usuarioId: string) {
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');

    const params =
      action === 'anular_usuario'
        ? { usuario_id: usuarioId, motivo: window.prompt('Motivo de anulacion')?.trim() }
        : { usuario_id: usuarioId, observacion: null };

    if (action === 'anular_usuario' && !params.motivo) {
      setError('La anulacion requiere motivo.');
      return;
    }

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc(action, params);
    setPanelLoading(false);

    if (rpcError) {
      setError('La accion administrativa no pudo completarse.');
      return;
    }

    setStatus(action === 'validar_usuario' ? 'Usuario validado manualmente.' : 'Usuario anulado.');
    await loadPanelData();
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

    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc(action, params);
    setPanelLoading(false);

    if (rpcError) {
      setError('La solicitud no pudo procesarse.');
      return;
    }

    setStatus(action === 'aprobar_afiliacion' ? 'Afiliacion aprobada.' : 'Afiliacion rechazada.');
    await loadPanelData();
  }

  async function runDisaffiliationRpc(solicitudId: string) {
    if (!supabase) {
      return;
    }

    setError('');
    setStatus('');
    setPanelLoading(true);
    const { error: rpcError } = await supabase.rpc('aprobar_desafiliacion', { solicitud_id: solicitudId });
    setPanelLoading(false);

    if (rpcError) {
      setError('La desafiliacion no pudo procesarse.');
      return;
    }

    setStatus('Desafiliacion aprobada.');
    await loadPanelData();
    await loadProfile();
  }

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setLoginPassword('');
    setStatus('Sesion cerrada.');
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <h1>Liberales PE</h1>
          <p>Padron operativo</p>
        </div>
        {session ? (
          <button className="secondary" type="button" onClick={handleLogout}>
            Cerrar sesion
          </button>
        ) : null}
      </section>

      {!supabaseConfigReady ? (
        <section className="panel">
          <h2>Configuracion incompleta</h2>
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
                  <dt>Validacion</dt>
                  <dd>{profile.validado_manualmente ? 'manual validada' : 'pendiente'}</dd>
                </div>
              </dl>
              {profile.estado === 'activo' && profile.tipo_miembro === 'adherente' ? (
                <button className="secondary section-action" type="button" disabled={loading} onClick={handleSolicitarAfiliacion}>
                  Solicitar afiliacion
                </button>
              ) : null}
              {profile.estado === 'activo' ? (
                <button className="secondary section-action" type="button" disabled={loading} onClick={handleSolicitarDesafiliacion}>
                  Solicitar desafiliacion
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

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombres</th>
                    <th>Rol</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Validacion</th>
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
              <span>Pagina {adminPage + 1}</span>
              <button
                className="secondary"
                type="button"
                disabled={(adminPage + 1) * pageSize >= adminUserCount}
                onClick={() => setAdminPage((page) => page + 1)}
              >
                Siguiente
              </button>
            </div>

            <h2>Solicitudes de afiliacion</h2>
            <div className="request-list">
              {affiliationRequests.length > 0 ? (
                affiliationRequests.map((request) => (
                  <div className="request-item" key={request.id}>
                    <div>
                      <strong>{requestProfiles[request.usuario_id]?.nombres ?? request.usuario_id}</strong>
                      <p className="muted">
                        {requestProfiles[request.usuario_id]?.dni ?? 'DNI no disponible'} ·{' '}
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

            <h2>Solicitudes de desafiliacion</h2>
            <div className="request-list">
              {disaffiliationRequests.length > 0 ? (
                disaffiliationRequests.map((request) => (
                  <div className="request-item" key={request.id}>
                    <div>
                      <strong>{requestProfiles[request.usuario_id]?.nombres ?? request.usuario_id}</strong>
                      <p className="muted">
                        {requestProfiles[request.usuario_id]?.dni ?? 'DNI no disponible'} ·{' '}
                        {new Date(request.creado_en).toLocaleString()}
                      </p>
                    </div>
                    <button type="button" disabled={panelLoading} onClick={() => runDisaffiliationRpc(request.id)}>
                      Aprobar
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted">No hay solicitudes pendientes.</p>
              )}
            </div>

            <h2>Auditoria reciente</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Accion</th>
                    <th>Tabla</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.creado_en).toLocaleString()}</td>
                      <td>{log.accion}</td>
                      <td>{log.tabla}</td>
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
                Contrasena
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
          ) : (
            <form className="panel form" onSubmit={handleRegister}>
              <h2>Registro manual</h2>
              <label>
                DNI
                <input
                  inputMode="numeric"
                  maxLength={8}
                  value={registerForm.dni}
                  onChange={(event) => {
                    setDniLookupMessage('');
                    setRegisterForm((current) => ({ ...current, dni: normalizeDni(event.target.value) }));
                  }}
                  autoComplete="username"
                />
              </label>
              <button className="secondary" type="button" disabled={dniLookupLoading} onClick={handleBuscarDni}>
                {dniLookupLoading ? 'Consultando...' : 'Autocompletar nombre'}
              </button>
              {dniLookupMessage ? <p className="hint">{dniLookupMessage}</p> : null}
              <label>
                Nombres completos
                <input
                  value={registerForm.nombres}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, nombres: event.target.value.toUpperCase() }))
                  }
                  autoComplete="name"
                />
              </label>
              <label>
                Telefono
                <input
                  inputMode="tel"
                  value={registerForm.telefono}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, telefono: event.target.value }))}
                  autoComplete="tel"
                />
              </label>
              <label>
                Contrasena
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                  autoComplete="new-password"
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>
          )}
        </section>
      ) : null}

      {status ? <p className="status">{status}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
