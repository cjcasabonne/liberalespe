import { FormEvent, useMemo, useState } from 'react';
import { dniToAuthEmail, isValidDni, normalizeDni } from './lib/auth';
import { buscarDni } from './lib/dniService';
import { supabase } from './lib/supabase';

type RegisterStep = 1 | 2 | 3 | 4;

type RegisterScreenProps = {
  onRegistered: () => void;
  onLogin: () => void;
};

const neutralRegisterError =
  'No se pudo completar el registro. Si ya tienes una cuenta o necesitas recuperar acceso, solicita revisión manual.';

function isStrongPassword(password: string) {
  return password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordStrength(password: string) {
  if (!password) {
    return 0;
  }

  let score = 0;
  if (password.length >= 10) {
    score += 1;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }
  return score;
}

export function RegisterScreen({ onRegistered, onLogin }: RegisterScreenProps) {
  const [step, setStep] = useState<RegisterStep>(1);
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dniLoading, setDniLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [manualFallback, setManualFallback] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  const strength = useMemo(() => passwordStrength(password), [password]);
  const stepLabels = ['Tu DNI', 'Tu nombre', 'Tu contacto', 'Confirmación'];

  async function handleDniSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setHint('');

    const normalizedDni = normalizeDni(dni);
    if (!isValidDni(normalizedDni)) {
      setError('Ingresa un DNI válido de 8 dígitos.');
      return;
    }

    setDni(normalizedDni);
    setDniLoading(true);
    const result = await buscarDni(normalizedDni);
    setDniLoading(false);

    if (result.ok) {
      setNombres(result.nombreCompleto.toUpperCase());
      setAutoFilled(true);
      setManualFallback(false);
      setHint('Nombre autocompletado. Confirma los datos antes de registrar.');
      setStep(2);
      return;
    }

    setAutoFilled(false);
    setManualFallback(true);

    if (result.reason === 'rate_limit') {
      setHint('Servicio ocupado por muchas solicitudes. Ingresa el nombre manualmente.');
    } else if (result.reason === 'timeout') {
      setHint('La consulta está tardando más de lo esperado. Ingresa el nombre manualmente.');
    } else {
      setHint('No se pudo autocompletar. Ingresa el nombre manualmente.');
    }

    setStep(2);
  }

  function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const normalizedNames = nombres.trim().replace(/\s+/g, ' ');
    if (normalizedNames.length < 3) {
      setError('Ingresa nombres válidos.');
      return;
    }

    setNombres(normalizedNames.toUpperCase());
    setStep(3);
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (telefono.trim().length > 0 && telefono.trim().length < 6) {
      setError('Ingresa un teléfono de contacto válido.');
      return;
    }

    if (!isValidEmail(correo.trim())) {
      setError('Ingresa un correo de contacto válido.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setStep(4);
  }

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setError(neutralRegisterError);
      return;
    }

    setError('');
    setSubmitting(true);

    const normalizedDni = normalizeDni(dni);
    const normalizedNames = nombres.trim().replace(/\s+/g, ' ');
    const normalizedPhone = telefono.trim();
    const normalizedEmail = correo.trim().toLowerCase();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: dniToAuthEmail(normalizedDni),
      password,
      options: {
        data: { dni: normalizedDni },
      },
    });

    if (signUpError || !signUpData.user) {
      setSubmitting(false);
      setError(neutralRegisterError);
      return;
    }

    const { error: profileError } = await supabase.from('perfiles').insert({
      user_id: signUpData.user.id,
      dni: normalizedDni,
      nombres: normalizedNames.toUpperCase(),
      telefono: normalizedPhone || null,
      correo_contacto: normalizedEmail,
    });

    setSubmitting(false);

    if (profileError) {
      setError(neutralRegisterError);
      return;
    }

    onRegistered();
  }

  return (
    <section className="register-screen" aria-label="Registro">
      <div className="register-card">
        <div className="register-brand">
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="18" fill="currentColor" />
            <path d="M10 26V12l8-4 8 4v14H22v-7h-4v7H10z" fill="var(--color-background)" opacity="0.92" />
          </svg>
          <span>Liberales</span>
        </div>

        <div className="register-progress" aria-label={`Paso ${step} de 4`}>
          <span>
            Paso {step} de 4 - {stepLabels[step - 1]}
          </span>
          <div>
            <i style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {step === 1 ? (
          <form className="register-form" onSubmit={handleDniSubmit} noValidate>
            <h2>¿Cuál es tu número de DNI?</h2>
            <label>
              Número de DNI
              <input
                inputMode="numeric"
                maxLength={8}
                value={dni}
                onChange={(event) => {
                  setError('');
                  setDni(normalizeDni(event.target.value));
                }}
                autoComplete="username"
                className="register-dni-input"
                placeholder="12345678"
              />
            </label>
            {error ? <p className="register-error">{error}</p> : null}
            <p className="register-helper">Tu DNI se usa como identificador de acceso al sistema.</p>
            <button type="submit" disabled={dniLoading}>
              {dniLoading ? 'Consultando...' : 'Continuar'}
            </button>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="register-form" onSubmit={handleNameSubmit} noValidate>
            <h2>¿Cuáles son tus nombres completos?</h2>
            {autoFilled ? <p className="register-info">{hint}</p> : null}
            {manualFallback ? <p className="register-warning">{hint}</p> : null}
            <label>
              Nombres completos
              <input value={nombres} onChange={(event) => setNombres(event.target.value.toUpperCase())} autoComplete="name" />
            </label>
            {error ? <p className="register-error">{error}</p> : null}
            <div className="register-actions">
              <button type="button" className="register-ghost" onClick={() => setStep(1)}>
                Atrás
              </button>
              <button type="submit">{autoFilled ? 'Confirmar nombre' : 'Continuar'}</button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <form className="register-form" onSubmit={handleContactSubmit} noValidate>
            <h2>Completa tus datos de contacto</h2>
            <label>
              Teléfono
              <input
                inputMode="tel"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value.replace(/\D/g, ''))}
                autoComplete="tel"
              />
            </label>
            <label>
              Correo de contacto
              <input
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value.trim().toLowerCase())}
                autoComplete="email"
                placeholder="nombre@correo.com"
              />
            </label>
            <label>
              Contraseña
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
            </label>
            {password ? (
              <div className="register-strength" aria-label="Fortaleza de contraseña">
                {[1, 2, 3].map((value) => (
                  <span key={value} className={strength >= value ? 'active' : ''} />
                ))}
                <strong>{['', 'Débil', 'Media', 'Fuerte'][strength]}</strong>
              </div>
            ) : null}
            <label>
              Confirmar contraseña
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </label>
            {error ? <p className="register-error">{error}</p> : null}
            <div className="register-actions">
              <button type="button" className="register-ghost" onClick={() => setStep(2)}>
                Atrás
              </button>
              <button type="submit">Continuar</button>
            </div>
          </form>
        ) : null}

        {step === 4 ? (
          <form className="register-form" onSubmit={handleCreateAccount} noValidate>
            <h2>Confirma tu registro</h2>
            <dl className="register-summary">
              <div>
                <dt>DNI</dt>
                <dd>{dni}</dd>
              </div>
              <div>
                <dt>Nombres</dt>
                <dd>{nombres}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{telefono || '-'}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{correo}</dd>
              </div>
            </dl>
            {error ? <p className="register-error">{error}</p> : null}
            <div className="register-actions">
              <button type="button" className="register-ghost" onClick={() => setStep(3)}>
                Atrás
              </button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        ) : null}

        <p className="register-switch">
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onLogin}>
            Ingresa
          </button>
        </p>
      </div>
    </section>
  );
}
