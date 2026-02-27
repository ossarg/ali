export type Priority = 'Alta' | 'Media' | 'Baja';
export type Stage = 'Ingesta' | 'Extracción' | 'Triage' | 'Fichero' | 'Borrador' | 'Revisión Humana' | 'Completado';
export type AgentStatus = 'Activo' | 'En espera' | 'Error';
export type Workload = 'Liviana' | 'Normal' | 'Alta';

export interface Lawyer {
  id: string;
  name: string;
  specialty: string;
  seniority: 'Junior' | 'Semi-senior' | 'Senior';
  activeCases: number;
  workload: Workload;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  currentCaseId?: string;
  metrics: {
    processedToday: number;
    avgTime: string;
    successRate: string;
  };
  recentActivity: {
    id: string;
    timestamp: string;
    caseId: string;
    caseName: string;
    result: 'Éxito' | 'Error' | 'Requiere revisión';
    duration: string;
  }[];
  queue: { caseId: string; caseName: string; priority: Priority }[];
}

export interface Case {
  id: string;
  title: string;
  plaintiff: string;
  jurisdiction: string;
  court: string;
  amount: number;
  priority: Priority;
  stage: Stage;
  lawyerId?: string;
  deadline: string;
  lastActivity: string;
  dataExtraction: {
    fields: Record<string, { value: string; confidence: 'Alta' | 'Media' | 'Baja' }>;
    summary: string;
  };
  documents: { id: string; name: string; type: string; url: string }[];
  draft?: {
    content: string;
    requiresReview: boolean;
  };
  timeline: {
    id: string;
    timestamp: string;
    agent: string;
    action: string;
    result: string;
    details?: string;
  }[];
  assignment: {
    suggestedLawyerId?: string;
    reason?: string;
    status: 'Pendiente' | 'Aprobada' | 'Modificada';
  };
}

export interface InboxItem {
  id: string;
  caseId: string;
  caseName: string;
  agent: string;
  actionRequired: string;
  urgency: 'Alta' | 'Media' | 'Baja';
  timestamp: string;
}

export const MOCK_LAWYERS: Lawyer[] = [
  { id: 'l1', name: 'Dra. Valentina Herrera', specialty: 'Accidentes vehiculares, Responsabilidad civil', seniority: 'Senior', activeCases: 12, workload: 'Alta' },
  { id: 'l2', name: 'Dr. Martín Aguirre', specialty: 'Seguros patrimoniales, Incendio', seniority: 'Semi-senior', activeCases: 8, workload: 'Normal' },
  { id: 'l3', name: 'Dra. Camila Ruiz', specialty: 'Mala praxis, Daños personales', seniority: 'Senior', activeCases: 5, workload: 'Liviana' },
  { id: 'l4', name: 'Dr. Federico López', specialty: 'Cobro de seguros, Contractual', seniority: 'Junior', activeCases: 15, workload: 'Alta' },
  { id: 'l5', name: 'Dra. Sofía Peralta', specialty: 'Daño ambiental, Responsabilidad civil', seniority: 'Semi-senior', activeCases: 7, workload: 'Normal' },
  { id: 'l6', name: 'Dr. Nicolás Vega', specialty: 'Accidentes vehiculares, Robo de vehículo', seniority: 'Junior', activeCases: 4, workload: 'Liviana' },
];

export const MOCK_CASES: Case[] = [
  {
    id: 'CAS-2024-001',
    title: 'García, María c/ Libra Seguros S.A. s/ daños y perjuicios',
    plaintiff: 'María García',
    jurisdiction: 'CABA',
    court: 'Juzgado Nacional en lo Civil N° 42',
    amount: 15000000,
    priority: 'Alta',
    stage: 'Revisión Humana',
    lawyerId: 'l1',
    deadline: '2024-05-15T23:59:59Z',
    lastActivity: '2024-05-10T10:30:00Z',
    dataExtraction: {
      fields: {
        'Demandante': { value: 'María García', confidence: 'Alta' },
        'Demandado': { value: 'Libra Seguros S.A.', confidence: 'Alta' },
        'Jurisdicción': { value: 'CABA', confidence: 'Alta' },
        'Tribunal': { value: 'Juzgado Nacional en lo Civil N° 42', confidence: 'Alta' },
        'Monto Reclamado': { value: 'ARS 15.000.000', confidence: 'Alta' },
        'Póliza': { value: 'POL-2024-00123', confidence: 'Alta' },
        'Tipo de Siniestro': { value: 'Accidente vehicular', confidence: 'Alta' },
        'Plazo Contestación': { value: '15/05/2024', confidence: 'Media' },
      },
      summary: 'Demanda por daños y perjuicios derivada de accidente de tránsito ocurrido el 10/01/2024. Reclama incapacidad sobreviniente y daño moral. Monto elevado, requiere atención prioritaria por vencimiento inminente.',
    },
    documents: [
      { id: 'd1', name: 'Demanda_Garcia.pdf', type: 'PDF', url: '#' },
      { id: 'd2', name: 'Ficha_Datos_CAS-2024-001.pdf', type: 'PDF', url: '#' },
      { id: 'd3', name: 'Poliza_POL-2024-00123.pdf', type: 'PDF', url: '#' },
    ],
    draft: {
      requiresReview: true,
      content: `
# CONTESTA DEMANDA - OPONE DEFENSAS

**SEÑOR JUEZ:**

[COMPLETAR: Nombre del abogado apoderado], abogado, inscripto al T° [X] F° [Y] del CPACF, constituyendo domicilio electrónico en el CUIT [COMPLETAR], en representación de **LIBRA SEGUROS S.A.**, con domicilio constituido en [COMPLETAR], en los autos caratulados **"García, María c/ Libra Seguros S.A. s/ daños y perjuicios"** (Expte. N° [COMPLETAR]), a V.S. respetuosamente me presento y digo:

## I. OBJETO
Que en tiempo y forma hábil vengo a contestar la demanda instaurada contra mi mandante, solicitando desde ya su íntegro rechazo, con expresa imposición de costas a la actora.

## II. NEGATIVAS GENERALES Y PARTICULARES
Niego todos y cada uno de los hechos expuestos en el escrito de demanda que no sean objeto de expreso reconocimiento en la presente.
En particular, niego:
- Que el siniestro haya ocurrido en las circunstancias de tiempo, modo y lugar relatadas por la actora.
- Que mi mandante deba responder por los rubros indemnizatorios reclamados.
- Que los montos reclamados se ajusten a la realidad y/o a los baremos aplicables.

<div class="bg-yellow-100 p-4 rounded-md border border-yellow-300 my-4">
  <div class="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    REQUIERE REVISIÓN HUMANA
  </div>
  [COMPLETAR: argumentación específica sobre la mecánica del siniestro según denuncia administrativa del asegurado. Contrastar versión de la actora con declaración del asegurado.]
</div>

## III. LÍMITE DE COBERTURA
Mi mandante opone como defensa de fondo el límite de cobertura establecido en la póliza N° POL-2024-00123, conforme lo dispuesto por el art. 118 de la Ley de Seguros 17.418. La responsabilidad de la aseguradora se limita estrictamente a los términos, condiciones y sumas aseguradas estipuladas en el contrato.

<div class="bg-yellow-100 p-4 rounded-md border border-yellow-300 my-4">
  <div class="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    REQUIERE REVISIÓN HUMANA
  </div>
  [COMPLETAR: prueba a ofrecer: documental, informativa, pericial médica, pericial mecánica, testimonial.]
</div>

## IV. PETITORIO
Por lo expuesto, a V.S. solicito:
1. Me tenga por presentado, por parte y por constituido el domicilio legal y electrónico.
2. Tenga por contestada la demanda en tiempo y forma.
3. Tenga por opuesta la defensa de límite de cobertura.
4. Oportunamente, rechace la demanda en todas sus partes, con costas.

Proveer de conformidad,
SERÁ JUSTICIA.
      `
    },
    timeline: [
      { id: 't1', timestamp: '2024-05-08T09:00:00Z', agent: 'Agente de Ingesta', action: 'Recepción y validación formal', result: 'Éxito', details: 'PDF procesado correctamente. Firmas detectadas.' },
      { id: 't2', timestamp: '2024-05-08T09:05:00Z', agent: 'Agente de Extracción', action: 'Extracción de datos estructurados', result: 'Requiere revisión', details: 'Plazo de contestación extraído con confianza media debido a formato inusual en el texto.' },
      { id: 't3', timestamp: '2024-05-08T09:10:00Z', agent: 'Agente de Triage', action: 'Clasificación de prioridad', result: 'Éxito', details: 'Prioridad ALTA asignada por monto (>10M) y plazo inminente.' },
      { id: 't4', timestamp: '2024-05-08T09:15:00Z', agent: 'Agente de Fichero', action: 'Armado de carpeta digital', result: 'Éxito', details: 'Póliza vinculada exitosamente desde sistema core.' },
      { id: 't5', timestamp: '2024-05-08T09:20:00Z', agent: 'Agente de Borrador', action: 'Generación de borrador', result: 'Éxito', details: 'Borrador generado con 2 secciones pendientes de completamiento humano.' },
    ],
    assignment: {
      suggestedLawyerId: 'l1',
      reason: 'Especialista en accidentes vehiculares con experiencia en CABA. Carga de trabajo actual permite tomar el caso.',
      status: 'Aprobada'
    }
  },
  {
    id: 'CAS-2024-002',
    title: 'Rodríguez, Carlos A. c/ Libra Seguros S.A. s/ cobro de seguro',
    plaintiff: 'Carlos A. Rodríguez',
    jurisdiction: 'Buenos Aires',
    court: 'Juzgado Civil y Comercial N° 7 de La Plata',
    amount: 8500000,
    priority: 'Media',
    stage: 'Borrador',
    deadline: '2024-05-20T23:59:59Z',
    lastActivity: '2024-05-11T14:20:00Z',
    dataExtraction: {
      fields: {
        'Demandante': { value: 'Carlos A. Rodríguez', confidence: 'Alta' },
        'Jurisdicción': { value: 'Buenos Aires', confidence: 'Alta' },
        'Monto Reclamado': { value: 'ARS 8.500.000', confidence: 'Alta' },
        'Tipo de Siniestro': { value: 'Robo/hurto de vehículo', confidence: 'Alta' },
      },
      summary: 'Reclamo por falta de pago de indemnización por robo de motovehículo. Aseguradora había rechazado siniestro por falta de pago de prima.',
    },
    documents: [],
    timeline: [],
    assignment: {
      suggestedLawyerId: 'l4',
      reason: 'Especialista en cobro de seguros.',
      status: 'Pendiente'
    }
  },
  {
    id: 'CAS-2024-003',
    title: 'Martínez, Lucía c/ Libra Seguros S.A. s/ incumplimiento contractual',
    plaintiff: 'Lucía Martínez',
    jurisdiction: 'Córdoba',
    court: 'Cámara de Apelaciones en lo Civil - Sala III',
    amount: 3200000,
    priority: 'Baja',
    stage: 'Extracción',
    deadline: '2024-05-25T23:59:59Z',
    lastActivity: '2024-05-12T08:15:00Z',
    dataExtraction: {
      fields: {
        'Demandante': { value: 'Lucía Martínez', confidence: 'Alta' },
        'Monto Reclamado': { value: 'ARS 3.200.000', confidence: 'Media' },
        'Póliza': { value: 'No identificada', confidence: 'Baja' },
      },
      summary: 'Apelación de sentencia de primera instancia. Reclamo por gastos de reparación no cubiertos.',
    },
    documents: [],
    timeline: [],
    assignment: {
      status: 'Pendiente'
    }
  },
  {
    id: 'CAS-2024-004',
    title: 'López, Juan c/ Libra Seguros S.A. s/ mala praxis médica',
    plaintiff: 'Juan López',
    jurisdiction: 'Mendoza',
    court: 'Juzgado Civil N° 2',
    amount: 45000000,
    priority: 'Alta',
    stage: 'Ingesta',
    deadline: '2024-05-14T23:59:59Z',
    lastActivity: '2024-05-12T10:00:00Z',
    dataExtraction: {
      fields: {},
      summary: '',
    },
    documents: [],
    timeline: [],
    assignment: {
      status: 'Pendiente'
    }
  },
  {
    id: 'CAS-2024-005',
    title: 'Pérez, Ana c/ Libra Seguros S.A. s/ daño ambiental',
    plaintiff: 'Ana Pérez',
    jurisdiction: 'Santa Fe',
    court: 'Juzgado Federal N° 1',
    amount: 85000000,
    priority: 'Alta',
    stage: 'Triage',
    deadline: '2024-05-18T23:59:59Z',
    lastActivity: '2024-05-12T11:30:00Z',
    dataExtraction: {
      fields: {
        'Demandante': { value: 'Ana Pérez', confidence: 'Alta' },
        'Monto Reclamado': { value: 'ARS 85.000.000', confidence: 'Alta' },
        'Tipo de Siniestro': { value: 'Daño ambiental', confidence: 'Alta' },
      },
      summary: 'Demanda colectiva por contaminación de afluente. Monto extraordinario, requiere derivación a estudio externo.',
    },
    documents: [],
    timeline: [],
    assignment: {
      suggestedLawyerId: 'l5',
      reason: 'Especialista en daño ambiental.',
      status: 'Pendiente'
    }
  },
  {
    id: 'CAS-2024-006',
    title: 'Gómez, Roberto c/ Libra Seguros S.A. s/ daños y perjuicios',
    plaintiff: 'Roberto Gómez',
    jurisdiction: 'CABA',
    court: 'Juzgado Nacional en lo Civil N° 15',
    amount: 1200000,
    priority: 'Baja',
    stage: 'Completado',
    lawyerId: 'l6',
    deadline: '2024-05-05T23:59:59Z',
    lastActivity: '2024-05-04T16:45:00Z',
    dataExtraction: {
      fields: {},
      summary: 'Choque simple, daños materiales menores.',
    },
    documents: [],
    timeline: [],
    assignment: {
      suggestedLawyerId: 'l6',
      status: 'Aprobada'
    }
  },
  {
    id: 'CAS-2024-007',
    title: 'Fernández, Silvia c/ Libra Seguros S.A. s/ cobro de seguro',
    plaintiff: 'Silvia Fernández',
    jurisdiction: 'Buenos Aires',
    court: 'Juzgado Civil N° 3 San Isidro',
    amount: 5500000,
    priority: 'Media',
    stage: 'Fichero',
    deadline: '2024-05-22T23:59:59Z',
    lastActivity: '2024-05-12T09:20:00Z',
    dataExtraction: {
      fields: {
        'Demandante': { value: 'Silvia Fernández', confidence: 'Alta' },
        'Monto Reclamado': { value: 'ARS 5.500.000', confidence: 'Alta' },
        'Tipo de Siniestro': { value: 'Incendio', confidence: 'Alta' },
      },
      summary: 'Incendio parcial de vivienda. Disputa sobre infraseguro.',
    },
    documents: [],
    timeline: [],
    assignment: {
      suggestedLawyerId: 'l2',
      status: 'Pendiente'
    }
  }
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'a0',
    name: 'Agente Coordinador',
    description: 'Orquesta el flujo de trabajo, asigna tareas a sub-agentes y sugiere asignación de abogados.',
    status: 'Activo',
    currentCaseId: 'CAS-2024-004',
    metrics: { processedToday: 42, avgTime: '1.2s', successRate: '99.5%' },
    recentActivity: [
      { id: 'ra1', timestamp: '2024-05-12T11:35:00Z', caseId: 'CAS-2024-005', caseName: 'Pérez, Ana c/ Libra...', result: 'Éxito', duration: '0.8s' },
      { id: 'ra2', timestamp: '2024-05-12T11:30:00Z', caseId: 'CAS-2024-004', caseName: 'López, Juan c/ Libra...', result: 'Éxito', duration: '1.1s' },
    ],
    queue: []
  },
  {
    id: 'a1',
    name: 'Agente de Ingesta y Revisión',
    description: 'Recibe PDF, extrae texto y verifica formalidades procesales.',
    status: 'Activo',
    currentCaseId: 'CAS-2024-004',
    metrics: { processedToday: 15, avgTime: '4.5s', successRate: '95.0%' },
    recentActivity: [
      { id: 'ra3', timestamp: '2024-05-12T10:00:00Z', caseId: 'CAS-2024-004', caseName: 'López, Juan c/ Libra...', result: 'Éxito', duration: '5.2s' },
    ],
    queue: []
  },
  {
    id: 'a2',
    name: 'Agente de Extracción de Datos',
    description: 'Produce objeto estructurado a partir del texto de la demanda.',
    status: 'En espera',
    metrics: { processedToday: 14, avgTime: '8.2s', successRate: '88.5%' },
    recentActivity: [
      { id: 'ra4', timestamp: '2024-05-12T08:15:00Z', caseId: 'CAS-2024-003', caseName: 'Martínez, Lucía c/ Libra...', result: 'Requiere revisión', duration: '9.1s' },
    ],
    queue: [
      { caseId: 'CAS-2024-004', caseName: 'López, Juan c/ Libra...', priority: 'Alta' }
    ]
  },
  {
    id: 'a3',
    name: 'Agente de Triage',
    description: 'Clasifica prioridad y genera resumen ejecutivo.',
    status: 'Activo',
    currentCaseId: 'CAS-2024-005',
    metrics: { processedToday: 13, avgTime: '3.1s', successRate: '98.0%' },
    recentActivity: [
      { id: 'ra5', timestamp: '2024-05-12T11:30:00Z', caseId: 'CAS-2024-005', caseName: 'Pérez, Ana c/ Libra...', result: 'Éxito', duration: '3.5s' },
    ],
    queue: [
      { caseId: 'CAS-2024-003', caseName: 'Martínez, Lucía c/ Libra...', priority: 'Baja' }
    ]
  },
  {
    id: 'a4',
    name: 'Agente de Fichero',
    description: 'Crea carpeta digital organizada vinculando sistemas core.',
    status: 'En espera',
    metrics: { processedToday: 12, avgTime: '12.4s', successRate: '92.0%' },
    recentActivity: [
      { id: 'ra6', timestamp: '2024-05-12T09:20:00Z', caseId: 'CAS-2024-007', caseName: 'Fernández, Silvia c/ Libra...', result: 'Éxito', duration: '11.2s' },
    ],
    queue: [
      { caseId: 'CAS-2024-005', caseName: 'Pérez, Ana c/ Libra...', priority: 'Alta' }
    ]
  },
  {
    id: 'a5',
    name: 'Agente de Borrador',
    description: 'Genera borrador de contestación a partir de templates.',
    status: 'Activo',
    currentCaseId: 'CAS-2024-002',
    metrics: { processedToday: 10, avgTime: '18.5s', successRate: '100%' },
    recentActivity: [
      { id: 'ra7', timestamp: '2024-05-11T14:20:00Z', caseId: 'CAS-2024-002', caseName: 'Rodríguez, Carlos A. c/ Libra...', result: 'Éxito', duration: '19.1s' },
    ],
    queue: [
      { caseId: 'CAS-2024-007', caseName: 'Fernández, Silvia c/ Libra...', priority: 'Media' }
    ]
  }
];

export const MOCK_INBOX: InboxItem[] = [
  { id: 'i1', caseId: 'CAS-2024-001', caseName: 'García, María c/ Libra Seguros S.A.', agent: 'Agente de Borrador', actionRequired: 'Revisar borrador de contestación', urgency: 'Alta', timestamp: '2024-05-12T09:00:00Z' },
  { id: 'i2', caseId: 'CAS-2024-003', caseName: 'Martínez, Lucía c/ Libra Seguros S.A.', agent: 'Agente de Extracción', actionRequired: 'Validar extracción — 2 campos con baja confianza', urgency: 'Media', timestamp: '2024-05-12T08:15:00Z' },
  { id: 'i3', caseId: 'CAS-2024-002', caseName: 'Rodríguez, Carlos A. c/ Libra Seguros S.A.', agent: 'Agente Coordinador', actionRequired: 'Aprobar asignación a Dr. Federico López', urgency: 'Media', timestamp: '2024-05-11T14:25:00Z' },
  { id: 'i4', caseId: 'CAS-2024-005', caseName: 'Pérez, Ana c/ Libra Seguros S.A.', agent: 'Agente Coordinador', actionRequired: 'Aprobar asignación a Dra. Sofía Peralta', urgency: 'Alta', timestamp: '2024-05-12T11:35:00Z' },
];
