import { z } from 'zod';

export const ClaimSchema = z.object({
  id: z.string().uuid(),
  sise_claim_id: z.number(),
  sise_id_pv: z.number(),
  claim_number: z.number(),
  claim_subnumber: z.number(),
  policy_number: z.number(),
  policy_endorsement: z.number(),
  ramo_code: z.number(),
  incident_date: z.string(),
  registration_date: z.string(),
  notice_date: z.string(),
  payment_date: z.string().nullable().optional(),
  cause: z.string(),
  coverage: z.string(),
  status: z.string(),
  estimated_amount: z.number(),
  paid_amount: z.number(),
  contratante: z.string(),
  doc_type: z.string(),
  doc_number: z.string(),
  policy_type: z.string(),
  insured_amount: z.number(),
  policy_valid_from: z.string(),
  policy_valid_to: z.string(),
  commercial_product_code: z.number(),
  commercial_product: z.string(),
  producer_code: z.number(),
  producer_type_code: z.number(),
  producer_group_code: z.number(),
  producer_status: z.string(),
  producer_name: z.string(),
  producer_type: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// SISE raw DTOs for lookup response
export const SISEClaimSchema = z.object({
  id_stro: z.number(),
  id_pv: z.number(),
  nro_siniestro: z.number(),
  nro_subreclamo: z.number(),
  nro_poliza: z.number(),
  nro_endoso: z.number(),
  codigo_ramo: z.number(),
  fecha_resgistro: z.string(),
  fecha_aviso: z.string(),
  fecha_incurrido: z.string(),
  fecha_pago: z.string().nullable().optional(),
  contratante_pagador: z.string(),
  titular: z.string(),
  paciente: z.string(),
  parentesco: z.string().nullable().optional(),
  importe_estimado: z.number(),
  importe_pago: z.number(),
  diagnostico: z.string(),
  causa: z.string(),
  cobertura: z.string(),
  estado: z.string(),
  tomador_tipo_doc: z.string(),
  tomador_doc: z.string(),
});

export const SISEPolicySchema = z.object({
  Sucursal: z.string(),
  Ramo: z.string(),
  Numero_Poliza: z.number(),
  Tipo_de_Poliza: z.string(),
  Suma_Asegurada: z.number(),
  Prima: z.number(),
  Premio: z.number(),
  Vigencia_Desde: z.string(),
  Vigencia_Hasta: z.string(),
  Contratante: z.string(),
  Tipo_Documento: z.string(),
  Numero_Documento: z.string(),
  cod_producto_com: z.number(),
  Producto_comercial: z.string(),
  Estado: z.string(),
  cantidad_siniestros: z.number(),
}).passthrough();

export const SISEProducerSchema = z.object({
  cod_agente: z.number(),
  nombre: z.string(),
  tipo_agente: z.string(),
  cod_estado: z.string(),
}).passthrough();

export const ClaimLookupResponseSchema = z.object({
  claim:    SISEClaimSchema,
  policy:   SISEPolicySchema.nullable().optional(),
  producer: SISEProducerSchema.nullable().optional(),
});

export type Claim = z.infer<typeof ClaimSchema>;
export type ClaimLookupResponse = z.infer<typeof ClaimLookupResponseSchema>;
export type SISEClaim = z.infer<typeof SISEClaimSchema>;
export type SISEPolicy = z.infer<typeof SISEPolicySchema>;
export type SISEProducer = z.infer<typeof SISEProducerSchema>;
