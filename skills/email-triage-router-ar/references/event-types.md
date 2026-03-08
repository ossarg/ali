# Event Types — Detailed Reference

This file contains the full definition of each event type, with typical patterns,
keywords, edge cases, and disambiguation guidance.

## 1. `sentencia` — Informe de sentencia

A court has issued a judgment in a case where Libra is involved (as direct defendant
or as insurer cited in guarantee).

**Typical patterns:**
- Law firm reports the outcome of a trial or motion
- Email says "se dictó sentencia" or "resolución de fecha..."
- May include whether the judgment is favorable or unfavorable
- Often includes the amount awarded, if any
- May mention appeal deadlines

**Keywords:** sentencia, fallo, resolución, primera instancia, cámara, apelación,
condena, absuelve, hace lugar, rechaza la demanda, costas, regulación de honorarios
(when tied to a judgment)

**Edge cases:**
- A "resolución" that isn't a final judgment (e.g., an interlocutory order) is more
  likely `oficio`. Reserve `sentencia` for decisions that resolve the case or a
  substantial portion of it.
- If the email only mentions the existence of a sentencia but the main action item is
  a payment request, classify as `reclamo_pago` — the sentencia is context, not the event.

---

## 2. `reclamo_pago` — Reclamo de pago

The law firm is requesting that Libra make a payment. This could be attorney fees,
a settlement amount, a judgment amount, or expenses.

**Typical patterns:**
- "Solicitamos el pago de..."
- "Adjuntamos factura/minuta por honorarios"
- "Procedemos a intimar el pago de..."
- Invoice or payment request attached
- References to "minuta de pago", "liquidación de honorarios"

**Keywords:** pago, honorarios, minuta, factura, transferencia, CBU, liquidación,
intimamos al pago, regulación de honorarios (when the focus is payment), depósito
judicial

**Edge cases:**
- A "regulación de honorarios" in the context of a sentencia is `sentencia` if the
  email is primarily reporting the judgment. It's `reclamo_pago` if the firm is
  specifically asking Libra to pay the regulated amount.
- A payment request tied to an acuerdo ("necesitamos que depositen para cerrar el
  acuerdo") is `reclamo_pago`, not `acuerdo` — the agreement is already in place,
  the action item is the payment.

---

## 3. `intimacion` — Aviso de intimaciones

A formal legal warning or deadline notice directed at Libra or its insured.

**Typical patterns:**
- Carta documento (certified letter) received or sent
- Judicial intimation with a deadline to act
- "Se intimó a..." with a specific action and deadline
- Threat of further legal action if not complied with

**Keywords:** intimación, intima, carta documento, plazo, apercibimiento, bajo
apercibimiento de, emplazamiento, requerimiento, 5 días, 10 días, perentorio,
improrrogable

**Edge cases:**
- An intimación to pay is still `intimacion`, not `reclamo_pago` — the key distinction
  is the formal/judicial nature and the deadline with consequences. A reclamo_pago is a
  request; an intimación is a demand with legal teeth.
- A judicial intimation as part of normal procedural flow (e.g., "se intima a contestar
  demanda") that comes within a broader case update may be `oficio` if the email is
  primarily about the court communication. It's `intimacion` if the deadline is the
  headline.

---

## 4. `acuerdo` — Aviso de acuerdo

A settlement or agreement has been reached, proposed, or is being negotiated.

**Typical patterns:**
- "Se llegó a un acuerdo" or "proponemos acordar en..."
- Terms of a proposed settlement
- Mediation result with agreement
- Request for Libra's approval of settlement terms

**Keywords:** acuerdo, convenio, transacción, mediación exitosa, conciliación,
homologación, desistimiento, propuesta de arreglo, arreglo, monto acordado

**Edge cases:**
- A failed mediation ("mediación fracasada") is not `acuerdo` — it's likely `oficio`
  or context within a broader case update. `acuerdo` requires an actual or proposed
  agreement.
- If the email proposes settlement terms AND requests payment, classify as `acuerdo`
  if the proposal is the news. If the agreement was already reached and now they're
  asking for the money, it's `reclamo_pago`.
- A "principio de acuerdo" pendiente de homologación is `acuerdo`, even if the email
  also solicita un depósito para perfeccionar el acuerdo. La noticia principal es que
  se llegó a un acuerdo — el pedido de depósito es consecuencia directa del acuerdo,
  no un reclamo de pago independiente. Solo es `reclamo_pago` cuando el acuerdo ya
  fue homologado y firme, y el estudio reclama el pago como gestión separada.

---

## 5. `embargo` — Notificación de embargo

A court has ordered or executed an asset seizure (embargo) against Libra or its insured.

**Typical patterns:**
- "Se trabó embargo sobre..."
- Notification that bank accounts, property, or assets have been frozen
- Court order directing an embargo
- Third party notification of embargo on Libra's assets

**Keywords:** embargo, traba de embargo, inhibición general de bienes, oficio de
embargo, embargo preventivo, embargo ejecutivo, levantamiento de embargo, anotación
de litis, medida cautelar

**Edge cases:**
- A request to lift an embargo ("levantamiento de embargo") is still classified as
  `embargo` — it's the same workflow.
- A "medida cautelar" that isn't specifically an embargo (e.g., prohibición de innovar)
  should still be `embargo` — we're using this type broadly for all asset-affecting
  judicial measures.
- An oficio bancario directing a bank to freeze funds is `embargo`, not `oficio`,
  because the action is the embargo.

---

## 6. `pericia` — Pericias

Expert witness activity — either a report has been submitted or an expert needs to be
appointed, or there's a scheduling matter related to expert proceedings.

**Typical patterns:**
- "Se presentó la pericia médica/mecánica/contable"
- Request to designate a perito (expert)
- Expert report with findings and conclusions
- Scheduling of pericial examination or inspection

**Keywords:** pericia, perito, peritaje, informe pericial, puntos de pericia,
dictamen pericial, impugnación de pericia, observaciones a la pericia, designación
de perito, sorteo de perito, pericia médica, pericia mecánica, pericia contable,
pericia psicológica, pericia accidentológica

**Edge cases:**
- An email that mentions pericial results within a broader sentencia report should be
  classified as `sentencia` — the judgment is the main event.
- A request for Libra to submit puntos de pericia (questions for the expert) is
  `pericia` even though it's procedural.

---

## 7. `oficio` — Oficios

Court orders, official communications, or procedural notifications that don't fit
neatly into the other six categories.

**Typical patterns:**
- Court sends an official communication (oficio) requesting information or action
- Procedural notifications (dates, deadlines, scheduling)
- Transfer of case to another court
- Notifications from regulatory bodies
- General case status updates from law firms

**Keywords:** oficio, cédula de notificación, traslado, auto, providencia, despacho,
vista, audiencia, sorteo, remisión, elevación, radicación, intervención, competencia

**Edge cases:**
- `oficio` is the catch-all for court communications that aren't captured by the other
  six types. When in doubt between `oficio` and another type, prefer the more specific
  type.
- A "cédula de notificación" is `oficio` unless the content being notified is itself
  one of the other types (e.g., a cédula notifying a sentencia → `sentencia`).

---

## Disambiguation cheat sheet

| If the email mentions... | ...and the main action is... | Classify as |
|--------------------------|------------------------------|-------------|
| Sentencia + honorarios | Reporting the judgment | `sentencia` |
| Sentencia + honorarios | Requesting payment of fees | `reclamo_pago` |
| Acuerdo + pago | Proposing settlement terms | `acuerdo` |
| Acuerdo + pago | Principio de acuerdo + depósito para perfeccionar | `acuerdo` |
| Acuerdo + pago | Acuerdo homologado y firme + reclamo de pago separado | `reclamo_pago` |
| Embargo + oficio | Court ordering the embargo | `embargo` |
| Intimación + pago | Formal demand with deadline | `intimacion` |
| Pericia + sentencia | Judgment citing expert report | `sentencia` |
| Oficio + embargo | Court communication = embargo order | `embargo` |
| General update + varios temas | No single dominant event | Escalate to human review |
