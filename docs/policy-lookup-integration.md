# Policy Lookup Integration — Spec

**Estado:** Pendiente de definición con Juan Mazzochi
**Skill relacionado:** `skills/extraction-policy-lookup-ar/SKILL.md`
**Agente:** Mike (Extraction Agent)

---

## Contexto

Mike necesita acceder a la póliza del asegurado para pasarla a `extraction-policy-summary-ar`. En la mayoría de los casos, la demanda no adjunta la póliza — solo menciona datos del asegurado o del vehículo. Este skill recupera el documento desde los sistemas internos de Libra.

## Preguntas a definir con Juan

1. **¿Qué sistema tiene las pólizas?**
   - ¿Sistema de gestión de pólizas propio? ¿Nombre del sistema?
   - ¿Tiene API? ¿O acceso directo a DB?

2. **¿Qué devuelve el sistema?**
   - ¿El documento de póliza completo (PDF)?
   - ¿Datos estructurados (JSON) con coberturas, exclusiones, suma asegurada?
   - ¿Ambos?

3. **¿Cómo se autentica?**
   - API key, OAuth, usuario/contraseña, certificado

4. **¿Cuáles son los campos de búsqueda disponibles?**
   - Número de póliza (¿cuál es el formato? ej: 7 dígitos, con guiones)
   - Dominio del vehículo
   - CUIT/DNI del asegurado o tomador

5. **¿Hay ambiente de staging/test?**

6. **¿Qué pasa si hay múltiples resultados?**
   - Ejemplo: mismo tomador con 2 pólizas activas. ¿Filtrar por fecha de siniestro?

## Impacto en el pipeline

Mientras este spec no esté definido, el pipeline opera sin `extraction-policy-summary-ar`:
- `policy_summary = null` en el output de Mike
- Edu trabaja sin datos de póliza (dictamen de cobertura marcado como INDETERMINADO si es necesario)
- Jess no completa las secciones que requieren póliza (secciones marcadas con `[COMPLETAR — ABOGADO]`)
