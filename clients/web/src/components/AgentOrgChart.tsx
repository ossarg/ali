import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, ArrowRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { AGENT_PERSONAS, PIPELINE_AGENTS, type AgentPersona } from '../data/agentPersonas';

/* ── Hardcoded metrics ───────────────────────────────────────────────── */
interface Metrics {
  status: 'Activo' | 'En espera' | 'Detenido';
  casesProcessed: number;
  avgTime: number;
  precision: number;
  queue: number;
}

const METRICS: Record<string, Metrics> = {
  a0: { status: 'Activo',    casesProcessed: 36, avgTime: 0.5,  precision: 99.5, queue: 0 },
  a1: { status: 'Activo',    casesProcessed: 12, avgTime: 1.2,  precision: 98,   queue: 2 },
  a2: { status: 'En espera', casesProcessed: 10, avgTime: 3.1,  precision: 97,   queue: 0 },
  a3: { status: 'Activo',    casesProcessed: 10, avgTime: 2.8,  precision: 96,   queue: 1 },
  a4: { status: 'En espera', casesProcessed:  8, avgTime: 4.5,  precision: 97.8, queue: 0 },
  a5: { status: 'Activo',    casesProcessed:  6, avgTime: 8.2,  precision: 94,   queue: 1 },
  a6: { status: 'En espera', casesProcessed:  5, avgTime: 1.5,  precision: 99,   queue: 0 },
};

const STATUS_DOT: Record<string, string> = {
  'Activo':    'bg-green-500',
  'En espera': 'bg-gray-400',
  'Detenido':  'bg-red-500',
};

const STATUS_TEXT: Record<string, string> = {
  'Activo':    'text-green-600',
  'En espera': 'text-gray-400',
  'Detenido':  'text-red-500',
};

/* ── AgentCard ───────────────────────────────────────────────────────── */
function AgentCard({
  persona,
  isAli = false,
  onClick,
}: {
  persona: AgentPersona;
  isAli?: boolean;
  onClick: () => void;
}) {
  const m = METRICS[persona.id];
  const status = m?.status ?? 'En espera';

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col text-left',
        'bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl',
        'transition-colors focus:outline-none hover:border-[var(--color-border-focus)]',
        isAli ? 'px-5 py-4 min-w-[148px]' : 'px-4 py-3 w-full'
      )}
    >
      {/* Name + status dot */}
      <div className="flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOT[status])} />
        <span className={cn(
          'font-semibold text-[var(--color-text-primary)] leading-tight',
          isAli ? 'text-[0.95rem]' : 'text-[0.875rem]'
        )}>
          {persona.persona}
        </span>
      </div>
      {/* Role */}
      <span className="text-[0.75rem] text-[var(--color-text-secondary)] mt-1 ml-4 leading-tight">
        {persona.role}
      </span>
      {/* Status label */}
      <span className={cn('text-[0.68rem] mt-1.5 ml-4', STATUS_TEXT[status])}>
        {status}
      </span>
      {/* Stage */}
      {!isAli && persona.pipelineOrder > 0 && (
        <span className="text-[0.62rem] text-[var(--color-text-tertiary)] mt-2 ml-4">
          Etapa {persona.pipelineOrder} de 6
        </span>
      )}
    </button>
  );
}

/* ── DetailPanel ─────────────────────────────────────────────────────── */
function DetailPanel({
  persona,
  onClose,
}: {
  persona: AgentPersona | null;
  onClose: () => void;
}) {
  const m = persona ? METRICS[persona.id] : null;
  const status = (m?.status ?? 'En espera') as string;

  return (
    <AnimatePresence>
      {persona && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 z-50 bg-[var(--color-surface-card)] border-l border-[var(--color-border-dim)] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--color-border-dim)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)] leading-tight">
                    {persona.persona}
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{persona.role}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={cn('w-2 h-2 rounded-full', STATUS_DOT[status])} />
                    <span className={cn('text-xs', STATUS_TEXT[status])}>{status}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-bg)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Función */}
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">
                  Función
                </p>
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                  {persona.description}
                </p>
              </div>

              {/* Skills */}
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {persona.skills.map(skill => (
                    <span
                      key={skill}
                      className="text-[0.72rem] px-3 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Métricas */}
              {m && (
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
                    Rendimiento este mes
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { value: m.casesProcessed,     label: 'casos procesados' },
                      { value: `${m.avgTime} min`,   label: 'tiempo promedio'  },
                      { value: `${m.precision}%`,    label: 'precisión'        },
                      { value: m.queue,              label: 'en cola'          },
                    ].map(({ value, label }) => (
                      <div
                        key={label}
                        className="bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-lg px-3 py-2.5"
                      >
                        <div className="text-base font-semibold text-[var(--color-text-primary)]">{value}</div>
                        <div className="text-[0.63rem] text-[var(--color-text-tertiary)] mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pipeline position */}
              {persona.pipelineOrder > 0 ? (
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
                    Posición en el pipeline
                  </p>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <div
                        key={n}
                        className={cn(
                          'w-2.5 h-2.5 rounded-full transition-colors',
                          n === persona.pipelineOrder
                            ? 'bg-[var(--color-text-primary)]'
                            : 'bg-transparent border-2 border-gray-300 dark:border-zinc-600'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[0.65rem] text-[var(--color-text-tertiary)]">
                    Etapa {persona.pipelineOrder} de 6
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">
                    Rol en el pipeline
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Coordinador — supervisa todas las etapas
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--color-border-dim)]">
              <button className="flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-primary)] transition-colors group">
                Ver actividad
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── AgentOrgChart ───────────────────────────────────────────────────── */
export default function AgentOrgChart() {
  const ali = AGENT_PERSONAS.find(a => a.id === 'a0')!;
  const [selected, setSelected] = useState<AgentPersona | null>(null);

  return (
    <>
      {/* How it works hint */}
      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
          <Info className="w-3.5 h-3.5" />
          ¿Cómo funciona?
        </button>
      </div>

      {/* ── Desktop layout ─────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col items-center w-full">

        {/* Level 1: Ali */}
        <AgentCard persona={ali} isAli onClick={() => setSelected(ali)} />

        {/* Vertical connector from Ali */}
        <div className="w-px h-8 bg-[#E5E7EB] dark:bg-zinc-700" />

        {/* Horizontal bracket */}
        <div className="relative w-full h-0 overflow-visible">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(860px,88%)] h-px bg-[#E5E7EB] dark:bg-zinc-700" />
        </div>

        {/* Level 2: Pipeline agents */}
        <div className="flex items-start justify-center gap-0 overflow-x-auto pt-0 pb-2 w-full">
          {PIPELINE_AGENTS.map((agent, i) => (
            <Fragment key={agent.id}>
              <div className="flex flex-col items-center min-w-[112px] max-w-[140px] flex-1">
                {/* Vertical connector from horizontal bracket */}
                <div className="w-px h-4 bg-[#E5E7EB] dark:bg-zinc-700" />
                <AgentCard persona={agent} onClick={() => setSelected(agent)} />
              </div>

              {i < PIPELINE_AGENTS.length - 1 && (
                <div className="flex items-center shrink-0 mt-[16px] px-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB] dark:text-zinc-600" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* Flow label */}
        <div className="flex items-center gap-3 mt-5">
          <div className="h-px w-16 bg-[#E5E7EB] dark:bg-zinc-700" />
          <span className="text-[0.6rem] font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest">
            Flujo secuencial
          </span>
          <div className="h-px w-16 bg-[#E5E7EB] dark:bg-zinc-700" />
        </div>
      </div>

      {/* ── Mobile layout ──────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col items-center w-full gap-0">
        <AgentCard persona={ali} isAli onClick={() => setSelected(ali)} />
        {PIPELINE_AGENTS.map(agent => (
          <Fragment key={agent.id}>
            <div className="w-px h-5 bg-[#E5E7EB] dark:bg-zinc-700" />
            <div className="w-full max-w-xs">
              <AgentCard persona={agent} onClick={() => setSelected(agent)} />
            </div>
          </Fragment>
        ))}
      </div>

      {/* Detail panel via portal */}
      {createPortal(
        <DetailPanel persona={selected} onClose={() => setSelected(null)} />,
        document.body
      )}
    </>
  );
}
