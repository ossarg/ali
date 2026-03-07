import { z } from 'zod';

// Backend enums (English, stored as SMALLINT, returned as string)
export const CaseStageSchema = z.enum([
  'intake',
  'triage',
  'review',
  'closed',
]);

export const CaseRelevanceSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const CaseSchema = z.object({
  id: z.number(),
  nro_siniestro: z.string().nullable().optional(),
  caratula: z.string(),
  monto_estimado: z.number().nullable().optional(),
  triage_relevancia: CaseRelevanceSchema.nullable().optional(),
  pipeline_stage: CaseStageSchema.nullable().optional(),
  pipeline_updated_at: z.string().nullable().optional(),
  estudio_id: z.number().nullable().optional(),
  tipo_accion: z.string().nullable().optional(),
});

export const CaseListResponseSchema = z.object({
  data: z.array(CaseSchema),
  total: z.number(),
});

export type CaseStage = z.infer<typeof CaseStageSchema>;
export type Case = z.infer<typeof CaseSchema>;
export type CaseListResponse = z.infer<typeof CaseListResponseSchema>;

// Case Events
export const MailTypeSchema = z.enum([
  'sentencia',
  'reclamo_pago',
  'intimacion',
  'acuerdo',
  'embargo',
  'pericia',
  'oficio',
]);

export const CaseEventSchema = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid().nullable().optional(),
  mail_id: z.string(),
  mail_provider: z.string().optional(),
  subject: z.string().optional(),
  mail_type: z.string(),
  confidence: z.number(),
  reasoning: z.string().optional(),
  raw_claim_number: z.string().optional(),
  raw_policy: z.string().optional(),
  raw_case_number: z.string().optional(),
  raw_caratula: z.string().optional(),
  processed: z.boolean(),
  received_at: z.string(),
  created_at: z.string(),
  approved: z.boolean().nullable().optional(),
  original_mail_type: z.string().nullable().optional(),
  reviewed_by: z.string().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
  review_comment: z.string().optional(),
});

export const CaseEventMetricsSchema = z.object({
  total: z.number(),
  approved: z.number(),
  pending: z.number(),
  processed: z.number(),
  last_event_at: z.string().nullable().optional(),
});

export const ReviewCaseEventRequestSchema = z.object({
  mail_type: z.number().int().min(1).max(7).optional(),
  review_comment: z.string().optional(),
});

export type MailType = z.infer<typeof MailTypeSchema>;
export type CaseEvent = z.infer<typeof CaseEventSchema>;
export type CaseEventMetrics = z.infer<typeof CaseEventMetricsSchema>;
export type ReviewCaseEventRequest = z.infer<typeof ReviewCaseEventRequestSchema>;
