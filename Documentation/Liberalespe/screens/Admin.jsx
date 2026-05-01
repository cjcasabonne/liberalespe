
// Pantallas 6, 7, 8: Panel de Administración — Liberales PE

const MOCK_USERS = [
  { id:1, nombre:'Carlos Mendoza Rivas',     dni:'12345678', estado:'activo',  tipo:'afiliado',  validado:true,  solicitud:'pendiente', rol:'administrador' },
  { id:2, nombre:'Ana Lucía Flores Paredes', dni:'23456789', estado:'activo',  tipo:'adherente', validado:false, solicitud:null,        rol:'usuario' },
  { id:3, nombre:'Roberto Quispe Mamani',    dni:'34567890', estado:'activo',  tipo:'afiliado',  validado:true,  solicitud:null,        rol:'usuario' },
  { id:4, nombre:'Lucía Vargas Torres',      dni:'45678901', estado:'anulado', tipo:'adherente', validado:true,  solicitud:null,        rol:'usuario' },
  { id:5, nombre:'Pedro Salas Cjuno',        dni:'56789012', estado:'activo',  tipo:'adherente', validado:true,  solicitud:'pendiente', rol:'usuario' },
  { id:6, nombre:'María Condori Asto',       dni:'67890123', estado:'activo',  tipo:'adherente', validado:false, solicitud:null,        rol:'usuario' },
  { id:7, nombre:'Jorge Huanca Pilco',       dni:'78901234', estado:'desafiliado', tipo:'adherente', validado:true, solicitud:null,     rol:'usuario' },
];

// ─── Admin Sidebar ──────────────────────────────────────────────────────────
const AdminSidebar = ({ active, onNavigate, pendingCount }) => {
  const navItems = [
    { key:'padron',     label:'Padrón',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { key:'pendientes', label:'Pendientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, badge: pendingCount },
    { key:'perfil',     label:'Mi perfil',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div style={adminStyles.sidebar}>
      <div style={adminStyles.sidebarLogo}>
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="18" fill="#FAF6EF" opacity="0.15"/>
          <path d="M10 26V12l8-4 8 4v14H22v-7h-4v7H10z" fill="#FAF6EF" opacity="0.9"/>
        </svg>
        <span style={{fontFamily:"'EB Garamond',serif",fontSize:18,fontWeight:700,color:'#FAF6EF',letterSpacing:'0.03em'}}>Liberales</span>
      </div>
      <nav style={{flex:1,padding:'8px 0'}}>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={()=>onNavigate&&onNavigate(item.key)}
            style={{
              ...adminStyles.navItem,
              background: active===item.key ? 'rgba(250,246,239,0.12)' : 'none',
              color: active===item.key ? '#FAF6EF' : 'rgba(250,246,239,0.65)',
              fontWeight: active===item.key ? 700 : 400,
            }}
          >
            {item.icon}
            <span style={{flex:1,textAlign:'left'}}>{item.label}</span>
            {item.badge > 0 && (
              <span style={{background:'#C25A1A',color:'#fff',borderRadius:10,fontSize:11,fontWeight:700,padding:'1px 7px',fontFamily:"'Lato',sans-serif"}}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>
      <div style={{borderTop:'1px solid rgba(250,246,239,0.15)',padding:'12px 0'}}>
        <button style={{...adminStyles.navItem,color:'rgba(250,246,239,0.55)'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

// ─── Admin User List ──────────────────────────────────────────────────────────
const AdminPadronScreen = ({ onSelectUser }) => {
  const [search, setSearch] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState('todos');
  const [filterTipo, setFilterTipo] = React.useState('todos');
  const [filterValidado, setFilterValidado] = React.useState('todos');
  const [onlyPending, setOnlyPending] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const PER_PAGE = 5;

  const filtered = MOCK_USERS.filter(u => {
    if (search && !u.dni.includes(search) && !u.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterEstado !== 'todos' && u.estado !== filterEstado) return false;
    if (filterTipo !== 'todos' && u.tipo !== filterTipo) return false;
    if (filterValidado !== 'todos' && (filterValidado==='validado') !== u.validado) return false;
    if (onlyPending && u.solicitud !== 'pendiente') return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const ChipSet = ({ label, options, value, onChange }) => (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <span style={{fontSize:11,fontWeight:700,color:'#7A6654',textTransform:'uppercase',letterSpacing:'0.05em',fontFamily:"'Lato',sans-serif"}}>{label}</span>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {options.map(opt => (
          <button key={opt.value} onClick={()=>{onChange(opt.value);setPage(1);}} style={{
            padding:'4px 10px',borderRadius:4,border:'1px solid',fontSize:12,fontWeight:value===opt.value?700:400,
            background: value===opt.value?'#C25A1A':'#FFFDF8',
            borderColor: value===opt.value?'#C25A1A':'#E2CDB6',
            color: value===opt.value?'#fff':'#6B4E3D',
            cursor:'pointer',fontFamily:"'Lato',sans-serif",
            transition:'all 150ms ease-out',
          }}>{opt.label}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={adminStyles.mainArea}>
      <div style={adminStyles.pageHeader}>
        <h1 style={adminStyles.pageTitle}>Padrón</h1>
        <span style={{fontSize:13,color:'#7A6654',fontFamily:"'Lato',sans-serif"}}>{filtered.length} usuario{filtered.length!==1?'s':''}</span>
      </div>

      {/* Search */}
      <div style={{background:'#FFFDF8',border:'1px solid #E2CDB6',borderRadius:6,padding:'16px 20px',marginBottom:12,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <div style={{position:'relative',maxWidth:380}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="tel" inputMode="numeric" placeholder="Buscar por DNI o nombre..."
            value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}
            style={{width:'100%',height:40,paddingLeft:38,paddingRight:12,border:'1px solid #E2CDB6',borderRadius:6,fontSize:14,color:'#1C120B',background:'#FFFDF8',outline:'none',fontFamily:"'Lato',sans-serif",boxSizing:'border-box'}}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={{background:'#FFFDF8',border:'1px solid #E2CDB6',borderRadius:6,padding:'14px 20px',marginBottom:16,display:'flex',flexWrap:'wrap',gap:16,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <ChipSet label="Estado" value={filterEstado} onChange={setFilterEstado} options={[{value:'todos',label:'Todos'},{value:'activo',label:'Activo'},{value:'anulado',label:'Anulado'},{value:'desafiliado',label:'Desafiliado'}]}/>
        <ChipSet label="Tipo" value={filterTipo} onChange={setFilterTipo} options={[{value:'todos',label:'Todos'},{value:'adherente',label:'Adherente'},{value:'afiliado',label:'Afiliado'}]}/>
        <ChipSet label="Validación" value={filterValidado} onChange={setFilterValidado} options={[{value:'todos',label:'Todos'},{value:'validado',label:'Validado'},{value:'no validado',label:'No validado'}]}/>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          <span style={{fontSize:11,fontWeight:700,color:'#7A6654',textTransform:'uppercase',letterSpacing:'0.05em',fontFamily:"'Lato',sans-serif"}}>Solicitudes</span>
          <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
            <input type="checkbox" checked={onlyPending} onChange={e=>{setOnlyPending(e.target.checked);setPage(1);}} style={{accentColor:'#C25A1A',width:16,height:16}}/>
            <span style={{fontSize:12,color:'#6B4E3D',fontFamily:"'Lato',sans-serif"}}>Solo con pendientes</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div style={{background:'#FFFDF8',border:'1px solid #E2CDB6',borderRadius:6,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        {paged.length === 0 ? (
          <div style={{padding:'48px 24px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E2CDB6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p style={{fontSize:14,color:'#7A6654',fontFamily:"'Lato',sans-serif",margin:0}}>No se encontraron usuarios con ese criterio.</p>
          </div>
        ) : (
          <>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #E2CDB6',background:'#FAF6EF'}}>
                  {['Nombre','DNI','Estado','Tipo','Validado','Solicitud',''].map((h,i) => (
                    <th key={i} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#7A6654',textTransform:'uppercase',letterSpacing:'0.06em',fontFamily:"'Lato',sans-serif",whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((u, i) => (
                  <tr key={u.id} onClick={()=>onSelectUser&&onSelectUser(u)} style={{borderBottom: i<paged.length-1?'1px solid #EFE3D3':'none',cursor:'pointer',transition:'background 100ms ease-out'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#FAF6EF'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={adminStyles.td}><span style={{fontWeight:700,color:'#1C120B',fontSize:14,fontFamily:"'Lato',sans-serif"}}>{u.nombre}</span></td>
                    <td style={adminStyles.td}><span style={{fontFamily:'monospace',fontSize:13,color:'#6B4E3D',letterSpacing:'0.08em'}}>{u.dni}</span></td>
                    <td style={adminStyles.td}><Badge type={u.estado}/></td>
                    <td style={adminStyles.td}><Badge type={u.tipo}/></td>
                    <td style={adminStyles.td}><Badge type={u.validado?'validado':'no validado'}/></td>
                    <td style={adminStyles.td}>{u.solicitud ? <Badge type={u.solicitud}/> : <span style={{fontSize:13,color:'#7A6654',fontFamily:"'Lato',sans-serif"}}>—</span>}</td>
                    <td style={{...adminStyles.td,textAlign:'right'}}>
                      <button onClick={e=>{e.stopPropagation();onSelectUser&&onSelectUser(u);}} style={{background:'none',border:'1px solid #E2CDB6',borderRadius:4,padding:'4px 12px',fontSize:12,color:'#6B4E3D',cursor:'pointer',fontFamily:"'Lato',sans-serif",whiteSpace:'nowrap'}}>Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderTop:'1px solid #EFE3D3'}}>
                <span style={{fontSize:12,color:'#7A6654',fontFamily:"'Lato',sans-serif"}}>Pág. {page} de {totalPages}</span>
                <div style={{display:'flex',gap:6}}>
                  <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{height:32,padding:'0 12px',border:'1px solid #E2CDB6',borderRadius:4,background:'#FFFDF8',color:'#6B4E3D',fontSize:12,cursor:page<=1?'default':'pointer',opacity:page<=1?0.4:1,fontFamily:"'Lato',sans-serif"}}>Anterior</button>
                  <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} style={{height:32,padding:'0 12px',border:'1px solid #E2CDB6',borderRadius:4,background:'#FFFDF8',color:'#6B4E3D',fontSize:12,cursor:page>=totalPages?'default':'pointer',opacity:page>=totalPages?0.4:1,fontFamily:"'Lato',sans-serif"}}>Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Admin User Detail ────────────────────────────────────────────────────────
const AdminUserDetailScreen = ({ user: initialUser, onBack, isFundador }) => {
  const [user, setUser] = React.useState(initialUser);
  const [dialog, setDialog] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const showToast = (msg, type='success') => setToast({message:msg,type});

  const doAction = (action, comment) => {
    setDialog(null);
    const updates = {
      'validar':    { validado: true },
      'aprobar-af': { tipo:'afiliado', solicitud:null },
      'rechazar-af':{ solicitud:null },
      'aprobar-des':{ tipo:'adherente', estado:'activo', solicitud:null },
      'anular':     { estado:'anulado' },
      'cambio-rol': {},
    };
    if (updates[action]) setUser(u => ({...u,...updates[action]}));
    const msgs = {
      'validar':    ['Identidad validada correctamente.','success'],
      'aprobar-af': ['Afiliación aprobada.','success'],
      'rechazar-af':['Afiliación rechazada.','info'],
      'aprobar-des':['Desafiliación aprobada.','info'],
      'anular':     ['Cuenta anulada.','error'],
    };
    if (msgs[action]) showToast(...msgs[action]);
  };

  const AUDIT = [
    { fecha:'01 may 2026 09:14', accion:'Cuenta registrada', operador:'Sistema', dni:'****3412' },
    { fecha:'28 abr 2026 16:30', accion:'Validación de identidad pendiente', operador:'—', dni:'—' },
  ];

  return (
    <div style={adminStyles.mainArea}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <button onClick={onBack} style={{height:36,padding:'0 12px',background:'none',border:'1px solid #E2CDB6',borderRadius:4,fontSize:13,color:'#6B4E3D',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:"'Lato',sans-serif"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Volver al padrón
        </button>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:16,maxWidth:760}}>
        {/* Personal data */}
        <div style={adminStyles.card}>
          <h2 style={adminStyles.cardTitle}>Datos del usuario</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              <div style={adminStyles.dataLabel}>Nombre completo</div>
              <div style={adminStyles.dataValue}>{user.nombre}</div>
            </div>
            <div>
              <div style={adminStyles.dataLabel}>DNI</div>
              <div style={{fontFamily:'monospace',fontSize:15,color:'#1C120B',letterSpacing:'0.12em'}}>{user.dni}</div>
            </div>
            <div>
              <div style={adminStyles.dataLabel}>Teléfono</div>
              <div style={adminStyles.dataValue}>+51 987 654 321</div>
            </div>
            <div>
              <div style={adminStyles.dataLabel}>Fecha de registro</div>
              <div style={adminStyles.dataValue}>28 abr 2026</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={adminStyles.card}>
          <h2 style={adminStyles.cardTitle}>Estado actual</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px',background:'#E2CDB6',borderRadius:6,overflow:'hidden',border:'1px solid #E2CDB6'}}>
            {[
              {label:'Estado', value: user.estado},
              {label:'Tipo', value: user.tipo},
              {label:'Identidad', value: user.validado?'validado':'no validado'},
              {label:'Solicitud', value: user.solicitud||null},
            ].map(({label,value},i)=>(
              <div key={i} style={{background:'#FFFDF8',padding:'12px 16px'}}>
                <div style={{fontSize:11,color:'#7A6654',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6,fontFamily:"'Lato',sans-serif"}}>{label}</div>
                {value ? <Badge type={value}/> : <span style={{fontSize:13,color:'#7A6654',fontFamily:"'Lato',sans-serif"}}>—</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Admin actions */}
        <div style={adminStyles.card}>
          <h2 style={adminStyles.cardTitle}>Acciones administrativas</h2>

          {user.estado === 'anulado' ? (
            <div style={{display:'flex',gap:8,alignItems:'center',padding:'12px 14px',background:'#FCE8DF',border:'1px solid #F5C6B0',borderRadius:6,fontSize:14,color:'#9A3412',fontFamily:"'Lato',sans-serif"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              Cuenta anulada — no hay acciones disponibles.
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {/* Validar */}
              {user.estado==='activo' && !user.validado && (
                <div style={adminStyles.actionRow}>
                  <div>
                    <div style={adminStyles.actionLabel}>Validar identidad</div>
                    <div style={adminStyles.actionHelp}>Confirma que el DNI y datos coinciden con el ciudadano.</div>
                  </div>
                  <button onClick={()=>setDialog({action:'validar',title:'Validar identidad',message:'Confirmas que has verificado manualmente la identidad de este ciudadano.',confirmLabel:'Validar',destructive:false,requireComment:false})} style={adminStyles.btnPrimarySmall}>Validar identidad</button>
                </div>
              )}

              {/* Aprobar/Rechazar afiliación */}
              {user.estado==='activo' && user.tipo==='adherente' && user.solicitud==='pendiente' && (
                <div style={adminStyles.actionRow}>
                  <div>
                    <div style={adminStyles.actionLabel}>Solicitud de afiliación pendiente</div>
                    <div style={adminStyles.actionHelp}>El ciudadano solicitó afiliarse al partido.</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setDialog({action:'rechazar-af',title:'Rechazar afiliación',message:'Indica el motivo del rechazo. El ciudadano no podrá ver el detalle técnico.',confirmLabel:'Rechazar',destructive:true,requireComment:true,commentLabel:'Motivo del rechazo'})} style={adminStyles.btnDestructiveSmall}>Rechazar</button>
                    <button onClick={()=>setDialog({action:'aprobar-af',title:'Aprobar afiliación',message:'¿Confirmas que deseas aprobar la afiliación de este ciudadano?',confirmLabel:'Aprobar',destructive:false,requireComment:false})} style={adminStyles.btnPrimarySmall}>Aprobar</button>
                  </div>
                </div>
              )}

              {/* Aprobar desafiliación */}
              {user.estado==='activo' && user.tipo==='afiliado' && user.solicitud==='pendiente' && (
                <div style={adminStyles.actionRow}>
                  <div>
                    <div style={adminStyles.actionLabel}>Solicitud de desafiliación pendiente</div>
                    <div style={adminStyles.actionHelp}>El ciudadano solicita retirarse del partido.</div>
                  </div>
                  <button onClick={()=>setDialog({action:'aprobar-des',title:'Aprobar desafiliación',message:'¿Confirmas que deseas aprobar la desafiliación?',confirmLabel:'Aprobar desafiliación',destructive:false,requireComment:false})} style={adminStyles.btnPrimarySmall}>Aprobar desafiliación</button>
                </div>
              )}

              {/* Anular cuenta */}
              {user.estado==='activo' && (
                <div style={{...adminStyles.actionRow, borderTop:'1px solid #EFE3D3', paddingTop:14, marginTop:4}}>
                  <div>
                    <div style={{...adminStyles.actionLabel, color:'#B42318'}}>Anular cuenta</div>
                    <div style={adminStyles.actionHelp}>Acción irreversible. Elimina todos los derechos políticos del ciudadano.</div>
                  </div>
                  <button onClick={()=>setDialog({action:'anular',title:'Anular cuenta',message:'Esta acción es irreversible. La cuenta quedará bloqueada permanentemente.',confirmLabel:'Anular cuenta',destructive:true,requireComment:true,commentLabel:'Motivo de anulación'})} style={adminStyles.btnDestructiveSmall}>Anular cuenta</button>
                </div>
              )}

              {/* Cambio de rol (solo fundador) */}
              {isFundador && (
                <RoleChangeSection user={user} onAction={(rol)=>{ setUser(u=>({...u,rol})); showToast(`Rol actualizado a ${rol}.`,'success'); }} />
              )}
            </div>
          )}
        </div>

        {/* Audit log */}
        <div style={adminStyles.card}>
          <h2 style={adminStyles.cardTitle}>Historial de auditoría</h2>
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {AUDIT.map((a,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:12,padding:'10px 0',borderBottom: i<AUDIT.length-1?'1px solid #EFE3D3':'none',alignItems:'start'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#1C120B',fontFamily:"'Lato',sans-serif"}}>{a.accion}</div>
                  <div style={{fontSize:11,color:'#7A6654',fontFamily:"'Lato',sans-serif",marginTop:2}}>{a.fecha}</div>
                </div>
                <div style={{fontSize:12,color:'#6B4E3D',fontFamily:"'Lato',sans-serif"}}>Operador: {a.operador}</div>
                <div style={{fontFamily:'monospace',fontSize:11,color:'#7A6654',letterSpacing:'0.08em'}}>{a.dni}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {dialog && (
        <ConfirmDialog
          {...dialog}
          onConfirm={(comment)=>doAction(dialog.action, comment)}
          onCancel={()=>setDialog(null)}
        />
      )}
      {toast && <Toast {...toast} onDismiss={()=>setToast(null)}/>}
    </div>
  );
};

// ─── Role Change Section (Pantalla 8) ────────────────────────────────────────
const RoleChangeSection = ({ user, onAction }) => {
  const [selectedRol, setSelectedRol] = React.useState(user.rol || 'usuario');
  const [dialog, setDialog] = React.useState(false);
  const roles = ['usuario','administrador','fundador'];

  return (
    <div style={{borderTop:'1px solid #EFE3D3',paddingTop:14,marginTop:4}}>
      <div style={adminStyles.actionLabel}>Cambio de rol <span style={{fontSize:11,color:'#C25A1A',fontWeight:700,marginLeft:6,background:'#FFF7ED',padding:'2px 6px',borderRadius:3}}>Solo Fundador</span></div>
      <div style={{fontSize:12,color:'#7A6654',fontFamily:"'Lato',sans-serif",marginBottom:10}}>Rol actual: <strong style={{color:'#1C120B'}}>{user.rol}</strong></div>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        {roles.map(r => (
          <label key={r} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',padding:'6px 12px',border:'1px solid',borderRadius:4,borderColor:selectedRol===r?'#C25A1A':'#E2CDB6',background:selectedRol===r?'#FFF7ED':'#FFFDF8',transition:'all 150ms'}}>
            <input type="radio" name="rol" value={r} checked={selectedRol===r} onChange={()=>setSelectedRol(r)} style={{accentColor:'#C25A1A'}}/>
            <span style={{fontSize:13,fontFamily:"'Lato',sans-serif",color:selectedRol===r?'#C25A1A':'#6B4E3D',textTransform:'capitalize',fontWeight:selectedRol===r?700:400}}>{r}</span>
          </label>
        ))}
      </div>
      <button
        disabled={selectedRol===user.rol}
        onClick={()=>setDialog(true)}
        style={{...adminStyles.btnPrimarySmall,opacity:selectedRol===user.rol?0.4:1}}
      >Aplicar cambio de rol</button>
      {dialog && (
        <ConfirmDialog
          title="Cambiar rol"
          message={`¿Confirmas cambiar el rol de "${user.nombre}" a "${selectedRol}"?`}
          confirmLabel="Confirmar cambio"
          destructive={false}
          requireComment={false}
          onConfirm={()=>{ setDialog(false); onAction(selectedRol); }}
          onCancel={()=>setDialog(false)}
        />
      )}
    </div>
  );
};

// ─── Full Admin Panel (with sidebar + routing) ────────────────────────────────
const AdminPanel = ({ isFundador }) => {
  const [page, setPage] = React.useState('padron');
  const [selectedUser, setSelectedUser] = React.useState(null);
  const pendingCount = MOCK_USERS.filter(u=>u.solicitud==='pendiente').length;

  const handleSelectUser = (u) => { setSelectedUser(u); setPage('detalle'); };
  const handleBack = () => { setSelectedUser(null); setPage('padron'); };

  return (
    <div style={{display:'flex',height:'100%',minHeight:'100%',background:'#FAF6EF',fontFamily:"'Lato',sans-serif"}}>
      <AdminSidebar active={page==='detalle'?'padron':page} onNavigate={p=>{setPage(p);setSelectedUser(null);}} pendingCount={pendingCount}/>
      <div style={{flex:1,overflow:'auto'}}>
        {page==='padron' && <AdminPadronScreen onSelectUser={handleSelectUser}/>}
        {page==='detalle' && selectedUser && <AdminUserDetailScreen user={selectedUser} onBack={handleBack} isFundador={isFundador}/>}
        {page==='pendientes' && (
          <div style={adminStyles.mainArea}>
            <div style={adminStyles.pageHeader}>
              <h1 style={adminStyles.pageTitle}>Solicitudes pendientes</h1>
              <span style={{fontSize:13,color:'#7A6654',fontFamily:"'Lato',sans-serif"}}>{pendingCount} pendiente{pendingCount!==1?'s':''}</span>
            </div>
            <div style={{background:'#FFFDF8',border:'1px solid #E2CDB6',borderRadius:6,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
              {MOCK_USERS.filter(u=>u.solicitud==='pendiente').map((u,i,arr)=>(
                <div key={u.id} onClick={()=>handleSelectUser(u)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderBottom:i<arr.length-1?'1px solid #EFE3D3':'none',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#FAF6EF'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:'#1C120B',fontFamily:"'Lato',sans-serif"}}>{u.nombre}</div>
                    <div style={{fontFamily:'monospace',fontSize:12,color:'#6B4E3D',marginTop:2,letterSpacing:'0.08em'}}>{u.dni}</div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <Badge type={u.tipo}/>
                    <Badge type="pendiente"/>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const adminStyles = {
  sidebar: {
    width: 220,
    minWidth: 220,
    background: '#4A2C1A',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    height: '100%',
    minHeight: '100%',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px 18px',
    borderBottom: '1px solid rgba(250,246,239,0.12)',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Lato', sans-serif",
    borderRadius: 0,
    transition: 'all 150ms ease-out',
  },
  mainArea: {
    padding: '28px 32px',
    maxWidth: 1100,
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: "'EB Garamond', serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#1C120B',
    margin: 0,
  },
  card: {
    background: '#FFFDF8',
    border: '1px solid #E2CDB6',
    borderRadius: 6,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    padding: '20px 24px',
  },
  cardTitle: {
    fontFamily: "'EB Garamond', serif",
    fontSize: 18,
    fontWeight: 600,
    color: '#4A2C1A',
    margin: '0 0 16px',
  },
  td: {
    padding: '12px 16px',
    fontSize: 13,
    verticalAlign: 'middle',
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#7A6654',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: "'Lato', sans-serif",
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 14,
    color: '#1C120B',
    fontFamily: "'Lato', sans-serif",
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '4px 0',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1C120B',
    fontFamily: "'Lato', sans-serif",
    marginBottom: 2,
  },
  actionHelp: {
    fontSize: 12,
    color: '#7A6654',
    fontFamily: "'Lato', sans-serif",
    maxWidth: 380,
    lineHeight: 1.4,
  },
  btnPrimarySmall: {
    height: 36,
    padding: '0 16px',
    background: '#C25A1A',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Lato', sans-serif",
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 150ms ease-out',
  },
  btnDestructiveSmall: {
    height: 36,
    padding: '0 16px',
    background: '#B42318',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Lato', sans-serif",
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 150ms ease-out',
  },
};

Object.assign(window, { AdminPanel, AdminPadronScreen, AdminUserDetailScreen, RoleChangeSection, Badge: window.Badge || Badge });
