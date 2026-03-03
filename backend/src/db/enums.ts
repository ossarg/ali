// Enums centrales — estados como SMALLINT en DB
export const Relevancia = { Baja: 1, Media: 2, Alta: 3 } as const
export type RelevanciaValue = typeof Relevancia[keyof typeof Relevancia]

export const RelevanciaLabel: Record<number, string> = {
  1: 'Baja',
  2: 'Media',
  3: 'Alta'
}

export const PipelineStage = {
  Ingesta: 'ingesta',
  Extraccion: 'extraccion',
  Triage: 'triage',
  Fichero: 'fichero',
  Borrador: 'borrador',
  Completado: 'completado'
} as const
