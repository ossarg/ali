import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MOCK_CASES } from '../data/mockData';

type Stage = 'Ingesta' | 'Extracción' | 'Triage' | 'Fichero' | 'Borrador' | 'Revisión Humana' | 'Completado';

const STAGES: { key: Stage; agent: string; bar: string; accent: string }[] = [
  { key: 'Ingesta',         agent: 'Rachel', bar: 'bg-violet-400',  accent: 'text-violet-600' },
  { key: 'Extracción',      agent: 'Donna',  bar: 'bg-pink-400',    accent: 'text-pink-600' },
  { key: 'Triage',          agent: 'Mike',   bar: 'bg-blue-400',    accent: 'text-blue-600' },
  { key: 'Fichero',         agent: 'Edu',    bar: 'bg-amber-400',   accent: 'text-amber-600' },
  { key: 'Borrador',        agent: 'Jess',   bar: 'bg-emerald-400', accent: 'text-emerald-600' },
  { key: 'Revisión Humana', agent: '',       bar: 'bg-red-400',     accent: 'text-red-600' },
  { key: 'Completado',      agent: '',       bar: 'bg-green-400',   accent: 'text-green-600' },
];

const PRIORITY_COLORS: Record<string, string> = {
  Alta:  'bg-red-50 text-red-700 border-red-100',
  Media: 'bg-amber-50 text-amber-700 border-amber-100',
  Baja:  'bg-green-50 text-green-700 border-green-100',
};

export default function PipelineStepper() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const stageCounts = useMemo(() => {
    const counts: Record<Stage, typeof MOCK_CASES> = {
      'Ingesta': [], 'Extracción': [], 'Triage': [], 'Fichero': [],
      'Borrador': [], 'Revisión Humana': [], 'Completado': [],
    };
    MOCK_CASES.forEach(c => {
      if (counts[c.stage as Stage]) counts[c.stage as Stage].push(c);
    });
    return counts;
  }, []);

  const handleStageClick = (stage: Stage) => {
    setSelectedStage(prev => prev === stage ? null : stage);
  };

  const selectedStageData = STAGES.find(s => s.key === selectedStage);

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-dim)] flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Pipeline de Litigación</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            {MOCK_CASES.length} casos · seleccioná una etapa para ver el detalle
          </p>
        </div>
        {selectedStage && selectedStageData && (
          <span className={cn(
            'text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)]',
            selectedStageData.accent
          )}>
            {stageCounts[selectedStage].length} caso{stageCounts[selectedStage].length !== 1 ? 's' : ''} en {selectedStage}
          </span>
        )}
      </div>

      {/* Stage cards */}
      <div className="flex divide-x divide-[var(--color-border-dim)] overflow-x-auto">
        {STAGES.map((stage) => {
          const count = stageCounts[stage.key].length;
          const isSelected = selectedStage === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => handleStageClick(stage.key)}
              className={cn(
                'group flex-1 flex flex-col items-start px-5 py-5 min-w-[110px] relative transition-all text-left',
                isSelected
                  ? 'bg-[var(--color-brand-primary)]/[0.04]'
                  : 'hover:bg-[var(--color-surface-bg)]'
              )}
            >
              {/* Top accent bar */}
              <div className={cn(
                'absolute inset-x-0 top-0 h-[3px] transition-all duration-200',
                isSelected
                  ? 'bg-[var(--color-brand-primary)]'
                  : cn(stage.bar, 'opacity-30 group-hover:opacity-80')
              )} />

              {/* Big count */}
              <span className={cn(
                'text-[2.5rem] font-bold tracking-tight leading-none mb-2.5 transition-colors',
                isSelected ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-text-primary)]'
              )}>
                {count}
              </span>

              {/* Stage name */}
              <span className={cn(
                'text-[11px] font-semibold leading-tight transition-colors',
                isSelected ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-text-secondary)]'
              )}>
                {stage.key}
              </span>

              {/* Agent name */}
              {stage.agent && (
                <span className={cn(
                  'text-[10px] mt-0.5 font-medium transition-colors',
                  isSelected ? stage.accent : 'text-[var(--color-text-tertiary)]'
                )}>
                  {stage.agent}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expandable Cases Panel */}
      <AnimatePresence>
        {selectedStage && (
          <motion.div
            key={selectedStage}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--color-border-dim)] p-4">
              {stageCounts[selectedStage].length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)] text-center py-6">
                  No hay casos en esta etapa.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {stageCounts[selectedStage].map(caso => (
                    <Link
                      key={caso.id}
                      to={`/casos/${caso.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] hover:border-[var(--color-border-focus)] transition-all group/card"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn('w-1 h-8 rounded-full shrink-0', selectedStageData?.bar ?? 'bg-gray-300')} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover/card:text-[var(--color-brand-primary)] transition-colors">
                            {caso.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)] truncate">{caso.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                          PRIORITY_COLORS[caso.priority] ?? 'bg-gray-50 text-gray-600 border-gray-100'
                        )}>
                          {caso.priority}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] group-hover/card:text-[var(--color-brand-primary)] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
