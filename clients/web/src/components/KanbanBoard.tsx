import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_CASES } from '../data/mockData';

type Stage = 'Ingesta' | 'Extracción' | 'Triage' | 'Fichero' | 'Borrador' | 'Revisión Humana' | 'Completado';

const STAGES: {
  key: Stage;
  agent: string;
  bar: string;
  headerBg: string;
  badge: string;
}[] = [
  { key: 'Ingesta',         agent: 'Rachel', bar: 'bg-violet-400',  headerBg: 'bg-violet-50 dark:bg-violet-500/10',   badge: 'bg-violet-500 text-white' },
  { key: 'Extracción',      agent: 'Donna',  bar: 'bg-pink-400',    headerBg: 'bg-pink-50 dark:bg-pink-500/10',       badge: 'bg-pink-500 text-white' },
  { key: 'Triage',          agent: 'Mike',   bar: 'bg-blue-400',    headerBg: 'bg-blue-50 dark:bg-blue-500/10',       badge: 'bg-blue-500 text-white' },
  { key: 'Fichero',         agent: 'Edu',    bar: 'bg-amber-400',   headerBg: 'bg-amber-50 dark:bg-amber-500/10',     badge: 'bg-amber-500 text-white' },
  { key: 'Borrador',        agent: 'Jess',   bar: 'bg-emerald-400', headerBg: 'bg-emerald-50 dark:bg-emerald-500/10', badge: 'bg-emerald-500 text-white' },
  { key: 'Revisión Humana', agent: '',       bar: 'bg-red-400',     headerBg: 'bg-red-50 dark:bg-red-500/10',         badge: 'bg-red-500 text-white' },
  { key: 'Completado',      agent: '',       bar: 'bg-green-400',   headerBg: 'bg-green-50 dark:bg-green-500/10',     badge: 'bg-green-500 text-white' },
];

const PRIORITY_DOT: Record<string, string> = {
  Alta:  'bg-red-500',
  Media: 'bg-amber-500',
  Baja:  'bg-green-500',
};

const PRIORITY_TEXT: Record<string, string> = {
  Alta:  'text-red-600',
  Media: 'text-amber-600',
  Baja:  'text-green-600',
};

function formatARS(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `ARS ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (amount >= 1_000) return `ARS ${(amount / 1_000).toFixed(0)}K`;
  return `ARS ${amount}`;
}

function formatDeadline(deadlineStr: string): string {
  const d = new Date(deadlineStr);
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Vencido';
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function isUrgent(deadlineStr: string): boolean {
  const diff = (new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff < 3;
}

export { formatARS };

export default function KanbanBoard() {
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

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-dim)] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Pipeline Kanban</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            {MOCK_CASES.length} casos en total · hacé click en una tarjeta para ver el detalle
          </p>
        </div>
        <Link
          to="/casos"
          className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Ver todos →
        </Link>
      </div>

      {/* Kanban columns */}
      <div className="flex divide-x divide-[var(--color-border-dim)] overflow-x-auto" style={{ maxHeight: '460px' }}>
        {STAGES.map(stage => {
          const cases = stageCounts[stage.key];
          return (
            <div key={stage.key} className="flex flex-col min-w-[182px] flex-1">
              {/* Column header */}
              <div className={cn('relative px-3 py-2.5 border-b border-[var(--color-border-dim)] shrink-0', stage.headerBg)}>
                <div className={cn('absolute inset-x-0 top-0 h-[3px]', stage.bar)} />
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate pr-1">
                    {stage.key}
                  </span>
                  <span className={cn(
                    'text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shrink-0',
                    cases.length > 0 ? stage.badge : 'bg-[var(--color-surface-card)] text-[var(--color-text-tertiary)] border border-[var(--color-border-dim)]'
                  )}>
                    {cases.length}
                  </span>
                </div>
                {stage.agent && (
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{stage.agent}</p>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[var(--color-surface-bg)]/60">
                {cases.length === 0 ? (
                  <div className="flex items-center justify-center py-8 opacity-30">
                    <span className="text-sm text-[var(--color-text-tertiary)]">—</span>
                  </div>
                ) : (
                  cases.map(caso => (
                    <Link
                      key={caso.id}
                      to={`/casos/${caso.id}`}
                      className="block p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] hover:border-[var(--color-border-focus)] transition-all group shadow-sm"
                    >
                      {/* Priority + case number */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', PRIORITY_DOT[caso.priority])} />
                          <span className={cn('text-[9px] font-semibold uppercase tracking-wide', PRIORITY_TEXT[caso.priority])}>
                            {caso.priority}
                          </span>
                        </div>
                        <span className="text-[9px] text-[var(--color-text-tertiary)] font-mono">
                          #{caso.id.split('-').pop()}
                        </span>
                      </div>

                      {/* Plaintiff name */}
                      <p className="text-[11px] font-semibold text-[var(--color-text-primary)] line-clamp-2 leading-snug mb-2 group-hover:text-[var(--color-brand-primary)] transition-colors">
                        {caso.title.split(' c/ ')[0]}
                      </p>

                      {/* Amount */}
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">
                        {formatARS(caso.amount)}
                      </p>

                      {/* Deadline */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className={cn(
                          'w-2.5 h-2.5 shrink-0',
                          isUrgent(caso.deadline) ? 'text-red-500' : 'text-[var(--color-text-tertiary)]'
                        )} />
                        <span className={cn(
                          'text-[9px]',
                          isUrgent(caso.deadline)
                            ? 'text-red-500 font-semibold'
                            : 'text-[var(--color-text-tertiary)]'
                        )}>
                          {formatDeadline(caso.deadline)}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
