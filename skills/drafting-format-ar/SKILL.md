---
name: drafting-format-ar
description: Paso 3 del pipeline de borrador. Convierte jess_draft.txt a contestacion.docx con formato profesional listo para presentación judicial. Ejecuta verificación automática post-generación. Sin contexto legal — solo formato.
---

# Jess-Format — Conversión a DOCX y Verificación

> **Objetivo**: convertir el texto plano del borrador a un .docx profesional listo para el abogado. Este step no analiza ni modifica el contenido legal. Solo aplica formato.

## Inputs

1. `jess_draft.txt` — output de Jess-Draft (texto plano del escrito)

## Instrucciones de formato

Generar el .docx con estas reglas:

### Estilos
- **Títulos de sección** (MAYÚSCULAS solos en su línea): Heading 1, negrita, 12pt Times New Roman, MAYÚSCULAS
- **Subtítulos** (nombre de rubro, etc.): Heading 2, negrita, 12pt Times New Roman
- **Texto de cuerpo**: Normal, 12pt Times New Roman, justificado, indent primera línea 1.27cm
- **Sin espaciado espurio**: `space_after = 0pt` en párrafos de cuerpo; `space_before = 12pt` en H1

### Campos especiales
- `[COMPLETAR — ABOGADO: ...]`: negrita + rojo (RGB 204, 0, 0)
- `[NOTA INTERNA: ...]`: cursiva + gris (RGB 102, 102, 102)
- `Proveer de conformidad,` → negrita, centrado
- `SERÁ JUSTICIA.` → negrita, centrado

### Márgenes
- Superior/inferior: 2.5cm
- Izquierdo: 3cm
- Derecho: 2.5cm

### Filtros obligatorios (NO incluir en el docx)
- Líneas exactamente `---` → filtrar
- Todo lo que contenga "METADATA INTERNA" → filtrar desde esa línea hasta el final
- Líneas que contengan "Generado por: Jess"
- Líneas que contengan "REVIEW LOU"
- El reporte de Lou (si aparece concatenado)

## Verificación post-generación

Después de generar el .docx, ejecutar el siguiente checklist. Si algún check falla, marcar el output como `DEFECTUOSO` y no entregarlo:

```
CHECKLIST AUTOMÁTICO:
1. chars_total >= 35000
2. "---" como texto visible: 0 ocurrencias
3. "METADATA INTERNA": 0 ocurrencias
4. "Generado por:": 0 ocurrencias
5. "REVIEW LOU": 0 ocurrencias
6. "CONSULTAR CON EL ASEGURADO": 0 ocurrencias
7. "Proveer de conformidad": exactamente 1 ocurrencia
8. "SERÁ JUSTICIA": exactamente 1 ocurrencia
```

Si el check falla en puntos 1-6: output `DEFECTUOSO`, pipeline detiene entrega y notifica.
Si el check falla en punto 7 u 8: output `ADVERTENCIA`, pipeline entrega con alerta.

## Implementación con python-docx

El script de conversión está en:
`/home/legales/.openclaw/workspace/pipeline-test-20260326/md_to_docx_v2.py`

Ejecutar:
```python
python3 md_to_docx_v2.py jess_draft.txt contestacion.docx
```

Luego verificar con:
```python
python3 verify_docx.py contestacion.docx
```

## Outputs

1. `contestacion.docx` — el escrito judicial listo para el abogado
2. `verification_report.json` — resultado de los 8 checks

El reporte de Lou NO va en el .docx. Si Lou corrió, su reporte va en `review-lou.md` separado.
