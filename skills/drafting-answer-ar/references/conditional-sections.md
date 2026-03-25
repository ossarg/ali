# Señales Condicionales — Mapeo de contexto → secciones

> Basado en tabla 9.3 del pattern_analysis.md

## Reglas de activación

| Si la demanda menciona... | Incluir sección | Boilerplate/Instrucción |
|---------------------------|----------------|------------------------|
| **Motocicleta** (actor o demandado en moto) | Culpa de la víctima: falta de uso de casco, velocidad, circulación por vereda | Desarrollar en "La verdad de los hechos" + negativas específicas sobre casco, velocidad, vereda |
| **Presupuesto de taller** | Desconocimiento del presupuesto + solicitar pericia mecánica | `desconoce-documental.md` + `impugna-rubros-base.md` (modelo daños materiales) |
| **Daño moral** | Impugnación con criterio restrictivo | `impugna-rubros-base.md` (modelo daño moral) |
| **Daño punitivo / art. 52 bis LDC** | Impugnación extensa + inconstitucionalidad | Desarrollo doctrinal: arts. 18, 19, 28 CN + naturaleza penal del instituto. Sección especial de ~3000-5000 chars |
| **Intereses tasa activa** | Bloque Samudio completo | `contesta-intereses-samudio.md` |
| **Ley de Defensa del Consumidor / Ley 24.240** | Bloque de inaplicabilidad | Ya incluido en `limite-cobertura.md`. Si se invoca como fundamento autónomo, desarrollar sección aparte sobre Ley 20.091 como régimen especial |
| **Repetición ART** (subrogación) | Contesta ILP + contable sobre ART + excepción defecto legal | Secciones especiales de ART. No usar template RC auto estándar para negativas |
| **Pago previo / acuerdo / desistimiento** | Excepción de pago/transacción + mora no configurada | Art. 347 inc. 7 CPCC. Solo en acción directa |
| **Inconstitucionalidad** (de leyes de emergencia, art. 730, etc.) | Contesta inconstitucionalidad | Bloque: última ratio + no acreditación de vulneración + compensación por intereses |
| **Capitalización de intereses / anatocismo** | Negar procedencia del anatocismo | Negativa específica + art. 770 CCyC |
| **Astreintes** | Negar procedencia | Negativa: "Niego la procedencia de las sanciones conminatorias (astreintes) solicitadas por el actor, por resultar improcedentes respecto de la parte demandada y la citada en garantía en los términos del art. 804 CCC." |
| **Privación de uso** | Impugnación con doctrina Valenza | `impugna-privacion-uso.md` |
| **Desvalorización venal** | Impugnación con criterio técnico | `impugna-rubros-base.md` (modelo desvalorización) |
| **Gastos médicos / farmacéuticos** | Impugnación por falta de prueba | Negativas + exigir comprobantes de gastos efectivamente realizados |
| **Incapacidad sobreviniente** | Impugnación extensa | Exigir pericia médica, cuestionar baremos, negar porcentaje pretendido |
| **Daño psicológico** | Impugnación + solicitar pericia psicológica | Distinguir de daño moral. Exigir prueba pericial psicológica |
| **Lesiones graves / fallecimiento** | Placeholder para abogado | NO generar automáticamente defensas de culpa víctima — placeholder para revisión |
| **Pericia mecánica penal preexistente** | Placeholder para abogado | NO negar hechos establecidos en pericia penal — placeholder para revisión |

## Secciones siempre activas (no condicionales)

Estas secciones se incluyen en TODA contestación, independientemente del contenido de la demanda:

1. Encabezado + Personería
2. Objeto
3. Negativa general + negativas particulares
4. Desconoce documental
5. Impugna liquidación
6. Prueba ofrecida (documental + confesional mínimo)
7. Autoriza
8. Reserva del caso federal
9. Petitorio

## Secciones activas por tipo de caso

### Citación en garantía (RC auto) — siempre incluir:
- Asume cobertura + reserva de exclusión
- Límite de cobertura (bloque doctrinal completo)
- Defensa en juicio del asegurado
- La verdad de los hechos
- Impugnación de rubros
- Derecho
- Oposición a prueba de actora (confesional citada + contable)

### Acción directa — siempre incluir:
- Póliza / contrato de seguro (versión breve)
- Negativas orientadas a incumplimiento contractual
- Impugnación de rubros

### Repetición ART — siempre incluir:
- Contesta ILP
- Contable sobre ART
- Excepción de defecto legal (si aplica)
- Contesta inconstitucionalidad (si la plantean)
