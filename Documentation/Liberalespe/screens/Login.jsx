
// Pantalla 1: Login — Liberales PE
const LoginScreen = ({ onNavigate }) => {
  const [showPass, setShowPass] = React.useState(false);
  const [dni, setDni] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dni || !pass) { setError('Por favor completa todos los campos.'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError('DNI o contraseña incorrectos.');
    }, 900);
  };

  return (
    <div style={loginStyles.root}>
      <div style={loginStyles.card}>
        {/* Logo */}
        <div style={loginStyles.logoArea}>
          <div style={loginStyles.logoMark}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#4A2C1A"/>
              <path d="M10 26V12l8-4 8 4v14H22v-7h-4v7H10z" fill="#FAF6EF" opacity="0.9"/>
            </svg>
          </div>
          <span style={loginStyles.logoText}>Liberales</span>
        </div>

        <h1 style={loginStyles.title}>Ingresa a tu cuenta</h1>

        <form onSubmit={handleSubmit} noValidate style={{width:'100%'}}>
          {/* DNI */}
          <div style={loginStyles.fieldGroup}>
            <label htmlFor="login-dni" style={loginStyles.label}>Número de DNI</label>
            <input
              id="login-dni"
              type="tel"
              inputMode="numeric"
              maxLength={8}
              value={dni}
              onChange={e => setDni(e.target.value.replace(/\D/g,''))}
              placeholder="12345678"
              style={{...loginStyles.input, fontFamily:'monospace', letterSpacing:'0.15em'}}
              autoComplete="username"
            />
          </div>

          {/* Contraseña */}
          <div style={loginStyles.fieldGroup}>
            <label htmlFor="login-pass" style={loginStyles.label}>Contraseña</label>
            <div style={loginStyles.inputWrap}>
              <input
                id="login-pass"
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={e => setPass(e.target.value)}
                style={{...loginStyles.input, paddingRight:44}}
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPass(v => !v)}
                style={loginStyles.eyeBtn}
              >
                {showPass
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" style={loginStyles.errorBanner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{...loginStyles.btnPrimary, opacity: loading ? 0.75 : 1}}
          >
            {loading
              ? <><span style={loginStyles.spinner}></span> Verificando...</>
              : 'Ingresar'
            }
          </button>
        </form>

        <p style={loginStyles.registerLink}>
          ¿No tienes cuenta?{' '}
          <a href="#" onClick={e=>{e.preventDefault(); onNavigate && onNavigate('register')}} style={loginStyles.link}>
            Regístrate
          </a>
        </p>

        <p style={loginStyles.helpText}>
          Si perdiste acceso, contacta a un operador del partido.
        </p>
      </div>
    </div>
  );
};

const loginStyles = {
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
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  logoArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoMark: {},
  logoText: {
    fontFamily: "'EB Garamond', serif",
    fontSize: 22,
    fontWeight: 700,
    color: '#4A2C1A',
    letterSpacing: '0.04em',
  },
  title: {
    fontFamily: "'EB Garamond', serif",
    fontSize: 24,
    fontWeight: 600,
    color: '#1C120B',
    margin: '0 0 28px',
    textAlign: 'center',
  },
  fieldGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 18,
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
  inputWrap: {
    position: 'relative',
    width: '100%',
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
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#FCE8DF',
    border: '1px solid #F5C6B0',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 14,
    color: '#9A3412',
    marginBottom: 16,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Lato', sans-serif",
  },
  btnPrimary: {
    width: '100%',
    height: 44,
    background: '#C25A1A',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Lato', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 150ms ease-out',
    marginTop: 4,
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
  registerLink: {
    marginTop: 20,
    fontSize: 14,
    color: '#7A6654',
    fontFamily: "'Lato', sans-serif",
    textAlign: 'center',
  },
  link: {
    color: '#C25A1A',
    textDecoration: 'none',
    fontWeight: 700,
  },
  helpText: {
    marginTop: 12,
    fontSize: 12,
    color: '#7A6654',
    fontFamily: "'Lato', sans-serif",
    textAlign: 'center',
    fontWeight: 300,
    lineHeight: 1.5,
  },
};

Object.assign(window, { LoginScreen });
