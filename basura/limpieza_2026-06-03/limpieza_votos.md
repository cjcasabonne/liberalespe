```text id="jlkq72"
Actúa como desarrollador senior Supabase/PostgreSQL del proyecto Liberales PE.

Contexto:
El módulo de votaciones ya funciona. Durante las pruebas se crearon temas, votos y posiblemente sugerencias de prueba. Quiero hacer “borrón y cuenta nueva” solo del módulo de votaciones.

No planifiques. Ejecuta con cuidado.

Objetivo:
Limpiar las votaciones de prueba sin afectar usuarios, perfiles, afiliaciones, roles, solicitudes, recuperación de acceso, configuración ni padrón.

Reglas estrictas:
- No borrar usuarios.
- No borrar perfiles.
- No borrar solicitudes de afiliación.
- No borrar solicitudes de desafiliación.
- No borrar solicitudes de recuperación.
- No borrar roles.
- No borrar configuración.
- No borrar `audit_log`.
- No modificar RLS.
- No modificar RPC.
- No modificar migraciones existentes.
- No usar `truncate cascade` sin revisar dependencias.
- Solo limpiar datos vivos de participación/votaciones.

Tablas objetivo probables:
- `votos`
- `temas`
- `tema_sugerencias`, solo si confirma que quiero limpiar también sugerencias de prueba

Tareas:

1. Inspecciona el esquema real:
   - relaciones/FK de `votos`;
   - relaciones/FK de `temas`;
   - relaciones/FK de `tema_sugerencias`;
   - si `tema_sugerencias.tema_id_generado` referencia `temas.id`.

2. Prepara un SQL seguro dentro de transacción.

3. Limpieza base obligatoria:
   - borrar primero `votos`;
   - desvincular sugerencias convertidas si apuntan a temas:
     `update tema_sugerencias set tema_id_generado = null where tema_id_generado is not null;`
   - borrar `temas`.

4. No borrar `audit_log`.

5. Antes de ejecutar, mostrar conteo previo:
   - cantidad de temas;
   - cantidad de votos;
   - cantidad de sugerencias;
   - cantidad de sugerencias con `tema_id_generado`.

6. Ejecutar limpieza.

7. Después de ejecutar, mostrar conteo final:
   - `select count(*) from temas;`
   - `select count(*) from votos;`
   - `select count(*) from tema_sugerencias;`
   - `select count(*) from tema_sugerencias where tema_id_generado is not null;`

8. Si también existe una tabla relacionada con resultados, adjuntos, comentarios o logs específicos de votaciones, revisarla antes de borrar.

SQL base esperado:

begin;

select count(*) as votos_antes from votos;
select count(*) as temas_antes from temas;
select count(*) as sugerencias_antes from tema_sugerencias;
select count(*) as sugerencias_convertidas_antes
from tema_sugerencias
where tema_id_generado is not null;

delete from votos;

update tema_sugerencias
set tema_id_generado = null
where tema_id_generado is not null;

delete from temas;

select count(*) as votos_despues from votos;
select count(*) as temas_despues from temas;
select count(*) as sugerencias_despues from tema_sugerencias;
select count(*) as sugerencias_convertidas_despues
from tema_sugerencias
where tema_id_generado is not null;

commit;

Resultado esperado:
- `votos = 0`
- `temas = 0`
- `tema_sugerencias` se conserva, salvo que confirme limpieza total de sugerencias
- `tema_id_generado = 0`
- usuarios y padrón intactos
- auditoría intacta

Entrega final:
- confirmar qué tablas limpió;
- confirmar conteos antes/después;
- confirmar que no tocó usuarios/perfiles/audit_log;
- indicar si dejó sugerencias o también las limpió.
```
