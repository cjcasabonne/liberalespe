Actúa como desarrollador senior React + Vite + TypeScript + Supabase.

Contexto:
Se implementó “Votaciones pasadas” y archivo de temas, pero al presionar “Archivar” aparece:
“No se pudo archivar el tema.”

No planifiques. Diagnostica y corrige directamente.

Objetivo:
Corregir el archivo de votaciones para que un administrador/fundador pueda archivar temas cerrados o anulados, y que estos pasen correctamente a “Votaciones pasadas”.

Reglas:
- No crear backend nuevo.
- No mover permisos al frontend.
- No hacer update directo desde frontend para archivar.
- No editar migraciones ya aplicadas.
- Crear una nueva migración 016.
- Mantener RLS/RPC como fuente real de autorización.
- Mantener auditoría.
- No romper emisión de voto.
- No romper resultados.
- No romper sugerencias de temas.
- No cambiar estructura general de UI salvo lo necesario.

Tareas obligatorias:

1. Inspeccionar el esquema real del proyecto:
   - columnas reales de `perfiles`;
   - columnas reales de `temas`;
   - columnas reales de `audit_log`;
   - tipo enum `estado_tema`;
   - definición actual de `archivar_tema_controlado`.

2. Verificar específicamente:
   - si `perfiles` vincula con Auth mediante `id`, `user_id` o ambos;
   - si `temas` tiene columna `actualizado_en`;
   - si `audit_log` acepta `actor_id`, `sujeto_id`, `accion`, `tabla`, `registro_id`, `antes`, `despues`, `creado_en`;
   - si `estado_tema` ya contiene `archivado`.

3. Crear nueva migración:
   `supabase/migrations/016_fix_archive_tema_rpc.sql`

4. En esa migración, reemplazar la RPC `archivar_tema_controlado(p_tema_id uuid)` para que:
   - use `auth.uid()`;
   - encuentre correctamente el perfil del actor según el esquema real;
   - valide que el actor sea `administrador` o `fundador`;
   - valide `estado = activo`;
   - valide `tipo_miembro = afiliado`;
   - valide que el tema exista;
   - permita archivar solo si `temas.estado IN ('cerrado', 'anulado')`;
   - actualice `temas.estado = 'archivado'`;
   - registre `audit_log`;
   - no use columnas inexistentes;
   - no dependa de `actualizado_en` si esa columna no existe.

5. Revisar el frontend:
   - ubicar el handler `handleArchiveTopic`;
   - agregar `console.error('archiveError', archiveError);` antes del mensaje genérico;
   - revisar la carga de votaciones archivadas;
   - si existe `.order('actualizado_en')` y `temas.actualizado_en` no existe, cambiarlo por `.order('creado_en', { ascending: false })`;
   - mantener “Votaciones pasadas” colapsado por defecto;
   - mantener archivadas fuera de la vista principal.

6. Mejorar el mensaje de error solo para diagnóstico:
   - en consola debe verse el error real de Supabase;
   - en UI puede mantenerse mensaje controlado.

7. Ejecutar validaciones:
   - `npm run build`
   - `npx supabase db push`

8. Si `db push` falla:
   - leer el error real;
   - corregir la migración;
   - volver a ejecutar.

9. Probar manualmente:
   - archivar una votación cerrada;
   - archivar una votación anulada;
   - verificar que desaparece de vista principal;
   - verificar que aparece en “Votaciones pasadas”;
   - verificar que se registra auditoría;
   - verificar que un usuario no admin no puede archivar aunque manipule frontend.

10. Commit y deploy:
   - `git add .`
   - `git commit -m "Fix archived voting RPC"`
   - `git push`
   - disparar deploy hook de Cloudflare.

Entrega final:
- listar archivos modificados;
- indicar si la migración fue aplicada;
- indicar el hash del commit;
- indicar resultado de `npm run build`;
- indicar resultado de prueba manual de archivar.