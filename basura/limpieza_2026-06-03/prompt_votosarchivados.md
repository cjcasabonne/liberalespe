Actúa como arquitecto frontend senior y desarrollador React + Vite + TypeScript dentro del proyecto Liberales PE.

Contexto:
El sistema ya tiene Votaciones V3 implementado con temas, votos, resultados, sugerencias separadas, RLS, RPC y auditoría.
No cambies la arquitectura base.
No crees backend nuevo.
No muevas permisos al frontend.
No rompas flujos existentes.
No cambies nombres de tablas, columnas, enums ni RPC existentes salvo que sea estrictamente necesario.
El problema actual es UX: la sección de votaciones está demasiado cargada visualmente.

Objetivo:
Mejorar el módulo de votaciones para reducir densidad visual creando una sección/pestaña colapsable llamada “Votaciones pasadas”.

Regla funcional:
Cuando un fundador/admin archive una votación, esta debe salir de la vista principal y pasar a “Votaciones pasadas”.
“Votaciones pasadas” debe ser visible para todos los usuarios autenticados en su propio panel, pero solo cuando el usuario despliegue la sección.
No debe mostrarse abierta por defecto.

Comportamiento esperado para usuarios:
- Al ingresar al panel, el usuario ve primero las votaciones activas o relevantes.
- Las votaciones pendientes de voto tienen prioridad visual.
- Las votaciones ya votadas deben verse compactas.
- Las votaciones cerradas/anuladas/archivadas no deben saturar la vista principal.
- “Votaciones pasadas” aparece como bloque colapsable o pestaña secundaria.
- Al desplegarla, el usuario ve votaciones históricas con:
  - título;
  - estado;
  - fecha de cierre o archivo;
  - su voto, si aplica;
  - resultados;
  - barra/porcentaje si ya existe ese componente.

Comportamiento esperado para fundador/admin:
- En cada votación cerrada o anulada debe existir acción “Archivar”.
- La acción debe pedir confirmación explícita.
- Archivar no debe borrar la votación ni sus votos.
- Archivar solo debe cambiar su clasificación operativa para la UI.
- La acción debe registrarse en auditoría.
- Si ya existe un campo/estado compatible, úsalo.
- Si no existe, propone una migración mínima.

Implementación preferida:
1. Revisar el modelo actual de `temas`.
2. Si existe un estado `archivado`, usarlo.
3. Si no existe, agregar soporte mínimo:
   - opción A: extender `estado_tema` con `archivado`;
   - opción B: agregar campo boolean `archivado` default false;
   - elegir la opción menos invasiva según el código actual.
4. Crear RPC controlada para archivar tema si no existe:
   - validar que el actor sea administrador/fundador;
   - validar que el tema no esté abierto si esa regla corresponde;
   - actualizar estado/campo;
   - insertar en `audit_log`.
5. Ajustar queries del frontend:
   - vista principal excluye archivadas;
   - “Votaciones pasadas” incluye cerradas/anuladas/archivadas según criterio;
   - no cargar todas si hay muchas: usar paginación o límite con “Ver más”.
6. Ajustar componentes visuales:
   - vista principal más limpia;
   - cards compactas;
   - sección colapsable;
   - estados claros;
   - sin duplicar información.
7. Mantener resultados visibles mediante RPC existente `resumen_votos_tema`.
8. Validar con tres perfiles:
   - adherente;
   - afiliado;
   - fundador.

Criterios de aceptación:
- La vista inicial de votaciones queda menos cargada.
- Un afiliado ve votaciones activas sin saturación.
- Un adherente puede ver resultados permitidos pero no votar.
- Un fundador puede archivar una votación cerrada/anulada.
- Una votación archivada desaparece de la vista principal.
- La votación archivada aparece dentro de “Votaciones pasadas”.
- “Votaciones pasadas” está cerrada por defecto.
- La acción de archivar queda registrada en `audit_log`.
- No hay update directo desde frontend para archivar.
- No se rompe emisión de voto.
- No se rompe resultados.
- No se rompe sugerencias de temas.
- Build final sin errores.

Entrega:
- Primero analiza archivos relevantes.
- Luego implementa cambios mínimos.
- Luego muestra lista de archivos modificados.
- Luego indica migración Supabase necesaria, si aplica.
- Luego indica comandos exactos:
  - npm run build
  - npx supabase db push, solo si hubo migración
  - git add .
  - git commit -m "Improve voting archive UX"