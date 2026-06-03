# Plan de pruebas RLS v2

Objetivo: automatizar la verificacion de permisos sin usar cuentas reales ni modificar usuarios existentes.

## Principios

- Usar solo cuentas fixture con DNI reservado para pruebas.
- No reutilizar cuentas reales de usuarios.
- No ejecutar pruebas destructivas contra perfiles productivos.
- Cada prueba debe crear sus datos, validar permisos y limpiar solo sus propios fixtures.
- El `service_role` solo puede usarse en setup/teardown del entorno de prueba, nunca desde frontend.

## Fixtures

Usuarios fixture recomendados:

- `99000001`: usuario comun activo.
- `99000002`: administrador activo.
- `99000003`: fundador activo.
- `99000004`: usuario anulado.
- `99000005`: usuario desafiliado.

Cada fixture debe tener:

- cuenta Auth;
- fila en `perfiles`;
- rol y estado definidos explicitamente;
- datos de contacto ficticios.

## Matriz minima

Usuario comun:

- puede leer su propio perfil;
- no puede leer otros perfiles;
- puede actualizar solo su telefono;
- no puede cambiar `rol_sistema`, `tipo_miembro`, `estado` ni `validado_manualmente`;
- puede crear solicitudes propias;
- no puede leer `audit_log`.

Administrador:

- puede leer perfiles operativos permitidos;
- puede ver solicitudes pendientes;
- puede ejecutar RPC administrativas permitidas;
- no puede cambiar roles del sistema;
- no puede degradar o anular fundadores si la RPC lo bloquea.

Fundador:

- puede leer datos sensibles autorizados;
- puede ejecutar cambio de rol mediante RPC;
- no puede cambiar su propio rol;
- puede crear nuevos fundadores activos; la RPC debe dejar al nuevo fundador como `afiliado`.
- los cambios a `fundador` deben quedar auditados.

Anonimo:

- no puede leer `perfiles`;
- no puede leer solicitudes;
- no puede leer `audit_log`;
- solo puede crear solicitudes de recuperacion si la policy publica lo permite.

## Comandos objetivo

Cuando se implemente el script, debe exponerse como:

```bash
npm run test:rls
```

El script debe:

1. Crear fixtures.
2. Iniciar sesion como cada rol.
3. Ejecutar queries y RPC esperadas.
4. Verificar exitos y rechazos.
5. Limpiar fixtures propios.

## Criterio de exito

- Todas las acciones permitidas pasan.
- Todas las acciones prohibidas fallan por RLS/RPC.
- No quedan datos fixture fuera del rango `99000000-99000099`.
