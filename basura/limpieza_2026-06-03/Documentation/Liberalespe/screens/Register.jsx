
// Pantalla 2: Registro multi-paso — Liberales PE
const RegisterScreen = ({ onNavigate }) => {
  const [step, setStep] = React.useState(1);
  const [dni, setDni] = React.useState('');
  const [dniError, setDniError] = React.useState('');
  const [dniLoading, setDniLoading] = React.useState(false);
  const [nombres, setNombres] = React.useState('');
  const [apellidos, setApellidos] = React.useState('');
  const [nameAutoFilled, setNameAutoFilled] = React.useState(false);
  const [nameServiceFailed, setNameServiceFailed] = React.useState(false);
  const [telefono, setTelefono] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPass, setConfirmPass] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [passError, setPassError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  // Password strength
  const passStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };
  const strengthLabel = ['','Débil','Media','Fuerte'];
  const strengthColor = ['','#B42318','#B45309','#4D7C0F'];
  const strength = passStrength();

  // Step 1 submit
  const handleDniSubmit = (e) => {
    e.preventDefault();
    if (dni.length !== 8) { setDniError('Ingresa un DNI válido de 8 dígitos.'); return; }
    setDniError('');
    setDniLoading(true);
    setTimeout(() => {
      setDniLoading(false);
      // Simulate autoFill success
      setNombres('María Alejandra');
      setApellidos('Torres Quispe');
      setNameAutoFilled(true);
      setNameServiceFailed(false);
      setStep(2);
    }, 800);
  };

  // Step 2
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim()) return;
    setStep(3);
  };

  // Step 3
  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!telefono.trim()) return;
    setStep(4);
  };

  // Step 4
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPass) { setPassError('Las contraseñas no coinciden.'); return; }
    if (password.length < 10) { setPassError('La contraseña debe tener al menos 10 caracteres.'); return; }
    setPassError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 1200);
  };

  const stepLabels = ['Tu DNI','Tu nombre','Tu contacto','Tu contraseña'];

  if (done) {
    return (
      <div style={regStyles.root}>
        <div style={regStyles.card}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,textAlign:'center'}}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#4D7C0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h1 style={{...regStyles.title, marginBottom:0}}>Cuenta creada</h1>
            <p style={{fontSize:15,color:'#6B4E3D',lineHeight:1.6,maxWidth:300,margin:0}}>
              Tu cuenta ha sido registrada. Un operador revisará tus datos para validar tu identidad antes de continuar.
            </p>
            <button
              style={{...regStyles.btnPrimary, marginTop:8}}
              onClick={() => onNavigate && onNavigate('profile')}
            >Ir a mi perfil</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={regStyles.root}>
      <div style={regStyles.card}>
        {/* Logo */}
        <div style={regStyles.logoArea}>
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#4A2C1A"/>
            <path d="M10 26V12l8-4 8 4v14H22v-7h-4v7H10z" fill="#FAF6EF" opacity="0.9"/>
          </svg>
          <span style={regStyles.logoText}>Liberales</span>
        </div>

        {/* Step indicator */}
        <div style={regStyles.stepIndicator}>
          <span style={regStyles.stepLabel}>Paso {step} de 4 — {stepLabels[step-1]}</span>
          <div style={regStyles.progressBar}>
            <div style={{...regStyles.progressFill, width: `${(step/4)*100}%`}}></div>
          </div>
        </div>

        {/* STEP 1: DNI */}
        {step === 1 && (
          <form onSubmit={handleDniSubmit} noValidate style={{width:'100%'}}>
            <h1 style={regStyles.title}>¿Cuál es tu número de DNI?</h1>
            <div style={regStyles.fieldGroup}>
              <label htmlFor="reg-dni" style={regStyles.label}>Número de DNI</label>
              <input
                id="reg-dni"
                type="tel"
                inputMode="numeric"
                maxLength={8}
                value={dni}
                onChange={e => setDni(e.target.value.replace(/\D/,''))}
                onBlur={() => { if(dni && dni.length !== 8) setDniError('Ingresa un DNI válido de 8 dígitos.'); else setDniError(''); }}
                placeholder="12345678"
                style={{...regStyles.input, fontFamily:'monospace', letterSpacing:'0.15em'}}
              />
              {dniError && (
                <span role="alert" style={regStyles.fieldError}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C25A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {dniError}
                </span>
              )}
              <span style={regStyles.helper}>Tu DNI es la clave de acceso al sistema. Debe ser válido.</span>
            </div>
            <button type="submit" disabled={dniLoading} style={{...regStyles.btnPrimary, opacity: dniLoading ? 0.75 : 1}}>
              {dniLoading ? <><span style={regStyles.spinner}></span> Verificando...</> : 'Continuar'}
            </button>
          </form>
        )}

        {/* STEP 2: Nombre */}
        {step === 2 && (
          <form onSubmit={handleNameSubmit} noValidate style={{width:'100%'}}>
            <h1 style={regStyles.title}>¿Cuáles son tus nombres y apellidos?</h1>

            {nameAutoFilled && !nameServiceFailed && (
              <div style={regStyles.infoBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Nombre obtenido del Registro Nacional. Puedes editarlo si hay un error.</span>
              </div>
            )}
            {nameServiceFailed && (
              <div style={regStyles.warnBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>No pudimos verificar tu DNI automáticamente. Por favor ingresa tu nombre completo.</span>
              </div>
            )}

            <div style={regStyles.fieldGroup}>
              <label htmlFor="reg-nombres" style={regStyles.label}>Nombres</label>
              <input id="reg-nombres" type="text" value={nombres} onChange={e=>setNombres(e.target.value)} required style={regStyles.input}/>
            </div>
            <div style={regStyles.fieldGroup}>
              <label htmlFor="reg-apellidos" style={regStyles.label}>Apellidos</label>
              <input id="reg-apellidos" type="text" value={apellidos} onChange={e=>setApellidos(e.target.value)} required style={regStyles.input}/>
            </div>

            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button type="button" onClick={()=>setStep(1)} style={regStyles.btnGhost}>Atrás</button>
              <button type="submit" style={{...regStyles.btnPrimary, flex:1}}>
                {nameAutoFilled ? 'Confirmar nombre' : 'Continuar'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Teléfono */}
        {step === 3 && (
          <form onSubmit={handlePhoneSubmit} noValidate style={{width:'100%'}}>
            <h1 style={regStyles.title}>¿Cuál es tu número de teléfono?</h1>
            <div style={regStyles.fieldGroup}>
              <label htmlFor="reg-tel" style={regStyles.label}>Número de teléfono</label>
              <div style={{display:'flex',gap:8}}>
                <div style={{...regStyles.input, width:54, display:'flex',alignItems:'center',justifyContent:'center',color:'#7A6654',fontSize:14,flexShrink:0,cursor:'default'}}>+51</div>
                <input id="reg-tel" type="tel" inputMode="numeric" value={telefono} onChange={e=>setTelefono(e.target.value.replace(/\D/,''))} maxLength={9} style={{...regStyles.input, flex:1}}/>
              </div>
              <span style={regStyles.helper}>Este número puede ser usado por operadores del partido para contactarte.</span>
            </div>
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button type="button" onClick={()=>setStep(2)} style={regStyles.btnGhost}>Atrás</button>
              <button type="submit" style={{...regStyles.btnPrimary, flex:1}}>Continuar</button>
            </div>
          </form>
        )}

        {/* STEP 4: Contraseña */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} noValidate style={{width:'100%'}}>
            <h1 style={regStyles.title}>Elige una contraseña</h1>

            <div style={regStyles.fieldGroup}>
              <label htmlFor="reg-pass" style={regStyles.label}>Contraseña</label>
              <div style={{position:'relative'}}>
                <input
                  id="reg-pass"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  style={{...regStyles.input, paddingRight:44, width:'100%', boxSizing:'border-box'}}
                  minLength={10}
                />
                <button type="button" aria-label={showPass?'Ocultar':'Mostrar'} onClick={()=>setShowPass(v=>!v)} style={regStyles.eyeBtn}>
                  {showPass
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {/* Strength indicator */}
              {password && (
                <div style={{display:'flex',gap:4,marginTop:6,alignItems:'center'}}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{height:4, flex:1, borderRadius:2, background: strength >= i ? strengthColor[strength] : '#E2CDB6', transition:'background 200ms ease-out'}}></div>
                  ))}
                  <span style={{fontSize:12,color:strengthColor[strength],fontWeight:700,marginLeft:6,minWidth:40}}>{strengthLabel[strength]}</span>
                </div>
              )}
              <span style={regStyles.helper}>Mínimo 10 caracteres.</span>
            </div>

            <div style={regStyles.fieldGroup}>
              <label htmlFor="reg-confirm" style={regStyles.label}>Confirmar contraseña</label>
              <div style={{position:'relative'}}>
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e=>setConfirmPass(e.target.value)}
                  onBlur={()=>{ if(confirmPass && confirmPass!==password) setPassError('Las contraseñas no coinciden.'); else setPassError(''); }}
                  style={{...regStyles.input, paddingRight:44, width:'100%', boxSizing:'border-box'}}
                />
                <button type="button" aria-label={showConfirm?'Ocultar':'Mostrar'} onClick={()=>setShowConfirm(v=>!v)} style={regStyles.eyeBtn}>
                  {showConfirm
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {passError && (
                <span role="alert" style={regStyles.fieldError}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C25A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {passError}
                </span>
              )}
            </div>

            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button type="button" onClick={()=>setStep(3)} style={regStyles.btnGhost}>Atrás</button>
              <button type="submit" disabled={submitting} style={{...regStyles.btnPrimary, flex:1, opacity:submitting?0.75:1}}>
                {submitting ? <><span style={regStyles.spinner}></span> Creando tu cuenta...</> : 'Crear cuenta'}
              </button>
            </div>
          </form>
        )}

        <p style={{marginTop:18,fontSize:13,color:'#7A6654',textAlign:'center',fontFamily:"'Lato',sans-serif"}}>
          ¿Ya tienes cuenta?{' '}
          <a href="#" onClick={e=>{e.preventDefault(); onNavigate && onNavigate('login')}} style={{color:'#C25A1A',textDecoration:'none',fontWeight:700}}>
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
};

const regStyles = {
  root: {
    minHeight: '100%',
    background: '#FAF6EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'Lato', sans-serif",
  },
  card: {
    background: '#FFFDF8',
    border: '1px solid #E2CDB6',
    borderRadius: 6,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: '36px 36px',
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  logoText: {
    fontFamily: "'EB Garamond', serif",
    fontSize: 20,
    fontWeight: 700,
    color: '#4A2C1A',
  },
  stepIndicator: {
    width: '100%',
    marginBottom: 24,
  },
  stepLabel: {
    fontSize: 12,
    color: '#7A6654',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    background: '#EFE3D3',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#C25A1A',
    borderRadius: 2,
    transition: 'width 250ms ease-out',
  },
  title: {
    fontFamily: "'EB Garamond', serif",
    fontSize: 22,
    fontWeight: 600,
    color: '#1C120B',
    margin: '0 0 22px',
    lineHeight: 1.3,
    width: '100%',
  },
  fieldGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1C120B',
    fontFamily: "'Lato', sans-serif",
  },
  input: {
    width: '100%',
    height: 44,
    padding: '0 12px',
    border: '1px solid #E2CDB6',
    borderRadius: 6,
    fontSize: 16,
    color: '#1C120B',
    background: '#FFFDF8',
    outline: 'none',
    fontFamily: "'Lato', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 150ms ease-out',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  helper: {
    fontSize: 12,
    color: '#7A6654',
    fontWeight: 300,
    fontFamily: "'Lato', sans-serif",
    lineHeight: 1.4,
  },
  fieldError: {
    fontSize: 13,
    color: '#C25A1A',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontFamily: "'Lato', sans-serif",
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: '#FFF7ED',
    border: '1px solid #F5D8B0',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 13,
    color: '#6B4E3D',
    marginBottom: 16,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Lato', sans-serif",
    lineHeight: 1.5,
  },
  warnBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: '#FEF0C7',
    border: '1px solid #F5D48A',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 13,
    color: '#8A4B0F',
    marginBottom: 16,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Lato', sans-serif",
    lineHeight: 1.5,
  },
  btnPrimary: {
    height: 44,
    background: '#C25A1A',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Lato', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 150ms ease-out',
    width: '100%',
  },
  btnGhost: {
    height: 44,
    background: 'none',
    color: '#7A6654',
    border: 'none',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 400,
    fontFamily: "'Lato', sans-serif",
    cursor: 'pointer',
    padding: '0 16px',
    transition: 'color 150ms ease-out',
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};

Object.assign(window, { RegisterScreen });
