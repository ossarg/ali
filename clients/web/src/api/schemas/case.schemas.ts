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
