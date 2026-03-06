# Catálogo de Excepciones — Derecho Procesal Argentino

## Uso
Catálogo de excepciones previas y defensas de fondo aplicables en litigios
de seguros. El Drafting Agent selecciona las que corresponden al caso.

---

## Excepciones Previas (arts. 346-354 CPCyCN)

Se resuelven como previas y pueden impedir el avance del proceso.

### EXC-PREV-001: Incompetencia (art. 347 inc. 1)
**Cuándo usar:** El tribunal no es competente por materia, territorio o grado.

> Opongo excepción de incompetencia. El tribunal interviniente carece de
> competencia para entender en estos actuados por cuanto {{MOTIVO_INCOMPETENCIA}}.
> Corresponde que la causa tramite ante {{TRIBUNAL_COMPETENTE}} conforme
> {{FUNDAMENTO_NORMATIVO}}.

### EXC-PREV-002: Falta de personería (art. 347 inc. 2)
**Cuándo usar:** El representante del actor no acredita debidamente su personería.

> Opongo excepción de falta de personería en los términos del art. 347 inc. 2°
> del CPCCN. El letrado/apoderado de la actora no ha acreditado debidamente
> su representación conforme lo exige el art. 46 del CPCCN.
> {{DETALLE_FALTA_PERSONERIA}}

### EXC-PREV-003: Litispendencia (art. 347 inc. 4)
**Cuándo usar:** Existe otro juicio pendiente entre las mismas partes por el mismo objeto.

> Opongo excepción de litispendencia. Existe identidad de sujetos, objeto y
> causa con el expediente "{{CARATULA_OTRO_EXPEDIENTE}}" que tramita ante
> {{TRIBUNAL_OTRO}}, por lo que corresponde disponer el archivo de las presentes
> actuaciones conforme art. 347 inc. 4° del CPCCN.

### EXC-PREV-004: Cosa juzgada (art. 347 inc. 6)
**Cuándo usar:** La cuestión ya fue resuelta por sentencia firme.

> Opongo excepción de cosa juzgada. La pretensión de la actora fue objeto de
> pronunciamiento firme en los autos "{{CARATULA_ANTERIOR}}", donde se resolvió
> {{RESOLUCION_ANTERIOR}}. Existe identidad de sujetos, objeto y causa que
> impide un nuevo pronunciamiento (art. 347 inc. 6° CPCCN).

### EXC-PREV-005: Prescripción (art. 346, 2do párrafo)
**Cuándo usar:** Transcurrió el plazo de prescripción de la acción.

> Opongo excepción de prescripción. La acción se encuentra prescripta conforme
> los siguientes fundamentos:
>
> **Plazo aplicable:** {{PLAZO}} ({{FUNDAMENTO_PLAZO}})
> - Art. 2561 CCC: acciones de daños y perjuicios — 3 años
> - Art. 58 Ley 17.418: acciones del contrato de seguros — 1 año
>
> **Cómputo:**
> - Fecha del hecho / conocimiento del daño: {{FECHA_INICIO}}
> - Fecha de interposición de demanda: {{FECHA_DEMANDA}}
> - Tiempo transcurrido: {{TIEMPO_TRANSCURRIDO}}
>
> Habiéndose excedido ampliamente el plazo legal, la acción se encuentra
> prescripta y corresponde su rechazo sin más trámite.

### EXC-PREV-006: Falta de legitimación activa
**Cuándo usar:** El actor no es titular del derecho que invoca.

> Opongo falta de legitimación activa. La actora no reviste la calidad de
> {{CALIDAD_INVOCADA}} ni acredita titularidad del derecho reclamado.
> {{DESARROLLO_FALTA_LEGITIMACION}}

### EXC-PREV-007: Falta de legitimación pasiva
**Cuándo usar:** La aseguradora no es la parte que debe responder.

> Opongo falta de legitimación pasiva de mi mandante. {{NOMBRE_ASEGURADORA}}
> no resulta responsable del siniestro reclamado por cuanto
> {{MOTIVO_FALTA_LEGITIMACION}}.

### EXC-PREV-008: Defecto legal (art. 347 inc. 5)
**Cuándo usar:** La demanda no cumple requisitos del art. 330 CPCyCN.

> Opongo excepción de defecto legal en el modo de proponer la demanda.
> El escrito de demanda no cumple con los requisitos del art. 330 del CPCCN
> por cuanto {{DEFECTO_IDENTIFICADO}}, lo que impide el adecuado ejercicio
> del derecho de defensa de mi mandante.

---

## Defensas de Fondo (específicas de seguros)

Se resuelven en la sentencia definitiva.

### DEF-FONDO-001: Exclusión de cobertura contractual
**Cuándo usar:** El siniestro está excluido por cláusula de la póliza.

> El siniestro reclamado se encuentra expresamente excluido de cobertura
> conforme la cláusula {{NUMERO_CLAUSULA}} de las condiciones
> {{GENERALES/PARTICULARES/ESPECIALES}} de la póliza N° {{NUMERO_POLIZA}},
> que establece: "{{TEXTO_CLAUSULA}}".
>
> En consecuencia, mi mandante no asumió el riesgo del evento reclamado,
> resultando improcedente toda pretensión indemnizatoria a su respecto.

### DEF-FONDO-002: Caducidad por incumplimiento de cargas (art. 47 Ley 17.418)
**Cuándo usar:** El asegurado no cumplió obligaciones post-siniestro.

> Opongo la caducidad del derecho del asegurado en los términos del art. 47
> de la Ley 17.418. El asegurado incumplió la carga de {{CARGA_INCUMPLIDA}},
> prevista en la cláusula {{CLAUSULA}} de la póliza y en el art. {{ARTICULO}}
> de la Ley de Seguros.
>
> El incumplimiento de las cargas informativas post-siniestro produce la
> caducidad del derecho del asegurado a ser indemnizado.

### DEF-FONDO-003: Culpa grave del asegurado (art. 70 Ley 17.418)
**Cuándo usar:** El siniestro se produjo por culpa grave del asegurado.

> El siniestro se produjo como consecuencia directa de la culpa grave del
> asegurado, en los términos del art. 70 de la Ley 17.418, que exime al
> asegurador de su obligación de indemnizar.
>
> La culpa grave se configura por {{DESCRIPCION_CULPA_GRAVE}}, conducta
> que excede la mera negligencia y demuestra un desprecio consciente por
> las consecuencias del obrar.

### DEF-FONDO-004: Culpa de la víctima (arts. 1729, 1730 CCC)
**Cuándo usar:** La víctima contribuyó a la producción del daño.

> El daño reclamado fue causado total o parcialmente por la propia conducta
> de la víctima, en los términos de los arts. 1729 y 1730 del Código Civil
> y Comercial. {{DESCRIPCION_CULPA_VICTIMA}}
>
> La culpa de la víctima interrumpe total o parcialmente el nexo causal,
> eximiendo o limitando la responsabilidad del asegurado y, consecuentemente,
> de la aseguradora.

### DEF-FONDO-005: Limitación al monto de cobertura
**Cuándo usar:** Siempre, en subsidio.

> En subsidio, y para el hipotético caso de que V.S. hiciera lugar a la
> demanda, la condena contra mi mandante deberá limitarse al monto de la
> cobertura contratada ({{SUMA_ASEGURADA}}), con deducción de la franquicia
> pactada ({{FRANQUICIA}}), conforme las condiciones particulares de la
> póliza N° {{NUMERO_POLIZA}} y el art. 118 de la Ley 17.418.

### DEF-FONDO-006: Falta de denuncia en término (art. 46 Ley 17.418)
**Cuándo usar:** El siniestro no fue denunciado en el plazo legal/contractual.

> El asegurado no denunció el siniestro dentro del plazo de tres (3) días
> de conocido, conforme lo establece el art. 46 de la Ley 17.418.
> El siniestro ocurrió el {{FECHA_SINIESTRO}} y fue denunciado recién el
> {{FECHA_DENUNCIA}}, es decir {{DIAS_DEMORA}} días después, excediendo
> ampliamente el plazo legal.

---

*Catálogo v1.0 — Libra Legal AI*
*Última actualización: 2026-03*
