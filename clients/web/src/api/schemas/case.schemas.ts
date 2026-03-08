import { z } from 'zod';

// Backend enums
export const CaseStageSchema = z.enum([
  'ingesta',
  'extraccion',
  'triage',
  'asignado',
  'borrador',
  'completado',
]);

export const CaseStatusSchema = z.enum(['open', 'closed', 'suspended']);
export const CaseTypeSchema   = z.enum(['lawsuit', 'mediation', 'third_party']);

export const FirmSummarySchema = z.object({
  id:   z.string().uuid(),
  name: z.string(),
  type: z.string(),
});

export const UserSummarySchema = z.object({
  id:         z.string().uuid(),
  email:      z.string(),
  first_name: z.string(),
  last_name:  z.string(),
});

export const CaseSchema = z.object({
  id:               z.string().uuid(),
  claim_number:     z.string().optional(),
  case_number:      z.string().optional(),
  title:            z.string(),
  policy:           z.string().optional(),
  case_type:        CaseTypeSchema,
  action_type:      z.string().nullable().optional(),
  court:            z.string().optional(),
  tribunal:         z.string().optional(),
  defense_firm:     FirmSummarySchema.nullable().optional(),
  plaintiff_firm:   FirmSummarySchema.nullable().optional(),
  assigned_user:    UserSummarySchema.nullable().optional(),
  status:           CaseStatusSchema,
  estimated_amount: z.number().nullable().optional(),
  incident_date:    z.string().nullable().optional(),
  opened_at:        z.string().nullable().optional(),
  pipeline_stage:   CaseStageSchema,
  created_at:       z.string(),
  updated_at:       z.string(),
});

export const CaseListResponseSchema = z.object({
  data:  z.array(CaseSchema),
  total: z.number(),
  page:  z.number().optional(),
  limit: z.number().optional(),
});

export type CaseStage      = z.infer<typeof CaseStageSchema>;
export type CaseStatus     = z.infer<typeof CaseStatusSchema>;
export type CaseType       = z.infer<typeof CaseTypeSchema>;
export type FirmSummary    = z.infer<typeof FirmSummarySchema>;
export type UserSummary    = z.infer<typeof UserSummarySchema>;
export type Case           = z.infer<typeof CaseSchema>;
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
  'gestion',
]);

export const ResolutionStatusSchema = z.enum(['pending', 'resolved', 'unresolved']);

export const CaseEventSchema = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid().nullable().optional(),
  mail_id: z.string(),
  mail_provider: z.string().optional(),
  subject: z.string().optional(),
  mail_type: z.string(),
  confidence: z.number(),
  reasoning: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
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
  reviewed_by_name: z.string().optional(),
  review_comment: z.string().optional(),
  resolution_status: z.string().optional(),
  resolution_error: z.string().optional(),
  resolved_claim_id: z.string().optional(),
  corrected_claim_number: z.string().optional(),
  correction_comment: z.string().optional(),
});

export const PaginatedCaseEventsSchema = z.object({
  data:  CaseEventSchema.array(),
  total: z.number(),
  page:  z.number(),
  limit: z.number(),
});
export type PaginatedCaseEvents = z.infer<typeof PaginatedCaseEventsSchema>;

export const CaseEventMetricsSchema = z.object({
  total: z.number(),
  approved: z.number(),
  pending: z.number(),
  processed: z.number(),
  last_event_at: z.string().nullable().optional(),
});

export const ReviewCaseEventRequestSchema = z.object({
  claim_number:    z.string().min(1),                       // required — SISE lookup needs it
  mail_type:       z.number().int().min(1).max(8).optional(),
  review_comment:  z.string().optional(),
  raw_policy:      z.string().optional(),
  raw_case_number: z.string().optional(),
  raw_caratula:    z.string().optional(),
});

export const RetryResolutionRequestSchema = z.object({
  corrected_claim_number: z.string().min(1),
  correction_comment: z.string().optional(),
});

export type RetryResolutionRequest = z.infer<typeof RetryResolutionRequestSchema>;

export type MailType = z.infer<typeof MailTypeSchema>;
export type CaseEvent = z.infer<typeof CaseEventSchema>;
export type CaseEventMetrics = z.infer<typeof CaseEventMetricsSchema>;
export type ReviewCaseEventRequest = z.infer<typeof ReviewCaseEventRequestSchema>;

export const UpdateCaseEventRequestSchema = z.object({
  mail_type:   z.number().int().min(1).max(11).optional(),
  title:       z.string().optional(),
  description: z.string().optional(),
  body_clean:  z.string().optional(),
  received_at: z.string().optional(),
});
export type UpdateCaseEventRequest = z.infer<typeof UpdateCaseEventRequestSchema>;
