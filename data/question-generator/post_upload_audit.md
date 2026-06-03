# Post-Upload Audit — Rutina Óptima v5
**Generado:** 2026-06-03T19:02:22Z
**project_ref:** pqqkvmmenqencuretwyx
**batch_code:** qgen_20260602221450_1436b730
**batch_id:** df12b30e-3ad7-426b-b6e1-14d10963f6b2

---

## 1. Verificación de batch

| Parámetro | Esperado | Detectado | OK |
|---|---|---|---|
| batch_code | qgen_20260602221450_1436b730 | qgen_20260602221450_1436b730 | ✓ |
| batch_id | df12b30e-3ad7-426b-b6e1-14d10963f6b2 | df12b30e-3ad7-426b-b6e1-14d10963f6b2 | ✓ |
| expected_count | 80 | 80 | ✓ |
| inserted_count | 80 | 80 | ✓ |
| batch_status | loaded/partially_reviewed | partially_reviewed | ✓ |

---

## 2. Distribución por topic (DB)

| Topic | Candidatos | Binaria | Opciones |
|---|---:|---:|---:|
| anti_mercantilismo | 5 | 4 | 1 |
| anticorrupcion | 5 | 4 | 1 |
| ciudadania_y_control_del_poder | 5 | 4 | 1 |
| desregulacion | 5 | 4 | 1 |
| emprendimiento | 5 | 4 | 1 |
| estado_de_derecho | 5 | 4 | 1 |
| estado_limitado | 5 | 4 | 1 |
| igualdad_ante_la_ley | 5 | 4 | 1 |
| innovacion_y_competitividad | 5 | 4 | 1 |
| instituciones_publicas | 5 | 4 | 1 |
| libertad_individual | 5 | 4 | 1 |
| mercado_libre | 5 | 4 | 1 |
| merito_y_talento | 5 | 4 | 1 |
| propiedad_privada | 5 | 4 | 1 |
| responsabilidad_fiscal | 5 | 4 | 1 |
| seguridad_ciudadana | 5 | 4 | 1 |
| **TOTAL** | **80** | **64** | **16** |

---

## 3. Validaciones de seguridad

| Validación | Resultado |
|---|---|
| Topics distintos | 16 ✓ |
| Candidatos por topic | 5 (exacto) ✓ |
| Total candidatos en batch | 80 ✓ |
| Inserciones en `temas` | 0 ✓ |
| Inserciones en `votos` | 0 ✓ |
| Inserciones en `tema_sugerencias` | 0 ✓ |
| Conversiones automáticas | 0 ✓ |
| Candidatos publicados | 0 ✓ |
| Candidatos convertidos | 0 ✓ |
| `human_review_required = true` | todos ✓ |
| Status candidatos | pending_review ✓ |

---

## 4. Estado de revisión humana

| Estado | Cantidad |
|---|---:|
| pending_review | 77 |
| revisados (humano) | 3 |
| **Total** | **80** |

> La revisión humana se realiza en el panel **Generador**.
> La rutina no publica ni convierte candidatos.

---

## 5. Artefactos generados

- `data/question-generator/upload_staging_payload.json` ✓
- `data/question-generator/upload_staging.sql` ✓
- `data/question-generator/apply_upload_result.json` ✓
- `data/question-generator/post_upload_audit.md` ✓

---

## 6. Resultado final

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
  "next_action": "human_review_in_generador_panel"
}
```
