Necesito cambiar la estructura de rutas del proyecto de forma segura.

Contexto actual:
- El proyecto es Vite + React + TypeScript.
- Actualmente la app funcional existente vive en "/".
- La landing nueva vive en "/landing-preview".
- La app funcional existente incluye el login y la funcionalidad interna para miembros.
- Ya existe un botón "Ingresar" en la landing que actualmente apunta a "/".
- Quiero que la landing sea la página principal pública.
- Quiero que el botón "Ingresar" lleve a la app interna existente.

Objetivo final:
- "/" debe mostrar la landing pública.
- "/ingresar" debe mostrar la app funcional existente con login/intranet.
- Opcionalmente "/landing-preview" puede seguir mostrando la landing o redirigir a "/".
- No quiero rehacer la landing.
- No quiero tocar la lógica interna de la app.
- No quiero tocar auth.
- No quiero tocar middleware.
- No quiero tocar estilos globales salvo que sea inevitable.

Cambio requerido:
1. Modifica el routing mínimo en src/main.tsx.
2. Renderiza LandingPreview cuando window.location.pathname sea "/".
3. Renderiza App cuando window.location.pathname sea "/ingresar".
4. Mantén compatibilidad opcional con "/landing-preview" mostrando LandingPreview, para no romper pruebas anteriores.
5. Cambia todos los botones/enlaces "Ingresar" de la landing para que apunten a "/ingresar".
6. La app interna existente debe quedar intacta, solo cambia su ruta de acceso.
7. No crear una nueva app interna.
8. No crear un nuevo login.
9. No duplicar App.
10. No modificar la lógica de autenticación.

Resultado esperado:
- Al abrir http://localhost:5173/ veo la landing pública.
- Al hacer clic en "Ingresar" voy a http://localhost:5173/ingresar.
- En /ingresar aparece el login existente si no hay sesión.
- Si hay sesión, se muestra la funcionalidad interna existente.
- /landing-preview puede seguir mostrando la landing.

Reglas estrictas:
- No modificar package.json.
- No instalar dependencias.
- No borrar archivos.
- No refactorizar App.tsx.
- No mover la funcionalidad interna.
- No tocar auth.
- No tocar lógica de login.
- No tocar base de datos.
- No tocar variables de entorno.
- Cambio mínimo y reversible.

Implementación sugerida:
En src/main.tsx, usar algo parecido a:

const path = window.location.pathname;

const isLanding =
  path === "/" ||
  path === "/landing-preview";

const isInternalApp =
  path === "/ingresar";

createRoot(root).render(
  <StrictMode>
    {isLanding ? <LandingPreview /> : <App />}
  </StrictMode>
);

Pero ajusta esto según el código real existente.

Además:
- En src/LandingPreview.tsx, cambiar href="/" por href="/ingresar" en todos los botones "Ingresar".
- Revisar menú desktop, hero y menú mobile.
- Si hay enlaces internos tipo "#participa", mantenerlos igual.
- No cambiar el botón "Únete".

Entrega final:
1. Archivos modificados.
2. Explicación breve del cambio de rutas.
3. Confirmación de que auth/login/App.tsx no fueron modificados.
4. Cómo probar:
   - abrir /
   - abrir /ingresar
   - hacer clic en "Ingresar" desde la landing
   - verificar que aparece el login existente