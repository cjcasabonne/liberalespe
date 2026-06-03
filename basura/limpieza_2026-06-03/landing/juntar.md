Necesito hacer un cambio pequeño y seguro en la landing preview.

Contexto:
- Ya existe una landing funcionando.
- Ya existe una funcionalidad de login en el proyecto.
- NO quiero rehacer la landing.
- NO quiero tocar auth, lógica de login, middleware ni configuración.
- Solo quiero agregar un botón "Ingresar" al costado del botón "Únete".
- El botón "Ingresar" debe llevar a la funcionalidad de login ya creada.

Tarea:
1. Inspecciona el proyecto para identificar cuál es la ruta actual de login o ingreso.
   Puede ser algo como:
   - /login
   - /auth/login
   - /signin
   - /ingresar
   - /
   - otra ruta existente
2. No inventes una ruta nueva de login.
3. No crees una nueva pantalla de login.
4. No modifiques la lógica de autenticación.
5. No modifiques middleware.
6. No modifiques variables de entorno.
7. No modifiques la página funcional actual.

Cambio visual:
- En la landing, ubica el botón principal "Únete".
- Agrega a su costado un botón secundario con el texto:
  "Ingresar"
- Debe verse alineado con "Únete".
- En desktop: ambos botones deben estar en la misma fila.
- En móvil: pueden apilarse o mantenerse bien alineados, según el diseño responsive actual.
- El botón "Únete" debe conservar su comportamiento actual.
- El botón "Ingresar" debe navegar a la ruta real de login existente.

Estilo:
- Reutiliza los estilos actuales del proyecto.
- El botón "Ingresar" debe verse como botón secundario o outline.
- Debe respetar tipografía, colores, bordes, radios, hover y focus states existentes.
- No instalar dependencias.
- No agregar librerías UI.

Reglas de seguridad:
- Cambio mínimo.
- No refactorizar.
- No tocar archivos no relacionados.
- No cambiar package.json.
- No borrar archivos.
- No mover componentes existentes.
- No romper la landing actual.
- No romper el login existente.

Entrega:
Al final dime:
1. Qué ruta de login encontraste.
2. Qué archivo modificaste.
3. Qué cambio exacto hiciste.
4. Cómo probarlo:
   - abrir /landing-preview
   - hacer clic en "Ingresar"
   - verificar que lleva al login existente