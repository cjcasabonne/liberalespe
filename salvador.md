Actúa como ingeniero senior continuando el desarrollo de un sistema político YA operativo.

El proyecto NO está en fase MVP.
NO está en fase de prototipo.
Está en fase de estabilización y consolidación funcional.

---

## CONTEXTO

El sistema YA tiene funcionando:

- registro con DNI
- Supabase Auth
- perfiles
- roles
- votaciones binarias
- sugerencias de temas
- panel fundador/admin
- contacto por correo/WhatsApp
- recuperación de contraseña
- RLS
- Cloudflare deploy

También ya existe:

- soporte inicial para votaciones por opciones
- soporte inicial para sugerencias de afiliados

---

## OBJETIVO

Continuar el desarrollo SIN romper estabilidad.

Prioridad:

1. integración visual correcta
2. consistencia UX
3. robustez operativa
4. trazabilidad
5. evitar deuda técnica

NO agregar features masivas sin integrar correctamente lo existente.

---

## REGLAS CRÍTICAS

- NO reescribir arquitectura
- NO mover lógica al frontend
- NO romper RLS
- NO introducir mocks
- NO crear backend innecesario
- NO duplicar lógica
- NO implementar permisos con if role === arbitrarios
- usar helpers reutilizables
- mantener layouts consistentes

---

## PASO 1 — AUDITORÍA DEL ESTADO ACTUAL

Antes de escribir código:

Revisar:

- App.tsx
- componentes renderizados
- navegación
- paneles visibles
- layouts CSS
- estados React
- errores TypeScript
- warnings
- componentes parcialmente implementados

Responder:

### FUNCIONA
(lista)

### IMPLEMENTADO PERO MAL INTEGRADO
(lista)

### PARCIAL
(lista)

### ROTO
(lista)

### DEUDA TÉCNICA
(lista)

NO modificar nada todavía.

---

## PASO 2 — CONSISTENCIA VISUAL

Crear patrones reutilizables para:

- paneles
- grids
- stacks
- formularios
- badges de estado
- tablas
- acciones de contacto

Evitar CSS duplicado.

Objetivo:
todos los módulos deben sentirse parte del mismo sistema.

---

## PASO 3 — ESTABILIZACIÓN UX

Revisar:

- separación visual de secciones
- scroll
- responsive móvil
- botones duplicados
- estados vacíos
- loaders
- errores
- feedback visual

Agregar:

- estados vacíos claros
- mensajes neutrales
- skeleton/loading simples si hace falta

---

## PASO 4 — VOTACIONES POR OPCIONES

Completar integración visual REAL.

Validar:

- fundador/admin puede crear:
  - binaria
  - opciones

- opciones se renderizan realmente
- “Otros” habilita input libre
- votos quedan persistidos correctamente
- resultados muestran conteo correcto

NO hardcodear Sí/No.

---

## PASO 5 — SUGERENCIAS DE TEMAS

Completar UX:

Afiliado:
- crear sugerencia
- ver estado
- ver comentario revisión

Admin/fundador:
- revisar
- aprobar
- rechazar
- convertir

Mostrar claramente:
- pendiente
- aprobado
- rechazado
- convertido

---

## PASO 6 — CENTRALIZAR HELPERS

Crear helpers reutilizables:

- canSuggestTopics(profile)
- canVote(profile, topic)
- canManageSuggestions(profile)
- buildMailtoLink()
- buildWhatsAppLink()

Eliminar lógica repetida en JSX.

---

## PASO 7 — AUDITORÍA DE SEGURIDAD FRONTEND

Verificar:

- no existen datos sensibles visibles incorrectamente
- adherentes no votan
- anulados no operan
- admins no dependen de frontend para permisos
- errores no exponen información sensible

---

## PASO 8 — VALIDACIÓN FINAL

Después de cada bloque:

- npm run build
- revisar consola browser
- revisar errores runtime
- validar responsive
- validar flujo móvil

NO avanzar si hay errores.

---

## RESTRICCIÓN IMPORTANTE

NO agregar nuevas features grandes todavía.

Primero:
- estabilizar
- integrar
- limpiar
- consolidar

---

## OUTPUT ESPERADO

Cada avance debe incluir:

### QUÉ SE CORRIGIÓ
### QUÉ SE ESTABILIZÓ
### QUÉ FALTA
### RIESGOS DETECTADOS

NO responder genérico.
NO asumir.
Trabajar sobre el código REAL existente.