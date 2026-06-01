# Supabase: entornos seguros para migraciones

## Objetivo

Este documento existe para evitar aplicar migraciones, pruebas RPC/RLS o datos de prueba contra produccion. Aplica especialmente a la migracion `supabase/migrations/017_generated_topic_staging.sql`. Leerlo antes de ejecutar cualquier comando Supabase.

## Estado actual del workspace

- Rama actual observada: `main`.
- Proyecto Supabase enlazado observado: `pqqkvmmenqencuretwyx`.
- Ese proyecto aparece en `.env.local`, `README.md` y `supabase/.temp/project-ref`.
- El `README.md` documenta esa URL como variable de produccion.
- Supabase local no esta disponible actualmente porque Docker/Supabase local no pudo iniciar.
- Auditoria remota de solo lectura del 2026-06-01: `npx supabase migration list` mostro `017 | 017`.
- La migracion 017 figura aplicada en el proyecto remoto enlazado.
- No se ejecutaron pruebas con datos, batches, candidatos ni RPCs de escritura en produccion.
- La prueba REST anonima de solo lectura contra `generated_topic_batches` y `generated_topic_candidates` devolvio `401 permission denied`.

Este workspace no debe usarse para probar migraciones mientras siga combinando rama `main`, `.env.local` productivo y proyecto Supabase enlazado a produccion.

## Referencias sensibles encontradas

- `.env.local`: contiene `VITE_SUPABASE_URL` apuntando a `https://pqqkvmmenqencuretwyx.supabase.co`, una anon key y un deploy hook de Cloudflare.
- `.env.example`: usa placeholder dev y contiene un placeholder `SUPABASE_SERVICE_ROLE_KEY` marcado como solo backend.
- `README.md`: contiene la URL de produccion y documentaba `npx supabase db push` sin guardrail suficiente.
- `supabase/.temp/project-ref`: contiene `pqqkvmmenqencuretwyx`.
- `supabase/.temp/linked-project.json`: enlaza el proyecto `pqqkvmmenqencuretwyx`.
- `package.json`: no contiene scripts npm que ejecuten migraciones, `db push`, `db reset` o seeds.
- `supabase/config.toml`: tiene migraciones habilitadas y seed local configurado como `./seed.sql`; no debe usarse para `db reset` salvo local descartable confirmado.
- `src/lib/supabase.ts`: lee solo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` desde el entorno del frontend.
- `functions/api/restablecer-password.ts`: declara `SUPABASE_SERVICE_ROLE_KEY` para una funcion backend. No debe trasladarse al frontend.
- `.claude/settings.local.json`: contiene una referencia operativa a busqueda de `SUPABASE_SERVICE_ROLE` en `.dev.vars`; no se encontro una clave impresa en esa linea.
- `fix_archivado.md` y `prompt_votosarchivados.md`: contienen menciones historicas a `npx supabase db push`; tratarlas como notas antiguas, no como autorizacion para produccion.

No se debe imprimir ni commitear ningun secreto completo. Si se revisan claves, deben enmascararse.
El deploy hook real detectado en `.env.local` debe rotarse si fue compartido fuera del entorno local privado.

## Como identificar produccion

Tratar el entorno como produccion si cualquiera de estas condiciones se cumple:

- `supabase/.temp/project-ref` contiene `pqqkvmmenqencuretwyx`.
- La URL activa es `https://pqqkvmmenqencuretwyx.supabase.co`.
- `.env.local` contiene variables productivas.
- El README o el dashboard identifican el proyecto como produccion.
- El proyecto remoto contiene datos reales de usuarios, temas, votos o sugerencias.

La rama `main` por si sola no prueba produccion, pero `main + proyecto productivo enlazado + .env.local productivo` bloquea cualquier prueba de migracion.

## Opcion A: Supabase local

Requisitos antes de aplicar migraciones:

1. Docker debe estar activo y disponible.
2. `npx supabase status` debe mostrar URLs locales, por ejemplo `127.0.0.1` o `localhost`.
3. La API local debe usar el puerto local configurado, normalmente `54321`.
4. La base local debe usar el puerto local configurado, normalmente `54322`.
5. Debe quedar escrito que el entorno es descartable.
6. Debe confirmarse que no se esta ejecutando contra `pqqkvmmenqencuretwyx`.

Comandos permitidos solo despues de confirmar local descartable:

```bash
npx supabase status
npx supabase migration list
npx supabase db reset
```

`npx supabase db reset` destruye y recrea la base local. No usarlo si `supabase status` no confirma entorno local.

## Opcion B: Supabase dev remoto

Requisitos antes de aplicar migraciones:

1. Crear o enlazar un proyecto Supabase dev distinto de `pqqkvmmenqencuretwyx`.
2. Documentar el project ref dev esperado antes de ejecutar comandos.
3. Usar `.env.dev.local` o equivalente con URL y anon key del proyecto dev.
4. Confirmar que las pruebas del frontend usan variables dev/local, no produccion.
5. Confirmar que `supabase/.temp/project-ref` coincide con el project ref dev.
6. Confirmar que el proyecto dev no contiene datos productivos.

Comandos permitidos solo despues de confirmar dev remoto:

```bash
npx supabase status
npx supabase migration list
npx supabase db push
```

`npx supabase db push` esta prohibido si el proyecto enlazado es `pqqkvmmenqencuretwyx`.

## Comandos prohibidos en produccion durante esta fase

Los siguientes comandos requieren confirmar que el entorno es local descartable o dev remoto antes de ejecutarse:

```bash
supabase db push
supabase db reset
supabase migration repair
supabase db remote commit
```

Tambien esta prohibido:

- Reaplicar manualmente `017_generated_topic_staging.sql` desde el SQL editor productivo.
- Ejecutar pruebas SQL que creen batches, candidatos o sugerencias en produccion.
- Usar `service_role` desde el frontend.
- Crear seeds o datos permanentes para validar el generador.
- Abrir temas o crear temas oficiales desde pruebas.

## Variables que deben revisarse

Antes de validar migraciones:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_DNI_SERVICE_URL`
- `CLOUDFLARE_DEPLOY_HOOK_URL`
- `supabase/.temp/project-ref`
- `supabase/.temp/linked-project.json`

La anon key puede ser publica en el modelo de Supabase, pero igual debe tratarse como dato operativo y no imprimirse completa en reportes. Cualquier deploy hook real debe tratarse como secreto.

## Checklist antes de aplicar cualquier migracion

No ejecutar ningun comando de migracion hasta confirmar cada punto:

- [ ] El entorno objetivo no es produccion.
- [ ] Project ref esperado documentado: ___________________
- [ ] `supabase/.temp/project-ref` coincide con el project ref dev/local (no es `pqqkvmmenqencuretwyx`).
- [ ] Rama de trabajo actual: `git branch --show-current` = ___________________
- [ ] Variables activas: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son dev/local o no se usan en esta prueba.
- [ ] `npx supabase status` no apunta a `pqqkvmmenqencuretwyx`.
- [ ] Comando exacto a ejecutar: ___________________
- [ ] El comando es destructivo: si/no = ___________________
- [ ] Respaldo disponible si la migracion falla: ___________________
- [ ] Se reviso el SQL de la migracion antes de aplicar.
- [ ] Usuario ejecutor: ___________________
- [ ] Fecha y hora de inicio: ___________________

## Checklist antes de `db push`

Ademas del checklist general, confirmar:

- [ ] El project ref enlazado es dev, no `pqqkvmmenqencuretwyx`.
- [ ] `.env.local` no contiene valores productivos, o se usa archivo dev separado.
- [ ] Existe respaldo o forma de descartar el proyecto dev si la migracion falla.

## Checklist antes de `db reset`

Ademas del checklist general, confirmar:

- [ ] Docker esta activo.
- [ ] Supabase local esta corriendo.
- [ ] `npx supabase status` muestra URLs locales (127.0.0.1 o localhost).
- [ ] La base objetivo es descartable.
- [ ] No hay datos reales en la base local que conservar.
- [ ] Se entiende que `db reset` destruye y recrea la base local completa.

## Orden seguro de validacion

1. Confirmar entorno local descartable o proyecto dev remoto.
2. Confirmar project ref y variables activas (ejecutar `node scripts/check-supabase-env.js`).
3. Ejecutar `npx supabase migration list` para ver estado de migraciones.
4. Aplicar cualquier migracion pendiente solo en local/dev confirmado.
5. Probar RLS: ejecutar checklist de `docs/generador-preguntas-politicas-pruebas.md`.
6. Probar RPCs con usuarios admin/comun de prueba.
7. Probar UI admin contra local/dev.
8. Ejecutar `npm run build` y confirmar que compila sin errores.
9. Documentar resultados.
10. Solo despues de validar local/dev: evaluar aplicar migracion en produccion.
11. En produccion: migracion primero, frontend despues.
12. El generador real solo puede crearse despues de validar el ecosistema de staging completo.

## Rollback conceptual

- Local: descartar la base local con `db reset` o recrear el entorno local.
- Dev remoto: restaurar desde backup/snapshot del proyecto dev o aplicar una migracion de reversa revisada.
- Frontend: no desplegar hasta que la migracion exista en el entorno objetivo; si se detecta fallo despues del deploy dev, revertir el deploy frontend.
- Produccion: no debe entrar en este flujo hasta que local/dev este validado y exista plan explicito de cambio.

## Decision actual

La migracion 017 ya figura aplicada en el remoto enlazado. No ejecutar pruebas con datos ni RPCs de escritura en produccion. Para cambios futuros o nuevas migraciones, el siguiente paso seguro sigue siendo habilitar Supabase local con Docker o enlazar un proyecto Supabase dev remoto distinto de `pqqkvmmenqencuretwyx`.
