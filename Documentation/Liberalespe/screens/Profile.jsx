
// Pantalla 3: Perfil ciudadano + Pantallas 4 y 5: Solicitudes — Liberales PE

// ─── Shared Badge Component ───────────────────────────────────────────────────
const Badge = ({ type }) => {
  const map = {
    activo:         { bg:'#ECF5DD', color:'#3F6212', icon:'check-circle',    label:'Activo' },
    anulado:        { bg:'#FCE8DF', color:'#9A3412', icon:'ban',             label:'Anulado' },
    desafiliado:    { bg:'#F3E8DA', color:'#6B4E3D', icon:'log-out',         label:'Desafiliado' },
    pendiente:      { bg:'#FEF0C7', color:'#8A4B0F', icon:'clock',           label:'Pendiente' },
    aprobada:       { bg:'#ECF5DD', color:'#3F6212', icon:'check',           label:'Aprobada' },
    rechazada:      { bg:'#FCE8DF', color:'#9A3412', icon:'x-circle',        label:'Rechazada' },
    cancelada:      { bg:'#F3E8DA', color:'#6B4E3D', icon:'minus-circle',    label:'Cancelada' },
    adherente:      { bg:'#FFF7ED', color:'#9A3412', icon:'user',            label:'Adherente' },
    afiliado:       { bg:'#F0F7E6', color:'#3F6212', icon:'badge-check',     label:'Afiliado' },
    validado:       { bg:'#F0F7E6', color:'#3F6212', icon:'shield-check',    label:'Validado' },
    'no validado':  { bg:'#FEF0C7', color:'#8A4B0F', icon:'shield',          label:'No validado' },
    revision:       { bg:'#FEF0C7', color:'#8A4B0F', icon:'clock',           label:'En revisión' },
  };
  const d = map[type] || map['pendiente'];

  const icons = {
    'check-circle': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    'ban':          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    'log-out':      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    'clock':        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    'check':        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    'x-circle':     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    'minus-circle': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
    'user':         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    'badge-check':  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    'shield-check': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
    'shield':       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  };

  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,background:d.bg,color:d.color,padding:'3px 8px',borderRadius:4,fontSize:12,fontWeight:700,fontFamily:"'Lato',sans-serif"}}>
      {icons[d.icon]}
      {d.label}
    </span>
  );
};

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
const ConfirmDialog = ({ title, message, confirmLabel, requireComment, commentLabel, destructive, onConfirm, onCancel }) => {
  const [comment, setComment] = React.useState('');
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(28,18,11,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
      <div style={{background:'#FFFDF8',border:'1px solid #E2CDB6',borderRadius:6,boxShadow:'0 4px 16px rgba(0,0,0,0.12)',maxWidth:440,width:'100%',padding:'28px 28px'}}>
        <h2 style={{fontFamily:"'EB Garamond',serif",fontSize:20,fontWeight:600,color:'#1C120B',margin:'0 0 10px'}}>{title}</h2>
        {message && <p style={{fontSize:14,color:'#6B4E3D',lineHeight:1.6,margin:'0 0 16px',fontFamily:"'Lato',sans-serif"}}>{message}</p>}
        {requireComment && (
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
            <label style={{fontSize:14,fontWeight:700,color:'#1C120B',fontFamily:"'Lato',sans-serif"}}>{commentLabel || 'Motivo'}</label>
            <textarea
              value={comment}
              onChange={e=>setComment(e.target.value)}
              rows={3}
              required
              style={{width:'100%',padding:'10px 12px',border:'1px solid #E2CDB6',borderRadius:6,fontSize:14,color:'#1C120B',background:'#FFFDF8',resize:'vertical',fontFamily:"'Lato',sans-serif",boxSizing:'border-box'}}
              placeholder="Escribe el motivo aquí..."
            />
          </div>
        )}
        <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
          <button onClick={onCancel} style={{height:40,padding:'0 18px',background:'none',border:'none',color:'#7A6654',fontSize:14,fontFamily:"'Lato',sans-serif",cursor:'pointer',borderRadius:6}}>Cancelar</button>
          <button
            onClick={()=>onConfirm(comment)}
            disabled={requireComment && !comment.trim()}
            style={{height:40,padding:'0 18px',background: destructive?'#B42318':'#C25A1A',color:'#fff',border:'none',borderRadius:6,fontSize:14,fontWeight:700,fontFamily:"'Lato',sans-serif",cursor:'pointer',opacity: requireComment&&!comment.trim()?0.5:1,transition:'opacity 150ms'}}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => {
  React.useEffect(()=>{const t=setTimeout(onDismiss,4000);return()=>clearTimeout(t);},[]);
  const colors = { success:{bg:'#ECF5DD',border:'#B6D88E',color:'#3F6212'}, error:{bg:'#FCE8DF',border:'#F5C6B0',color:'#9A3412'}, info:{bg:'#FFF7ED',border:'#F5D8B0',color:'#6B4E3D'}, warning:{bg:'#FEF0C7',border:'#F5D48A',color:'#8A4B0F'} };
  const c = colors[type] || colors.info;
  return (
    <div aria-live="polite" role="alert" style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:c.bg,border:`1px solid ${c.border}`,borderRadius:6,padding:'12px 20px',fontSize:14,color:c.color,fontFamily:"'Lato',sans-serif",fontWeight:400,boxShadow:'0 2px 8px rgba(0,0,0,0.1)',zIndex:2000,whiteSpace:'nowrap',maxWidth:'90vw',textOverflow:'ellipsis',overflow:'hidden'}}>
      {message}
    </div>
  );
};

// ─── Profile Screen ───────────────────────────────────────────────────────────
const ProfileScreen = ({ onNavigate, userState }) => {
  const user = userState || {
    nombre: 'María Alejandra Torres Quispe',
    dni: '45892316',
    telefono: '+51 987 654 321',
    estado: 'activo',
    tipo: 'adherente',
    validado: false,
    solicitudPendiente: false,
  };

  const [toast, setToast] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);

  const showToast = (message, type='success') => setToast({message, type});

  const StatusGrid = () => (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px',background:'#E2CDB6',borderRadius:6,overflow:'hidden',border:'1px solid #E2CDB6'}}>
      {[
        { label:'Estado', value: user.estado },
        { label:'Tipo', value: user.tipo },
        { label:'Identidad', value: user.validado ? 'validado' : 'no validado' },
        { label:'Afiliación', value: user.solicitudPendiente ? 'revision' : null },
      ].map(({label,value},i) => (
        <div key={i} style={{background:'#FFFDF8',padding:'14px 16px'}}>
          <div style={{fontSize:11,color:'#7A6654',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6,fontFamily:"'Lato',sans-serif"}}>{label}</div>
          {value ? <Badge type={value}/> : <span style={{fontSize:13,color:'#7A6654',fontFamily:"'Lato',sans-serif"}}>—</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div style={profStyles.root}>
      <div style={profStyles.inner}>

        {/* ── Personal data ── */}
        <div style={profStyles.card}>
          <h2 style={profStyles.name}>{user.nombre}</h2>
          <div style={profStyles.dataRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span style={{fontFamily:'monospace',fontSize:15,letterSpacing:'0.12em',color:'#1C120B'}}>{user.dni}</span>
          </div>
          <div style={profStyles.dataRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span style={{fontSize:14,color:'#6B4E3D',fontFamily:"'Lato',sans-serif"}}>{user.telefono}</span>
          </div>
        </div>

        {/* ── Status grid ── */}
        <div style={profStyles.card}>
          <h3 style={profStyles.sectionTitle}>Estado en el padrón</h3>
          <StatusGrid />
        </div>

        {/* ── Available actions ── */}
        <div style={profStyles.card}>
          <h3 style={profStyles.sectionTitle}>Acciones disponibles</h3>

          {user.estado === 'anulado' && (
            <div style={profStyles.bannerDestructive}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              Tu cuenta ha sido anulada. Contacta a un operador del partido.
            </div>
          )}

          {user.estado === 'activo' && !user.validado && (
            <div style={profStyles.bannerWarning}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Tu identidad aún no ha sido validada por un operador. Este proceso es manual.
            </div>
          )}

          {user.solicitudPendiente && user.estado === 'activo' && (
            <div style={profStyles.badgeRow}>
              <Badge type="revision" />
              <span style={{fontSize:13,color:'#7A6654',fontFamily:"'Lato',sans-serif"}}>Tu solicitud está siendo revisada por el equipo operativo.</span>
            </div>
          )}

          {user.estado === 'activo' && user.validado && user.tipo === 'adherente' && !user.solicitudPendiente && (
            <button onClick={()=>onNavigate&&onNavigate('solicitud-afiliacion')} style={profStyles.btnPrimary}>
              Solicitar afiliación
            </button>
          )}

          {user.estado === 'activo' && user.tipo === 'afiliado' && !user.solicitudPendiente && (
            <button onClick={()=>onNavigate&&onNavigate('solicitud-desafiliacion')} style={{...profStyles.btnPrimary, background:'none', color:'#7A6654', border:'1px solid #E2CDB6'}}>
              Solicitar desafiliación
            </button>
          )}

          {user.estado === 'activo' && !user.validado && !user.solicitudPendiente && user.tipo === 'adherente' && (
            <p style={{fontSize:13,color:'#7A6654',fontFamily:"'Lato',sans-serif",margin:0}}>No hay acciones disponibles hasta que tu identidad sea validada.</p>
          )}
        </div>

        {/* ── Request history ── */}
        <div style={profStyles.card}>
          <h3 style={profStyles.sectionTitle}>Historial de solicitudes</h3>
          {[
            { tipo:'Registro de cuenta', fecha:'28 abr 2026', estado:'aprobada', comentario:null },
          ].length > 0 ? (
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {[
                { tipo:'Registro de cuenta', fecha:'28 abr 2026', estado:'aprobada', comentario:null },
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:i<0?'1px solid #EFE3D3':'none',gap:12}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:'#1C120B',fontFamily:"'Lato',sans-serif",marginBottom:2}}>{s.tipo}</div>
                    <div style={{fontSize:12,color:'#7A6654',fontFamily:"'Lato',sans-serif"}}>{s.fecha}</div>
                    {s.comentario && <div style={{fontSize:12,color:'#6B4E3D',fontFamily:"'Lato',sans-serif",marginTop:4,fontStyle:'italic'}}>"{s.comentario}"</div>}
                  </div>
                  <Badge type={s.estado}/>
                </div>
              ))}
            </div>
          ) : (
            <p style={{fontSize:13,color:'#7A6654',fontFamily:"'Lato',sans-serif",margin:0}}>No hay solicitudes registradas.</p>
          )}
        </div>

      </div>
      {toast && <Toast {...toast} onDismiss={()=>setToast(null)}/>}
    </div>
  );
};

const profStyles = {
  root: { minHeight:'100%', background:'#FAF6EF', padding:'24px 16px', fontFamily:"'Lato',sans-serif" },
  inner: { maxWidth:680, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 },
  card: { background:'#FFFDF8', border:'1px solid #E2CDB6', borderRadius:6, boxShadow:'0 1px 3px rgba(0,0,0,0.08)', padding:'20px 24px' },
  name: { fontFamily:"'EB Garamond',serif", fontSize:24, fontWeight:600, color:'#1C120B', margin:'0 0 14px' },
  sectionTitle: { fontFamily:"'EB Garamond',serif", fontSize:18, fontWeight:600, color:'#4A2C1A', margin:'0 0 14px' },
  dataRow: { display:'flex', alignItems:'center', gap:10, marginBottom:8 },
  badgeRow: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#FEF0C7', border:'1px solid #F5D48A', borderRadius:6 },
  bannerDestructive: { display:'flex', alignItems:'flex-start', gap:8, background:'#FCE8DF', border:'1px solid #F5C6B0', borderRadius:6, padding:'12px 14px', fontSize:14, color:'#9A3412', lineHeight:1.5, fontFamily:"'Lato',sans-serif" },
  bannerWarning: { display:'flex', alignItems:'flex-start', gap:8, background:'#FEF0C7', border:'1px solid #F5D48A', borderRadius:6, padding:'12px 14px', fontSize:14, color:'#8A4B0F', lineHeight:1.5, fontFamily:"'Lato',sans-serif" },
  btnPrimary: { height:44, background:'#C25A1A', color:'#fff', border:'none', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:"'Lato',sans-serif", cursor:'pointer', padding:'0 24px', transition:'background 150ms ease-out', width:'100%', display:'flex', alignItems:'center', justifyContent:'center' },
};

// ─── Solicitud Afiliación ─────────────────────────────────────────────────────
const AffiliationScreen = ({ onNavigate }) => {
  const [toast, setToast] = React.useState(null);
  const [sent, setSent] = React.useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(()=>{
      setToast({message:'Solicitud enviada. Recibirás una respuesta del equipo operativo.', type:'success'});
      setTimeout(()=>onNavigate&&onNavigate('profile'), 1500);
    }, 300);
  };

  return (
    <div style={profStyles.root}>
      <div style={{...profStyles.inner, maxWidth:560}}>
        <div style={profStyles.card}>
          <h1 style={{fontFamily:"'EB Garamond',serif",fontSize:26,fontWeight:700,color:'#1C120B',margin:'0 0 10px'}}>Solicitar afiliación</h1>
          <p style={{fontSize:14,color:'#6B4E3D',lineHeight:1.6,margin:'0 0 20px',fontFamily:"'Lato',sans-serif"}}>
            Al afiliarte, adquieres derechos políticos dentro del partido, incluyendo el voto en decisiones internas. Tu solicitud será revisada por un operador.
          </p>

          {/* User summary */}
          <div style={{background:'#FAF6EF',border:'1px solid #E2CDB6',borderRadius:6,padding:'14px 16px',marginBottom:20,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{fontSize:12,fontWeight:700,color:'#7A6654',textTransform:'uppercase',letterSpacing:'0.05em',fontFamily:"'Lato',sans-serif"}}>Tus datos</div>
            <div style={{fontSize:15,fontWeight:700,color:'#1C120B',fontFamily:"'Lato',sans-serif"}}>María Alejandra Torres Quispe</div>
            <div style={{fontFamily:'monospace',fontSize:13,color:'#6B4E3D',letterSpacing:'0.1em'}}>45892316</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}><Badge type="activo"/><Badge type="adherente"/><Badge type="validado"/></div>
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>onNavigate&&onNavigate('profile')} style={{height:44,padding:'0 20px',background:'none',border:'none',color:'#7A6654',fontSize:14,fontFamily:"'Lato',sans-serif",cursor:'pointer',borderRadius:6}}>Cancelar</button>
            <button onClick={handleSend} disabled={sent} style={{...profStyles.btnPrimary,flex:1,opacity:sent?0.7:1}}>
              {sent ? <><span style={{display:'inline-block',width:16,height:16,border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}></span> Enviando...</> : 'Enviar solicitud'}
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast {...toast} onDismiss={()=>setToast(null)}/>}
    </div>
  );
};

// ─── Solicitud Desafiliación ──────────────────────────────────────────────────
const DisaffiliationScreen = ({ onNavigate }) => {
  const [motivo, setMotivo] = React.useState('');
  const [dialog, setDialog] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const handleConfirm = () => {
    setDialog(false);
    setToast({message:'Solicitud de desafiliación enviada.', type:'info'});
    setTimeout(()=>onNavigate&&onNavigate('profile'), 1500);
  };

  return (
    <div style={profStyles.root}>
      <div style={{...profStyles.inner, maxWidth:560}}>
        <div style={profStyles.card}>
          <h1 style={{fontFamily:"'EB Garamond',serif",fontSize:26,fontWeight:700,color:'#1C120B',margin:'0 0 10px'}}>Solicitar desafiliación</h1>

          <div style={{display:'flex',alignItems:'flex-start',gap:8,background:'#FEF0C7',border:'1px solid #F5D48A',borderRadius:6,padding:'12px 14px',marginBottom:20,fontSize:14,color:'#8A4B0F',lineHeight:1.5,fontFamily:"'Lato',sans-serif"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Esta acción retirará tus derechos políticos dentro del partido. El proceso es reversible solo mediante nueva afiliación.
          </div>

          {/* User summary */}
          <div style={{background:'#FAF6EF',border:'1px solid #E2CDB6',borderRadius:6,padding:'14px 16px',marginBottom:20,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{fontSize:12,fontWeight:700,color:'#7A6654',textTransform:'uppercase',letterSpacing:'0.05em',fontFamily:"'Lato',sans-serif"}}>Tus datos</div>
            <div style={{fontSize:15,fontWeight:700,color:'#1C120B',fontFamily:"'Lato',sans-serif"}}>María Alejandra Torres Quispe</div>
            <div style={{fontFamily:'monospace',fontSize:13,color:'#6B4E3D',letterSpacing:'0.1em'}}>45892316</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}><Badge type="activo"/><Badge type="afiliado"/></div>
          </div>

          {/* Reason */}
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:20}}>
            <label htmlFor="motivo-desaf" style={{fontSize:14,fontWeight:700,color:'#1C120B',fontFamily:"'Lato',sans-serif"}}>¿Por qué deseas desafiliarte? <span style={{fontWeight:300,color:'#7A6654'}}>(opcional)</span></label>
            <textarea
              id="motivo-desaf"
              value={motivo}
              onChange={e=>setMotivo(e.target.value)}
              maxLength={500}
              rows={4}
              style={{width:'100%',padding:'10px 12px',border:'1px solid #E2CDB6',borderRadius:6,fontSize:14,color:'#1C120B',background:'#FFFDF8',resize:'vertical',fontFamily:"'Lato',sans-serif",boxSizing:'border-box'}}
              placeholder="Escribe aquí si lo deseas..."
            />
            <span style={{fontSize:12,color:'#7A6654',textAlign:'right',fontFamily:"'Lato',sans-serif"}}>{motivo.length}/500</span>
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>onNavigate&&onNavigate('profile')} style={{height:44,padding:'0 20px',background:'none',border:'none',color:'#7A6654',fontSize:14,fontFamily:"'Lato',sans-serif",cursor:'pointer',borderRadius:6}}>Cancelar</button>
            <button onClick={()=>setDialog(true)} style={{...profStyles.btnPrimary,flex:1,background:'#B42318'}}>
              Solicitar desafiliación
            </button>
          </div>
        </div>
      </div>

      {dialog && (
        <ConfirmDialog
          title="¿Confirmas la desafiliación?"
          message="Esta acción iniciará el proceso de desafiliación. Podrás reafiliarte en el futuro si lo deseas."
          confirmLabel="Confirmar desafiliación"
          destructive={true}
          requireComment={false}
          onConfirm={handleConfirm}
          onCancel={()=>setDialog(false)}
        />
      )}
      {toast && <Toast {...toast} onDismiss={()=>setToast(null)}/>}
    </div>
  );
};

Object.assign(window, { Badge, ConfirmDialog, Toast, ProfileScreen, AffiliationScreen, DisaffiliationScreen });
