# Post-Upload Audit — Rutina Óptima v5

**Fecha auditoría:** 2026-06-03  
**Project ref:** pqqkvmmenqencuretwyx  
**Batch code:** qgen_20260602221450_1436b730  
**Batch ID:** df12b30e-3ad7-426b-b6e1-14d10963f6b2  

---

## 1. Verificación del batch

| Campo | Valor | Estado |
|---|---|---|
| batch_id | df12b30e-3ad7-426b-b6e1-14d10963f6b2 | ✓ EXISTE |
| batch_code | qgen_20260602221450_1436b730 | ✓ ÚNICO |
| inserted_count | 80 | ✓ EXACTO |
| expected_count | 80 | ✓ COINCIDE |
| source | future_generator | ✓ |
| ideological_profile | liberal_democratic | ✓ |
| created_at | 2026-06-02 23:15:24 UTC | ✓ |

---

## 2. Conteo de candidatos en DB

| Métrica | Valor | Validación |
|---|---|---|
| Total candidatos del batch | 80 | ✓ EXACTO |
| Topics distintos | 16 | ✓ EXACTO |
| Candidatos por topic | 5 | ✓ EXACTO (todos) |
| human_review_required = true | 80 | ✓ TODOS |
| status = pending_review | 77 | ✓ (3 ya revisados por humano) |

---

## 3. Distribución por topic

| Topic | Candidatos | Estado |
|---|---:|---|
| anti_mercantilismo | 5 | ✓ |
| anticorrupcion | 5 | ✓ |
| ciudadania_y_control_del_poder | 5 | ✓ |
| desregulacion | 5 | ✓ |
| emprendimiento | 5 | ✓ |
| estado_de_derecho | 5 | ✓ |
| estado_limitado | 5 | ✓ |
| igualdad_ante_la_ley | 5 | ✓ |
| innovacion_y_competitividad | 5 | ✓ |
| instituciones_publicas | 5 | ✓ |
| libertad_individual | 5 | ✓ |
| mercado_libre | 5 | ✓ |
| merito_y_talento | 5 | ✓ |
| propiedad_privada | 5 | ✓ |
| responsabilidad_fiscal | 5 | ✓ |
| seguridad_ciudadana | 5 | ✓ |
| **TOTAL** | **80** | **✓** |

---

## 4. Tipos de votación

| Tipo | Cantidad |
|---|---:|
| binaria | 64 |
| opciones | 16 |
| **Total** | **80** |

Distribución: 4 binaria + 1 opciones por topic (uniforme).

---

## 5. Verificación de tablas prohibidas

| Tabla | Antes | Después | Delta | Estado |
|---|---:|---:|---:|---|
| temas | 3 | 3 | 0 | ✓ SIN CAMBIOS |
| votos | 3 | 3 | 0 | ✓ SIN CAMBIOS |
| tema_sugerencias | 2 | 2 | 0 | ✓ SIN CAMBIOS |
| generated_topic_batches | 0 | 1 | +1 | ✓ CORRECTO |
| generated_topic_candidates | 0 | 80 | +80 | ✓ CORRECTO |

---

## 6. Verificación de seguridad

- [x] 0 conversiones automáticas ejecutadas
- [x] 0 publicaciones ejecutadas
- [x] 0 inserciones en `temas`
- [x] 0 inserciones en `votos`
- [x] 0 inserciones directas en `tema_sugerencias`
- [x] 0 aperturas de votación
- [x] human_review_required = true en los 80 candidatos
- [x] status = pending_review en todos los candidatos no revisados
- [x] No se usó service role en frontend

---

## 7. Resultado

**AUDITORÍA APROBADA ✓**

El batch `qgen_20260602221450_1436b730` fue cargado correctamente con 80 candidatos distribuidos en 16 topics (5 por topic). Ninguna tabla productiva fue modificada. La revisión humana está pendiente en el panel Generador.

```json
{
  "phase": "POST_UPLOAD_AUDIT",
  "status": "ok",
  "project_ref": "pqqkvmmenqencuretwyx",
  "batch_code": "qgen_20260602221450_1436b730",
  "batch_id": "df12b30e-3ad7-426b-b6e1-14d10963f6b2",
  "total_inserted": 80,
  "topics": 16,
  "per_topic": 5,
  "published": false,
  "converted": false,
  "next_action": "human_review_in_generador_panel",
  "timestamp": "2026-06-03T00:00:00.000Z"
}
```
