import { z } from 'zod';

// Enums — match backend models exactly
export const PipelineStageSchema = z.enum([
  'ingesta',
  'extraccion',
  'triage',
  'asignado',
  'borrador',
  'completado',
]);

export const CaseTypeSchema = z.enum(['lawsuit', 'mediation', 'third_party']);
export const ActionTypeSchema = z.enum(['direct_claim', 'guarantee_citation']);
export const CaseStatusSchema = z.enum(['open', 'closed', 'suspended']);

export const FirmSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
});

export const UserSummarySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
});

export const CaseSchema = z.object({
  id: z.string().uuid(),
  claim_number: z.string().optional(),
  case_number: z.string().optional(),
  title: z.string(),
  policy: z.string().optional(),
  case_type: CaseTypeSchema,
  action_type: ActionTypeSchema.optional(),
  court: z.string().optional(),
  tribunal: z.string().optional(),
  defense_firm: FirmSummarySchema.nullable().optional(),
  plaintiff_firm: FirmSummarySchema.nullable().optional(),
  assigned_user: UserSummarySchema.nullable().optional(),
  status: CaseStatusSchema,
  estimated_amount: z.number().nullable().optional(),
  incident_date: z.string().nullable().optional(),
  opened_at: z.string().nullable().optional(),
  pipeline_stage: PipelineStageSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const CaseListResponseSchema = z.array(CaseSchema);

export type PipelineStage = z.infer<typeof PipelineStageSchema>;
export type Case = z.infer<typeof CaseSchema>;
export type CaseListResponse = z.infer<typeof CaseListResponseSchema>;
export type FirmSummary = z.infer<typeof FirmSummarySchema>;
export type UserSummary = z.infer<typeof UserSummarySchema>;
