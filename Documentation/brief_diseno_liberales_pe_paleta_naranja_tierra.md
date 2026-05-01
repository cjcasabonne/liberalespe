# Brief de Diseño — Liberales PE
### Documento para Claude Design

---

## 1. Contexto del problema

**Liberales PE** no es una página institucional ni un formulario de captación. Es una plataforma operativa para gestionar el padrón político de un partido en Perú.

El problema central es el **ciclo de vida político-administrativo de un ciudadano**:

```
Registro → Validación manual → Solicitud de afiliación → Aprobación/Rechazo
                                                                  ↓
                                              Desafiliación o Anulación de cuenta
```

Cada estado tiene consecuencias reales: habilitar o deshabilitar derechos políticos internos (como el voto partidario). La interfaz debe comunicar este peso sin alarmar. Formal, confiable, claro.

---

## 2. Sistema de diseño

### Estilo base
**Accessible & Ethical** — Alto contraste, semántica clara, sin decoración innecesaria. WCAG AA mínimo, AAA donde sea posible.

> El diseño no debe competir con los datos. El padrón es el protagonista.

### Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#4A2C1A` | Encabezados, navbar, elementos de autoridad |
| `secondary` | `#6B4E3D` | Texto secundario, labels |
| `accent` | `#C25A1A` | CTAs, links, estados activos |
| `background` | `#FAF6EF` | Fondo general |
| `foreground` | `#1C120B` | Texto principal |
| `card` | `#FFFDF8` | Tarjetas y formularios |
| `muted` | `#EFE3D3` | Fondos alternativos, separadores |
| `muted-foreground` | `#7A6654` | Texto de ayuda, placeholders |
| `border` | `#E2CDB6` | Bordes de inputs y tarjetas |
| `destructive` | `#B42318` | Acciones destructivas (anular, rechazar) |
| `success` | `#4D7C0F` | Confirmaciones, estados aprobados |
| `warning` | `#B45309` | Estados pendientes, alertas operativas |

### Tipografía

```css
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');
```

| Rol | Fuente | Peso | Uso |
|-----|--------|------|-----|
| Display / H1 | EB Garamond | 700 | Título de sección principal |
| H2–H3 | EB Garamond | 600 | Subtítulos de sección |
| Body | Lato | 400 | Texto corrido, descripciones |
| Label | Lato | 700 | Labels de formularios, badges |
| Helper | Lato | 300 | Texto de ayuda, notas |
| Mono | System mono | 400 | DNI, IDs, datos técnicos |

**Escala tipográfica:** 12 / 14 / 16 / 18 / 24 / 32 / 40px  
**Line-height body:** 1.6  
**Tamaño mínimo:** 16px en mobile (evita zoom en iOS)

### Efectos

- **Sombras:** Sutiles. `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` para cards. Sin sombras dramáticas.
- **Bordes:** `border-radius: 6px` para inputs y tarjetas. `border-radius: 4px` para badges y chips.
- **Focus ring:** 3px solid `#C25A1A` con offset de 2px. Siempre visible, nunca omitido.
- **Transiciones:** 150–200ms ease-out. Solo en color, opacity y border. Nunca en width/height.
- **No usar:** glassmorphism, gradientes decorativos, blur de fondo, sombras de colores.

---

## 3. Iconografía

Usar exclusivamente **Lucide Icons** (stroke, 1.5px, 24px base).

| Contexto | Icono sugerido |
|----------|----------------|
| DNI / identificación | `id-card` o `fingerprint` |
| Estado activo | `check-circle` (verde) |
| Estado anulado | `ban` (rojo) |
| Estado desafiliado | `log-out` |
| Pendiente de validación | `clock` (amarillo) |
| Validado manualmente | `shield-check` |
| Afiliado | `badge-check` |
| Adherente | `user` |
| Administrador | `shield` |
| Fundador | `star` |
| Buscar | `search` |
| Filtros | `sliders-horizontal` |
| Auditoria | `scroll` |
| Alerta | `alert-triangle` |
| Información | `info` |

---

## 4. Componentes base

### Badges de estado

Son el elemento de mayor frecuencia. Deben ser inmediatamente legibles.

```
[activo]          → fondo #ECF5DD, texto #3F6212, ícono check-circle
[anulado]         → fondo #FCE8DF, texto #9A3412, ícono ban
[desafiliado]     → fondo #F3E8DA, texto #6B4E3D, ícono log-out
[pendiente]       → fondo #FEF0C7, texto #8A4B0F, ícono clock
[aprobada]        → fondo #ECF5DD, texto #3F6212, ícono check
[rechazada]       → fondo #FCE8DF, texto #9A3412, ícono x-circle
[cancelada]       → fondo #F3E8DA, texto #6B4E3D, ícono minus-circle
```

```
[adherente]       → fondo #FFF7ED, texto #9A3412, ícono user
[afiliado]        → fondo #F0F7E6, texto #3F6212, ícono badge-check
```

```
[validado]        → fondo #F0F7E6, texto #3F6212, ícono shield-check
[no validado]     → fondo #FEF0C7, texto #8A4B0F, ícono shield (outline)
```

Especificación: `padding: 3px 8px`, `font-size: 12px`, `font-weight: 700`, `border-radius: 4px`.

### Inputs de formulario

- Label visible siempre arriba del input (nunca solo placeholder)
- Helper text permanente debajo cuando aplica
- Error bajo el campo afectado, con ícono `alert-circle` terracota
- Validación on blur, no on keystroke
- Altura mínima input: 44px (touch target)
- Input de DNI: tipo `tel`, `inputmode="numeric"`, `maxlength="8"`, monoespaciado

### Botones

| Variante | Uso | Estilo |
|----------|-----|--------|
| Primary | Acción principal de pantalla | `background: #C25A1A`, texto blanco |
| Secondary | Acción secundaria | Borde `#C25A1A`, texto `#C25A1A`, fondo transparente |
| Destructive | Anular, rechazar | `background: #B42318`, texto blanco |
| Ghost | Cancelar, volver | Sin borde, texto `#7A6654` |

Un solo botón primary por pantalla. Los destructivos van siempre a la derecha en diálogos de confirmación.

### Toast / Notificaciones

- Posición: bottom-center en mobile, top-right en desktop
- Auto-dismiss: 4 segundos
- Variantes: success (oliva), error (terracota), info (cobre), warning (ámbar)
- Siempre incluir `aria-live="polite"` o `role="alert"`

### Diálogo de confirmación

Para todas las acciones destructivas o irreversibles (anular, rechazar, aprobar desafiliación):
- Fondo oscurecido al 50%
- Título claro de la acción
- Campo de texto obligatorio para motivo/comentario (con label visible)
- Botón destructivo primario + botón Ghost "Cancelar"

---

## 5. Pantallas a diseñar

---

### PANTALLA 1: Login

**Propósito:** El ciudadano ingresa al sistema con su DNI y contraseña.

**Elementos:**
- Logo + nombre "Liberales" centrado superior
- Título: "Ingresa a tu cuenta"
- Input DNI: label "Número de DNI", 8 dígitos, tipo numérico, monoespaciado
- Input contraseña: label "Contraseña", toggle show/hide
- Botón primary: "Ingresar"
- Enlace secundario: "¿No tienes cuenta? Regístrate"
- Texto de ayuda (pequeño, muted): "Si perdiste acceso, contacta a un operador del partido."

**UX crítica:**
- Sin recuperación automática de contraseña (no mostrar "¿Olvidaste tu contraseña?")
- Error genérico ante credenciales incorrectas: "DNI o contraseña incorrectos." Sin indicar cuál falló.
- Sin indicación de si el DNI existe o no existe en el sistema

**Layout:** Centrado en pantalla, card de 400px max-width. En mobile: full-width con padding 24px.

---

### PANTALLA 2: Registro — Flujo multi-paso

El registro es un flujo de **4 pasos**. Mostrar indicador de progreso "Paso X de 4" en la parte superior.

---

#### Paso 1: DNI

**Elementos:**
- Indicador: "Paso 1 de 4 — Tu DNI"
- Título: "¿Cuál es tu número de DNI?"
- Input DNI: label "Número de DNI", 8 dígitos exactos, tipo numérico, monoespaciado, validación on blur
- Texto ayuda: "Tu DNI es la clave de acceso al sistema. Debe ser válido."
- Botón primary: "Continuar"

**UX crítica:**
- Si el DNI ya existe: mensaje controlado neutral — "No se pudo completar el registro. Si ya tienes una cuenta o necesitas recuperar acceso, solicita revisión manual." NO indicar que el DNI existe.
- Spinner de "Verificando..." mientras se consulta el backend (breve, 500ms max visible)

---

#### Paso 2: Nombre

**Elementos:**
- Indicador: "Paso 2 de 4 — Tu nombre"
- Título: "¿Cuáles son tus nombres y apellidos?"

**Caso A — Autocompletado exitoso del servicio DNI:**
- Campo pre-llenado con nombre completo, editable
- Mensaje informativo (cobre info): "Nombre obtenido del Registro Nacional. Puedes editarlo si hay un error."
- Botón primary: "Confirmar nombre"

**Caso B — Servicio DNI degradado/fallido:**
- Banner de aviso (ámbar, sin alarmar): "No pudimos verificar tu DNI automáticamente. Por favor ingresa tu nombre completo."
- Input "Nombres", vacío, requerido, label visible
- Input "Apellidos", vacío, requerido, label visible
- Botón primary: "Continuar"

**UX crítica:**
- El usuario NUNCA queda bloqueado por el servicio DNI. El fallback manual siempre está disponible.
- No mostrar el error técnico del servicio. Mostrar mensaje operativo amable.

---

#### Paso 3: Teléfono

**Elementos:**
- Indicador: "Paso 3 de 4 — Tu contacto"
- Título: "¿Cuál es tu número de teléfono?"
- Input teléfono: label "Número de teléfono", tipo `tel`, prefijo "+51" no editable, campo numérico
- Texto ayuda: "Este número puede ser usado por operadores del partido para contactarte."
- Botón primary: "Continuar"

---

#### Paso 4: Contraseña

**Elementos:**
- Indicador: "Paso 4 de 4 — Tu contraseña"
- Título: "Elige una contraseña"
- Input contraseña: label "Contraseña", toggle show/hide, mínimo 10 caracteres
- Input confirmar contraseña: label "Confirmar contraseña", toggle show/hide
- Indicador visual de fortaleza de contraseña (3 niveles: débil / media / fuerte)
- Botón primary: "Crear cuenta"
- Estado loading: spinner + "Creando tu cuenta..."

**UX crítica:**
- Error de contraseñas no coincidentes: bajo el segundo campo, en rojo, inmediato on blur
- Error de registro (catch-all): "No se pudo completar el registro. Si ya tienes una cuenta o necesitas recuperar acceso, solicita revisión manual." — jamás detallar la causa real

**Post-registro:**
- Pantalla de confirmación: ícono `check-circle` grande (oliva), título "Cuenta creada", texto explicativo: "Tu cuenta ha sido registrada. Un operador revisará tus datos para validar tu identidad antes de continuar."
- Botón: "Ir a mi perfil"

---

### PANTALLA 3: Perfil del ciudadano

**Propósito:** El usuario ve su situación actual en el padrón y puede tomar acciones según su estado.

**Layout:** Single-column en mobile. Max-width 680px centrado en desktop.

**Sección 1 — Datos personales**
Card con:
- Nombre completo (H2)
- DNI: monoespaciado con ícono `id-card`
- Teléfono con ícono `phone`

**Sección 2 — Estado en el padrón**
Card con grid 2x2 de indicadores:

```
┌─────────────────┬─────────────────┐
│  Estado         │  Tipo           │
│  [activo]       │  [adherente]    │
├─────────────────┼─────────────────┤
│  Identidad      │  Afiliación     │
│  [no validado]  │  —              │
└─────────────────┴─────────────────┘
```

Cada celda: label muted arriba, badge de estado abajo.

**Sección 3 — Acciones disponibles**

Las acciones se muestran u ocultan según el estado del usuario:

| Condición | Acción disponible |
|-----------|-------------------|
| `activo` + `validado` + `adherente` + sin solicitud pendiente | Botón "Solicitar afiliación" |
| `activo` + `afiliado` + sin solicitud pendiente | Botón "Solicitar desafiliación" |
| Tiene solicitud pendiente | Badge "Solicitud en revisión" + sin botón de acción |
| `anulado` | Banner terracota: "Tu cuenta ha sido anulada. Contacta a un operador del partido." |
| `no validado` | Banner ámbar: "Tu identidad aún no ha sido validada por un operador. Este proceso es manual." |

**Sección 4 — Historial de solicitudes**
Lista de solicitudes previas con: tipo, fecha, estado (badge), y si aplica, comentario del operador.

---

### PANTALLA 4: Formulario de solicitud de afiliación

**Propósito:** El usuario solicita formalmente su afiliación al partido.

**Elementos:**
- Título: "Solicitar afiliación"
- Texto explicativo: "Al afiliarte, adquieres derechos políticos dentro del partido, incluyendo el voto en decisiones internas. Tu solicitud será revisada por un operador."
- Resumen de datos del usuario (readonly): nombre, DNI, estado actual
- Botón primary: "Enviar solicitud"
- Botón ghost: "Cancelar"

**Post-envío:**
- Toast success: "Solicitud enviada. Recibirás una respuesta del equipo operativo."
- Redirige al perfil donde aparece el badge "Solicitud en revisión"

---

### PANTALLA 5: Formulario de solicitud de desafiliación

**Propósito:** El usuario solicita voluntariamente salir del partido.

**Elementos:**
- Título: "Solicitar desafiliación"
- Banner de advertencia (amarillo): "Esta acción retirará tus derechos políticos dentro del partido. El proceso es reversible solo mediante nueva afiliación."
- Resumen de datos readonly: nombre, DNI, tipo actual
- Input textarea: label "¿Por qué deseas desafiliarte? (opcional)", `maxlength` 500
- Botón destructive: "Solicitar desafiliación"
- Botón ghost: "Cancelar"
- Diálogo de confirmación antes de enviar: "¿Confirmas que deseas solicitar la desafiliación?"

---

### PANTALLA 6: Panel de administración — Lista de usuarios

**Propósito:** El administrador o fundador gestiona el padrón completo.

**Layout:** Sidebar izquierda con navegación + área principal. En mobile: drawer o bottom nav simple.

**Barra de búsqueda:**
- Input DNI como ruta principal de búsqueda: label "Buscar por DNI", tipo numérico, 8 dígitos, ícono `search`
- Búsqueda secundaria por nombre: toggle o campo separado

**Filtros:**
- Estado: todos / activo / anulado / desafiliado (chips seleccionables)
- Tipo: todos / adherente / afiliado
- Validación: todos / validado / no validado
- Solicitudes pendientes: toggle "Solo con pendientes"

**Tabla de usuarios:**

Columnas: Nombre | DNI | Estado | Tipo | Validado | Solicitud | Acciones

- Paginación obligatoria: 20 usuarios por página, controles de página
- Fila en hover: fondo `#FAF6EF`
- Clic en fila: navega al detalle del usuario
- Columna "Acciones": ícono `chevron-right` o botón ghost "Ver"
- Empty state: ícono `users` + "No se encontraron usuarios con ese criterio."

**Estado vacío global (sin usuarios aún):**
- Ícono `clipboard-list` grande, centrado
- Texto: "El padrón está vacío. Los usuarios aparecerán aquí cuando se registren."

---

### PANTALLA 7: Panel de administración — Detalle de usuario

**Propósito:** El administrador ejecuta acciones sobre un usuario específico.

**Layout:** Single-column, max-width 760px.

**Sección 1 — Datos del usuario**
Card con datos personales: nombre, DNI (monoespaciado), teléfono, fecha de registro.

**Sección 2 — Estado actual**
Mismo grid 2x2 de la vista del ciudadano, pero aquí es informativo para el admin.

**Sección 3 — Acciones administrativas**

Las acciones disponibles según el estado:

```
Si estado=activo y validado_manualmente=false:
  → Botón primary "Validar identidad"

Si estado=activo y tipo=adherente y tiene solicitud pendiente de afiliación:
  → Botón primary "Aprobar afiliación"
  → Botón destructive "Rechazar afiliación" (requiere comentario)

Si estado=activo y tipo=afiliado y tiene solicitud pendiente de desafiliación:
  → Botón primary "Aprobar desafiliación"

Si estado=activo:
  → Botón destructive "Anular cuenta" (requiere motivo, confirmación)

Si estado=anulado:
  → [sin acciones disponibles — mostrar badge "Cuenta anulada"]
```

**Cada acción destructiva** abre un diálogo de confirmación con:
- Campo de texto obligatorio (motivo o comentario)
- Botón de confirmación destructive
- Botón ghost "Cancelar"

**Sección 4 — Historial de auditoría**
Lista cronológica (más reciente primero) de acciones sobre este usuario:
- Fecha + hora
- Acción realizada
- Operador que la ejecutó
- DNI enmascarado en cada registro

---

### PANTALLA 8: Cambio de rol (solo Fundador)

**Propósito:** El fundador puede promover o degradar el rol de sistema de un usuario.

**Elemento:**
- Selector de rol: `usuario` / `administrador` / `fundador` (radio buttons o select)
- Estado actual visible readonly
- Botón primary "Aplicar cambio de rol"
- Diálogo de confirmación siempre requerido

---

### PANTALLA 9: Estados vacíos y errores globales

#### Error de conexión / Supabase no disponible
- Ícono `wifi-off`, centrado
- Título: "Sin conexión"
- Texto: "No se pudo conectar al servidor. Verifica tu conexión e intenta nuevamente."
- Botón ghost: "Reintentar"

#### Error 403 / Sin permisos
- Ícono `lock`, centrado
- Título: "Acceso restringido"
- Texto: "No tienes permisos para ver esta sección."

#### Error genérico de operación
- Toast error: "Ocurrió un error al procesar la acción. Inténtalo nuevamente."
- Sin detalles técnicos expuestos al usuario

---

## 6. Navegación

### Usuario ciudadano
```
Bottom nav (mobile) / Sidebar (desktop):
  [Perfil]  →  /perfil
  [Cerrar sesión]
```

### Administrador / Fundador
```
Sidebar:
  [Padrón]         → /admin/padron
  [Pendientes]     → /admin/pendientes  (badge con conteo)
  [Mi perfil]      → /perfil
  [Cerrar sesión]
```

**Reglas de navegación:**
- El botón "Cerrar sesión" siempre visible, separado del resto con un divisor
- "Pendientes" muestra badge numérico con solicitudes sin resolver
- Ruta por defecto post-login: `/perfil` para ciudadanos, `/admin/pendientes` para administradores

---

## 7. Responsive

| Breakpoint | Layout |
|------------|--------|
| < 640px (mobile) | Single-column, padding 16px, bottom nav |
| 640–1024px (tablet) | Single-column centrado, max-width 680px, padding 24px |
| > 1024px (desktop) | Sidebar 240px + área principal, max-width 1200px |

---

## 8. PWA — Consideraciones

La app es una PWA instalable. El diseño debe contemplar:
- Splash screen con logo + color primary `#4A2C1A`
- `theme-color: #4A2C1A` en el manifest
- Soporte para modo standalone (sin barra de navegación del browser)
- Safe areas en iOS para contenido bajo el notch y la barra de gestos

---

## 9. Accesibilidad (obligatorio)

- Contraste mínimo 4.5:1 para todo texto
- Focus ring siempre visible: 3px solid `#C25A1A`, offset 2px
- Todos los inputs con `<label>` asociado
- Todos los botones icon-only con `aria-label`
- `aria-live="polite"` en toasts y mensajes de estado dinámico
- `role="alert"` en errores de formulario
- Navegación completa por teclado
- Respetar `prefers-reduced-motion`: sin animaciones decorativas si el sistema lo indica

---

## 10. Anti-patrones a evitar

- No usar emojis como íconos
- No mostrar mensajes de error que revelen el estado interno del padrón
- No usar gradientes decorativos
- No glassmorphism
- No placeholder como único label de un campo
- No omitir estados de carga (loading buttons)
- No mostrar el stack trace o errores técnicos al usuario
- No colocar acciones destructivas en lugares prominentes sin separación visual
- No habilitar acciones administrativas en el frontend sin que el backend las valide también
- No usar el color como único indicador de estado (siempre acompañar con texto o ícono)

---

## 11. Flujo de trabajo sugerido para Claude Design

1. Empezar por **Pantallas 1 y 2** (Login y Registro) — son el punto de entrada de todos los usuarios.
2. Luego **Pantalla 3** (Perfil ciudadano) — es la pantalla más frecuente post-login.
3. Luego **Pantallas 6 y 7** (Panel admin) — son las más complejas en densidad de información.
4. Finalmente los formularios de solicitud y los estados de error.

Para cada pantalla, generar:
- Versión mobile (375px)
- Versión desktop (1280px)
- Estados de loading, empty state y error cuando aplique
