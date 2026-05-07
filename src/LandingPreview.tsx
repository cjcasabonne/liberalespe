import { useState } from 'react';
import './styles.css';
import './landing-preview.css';

const valores = [
  { nombre: 'Libertad', desc: 'El derecho de cada persona a decidir su propio proyecto de vida sin interferencias arbitrarias del poder político.' },
  { nombre: 'Igualdad ante la ley', desc: 'Mismas reglas para todos. Sin privilegios, sin excepciones, sin ciudadanos de primera y segunda categoría.' },
  { nombre: 'Responsabilidad individual', desc: 'La libertad implica asumir decisiones y consecuencias. El progreso empieza por el esfuerzo personal.' },
  { nombre: 'Propiedad privada', desc: 'La base de la autonomía económica. Defenderla es proteger el trabajo, el ahorro y la iniciativa individual.' },
  { nombre: 'Emprendimiento', desc: 'Crear, invertir y generar valor sin trabas innecesarias. Así se construyen empleos y oportunidades reales.' },
  { nombre: 'Innovación', desc: 'Competitividad basada en conocimiento, tecnología y apertura al cambio.' },
  { nombre: 'Talento', desc: 'El mérito debe abrir puertas. No la burocracia ni los privilegios políticos.' },
  { nombre: 'Competencia', desc: 'Mercados abiertos que premian calidad, reducen precios y amplían opciones para los ciudadanos.' },
  { nombre: 'Mercado libre', desc: 'Intercambio voluntario bajo reglas claras. Regulación que garantice, no que asfixie.' },
  { nombre: 'Progreso', desc: 'No se decreta desde el poder: se construye con libertad económica e instituciones estables.' },
  { nombre: 'Estado limitado', desc: 'Fuerte donde corresponde, ausente donde estorba. Más libertad para el ciudadano.' },
  { nombre: 'Desregulación', desc: 'Menos trámites, menos barreras, más oportunidades para crecer.' },
];

const manifiesto = [
  'La defensa irrestricta de la libertad individual.',
  'La igualdad ante la ley, sin privilegios ni castas políticas.',
  'Un Estado limitado, eficiente y sometido a controles reales.',
  'Una economía abierta donde el mérito, y no los contactos, definan el progreso.',
  'La eliminación de barreras que protegen intereses creados y bloquean oportunidades.',
  'La lucha frontal contra el mercantilismo, la corrupción y toda forma de captura del poder.',
  'Reformas estructurales que modernicen el Estado, fortalezcan las instituciones y garanticen seguridad jurídica.',
  'Una política de seguridad ciudadana firme, basada en el imperio de la ley.',
  'Responsabilidad fiscal, equilibrio en las cuentas públicas y uso eficiente de los recursos de todos.',
  'Ciudadanos activos que vigilan, fiscalizan y limitan al poder.',
];

const navLinks = [
  { href: '#quienes', label: '¿Quiénes somos?' },
  { href: '#valores', label: 'Valores' },
  { href: '#defender', label: 'Lo que defendemos' },
  { href: '#manifiesto', label: 'Manifiesto' },
  { href: '#participa', label: 'Participa' },
];

export default function LandingPreview() {
  const [menuOpen, setMenuOpen] = useState(false);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <div className="lp-shell">
      {/* Nav */}
      <nav className="lp-nav" aria-label="Navegación principal">
        <div className="lp-nav-inner">
          <a className="lp-nav-brand" href="#hero" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
            <img src="/logo_cs.svg" alt="Logo Ciudadanos PE" />
            Ciudadanos PE
          </a>

          <ul className="lp-nav-links" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={(e) => { e.preventDefault(); scrollTo(link.href.slice(1)); }}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="lp-nav-actions">
            <a className="lp-btn lp-nav-cta" href="#participa" onClick={(e) => { e.preventDefault(); scrollTo('participa'); }}>
              Únete
            </a>
            <a className="lp-btn lp-btn-outline lp-nav-ingresar" href="/ingresar">
              Ingresar
            </a>
          </div>

          <button
            className="lp-menu-btn"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className={`lp-mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); scrollTo(link.href.slice(1)); }}>
              {link.label}
            </a>
          ))}
          <a href="#participa" onClick={(e) => { e.preventDefault(); scrollTo('participa'); }}>
            → Únete a Ciudadanos
          </a>
          <a href="/ingresar">→ Ingresar</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero" id="hero" aria-labelledby="hero-title">
        <div className="lp-hero-inner">
          <p className="lp-hero-label">Partido por el Cambio, la Libertad y el Futuro</p>
          <h1 className="lp-hero-title" id="hero-title">
            El poder debe volver<br />
            a los <em>ciudadanos</em>.
          </h1>
          <p className="lp-hero-sub">
            Ciudadanos PE es una nueva opción liberal que defiende la libertad individual,
            la igualdad ante la ley y el mérito como pilares. No creemos en el Estado
            paternalista sino en la fuerza de las personas libres.
          </p>
          <div className="lp-hero-actions">
            <a className="lp-btn" href="#participa" onClick={(e) => { e.preventDefault(); scrollTo('participa'); }}>
              Afilíate
            </a>
            <a className="lp-btn lp-btn-outline" href="#quienes" onClick={(e) => { e.preventDefault(); scrollTo('quienes'); }}>
              Conoce el proyecto
            </a>
            <a className="lp-btn lp-btn-outline" href="/ingresar">
              Ingresar
            </a>
          </div>
        </div>
      </section>

      {/* Quiénes somos */}
      <section id="quienes" aria-labelledby="quienes-title">
        <div className="lp-section">
          <p className="lp-section-label">El equipo</p>
          <h2 className="lp-section-title" id="quienes-title">¿Quiénes somos?</h2>
          <div className="lp-section-body">
            <p>
              Somos un grupo de jóvenes que decidió dejar de observar la política desde lejos.
              Cansados de ver cómo el Estado se volvía más grande, más ineficiente y menos útil
              para los ciudadanos, entendimos que el Perú necesitaba una alternativa liberal moderna.
            </p>
            <p>
              Creemos en la libertad individual, en la responsabilidad personal y en un Estado
              limitado que sirva, no que controle. Rechazamos el asistencialismo, el mercantilismo
              y la burocracia que frena el talento y las oportunidades de millones de peruanos.
            </p>
            <p>
              Ciudadanos nace con una premisa simple: <strong>el poder debe volver a las personas,
              no quedarse en manos del Estado ni de una élite política.</strong>
            </p>
            <p>
              Apostamos por un país donde las reglas sean claras, la competencia sea real y el
              progreso dependa del esfuerzo y del mérito de cada individuo. Somos jóvenes, sí.
              Pero también somos libres, responsables y conscientes de que el cambio no vendrá
              de arriba. <strong>El cambio lo construimos nosotros.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="lp-values-bg" id="valores" aria-labelledby="valores-title">
        <div className="lp-section">
          <p className="lp-section-label">Nuestros principios</p>
          <h2 className="lp-section-title" id="valores-title">Valores que nos unen</h2>
          <p className="lp-section-body">
            <span>Valores que defienden la libertad, limitan el poder del Estado y permiten el progreso de todos.</span>
          </p>
          <div className="lp-values-grid" role="list">
            {valores.map((v) => (
              <div className="lp-value-card" key={v.nombre} role="listitem">
                <p className="lp-value-name">{v.nombre}</p>
                <p className="lp-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lo que vamos a defender */}
      <section className="lp-alt-bg" id="defender" aria-labelledby="defender-title">
        <div className="lp-section">
          <p className="lp-section-label">Posición política</p>
          <h2 className="lp-section-title" id="defender-title">Lo que vamos a defender</h2>
          <div className="lp-section-body">
            <p>
              En Ciudadanos creemos que la política no empieza cuando alguien llega al poder,
              sino cuando los ciudadanos se organizan para ponerle límites a quienes gobiernan
              y defender sus derechos.
            </p>
            <p>
              Mientras no seamos gobierno, actuaremos como lo que somos: ciudadanos comprometidos
              con la defensa de una sociedad libre. Vamos a defender la libertad sin complejos y
              sin miedos. Frente a cualquier intento de expansión arbitraria del poder político,
              frente a regulaciones que asfixian al que emprende o privilegios que benefician a
              unos pocos a costa de todos.
            </p>
            <p>
              Defenderemos la igualdad ante la ley. Denunciaremos normas hechas a la medida de
              grupos de interés. Nos opondremos a que el éxito dependa de tener contactos en el
              gobierno y no del esfuerzo, el talento o el trabajo honesto.
            </p>
            <p>
              Impulsaremos un debate público basado en evidencia, responsabilidad fiscal y respeto
              a las instituciones. No aceptaremos que el Estado sea utilizado como botín político
              ni como herramienta para repartir favores entre aliados.
            </p>
            <p>
              Porque una sociedad libre no se defiende solo desde el gobierno. Se defiende desde
              la ciudadanía. Y nosotros asumimos ese compromiso desde hoy: actuar, proponer y
              exigir reglas claras, instituciones fuertes y límites efectivos al ejercicio del poder.
            </p>
          </div>
        </div>
      </section>

      {/* Manifiesto */}
      <section id="manifiesto" aria-labelledby="manifiesto-title">
        <div className="lp-section">
          <p className="lp-section-label">Lo que nos mueve</p>
          <h2 className="lp-section-title" id="manifiesto-title">Manifiesto de Ciudadanos</h2>
          <p className="lp-section-body">
            <span>Ciudadanos nace y se sostiene sobre estos principios:</span>
          </p>
          <ul className="lp-manifesto-list" role="list">
            {manifiesto.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="lp-manifesto-cta">¡La libertad no se logra sola! ¡Actuemos juntos!</p>
        </div>
      </section>

      {/* Proyecto común */}
      <section className="lp-alt-bg" id="proyecto" aria-labelledby="proyecto-title">
        <div className="lp-section">
          <p className="lp-section-label">Visión de país</p>
          <h2 className="lp-section-title" id="proyecto-title">Un proyecto común para el Perú</h2>
          <div className="lp-section-body">
            <p>
              En Ciudadanos creemos que el Perú necesita algo más que alternancia en el poder:
              necesita reglas claras, instituciones sólidas y ciudadanos libres para construir
              su propio futuro. Por eso trabajamos para fortalecer el Estado de derecho, limitar
              el poder discrecional del gobierno y garantizar una economía abierta y competitiva,
              donde el mérito, la igualdad ante la ley y las oportunidades reales sean la base del progreso.
            </p>
            <p>
              Nuestro objetivo es contribuir a superar la crisis económica, la inseguridad y la
              corrupción mediante reformas que recuperen la confianza en las instituciones, eliminen
              los privilegios que distorsionan la competencia y pongan fin al capitalismo de amiguetes
              que convierte al Estado en un instrumento al servicio de unos pocos.
            </p>
            <p>
              Creemos en un país donde el esfuerzo sea recompensado, las reglas se respeten y el
              poder tenga límites. El objetivo no es un Estado más grande, sino un Estado que
              funcione mejor y esté realmente al servicio de las personas.
            </p>
            <p>
              <strong>El Perú no necesita más promesas, sino soluciones a los problemas reales de los peruanos.
              Ese es el proyecto común que queremos construir.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Participa */}
      <section className="lp-participa-bg" id="participa" aria-labelledby="participa-title">
        <div className="lp-section">
          <p className="lp-section-label">Únete</p>
          <h2 className="lp-section-title" id="participa-title">Ayúdanos a construir un país libre</h2>
          <div className="lp-participa-cards">
            <div className="lp-participa-card lp-sincomplejos-card">
              <a
                className="lp-sincomplejos-link"
                href="https://www.linkedin.com/newsletters/sin-complejos-7386187440685891584/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Leer newsletter Sin Complejos en LinkedIn"
              >
                <img
                  src="/sin_complejos.png"
                  alt="Sin Complejos — newsletter de opinión liberal"
                  className="lp-sincomplejos-img"
                />
                <div className="lp-sincomplejos-body">
                  <h3>Sin Complejos</h3>
                  <ul>
                    <li>Análisis directo sobre la coyuntura política nacional.</li>
                    <li>Artículos de opinión política escritos por J.</li>
                    <li>Ideas y propuestas para una agenda liberal en el Perú.</li>
                  </ul>
                  <span className="lp-btn lp-sincomplejos-btn">Leer newsletter</span>
                </div>
              </a>
            </div>

            <div className="lp-participa-card">
              <h3>Afilíate a Ciudadanos</h3>
              <ul>
                <li>Da el primer paso para afiliarte a Ciudadanos.</li>
                <li>Déjanos tus datos para iniciar el proceso.</li>
                <li>Coordinamos contigo para formalizar tu afiliación.</li>
              </ul>
              <a
                className="lp-btn"
                href="https://docs.google.com/forms/d/e/1FAIpQLSf7NpTEejZqR-98v3tMaUiCV9YrDY829EOcVhEci-dYMy7-Bg/viewform"
                target="_blank"
                rel="noopener noreferrer"
              >
                Solicitar afiliación
              </a>
            </div>

            <div className="lp-participa-card">
              <h3>Sé parte del equipo</h3>
              <ul>
                <li>Únete al equipo que impulsa este proyecto liberal en todo el país.</li>
                <li>Ayúdanos a sumar adherentes y nuevos miembros comprometidos.</li>
                <li>Construyamos un partido que devuelva el protagonismo a los ciudadanos.</li>
              </ul>
              <a
                className="lp-btn"
                href="https://docs.google.com/forms/d/e/1FAIpQLSct4xbKLiCtkjzacsfQ0C4ZHzydJn09JTLryI6jxz0vYe3I8A/viewform"
                target="_blank"
                rel="noopener noreferrer"
              >
                Participar como voluntario
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer" aria-label="Pie de página">
        <div className="lp-footer-inner">
          <span>© 2026 Ciudadanos – Partido por el Cambio, la Libertad y el Futuro</span>
          <a href="mailto:info.liberalescs@gmail.com">info.liberalescs@gmail.com</a>
        </div>
      </footer>
    </div>
  );
}
