import { z } from 'zod';

// 1=mediacion, 2=juicio
export const AgreementTypeSchema = z.union([z.literal(1), z.literal(2), z.literal(0)]);

// 1=pending, 2=completed, 3=failed
export const ExtractionStatusSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const AgreementStatusSchema = z.enum(['vigente', 'proximo', 'vencido', 'sin_fecha']);

export const AgreementSchema = z.object({
  id:                      z.string().uuid(),
  case_event_id:           z.string().uuid(),
  case_id:                 z.string().uuid().nullable(),
  agreement_type:          AgreementTypeSchema,
  agreement_type_label:    z.string(),
  claim_number:            z.string(),
  producer:                z.string(),
  beneficiary:             z.string(),
  concept:                 z.string(),
  invoice_number:          z.string(),
  amount:                  z.number().nullable(),
  due_date:                z.string().nullable(),    // ISO date string from backend
  status:                  AgreementStatusSchema,
  extraction_status:       ExtractionStatusSchema,
  extraction_status_label: z.string(),
  created_at:              z.string(),
});

export const AgreementListResponseSchema = z.object({
  data:  AgreementSchema.array(),
  total: z.number(),
});

export const CreateAgreementRequestSchema = z.object({
  case_event_id:  z.string().uuid(),
  agreement_type: AgreementTypeSchema.optional(),
  claim_number:   z.string().optional(),
  producer:       z.string().optional(),
  beneficiary:    z.string().optional(),
  concept:        z.string().optional(),
  invoice_number: z.string().optional(),
  amount:         z.number().optional(),
  due_date:       z.string().optional(),
});

export const UpdateAgreementRequestSchema = z.object({
  agreement_type: AgreementTypeSchema.optional(),
  claim_number:   z.string().optional(),
  producer:       z.string().optional(),
  beneficiary:    z.string().optional(),
  concept:        z.string().optional(),
  invoice_number: z.string().optional(),
  amount:         z.number().nullable().optional(),
  due_date:       z.string().nullable().optional(),
});

export type Agreement             = z.infer<typeof AgreementSchema>;
export type AgreementListResponse = z.infer<typeof AgreementListResponseSchema>;
export type CreateAgreementRequest = z.infer<typeof CreateAgreementRequestSchema>;
export type UpdateAgreementRequest = z.infer<typeof UpdateAgreementRequestSchema>;
