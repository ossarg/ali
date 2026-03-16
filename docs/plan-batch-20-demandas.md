# Plan: Procesamiento de 20 Demandas

## Estado actual (honesto)

| Componente | Estado | Bloqueante? |
|-----------|--------|-------------|
| Pipeline Donna→Mike→Edu→Jess→Lou | ✅ Funciona (dry run García) | — |
| Prompts alineados a skills | ✅ Todos actualizados | — |
| CLI toolkit (OCR, metadata) | ✅ Probado | — |
| Póliza lookup (SISE) | ⚠️ Endpoint existe pero no wired al pipeline | **Sí** — sin póliza, Edu da INDETERMINADO |
| Automatización (batch spawn) | ❌ Manual — Ali spawea 1×1 | **Sí** para 20 casos |
| Tracking de progreso | ❌ Solo archivos en disco | **No** — funciona, es incómodo |
| Persistencia en DB | ❌ Solo JSONs locales | **No** — funciona para PoC |
| Feedback loop | ❌ No existe | **No** — pero necesario para ajustar |
| Cost tracking | ❌ No existe | **No** — pero necesario para proyectar |

## Qué necesitamos resolver ANTES de arrancar

### 1. Póliza lookup (crítico)
Sin póliza, Edu no puede dar dictamen de cobertura (García = INDETERMINADO). Para 20 demandas reales esto invalida 1/3 del triage.

**Opciones:**
- A) Woz wirea SISE al pipeline: Mike consulta `GET /api/v1/claims/lookup` con datos del demandado/vehículo → obtiene póliza
- B) Ali consulta SISE manualmente por caso antes de spawear Mike
- C) Procesamos sin póliza y marcamos todos los coverage como pendientes

**Recomendación:** Opción B para arrancar (Ali lo puede hacer ahora), Opción A como mejora posterior.

### 2. Batch runner (crítico)
20 casos × 5 agentes = 100 spawns manuales. No es viable.

**Solución:** Ali procesa en lotes de 5 casos. Para cada caso:
1. Lee el PDF path
2. Corre `pdf_metadata.sh` + `extract_text.sh` (pre-check)
3. Spawea Donna
4. Cuando Donna termina → evalúa reglas de corte → spawea Mike
5. ... hasta Lou

**Limitación:** Ali puede correr 3-4 sub-agentes en paralelo sin degradar el Pi. Con 5 casos simultáneos serían ~5 agentes concurrentes. Factible pero hay que monitorear RAM/CPU.

**Estimación de tiempo por caso:** ~35-40 min (Donna ~5min, Mike ~6min, Edu ~16min, Jess ~12min, Lou ~12min). Para 20 casos secuenciales = ~13 horas. Con 3 en paralelo = ~4-5 horas.

### 3. Estructura de archivos

```
pipeline-tests/
├── batch-2026-03-11/
│   ├── manifest.json          ← lista de casos, estado, paths
│   ├── caso-001-garcia/
│   │   ├── donna_output.json
│   │   ├── mike_output.json
│   │   ├── edu_output.json
│   │   ├── jess_output.json
│   │   ├── lou_output.json
│   │   └── run_summary.json
│   ├── caso-002-xxx/
│   └── ...
```

## Plan de ejecución

### Fase 1: Preparación (1-2 horas)
- [ ] Recibir los 20 PDFs (Juan los sube o Rachel los procesa)
- [ ] Crear `manifest.json` con: case_id, pdf_path, carátula, estado
- [ ] Pre-procesar todos con `pdf_metadata.sh` → verificar que son legibles
- [ ] Consultar SISE por póliza para cada caso (si disponible)
- [ ] Clasificar por complejidad estimada (pages, scan vs native, monto si conocido)

### Fase 2: Procesamiento (4-5 horas con paralelismo)
- [ ] Lote 1: casos 1-5 → Donna en paralelo
- [ ] Evaluar reglas de corte → Mike en paralelo para los que pasaron
- [ ] ... Edu → Jess → Lou
- [ ] Lote 2: casos 6-10
- [ ] Lote 3: casos 11-15
- [ ] Lote 4: casos 16-20

### Fase 3: Quality review (2-3 horas)
- [ ] Consolidar resultados: cuántos completados, cuántos STOP, cuántos FLAG
- [ ] Identificar patrones de error (¿los mismos campos fallan en todos?)
- [ ] Comparar outputs de Lou: ¿qué errores son recurrentes?
- [ ] Ajustar prompts si hay errores sistemáticos
- [ ] Generar reporte para Juan con métricas

## Seguimiento y ajuste

### Dashboard improvisado (sin webapp)
Ali genera un `batch_status.md` actualizado después de cada lote:

```markdown
| # | Carátula | Donna | Mike | Edu | Jess | Lou | Result | Flags |
|---|----------|-------|------|-----|------|-----|--------|-------|
| 1 | García c/ Ramoa | ✅ 5m | ✅ 6m | ✅ 16m | ✅ 12m | ⏳ | — | presupuesto_inconsistente |
| 2 | ... | ✅ | ✅ | STOP | — | — | stopped | confidence < 0.5 |
```

### Métricas a trackear
- **Completion rate:** % de casos que llegan a Lou
- **Stop rate por agente:** ¿dónde se frena más?
- **Confidence promedio por agente**
- **Tiempo promedio por etapa**
- **Tokens totales y costo estimado por caso**
- **Hallazgos de Lou más frecuentes**

### Feedback loop
Después de cada lote de 5:
1. Ali revisa los outputs y los hallazgos de Lou
2. Si hay errores sistemáticos → ajusta prompt del agente afectado
3. Si hay un campo que siempre sale low confidence → evaluar si falta dato o falta skill
4. Reporte a Juan con findings

## Estimación de costos

Basado en García (primer caso):
- **Donna:** ~12K tokens
- **Mike:** ~20K tokens  
- **Edu:** ~50K tokens
- **Jess:** ~37K tokens
- **Lou:** ~30K tokens (estimado)
- **Total por caso:** ~150K tokens
- **20 casos:** ~3M tokens
- **Costo estimado (Sonnet):** ~$9-12 USD

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Pi se queda sin RAM con 4 agentes paralelos | Media | Alto | Monitorear con `htop`, reducir a 2 paralelos si necesario |
| Mayoría de casos sin póliza → Edu inútil | Alta | Alto | Consultar SISE antes, o procesar igual y marcar |
| Scans de baja calidad → OCR falla | Media | Medio | pdf_metadata.sh detecta, Donna marca bloqueante |
| Prompts necesitan ajuste después de lote 1 | Alta | Bajo | Es esperado — por eso procesamos en lotes de 5 |
| Rate limits de API | Baja | Alto | Serializar spawns, no más de 3 concurrentes |
