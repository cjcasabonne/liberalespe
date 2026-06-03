Usa este prompt en Codex:

```txt id="0nbw44"
Necesito crear una nueva página tipo landing/interactiva usando el contenido de ./contenido-limpio.md.

IMPORTANTE:
- NO modificar la página actual que ya funciona.
- NO tocar el login existente.
- NO tocar rutas actuales de autenticación.
- NO cambiar configuración global del proyecto salvo que sea estrictamente necesario.
- NO instalar dependencias.
- NO hacer refactor del proyecto.
- NO borrar archivos.
- Esta landing debe quedar aislada para poder revisarla sin afectar lo existente.

Objetivo:
Crear una nueva página visual e interactiva basada en el contenido de ./contenido-limpio.md, reutilizando el estilo visual actual del proyecto:
- tipografías
- colores
- variables CSS
- clases globales existentes
- estilo de botones
- estilo de cards
- espaciados
- responsive actual

Primero:
1. Inspecciona la estructura del proyecto.
2. Detecta si es Next.js, React, Vite u otro framework.
3. Identifica dónde están los estilos globales, por ejemplo:
   - globals.css
   - app/globals.css
   - styles/globals.css
   - tailwind.config
   - theme
   - variables CSS
4. Reutiliza esos estilos. No crees un diseño visual desconectado del proyecto.

Página a crear:
- Crear una ruta nueva y aislada llamada:
  /landing-preview

O el equivalente según el framework:
- Next.js App Router: app/landing-preview/page.tsx
- Next.js Pages Router: pages/landing-preview.tsx
- Vite/React: crear un componente LandingPreview y conectarlo de forma mínima sin romper rutas existentes.

Contenido:
- Usar ./contenido-limpio.md como fuente principal.
- Convertir el contenido en una landing ordenada, clara y moderna.
- No copiar el Markdown como texto plano sin diseño.
- Estructurar en secciones visuales:
  - Hero principal
  - resumen o propuesta de valor
  - servicios / beneficios
  - secciones informativas
  - llamada a la acción
  - contacto o cierre
- Mantener el texto original, pero se permite reorganizarlo para mejorar la lectura.
- No inventar promesas comerciales fuertes.
- No eliminar contenido importante.

Interactividad:
Agregar interacciones simples, sin dependencias nuevas:
- navegación interna por secciones
- botones CTA con scroll suave
- cards de servicios o beneficios
- acordeones para bloques largos si aplica
- sección destacada visual
- menú responsive si ya existe estilo para eso
- estados hover/focus accesibles

Reglas técnicas:
- Usar componentes simples.
- Si el proyecto usa TypeScript, respetarlo.
- Si el proyecto usa Tailwind, usar clases Tailwind existentes.
- Si el proyecto usa CSS Modules, seguir ese patrón.
- Si el proyecto usa CSS global con variables, reutilizar variables.
- No agregar librerías de UI.
- No tocar auth.
- No tocar middleware.
- No tocar layout principal si puede evitarse.
- No cambiar package.json.
- No cambiar rutas existentes.
- No cambiar nombres de archivos actuales.

Aislamiento:
- La nueva landing debe poder abrirse en:
  /landing-preview
- La página actual debe seguir funcionando exactamente igual.
- Si necesitas crear componentes, colócalos en una carpeta aislada, por ejemplo:
  components/landing-preview/
  o app/landing-preview/_components/
- Si necesitas CSS específico, usar un archivo aislado:
  landing-preview.module.css
  o equivalente según el patrón del proyecto.

Calidad visual:
- Debe verse como parte del proyecto actual.
- Debe aprovechar colores y tipografía existentes.
- Diseño responsive para móvil, tablet y desktop.
- Buena jerarquía visual.
- Nada de diseño genérico tipo plantilla vacía.
- Evitar sobrecargar la página.

Entrega:
1. Crea la ruta /landing-preview.
2. Genera la landing usando ./contenido-limpio.md.
3. Reutiliza estilos existentes del proyecto.
4. No modifiques nada crítico del proyecto actual.
5. Al final dime exactamente:
   - qué archivos creaste
   - qué archivos modificaste
   - cómo abrir la landing
   - confirmación de que no tocaste login/auth/rutas actuales
```

Y una versión más estricta, por si quieres blindarlo más:

```txt id="cixrvp"
Modo seguro.

Crea una landing preview en una ruta nueva /landing-preview usando ./contenido-limpio.md.

Restricciones absolutas:
- No tocar login.
- No tocar auth.
- No tocar middleware.
- No tocar la página principal existente.
- No tocar rutas funcionales existentes.
- No modificar package.json.
- No instalar dependencias.
- No hacer refactor.
- No borrar archivos.
- No modificar configuración global salvo que sea inevitable. Si es inevitable, explícalo antes de hacerlo.

La landing debe estar aislada.

Antes de editar:
1. Revisa la estructura del proyecto.
2. Detecta framework y sistema de rutas.
3. Detecta estilos existentes: globals.css, variables CSS, Tailwind, módulos CSS, tema, fuentes y colores.
4. Usa esos estilos como base visual.

Construcción:
- Leer ./contenido-limpio.md.
- Crear una página visual, moderna e interactiva.
- Ruta final: /landing-preview.
- Separar el contenido en secciones:
  Hero, propuesta de valor, servicios/beneficios, contenido principal, CTA y contacto.
- Reutilizar tipografías, colores, botones, espaciados y estética del proyecto.
- Agregar interactividad sin librerías:
  scroll suave, navegación interna, cards, acordeones si hay bloques largos, hovers y focus states.
- Responsive completo.

Importante:
No quiero fusionar esta landing con el sistema actual todavía.
Solo quiero verla funcionando aparte.
Luego decidiré cómo integrarla.

Entrega final:
- Lista de archivos creados.
- Lista de archivos modificados.
- URL local para revisar.
- Confirmación explícita de que login/auth/página actual no fueron tocados.
```
