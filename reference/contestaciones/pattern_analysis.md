# Análisis de Patrones – Contestaciones de Demanda de Libra Cía. Argentina de Seguros S.A.

**Corpus**: 32 archivos en `/home/legales/ali/reference/contestaciones/markdown/`
**Casos únicos efectivos**: ~22 (hay duplicados/versiones del mismo expediente: 82107×2, 96135×3, 098163×2, 93326×3, 80224×2, 85483×3, 96149×2)
**Fecha del análisis**: 25 de marzo de 2026

---

## 1. ESTRUCTURA DE SECCIONES – FRECUENCIA Y ORDEN CANÓNICO

### Estructura canónica por tipo de caso

#### A) CITACIÓN EN GARANTÍA – RC AUTO (caso dominante, ~18/22 casos)

| # | Sección | Frecuencia | Obligatoria |
|---|---------|-----------|-------------|
| 1 | Encabezado (título + presentación letrada) | 22/22 | ✅ |
| 2 | PERSONERÍA | 22/22 | ✅ |
| 3 | OBJETO | 20/22 | ✅ |
| 4 | ASUME COBERTURA – DENUNCIA LÍMITE – FORMULA RESERVA | 18/22 | ✅ (citación) |
| 5 | LÍMITE DE COBERTURA (desarrollo doctrinal extenso) | 18/22 | ✅ (citación) |
| 6 | DEFENSA EN JUICIO DEL ASEGURADO | 12/22 | ⚠️ Frecuente |
| 7 | CONTESTA DEMANDA – NEGATIVAS GENERALES Y PARTICULARES | 22/22 | ✅ |
| 8 | DESCONOCE DOCUMENTAL | 18/22 | ✅ |
| 9 | LA VERDAD DE LOS HECHOS / LA REALIDAD DE LOS HECHOS | 18/22 | ✅ |
| 10 | CULPA DE LA VÍCTIMA / FALTA DE PRUEBA | 8/22 | ⚠️ Condicional |
| 11 | DERECHO | 14/22 | ✅ |
| 12 | IMPUGNA RUBROS / RECLAMO PATRIMONIAL | 20/22 | ✅ |
| 13 | IMPUGNA LIQUIDACIÓN | 20/22 | ✅ |
| 14 | CONTESTA PLANTEO DE INTERESES | 10/22 | ⚠️ Condicional |
| 15 | OFRECE PRUEBA | 22/22 | ✅ |
| 16 | OPOSICIÓN A PRUEBA DE ACTORA | 14/22 | ⚠️ Frecuente |
| 17 | FÓRMULA RESERVA DE DERECHOS | 6/22 | Opcional |
| 18 | ART. 730 CCyC (tope de costas) | 8/22 | Opcional |
| 19 | RESERVA ART (repetición de ART) | 3/22 | Opcional |
| 20 | AUTORIZA | 22/22 | ✅ |
| 21 | RESERVA DEL CASO FEDERAL | 20/22 | ✅ |
| 22 | PETITORIO | 22/22 | ✅ |

#### B) ACCIÓN DIRECTA CONTRA LIBRA (cobro de seguro, ordinario) – ~4/22 casos

| # | Sección | Frecuencia |
|---|---------|-----------|
| 1 | Encabezado + PERSONERÍA | 4/4 |
| 2 | OBJETO | 4/4 |
| 3 | PÓLIZA / CONTRATO DE SEGURO | 4/4 |
| 4 | ACUERDO – PAGO – DESISTIMIENTO (cuando hubo acuerdo previo) | 3/4 |
| 5 | EXCEPCIÓN DE PAGO / TRANSACCIÓN | 3/4 |
| 6 | SUBSIDIARIAMENTE CONTESTA DEMANDA – NEGATIVAS | 4/4 |
| 7 | LEY 24240 – INAPLICABILIDAD | 2/4 |
| 8 | DAÑOS RECLAMADOS (impugnación rubro por rubro) | 4/4 |
| 9 | LIQUIDACIÓN / INTERESES | 4/4 |
| 10 | PRUEBA | 4/4 |
| 11 | AUTORIZA / RESERVA FEDERAL / PETITORIO | 4/4 |

#### C) REPETICIÓN ART (subrogación contra asegurado RC) – ~2/22 casos

| # | Sección | Diferencia vs. RC auto estándar |
|---|---------|-------------------------------|
| - | EXCEPCIÓN DEFECTO LEGAL | Aparece en repetición ART |
| - | EL RIESGO ASUMIDO EN MOTOCICLETAS | Específico de motos |
| - | CONTESTA PLANTEO DE INCONSTITUCIONALIDAD | Frecuente en ART |
| - | PERICIAL MÉDICA + CONTABLE SOBRE ART | Prueba específica |

---

## 2. FÓRMULAS LEGALES RECURRENTES (BOILERPLATES)

### 2.1 ENCABEZADO – Presentación letrada

**Frecuencia**: 25/22 casos (Diaz Mariana en 25, Mastroizzi en 1)

```
DIAZ MARIANA ALEJANDRA (T143 F 869 CPACF, CUIT 27 17029650-3, Monotributista), letrada apoderada, mail: [mail]@libraseguros.com.ar, constituyendo domicilio legal en la calle Olazabal 1515 5to OF 505, CEL 1168973780 y con domicilio electrónico [CUIT], en los autos caratulados: "[CARATULA]" (Expediente: [NRO]/[AÑO]), a V.S. me presento y digo:
```

### 2.2 PERSONERÍA

**Frecuencia**: 22/22 – texto casi idéntico siempre.

**Versión estándar (citación en garantía)**:
```
Que tal como surge de la copia de poder general que acompaño, que declaro bajo juramento es fiel a su original que se encuentra vigente, soy mandataria de LIBRA COMPAÑIA ARGENTINA DE SEGUROS S.A., con domicilio real en Olazábal 1515, piso 5 of. 505, de la Ciudad de Buenos Aires.
```

**Versión alternativa (acción directa)**:
```
Que en nombre y representación de LIBRA COMPAÑIA ARGENTINA DE SEGUROS S.A., con domicilio real en Olazabal 1515, piso 5° Oficina 505, de la Ciudad Autónoma de Buenos Aires, conforme lo justifico con la fotocopia del poder general que adjunto acompaño -declarando bajo juramento que es fiel a su original y que se encuentra en plena vigencia-, vengo en tiempo y forma a tomar intervención en autos, solicitando se me tenga por presentado, por parte y por constituido el domicilio legal indicado.
```

### 2.3 OBJETO

**Frecuencia**: 20/22

```
Que vengo en legal tiempo y forma a contestar la demanda de la cual se le ha corrido traslado a mi representada solicitando el rechazo de la pretensión impetrada por la parte actora, con expresa imposición de costas por las consideraciones de hecho y derecho que a continuación expondré.
```

Variante (citación en garantía):
```
Que, en el carácter invocado, vengo por el presente a contestar, en legal tiempo y forma, la citación en garantía cursada en estas actuaciones, notificada por cédula el [FECHA], cuyo vencimiento opera el [FECHA], solicitando su total rechazo con costas.
```

### 2.4 ASUME COBERTURA – CLÁUSULA CG-RC 01.1

**Frecuencia**: 18/22 (todos los de citación en garantía)

```
En el caso de autos, [el/la] aquí demandado/a, [ASEGURADO], contrató oportunamente una póliza de seguro automotor N° [NRO POLIZA], con cobertura de "Responsabilidad Civil hacia terceros transportados y no transportados, respecto del automóvil [MARCA MODELO] dominio [DOMINIO], hasta la suma máxima por acontecimiento detallada en el riesgo". Se limita a la suma de $[MONTO] tal como se establece en el Frente de póliza y en la clausula CG-RC 01.1 - Responsabilidad Civil - Riesgo Cubierto: […] El Asegurador se obliga a mantener indemne al Asegurado y/o a la persona que con su autorización conduzca el vehículo objeto del seguro (en adelante el Conductor), por cuanto deban a un tercero como consecuencia de daños causados por ese vehículo o por la carga que transporte en condiciones reglamentarias, por hechos acaecidos en el plazo convenido, en razón de la responsabilidad civil que pueda resultar a cargo de ellos. El Asegurador asume esta obligación únicamente en favor del Asegurado y del Conductor, hasta la suma máxima por acontecimiento, establecida en el Frente de Póliza por daños corporales a personas, sean estas transportadas o no transportadas y por daños materiales, hasta el monto máximo allí establecido para cada acontecimiento sin que los mismos puedan ser excedidos por el conjunto de indemnizaciones que provengan de un mismo hecho generador. Se entiende por acontecimiento todo evento que pueda ocasionar uno o más reclamos producto de un mismo hecho generador […]
```

### 2.5 RESERVA DE EXCLUSIÓN

**Frecuencia**: 18/22

```
Asimismo, mi representada formula expresa reserva de invocar alguna de las causas de "exclusión de cobertura" previstas en la póliza y la Ley 17.418 con sus consecuencias jurídicas, si con posterioridad a éste responde llegaran a su conocimiento hechos, circunstancias y/o elementos no denunciados por su asegurado que hubieran obstado a esta presentación (Cláusula 3), haciendo expresa reserva de los derechos que pudieran derivarse de dicha circunstancia.
```

### 2.6 LÍMITE DE COBERTURA – Bloque doctrinal completo

**Frecuencia**: 18/22 – Este es el bloque más largo y más repetido verbatim. Se copia casi idéntico entre todos los casos. Contiene las siguientes citas canónicas en este orden:

1. **Stiglitz sobre art. 118.3**: "habrá de tenerse presente que ello resulta de la previsión contenida en el art. 118.3 Ley de Seguros..."
2. **CSJN – Oponibilidad**: Fallos 329:3054 y 3488; 330:3483 y 331:379; Obarrio; Gauna
3. **CSJN – Buffoni** (Fallos: 337:329): función social no implica reparación integral sin límites
4. **Fuente de obligación**: "las obligaciones del demandado civilmente responsable y de la aseguradora... poseen distintos sujetos y tienen distinta causa"
5. **Art. 68 Ley de Tránsito**: no surge que cobertura deba ser integral
6. **Límites como elemento esencial**: "constituyen un elemento esencial en la estructura técnica del seguro"
7. **Principio compensación integral no es absoluto**: "el legislador puede optar por diversos sistemas"
8. **Ley de Defensa del Consumidor no aplica**: "ley general posterior que no deroga ni modifica ley especial anterior"
9. **Martínez de Costa c/ Vallejos** (CSJ 1319/2008)
10. **Flores, Lorena Romina c/ Gimenez** (CSJ 678/2013): "la obligación del asegurador de reparar el daño tiene naturaleza meramente contractual"
11. **Aimar, María Cristina c/ Molina** (ratificación 24/04/2018)
12. **Álvarez c/ Moscatelli** (14/12/2023): ratificación más reciente

```
En consecuencia, para el supuesto caso de prosperar la demanda entablada por la parte actora, solicito que la sentencia se haga extensiva a mi representada sólo hasta el límite de cobertura invocado.
```

### 2.7 DEFENSA EN JUICIO DEL ASEGURADO

**Frecuencia**: 12/22

```
De conformidad con lo establecido por la cláusula tercera de la Póliza Básica del Seguro Obligatorio de Responsabilidad Civil, en caso de que el Asegurado y/o Conductor del vehículo asegurado asuman su defensa en juicio sin darle noticia oportuna a mi representada para que éste la asuma, los honorarios de los letrados de éstos quedarán a su exclusivo cargo de los mismos.
```

### 2.8 NEGATIVA GENERAL INTRODUCTORIA

**Frecuencia**: 22/22

**Versión 1** (más frecuente):
```
Siguiendo expresas instrucciones de mi mandante, niego todos y cada uno de los hechos invocados en la demanda que no sean objeto de expreso reconocimiento en el presente responde.
```

**Versión 2** (con referencia al art. 356):
```
Conforme lo dispone el art. 356 CPCCN, niego todos y cada uno de los hechos y el derecho invocado por la actora, como así también la autenticidad de toda la documentación que no sea expresamente reconocida en este responde.
```

### 2.9 DESCONOCE DOCUMENTAL

**Frecuencia**: 18/22

```
En los términos del artículo 356 inciso 1° del Código Procesal Civil y Comercial, mi parte desconoce expresa y formalmente, por no constarle su autenticidad, veracidad, origen, integridad, fecha cierta ni correspondencia con el hecho de autos, toda la documentación acompañada por la actora, así como aquella que eventualmente se incorpore en el futuro sin los recaudos legales pertinentes.
```

### 2.10 BLOQUE DOCTRINAL SOBRE EL DAÑO (Impugnación de rubros)

**Frecuencia**: 14/22

```
La indemnización por daños y perjuicios tiene una finalidad de equilibrio patrimonial, está destinada a colocar al patrimonio dañado en las mismas condiciones que se encontraba temporalmente anterior al hecho o evento dañoso.

Por lo tanto, se debe verificar y probar la existencia de daño con la correspondiente relación causal con algún factor de atribución de responsabilidad. Y luego, cuantificar el daño verdaderamente sufrido. El daño debe ser cierto y subsistente, debe ser personal y afectar intereses legítimos de la víctima a los fines de ser resarcible.

"Para ser indemnizable el daño debe ser cierto, el daño cierto es aquel cuyo acaecimiento no es conjetural o dudoso, sino demostrable en cuanto a su existencia y extensión (Teoría general de la responsabilidad Civil - Bustamante Alsina, Jorge)"

[...]

"La responsabilidad civil no puede declarase en el vacío y éste se presenta no sólo en ausencia del daño, sino también cuando se carece de sustento para identificar su contenido específico, pues sólo es resarcible el daño 'causado por el accidente' que se atribuye al responsable y la prueba de la relación causal asume máxima importancia, ya que determina quien responde (autoría del daño) y por cuáles consecuencias responde (Cfr. Alterini, López Cabana, 'Presunciones de causalidad y de responsabilidad', L.L. 1986 - E - 984)"

[...] el onus probandi ('carga de la prueba') se encuentra a cargo del reclamante [...] la indemnización no debe producir el enriquecimiento indebido del actor [...]
```

### 2.11 IMPUGNACIÓN DE PRIVACIÓN DE USO

**Frecuencia**: 14/22 (en todos los RC auto con daños materiales)

```
La procedencia de la indemnización por privación de uso exige la acreditación fehaciente del perjuicio efectivamente sufrido. Ello, en tanto la indisponibilidad del vehículo no sólo puede generar gastos de movilidad alternativa, sino también ahorros correlativos —tales como combustible, estacionamiento, mantenimiento y otros costos asociados al uso habitual del rodado— que deben ser ponderados a fin de evitar una reparación injustificada.
```

Con cita de Valenza c/ Provincia Seguros (CNCom Sala A):
```
"(…) Para que este rubro —privación del uso del automotor— prospere, es exigible que la interesada suministre prueba concreta de que los gastos y molestias ocasionados por la falta del vehículo superan o exceden el ahorro que produce dicha ausencia de uso [...]"
```

### 2.12 OPOSICIÓN A CONFESIONAL DE CITADA EN GARANTÍA

**Frecuencia**: 14/22

```
No habiendo el presidente de mi representada participado en los hechos invocados en la demanda y atento a que la cobertura asegurativa que se le atribuye a mi mandante ha sido reconocida en el presente responde acompañándose la póliza respectiva y la denuncia de siniestro formulada por su asegurado, la prueba ofrecida resulta superflua.
```

### 2.13 OPOSICIÓN A PERICIAL CONTABLE

**Frecuencia**: 14/22

```
Esta parte se opone a la producción de la prueba pericial contable ofrecida en forma subsidiaria por la actora, por resultar manifiestamente innecesaria, inconducente e improcedente para la resolución del presente litigio.

En efecto, LIBRA COMPAÑÍA ARGENTINA DE SEGUROS S.A. ha reconocido la existencia de cobertura vigente al momento del hecho, circunstancia que no se encuentra controvertida en autos. En consecuencia, no existe cuestión contable alguna que requiera el auxilio de un experto [...] La producción de dicha prueba no haría más que dilatar innecesariamente el proceso y generar gastos superfluos [...] esta parte se opone expresamente a la producción de la pericia contable ofrecida y manifiesta su desinterés en los términos del art. 478, segundo párrafo, apartado 2, del CPCCN, solicitando se la tenga por desistida y no se ordene su producción.
```

### 2.14 DERECHO

**Frecuencia**: 14/22

```
Fundo el derecho que asiste a mi mandante en la ley 17.418, Ley Nacional de Tránsito, Código Civil y Comercial de la Nación Argentina, Código Procesal Civil y Comercial de La Nación, jurisprudencia y doctrina aplicables al caso.
```

### 2.15 RESERVA DEL CASO FEDERAL

**Frecuencia**: 20/22

```
Para el hipotético e improbable caso de que V.S. haga lugar al planteo realizado, dejo expresa reserva del caso federal previsto en el art. 14 de la Ley 48, por considerar vulnerados, en tal improbable supuesto, las garantías constitucionales de mis representados, plasmadas en los principios constitucionales de defensa en juicio, igualdad ante la ley, propiedad, y debido proceso. (Arts. 16, 17, 18).
```

### 2.16 AUTORIZA

**Frecuencia**: 22/22

```
Solicito se autorice a Hernan Enrique Fernández, Hernan Báez, Julieta Anahí Rodriguez, Lorena Alejandra Iglesias, Florencia Agustina Cabrera, Agustina Castro, Michelle Cerini, Axel Accorinti, Claudio Sagot, a solicitar el expediente en mesa de entradas, presentar escritos, extraer fotocopias, retirar oficios, exhortos, testimonios, copias de escritos y/o pericias, hacer desgloses y cuanto más sea necesario a los efectos de controlar el estado del juicio (R.N.J. Art. 63, inc. A modificado por la Acordada de la C.S.J.N. 5.3.54). Para el caso de que los autorizados procediesen a retirar copias de escritos y/o pericias de los cuales se hubiera corrido vista o traslado, queda entendido que dicho retiro implica la notificación del suscripto de tal vista o traslado.
```

### 2.17 PETITORIO

**Frecuencia**: 22/22

**Versión citación en garantía**:
```
Por todo lo expuesto, a V.S. solicito:
Me tenga por presentada, por parte.
Tenga por constituido el domicilio legal y electrónico.
Tenga por contestada la demanda.
Por ofrecida la prueba.
Por introducida la cuestión federal.
Oportunamente se rechace la misma, con costas.
Se tengan presentes las autorizaciones conferidas.

Proveer de conformidad,
SERÁ JUSTICIA.
```

### 2.18 CONTESTA PLANTEO DE INTERESES (Samudio)

**Frecuencia**: 10/22

Bloque doctrinal extenso que invoca:
- Plenario "Samudio de Martínez c/ Transportes Doscientos Setenta S.A."
- Excepción de enriquecimiento indebido cuando se fijan montos a valores actuales
- Tasa de interés puro del 6-8% anual hasta sentencia
- Tasa activa solo desde sentencia en adelante
- Citas de Sala E, Sala M, Sala G CNCiv

### 2.19 ART. 730 CCyC (TOPE DE COSTAS)

**Frecuencia**: 8/22

```
Con fecha 10 de Enero de 1995, se ha publicado en el Boletín Oficial la Ley 24.432 de Honorarios Profesionales, la cual en su art. 1º dispone que se incorpora al art. 505 del Código Civil (actual art. 730 del Código Civil y Comercial) el siguiente párrafo: "Si en el cumplimiento de la obligación, cualquiera sea su fuente, derivase en litigio judicial o arbitral, la responsabilidad por el pago de las costas, incluidos los honorarios profesionales de todo tipo allí devengados y correspondientes a la primera o única instancia, no excederá del veinticinco por ciento (25%) del monto de la sentencia, laudo, transacción o instrumento que ponga fin al diferendo".
```

---

## 3. DEFENSAS MÁS COMUNES – RANKING

| # | Defensa | Frecuencia | Patrón de redacción |
|---|---------|-----------|---------------------|
| 1 | **Oponibilidad del límite de cobertura** | 18/22 | Bloque doctrinal completo (§2.6). Siempre con citas CSJN: Buffoni, Flores, Álvarez c/ Moscatelli |
| 2 | **Negativa general + negativas particulares** | 22/22 | Lista numerada de "Niego que..." (20-54 ítems). Cada negativa es una oración que empieza con "Niego que..." |
| 3 | **Impugnación de rubros** | 20/22 | Rubro por rubro: daños materiales, privación de uso, desvalorización, daño moral, daño futuro |
| 4 | **Impugnación de liquidación** | 20/22 | "se impugna por arbitraria y desmedida la liquidación practicada en autos la que asciende a la suma de $[MONTO]" |
| 5 | **Desconocimiento de documental** | 18/22 | Art. 356 inc. 1° CPCCN + lista específica de docs desconocidos |
| 6 | **Culpa de la víctima / concurrencia de culpa** | 15/22 | Desarrollo de conducta imprudente del actor. En motos: falta de casco, exceso de velocidad, circulación por vereda |
| 7 | **Falta de prueba del daño** | 14/22 | "El daño debe ser cierto y actual" + Bustamante Alsina + carga de la prueba |
| 8 | **Contesta intereses (anti-tasa activa)** | 10/22 | Plenario Samudio + excepción de enriquecimiento indebido |
| 9 | **Oposición a pruebas de actora** | 14/22 | Confesional citada + pericial contable como innecesarias |
| 10 | **Reserva de exclusión de cobertura** | 18/22 | Cláusula 3 póliza + Ley 17.418 |
| 11 | **Defensa en juicio del asegurado** | 12/22 | Honorarios a cargo del asegurado si asume defensa sin avisar |
| 12 | **Tope art. 730 CCyC** | 8/22 | Ley 24.432 – 25% de costas |
| 13 | **Inaplicabilidad Ley Consumidor** | 6/22 | "ley general posterior no deroga ley especial anterior" + Ley 20.091 |
| 14 | **Excepción de pago/transacción** | 3/22 | Solo en acción directa donde hubo acuerdo previo |
| 15 | **Falta de uso de casco** | 6/22 | En accidentes con motos |
| 16 | **Inconstitucionalidad de daño punitivo** | 2/22 | Arts. 18, 19, 28 CN + naturaleza penal del instituto |
| 17 | **Excepción de defecto legal** | 2/22 | En repetición ART |
| 18 | **Excepción de transacción previa** | 3/22 | Art. 347 inc. 7 CPCC |
| 19 | **Reserva respecto de ART** | 3/22 | Por eventual indemnización de ART al mismo trabajador |
| 20 | **Oposición a multa art. 45 CPCCN** | 4/22 | Temeridad/malicia |

---

## 4. DIFERENCIAS POR TIPO DE CASO

### 4.1 Citación en Garantía vs. Acción Directa

| Aspecto | Citación en Garantía | Acción Directa |
|---------|---------------------|----------------|
| **Título** | "CONTESTA DEMANDA CITADA EN GARANTÍA – OFRECE PRUEBA" | "CONTESTA DEMANDA. OFRECE PRUEBA" |
| **Sección cobertura** | ASUME COBERTURA – DENUNCIA LÍMITE (extenso, ~4000 chars) | CONTRATO DE SEGURO / PÓLIZA (más breve, ~1500 chars) |
| **Límite de cobertura** | Desarrollo doctrinal completo con CSJN (~6000-8000 chars) | Solo mención de suma asegurada como tope + art. 61 Ley 17.418 |
| **Relato de hechos** | "LA VERDAD DE LOS HECHOS" – versión propia de la mecánica del accidente | "CUMPLIMIENTO DE OBLIGACIÓN" – defensa de que se pagó/cumplió |
| **Negativas** | Orientadas a mecánica del accidente y responsabilidad | Orientadas a incumplimiento contractual |
| **Defensas específicas** | Culpa víctima, falta de casco, culpa concurrente | Excepción de pago, transacción, mora no configurada |
| **Prueba** | Pericia mecánica + médica + informativa policial | Contable + informativa bancaria |
| **Largo promedio** | ~48.000 chars | ~35.000 chars |

### 4.2 RC Auto vs. ART vs. Otros Ramos

| Aspecto | RC Auto (accidentes) | Repetición ART | Seguro patrimonial (robo) |
|---------|---------------------|----------------|--------------------------|
| **Negativas** | 30-54 específicas sobre mecánica | 46+ sobre responsabilidad civil y laboral | 25-40 sobre incumplimiento |
| **Impugnación rubros** | Daños materiales, privación de uso, desvalorización, daño moral | Prestaciones médicas, ILP, gastos | Intereses, daño moral, daño punitivo |
| **Prueba especial** | Pericia mecánica (siempre) | Contable sobre ART + médica | Contable + informativa bancaria |
| **Defensas únicas** | Culpa víctima, falta de casco, circulación por vereda | Inconstitucionalidad leyes de emergencia, contesta ILP | Mora no configurada, inaplicabilidad LDC, inconstitucionalidad daño punitivo |
| **Secciones exclusivas** | FALTA DE USO DE CASCO, CULPA DE LA VÍCTIMA | EXCEPCIÓN DEFECTO LEGAL, CONTESTA INCONSTITUCIONALIDAD | ACUERDO-PAGO-DESISTIMIENTO, LEY 24240 |

### 4.3 Daños solo materiales vs. con lesiones

| Aspecto | Solo daños materiales | Con lesiones |
|---------|----------------------|--------------|
| **Rubros impugnados** | Daños materiales, privación de uso, desvalorización | + Daño moral, daño psicológico, gastos médicos, incapacidad |
| **Prueba** | Solo pericia mecánica | + Pericia médica, psicológica, informativa hospitales |
| **Largo** | ~35.000-45.000 chars | ~50.000-70.000 chars |

---

## 5. LARGO POR SECCIÓN (PROMEDIO)

| Sección | Chars promedio | Párrafos promedio |
|---------|---------------|-------------------|
| Encabezado + Personería | ~800-1.200 | 2-3 |
| Objeto | ~300-500 | 1-2 |
| Asume cobertura + Reserva | ~1.500-2.500 | 3-5 |
| Límite de cobertura (desarrollo completo) | ~6.000-8.000 | 12-18 |
| Defensa en juicio | ~300-400 | 1 |
| Negativas generales y particulares | ~3.000-8.000 | 30-54 ítems |
| Desconoce documental | ~800-1.500 | 2-4 |
| La verdad de los hechos | ~1.500-3.000 | 5-10 |
| Culpa de la víctima | ~1.000-2.500 | 3-8 |
| Derecho | ~200-500 | 1-2 |
| Impugna rubros (todos) | ~3.000-8.000 | 8-20 |
| - Daños materiales | ~800-1.500 | 3-5 |
| - Privación de uso | ~1.000-2.000 | 4-6 |
| - Desvalorización | ~500-1.000 | 2-3 |
| - Daño moral | ~1.000-2.500 | 4-8 |
| - Daño punitivo | ~3.000-5.000 | 10-15 |
| Impugna liquidación | ~300-600 | 1-2 |
| Contesta intereses | ~3.000-5.000 | 8-15 |
| Prueba ofrecida | ~1.500-4.000 | 6-15 |
| Oposición a prueba actora | ~600-1.500 | 2-5 |
| Art. 730 / tope costas | ~500-800 | 2-3 |
| Reserva caso federal | ~200-300 | 1 |
| Autoriza | ~400-500 | 1 |
| Petitorio | ~300-500 | 6-8 ítems |
| **TOTAL PROMEDIO** | **~35.000-55.000 chars** | **~80-150 párrafos** |

---

## 6. PRUEBA OFRECIDA

### 6.1 Prueba que se ofrece SIEMPRE

| Prueba | Frecuencia | Detalle |
|--------|-----------|---------|
| **Documental** | 22/22 | a) Copia de poder general; b) Copia de póliza; c) Copia denuncia de siniestro |
| **Confesional** | 18/22 | "Solicito se cite a la parte actora a absolver posiciones a tenor del pliego que oportunamente se acompañará, bajo apercibimiento de ley." |

### 6.2 Prueba frecuente/condicional

| Prueba | Frecuencia | Cuándo aparece |
|--------|-----------|----------------|
| **Pericia mecánica** | 17/22 | En todo RC auto. Se adhiere a la ofrecida por actora + puntos propios |
| **Informativa** | 15/22 | Oficios a policía, hospitales, bancos según caso |
| **Pericia médica** | 7/22 | Cuando hay lesiones |
| **Pericia psicológica** | 8/22 | Cuando se reclama daño psíquico/moral con lesiones |
| **Pericia contable** | 8/22 | Sobre la actora (ART) o sobre hechos de pago |
| **Pericial informática** | 2/22 | Cuando se discuten correos electrónicos |

### 6.3 Puntos de pericia mecánica (canónicos)

Se repiten estos puntos en casi todas las pericias mecánicas:

1. Verifique y describa detalladamente los daños que presenta el vehículo del actor
2. Determine cuáles guardan relación directa y exclusiva con el contacto denunciado
3. Informe si la magnitud es compatible con la entidad del impacto
4. Indique si las piezas cuya sustitución se consigna resultan efectivamente necesarias o si corresponde reparación
5. Determine si el presupuesto se corresponde con los daños efectivamente constatados
6. Estime el costo razonable de reparación conforme valores de plaza vigentes

---

## 7. TONO Y REGISTRO

### 7.1 Características generales

- **Registro**: Español jurídico formal argentino, con tuteo procesal ("V.S.", "a V.S. me presento y digo")
- **Nivel de formalidad**: Alto. Uso de fórmulas procesales rituales
- **Persona gramatical**: Primera persona del singular para la letrada; tercera para la mandante
- **Expresiones recurrentes**:
  - "mi mandante" / "mi representada" / "mi conferente"
  - "la aquí demandada" / "la actora" / "la accionante"
  - "el libelo de inicio" / "el escrito de inicio"
  - "niego todos y cada uno de los hechos"
  - "para el hipotético e improbable supuesto"
  - "solicito su total rechazo con costas"
  - "en la medida del seguro"
  - "Proveer de conformidad, SERÁ JUSTICIA"

### 7.2 Variación entre abogados

Se identifican **2 estilos principales** en el corpus:

**Estilo A – Díaz Mariana (mayoritario, ~21/22 casos)**:
- Secciones con números romanos (I., II., III.) o números arábigos
- Negativas numeradas ("1. Niego que...", "2. Niego que...")
- Desarrollo doctrinal extenso con citas verbatim de fallos CSJN
- Tono asertivo pero contenido
- Mayor sistematización formal

**Estilo B – Mastroizzi (1 caso: Trinidad c/ Libra)**:
- Secciones con números arábigos ("2.- POLIZA", "3.- ACUERDO")
- Negativas como párrafos separados sin numeración
- Más jurisprudencia de CNCom y fuero comercial
- Tono ligeramente más combativo
- Domicilio en Tucumán 1438 (no Olazábal)
- Elenco de autorizados diferente

### 7.3 Fórmulas de cierre de sección

- "Por lo expuesto, solicito se rechace íntegramente este rubro"
- "Niego que la accionante tenga derecho a percibir la suma de $[MONTO] en concepto de [RUBRO]"
- "El reclamo resulta improcedente, abusivo y carece de sustento fáctico"
- "Proveer de conformidad, SERÁ JUSTICIA"

---

## 8. ARTÍCULOS Y LEYES MÁS CITADOS – TOP 20

| # | Artículo/Ley | Menciones | Contexto de uso |
|---|-------------|-----------|-----------------|
| 1 | **Ley 17.418** (Ley de Seguros) | 70 | Base normativa de toda contestación. Art. 118 (citación en garantía), art. 56 (plazo de pago) |
| 2 | **Art. 118 Ley 17.418** | 44 | Citación en garantía, "en la medida del seguro" |
| 3 | **Ley 24.432** (Honorarios) | 52 | Tope de costas 25% (art. 730 CCyC) |
| 4 | **Art. 730 CCyC** | 39 | Tope del 25% de costas. También constitucionalidad |
| 5 | **Art. 14 Ley 48** | 31 | Reserva del caso federal |
| 6 | **Art. 68 Ley de Tránsito** | 22 | Obligatoriedad del seguro ≠ cobertura integral |
| 7 | **Art. 1729 CCyC** | 21 | Hecho de la víctima como eximente |
| 8 | **Art. 45 CPCCN** | 19 | Temeridad y malicia – oposición |
| 9 | **Ley 24.449** (Tránsito) | 19 | Normas de circulación violadas por actor |
| 10 | **Art. 388 CPCCN** | 16 | Intimación a acompañar documental |
| 11 | **Ley 26.361** (LDC reforma) | 20 | Inaplicabilidad al contrato de seguro |
| 12 | **Art. 356 CPCCN** | 9 | Carga de negar hechos + desconocer docs |
| 13 | **Art. 1744 CCyC** | 9 | Prueba del daño |
| 14 | **Art. 52 bis LDC** | 8 | Daño punitivo – impugnación |
| 15 | **Art. 1726 CCyC** | 8 | Consecuencias mediatas previsibles |
| 16 | **Art. 478 CPCCN** | 7 | Desinterés en pericia contable |
| 17 | **Ley 25.561** (Emergencia) | 14 | Inconstitucionalidad – prohibición de indexación |
| 18 | **Ley 24.283** (Desindexación) | 12 | Valor real no puede exceder valor actual |
| 19 | **Art. 50 Ley Tránsito** | 6 | Pleno dominio del vehículo |
| 20 | **Art. 1739 CCyC** | 5 | Requisitos del daño resarcible |

### Fallos CSJN más citados:

| Fallo | Menciones | Uso |
|-------|-----------|-----|
| **Buffoni** (Fallos 337:329) | 18+ | Oponibilidad de límite de cobertura |
| **Flores c/ Gimenez** (CSJ 678/2013) | 14+ | Naturaleza contractual de obligación aseguradora |
| **Álvarez c/ Moscatelli** (14/12/2023) | 12+ | Ratificación doctrina de límite |
| **Martínez de Costa c/ Vallejos** (CSJ 1319/2008) | 10+ | LDC no modifica ley especial |
| **Obarrio c/ Microómnibus Norte** | 8+ | Oponibilidad cláusulas contractuales |
| **Aimar c/ Molina** (24/04/2018) | 8+ | Ratificación |
| **Samudio c/ Transportes 270** (Plenario) | 10+ | Tasa de interés |

---

## 9. OBSERVACIONES ADICIONALES PARA CALIBRACIÓN DE JESS

### 9.1 Patrones de negativas según tipo de caso

**Accidentes de tránsito con solo daños materiales** (~30-40 negativas):
- Mecánica del accidente (10-15 negativas)
- Responsabilidad/factor de atribución (5-8 negativas)
- Cada rubro reclamado (3-5 negativas por rubro)
- Documental/prueba (3-5 negativas)
- Cierre genérico: "Niego cada uno de los hechos y derechos invocados por la contraparte que no sean objeto de expreso reconocimiento en esta contestación"

**Accidentes con lesiones** (~40-54 negativas):
- Todo lo anterior + 
- Cada lesión alegada (5-10 negativas adicionales)
- Incapacidad pretendida
- Tratamientos médicos
- Gastos médicos y farmacéuticos

### 9.2 Estructura de cada negativa particular

Patrón: `[Nro]. Niego que [sujeto] [verbo en subjuntivo] [complemento específico del caso]`

Ejemplos canónicos:
- "Niego que el siniestro objeto de autos haya ocurrido tal como lo relata el actor."
- "Niego la existencia de un nexo de causalidad adecuado entre la conducta de mi asegurado y el resultado dañoso alegado."
- "Niego la procedencia y el quantum del rubro [RUBRO] por la suma de $[MONTO]."
- "Niego la autenticidad, validez y contenido del presupuesto del taller '[NOMBRE]' por la suma de $[MONTO]."
- "Niego que los valores consignados en dicho presupuesto se ajusten a los precios de mercado para repuestos y mano de obra."

### 9.3 Señales de contexto que Jess debe detectar

| Si la demanda menciona... | Jess debe incluir... |
|--------------------------|---------------------|
| Motocicleta | Falta de uso de casco, velocidad, circulación por vereda |
| Presupuesto de taller | Desconocimiento del presupuesto + pericia mecánica |
| Daño moral | Impugnación con jurisprudencia de criterio restrictivo |
| Daño punitivo | Impugnación extensa + inconstitucionalidad art. 52 bis |
| Intereses tasa activa | Bloque Samudio completo |
| Ley consumidor | Bloque de inaplicabilidad + Ley 20.091 |
| Repetición ART | Contesta ILP + contable sobre ART + excepción defecto legal |
| Pago previo/acuerdo | Excepción de pago/transacción + mora no configurada |
| Inconstitucionalidad | Contesta inconstitucionalidad (leyes emergencia, art. 730) |
| Capitalización de intereses | Negar procedencia del anatocismo |

### 9.4 Documental que siempre se adjunta

1. Copia de poder general
2. Copia de póliza emitida
3. Copia de denuncia de siniestro
4. (Opcional) Comprobante de pago si hubo pago previo
5. (Opcional) Acuerdo suscripto si hubo acuerdo

### 9.5 Terminología fija

| Término interno | Cómo se refiere en escritos |
|----------------|---------------------------|
| Libra | "LIBRA COMPAÑÍA ARGENTINA DE SEGUROS S.A." / "mi mandante" / "mi representada" |
| Asegurado | "mi asegurado" / "el asegurado" / "el demandado" |
| Actor | "la actora" / "el actor" / "la accionante" / "la parte actora" |
| Póliza | "póliza de seguro automotor N° [NRO]" |
| Siniestro | "siniestro N° [NRO]" / "el hecho de autos" / "el evento dañoso" |
| Cobertura | "en la medida del seguro" / "hasta el límite de cobertura contratado" |

---

## 10. RESUMEN EJECUTIVO PARA CALIBRACIÓN

### Lo que NUNCA puede faltar:
1. Encabezado con datos letrada + expediente
2. Personería
3. Objeto
4. Negativas generales + particulares (numeradas)
5. Prueba documental (poder + póliza + denuncia)
6. Reserva del caso federal
7. Autoriza
8. Petitorio
9. "SERÁ JUSTICIA"

### Lo que debe incluirse en citación en garantía:
- Asume cobertura + cláusula CG-RC 01.1
- Reserva de exclusión
- Límite de cobertura (bloque doctrinal completo con CSJN)
- Defensa en juicio del asegurado

### Lo que debe incluirse cuando hay rubros impugnables:
- Impugnación rubro por rubro con doctrina específica
- Impugnación de liquidación
- Bloque del daño (Bustamante Alsina + carga de la prueba)

### Lo que se incluye condicionalmente:
- Culpa víctima (si hay indicios)
- Falta de casco (si hay moto)
- Contesta intereses Samudio (si piden tasa activa)
- Art. 730 tope costas (frecuente)
- Inaplicabilidad LDC (si la invocan)
- Inconstitucionalidad daño punitivo (si lo piden)
- Excepción de pago/transacción (si hubo pago previo)
