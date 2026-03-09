import { useState } from 'react';
import { type Stage } from '../data/mockData';
import { LayoutGrid, List, Search, Filter, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useCasesPaginated } from '../api/hooks/useCases';
import Pagination from '../components/Pagination';
import PageHeader from '../components/PageHeader';

const STAGE_CONFIG: Record<Stage, { bar: string; headerBg: string; badge: string; agent: string }> = {
  'Ingesta':         { bar: 'bg-violet-400', headerBg: 'bg-violet-50 dark:bg-violet-500/10',   badge: 'bg-violet-500 text-white',  agent: 'Rachel' },
  'Extracción':      { bar: 'bg-pink-400',   headerBg: 'bg-pink-50 dark:bg-pink-500/10',       badge: 'bg-pink-500 text-white',    agent: 'Donna'  },
  'Triage':          { bar: 'bg-blue-400',   headerBg: 'bg-blue-50 dark:bg-blue-500/10',       badge: 'bg-blue-500 text-white',    agent: 'Mike'   },
  'Fichero':         { bar: 'bg-amber-400',  headerBg: 'bg-amber-50 dark:bg-amber-500/10',     badge: 'bg-amber-500 text-white',   agent: 'Edu'    },
  'Borrador':        { bar: 'bg-emerald-400',headerBg: 'bg-emerald-50 dark:bg-emerald-500/10', badge: 'bg-emerald-500 text-white', agent: 'Jess'   },
  'Revisión Humana': { bar: 'bg-red-400',    headerBg: 'bg-red-50 dark:bg-red-500/10',         badge: 'bg-red-500 text-white',     agent: ''       },
  'Completado':      { bar: 'bg-green-400',  headerBg: 'bg-green-50 dark:bg-green-500/10',     badge: 'bg-green-500 text-white',   agent: ''       },
};

const PRIORITY_BADGE: Record<string, string> = {
  'Alta':  'bg-red-100 dark:bg-red-500/20 text-red-600',
  'Media': 'bg-amber-100 dark:bg-amber-500/20 text-amber-600',
  'Baja':  'bg-green-100 dark:bg-green-500/20 text-green-700',
};

function formatAmount(amount: number): string {
  if (!amount) return '—';
  if (amount >= 1_000_000) return `ARS ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `ARS ${(amount / 1_000).toFixed(0)}K`;
  return `ARS ${amount}`;
}

function isDeadlineUrgent(dateStr: string): boolean {
  return (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 3;
}

export default function Contestaciones() {
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const stages: Stage[] = ['Ingesta', 'Extracción', 'Triage', 'Fichero', 'Borrador', 'Revisión Humana', 'Completado'];

  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCasesPaginated(page, 10, searchQuery ? { search: searchQuery } : undefined);
  const casos = data?.data ?? [];

  const stageMap: Record<string, Stage> = {
    ingesta:    'Ingesta',
    extraccion: 'Extracción',
    triage:     'Triage',
    asignado:   'Fichero',
    borrador:   'Borrador',
    completado: 'Completado',
  };

  const filteredCases = casos.map(c => ({
    id:       c.id,
    title:    c.title,
    amount:   c.estimated_amount || 0,
    priority: 'Baja' as string,
    stage:    (c.pipeline_stage ? stageMap[c.pipeline_stage] : null) ?? 'Ingesta' as Stage,
    deadline: c.updated_at,
    lawyerId: c.assigned_user?.id || null,
    tipo:     c.action_type || c.case_type || '',
  }));

  return (
    <div className="flex flex-col h-full space-y-6">
      <PageHeader
        title="Contestaciones"
        subtitle="Pipeline de litigación · todas las etapas del proceso"
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                type="text"
                placeholder="Buscar casos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-border-focus)] w-56 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-colors"
              />
            </div>

            <button className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-focus)] transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>

            <div className="flex items-center bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-lg p-1">
              <button
                onClick={() => setView('pipeline')}
                className={cn('p-1.5 rounded transition-colors', view === 'pipeline' ? 'bg-[var(--color-surface-card)] shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={cn('p-1.5 rounded transition-colors', view === 'table' ? 'bg-[var(--color-surface-card)] shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-full text-[var(--color-text-tertiary)]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando casos...
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center h-full gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" /> No se pudieron cargar los casos. Intentá de nuevo.
          </div>
        )}

        {!isLoading && !isError && (view === 'pipeline' ? (
          /* ── PIPELINE VIEW ── */
          <div className="h-full bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl overflow-hidden">
            <div className="flex divide-x divide-[var(--color-border-dim)] h-full overflow-x-auto">
              {stages.map(stage => {
                const stageCases = filteredCases.filter(c => c.stage === stage);
                const cfg = STAGE_CONFIG[stage];
                return (
                  <div key={stage} className="flex flex-col min-w-[182px] flex-1">
                    {/* Column header */}
                    <div className={cn('relative px-3 py-2.5 border-b border-[var(--color-border-dim)] shrink-0', cfg.headerBg)}>
                      <div className={cn('absolute inset-x-0 top-0 h-[3px]', cfg.bar)} />
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate pr-1">
                          {stage}
                        </span>
                        <span className={cn(
                          'text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shrink-0',
                          stageCases.length > 0 ? cfg.badge : 'bg-[var(--color-surface-card)] text-[var(--color-text-tertiary)] border border-[var(--color-border-dim)]'
                        )}>
                          {stageCases.length}
                        </span>
                      </div>
                      {cfg.agent && (
                        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{cfg.agent}</p>
                      )}
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[var(--color-surface-bg)]/60">
                      {stageCases.length === 0 ? (
                        <div className="flex items-center justify-center py-8 opacity-30">
                          <span className="text-sm text-[var(--color-text-tertiary)]">—</span>
                        </div>
                      ) : (
                        stageCases.map(caso => {
                          const urgent = isDeadlineUrgent(caso.deadline);
                          return (
                            <Link
                              key={caso.id}
                              to={`/casos/${caso.id}`}
                              className="block p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] hover:border-[var(--color-border-focus)] transition-all group shadow-sm"
                            >
                              {/* Priority + short ID */}
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide', PRIORITY_BADGE[caso.priority])}>
                                  {caso.priority}
                                </span>
                                <span className="text-[9px] text-[var(--color-text-tertiary)] font-mono">
                                  #{caso.id.slice(-6)}
                                </span>
                              </div>

                              {/* Title */}
                              <p className="text-[11px] font-semibold text-[var(--color-text-primary)] line-clamp-2 leading-snug mb-2 group-hover:text-[var(--color-brand-primary)] transition-colors">
                                {caso.title}
                              </p>

                              {/* Amount */}
                              <p className="text-xs font-bold text-[var(--color-text-primary)]">
                                {formatAmount(caso.amount)}
                              </p>

                              {/* Tipo */}
                              {caso.tipo && (
                                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 capitalize truncate">
                                  {caso.tipo}
                                </p>
                              )}

                              {/* Deadline */}
                              <div className="flex items-center gap-1 mt-1.5">
                                <Clock className={cn('w-2.5 h-2.5 shrink-0', urgent ? 'text-red-500' : 'text-[var(--color-text-tertiary)]')} />
                                <span className={cn('text-[9px]', urgent ? 'text-red-500 font-semibold' : 'text-[var(--color-text-tertiary)]')}>
                                  {format(new Date(caso.deadline), 'dd/MM/yyyy')}
                                </span>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── TABLE VIEW ── */
          <div className="h-full bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border-dim)] overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-surface-bg)] border-b border-[var(--color-border-dim)] sticky top-0">
                  <tr>
                    {['ID', 'Carátula', 'Monto', 'Prioridad', 'Etapa', 'Vencimiento'].map(h => (
                      <th key={h} className="px-6 py-3.5 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-dim)]">
                  {filteredCases.map(c => (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--color-surface-bg)] transition-colors cursor-pointer"
                      onClick={() => navigate(`/casos/${c.id}`)}
                    >
                      <td className="px-6 py-3.5 font-mono text-xs text-[var(--color-text-tertiary)]">
                        #{c.id.slice(-8)}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-[var(--color-text-primary)] max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="px-6 py-3.5 text-[var(--color-text-secondary)]">
                        {formatAmount(c.amount)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', PRIORITY_BADGE[c.priority])}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', STAGE_CONFIG[c.stage]?.bar ?? 'bg-gray-400')} />
                          <span className="text-[var(--color-text-secondary)]">{c.stage}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-[var(--color-text-secondary)]">
                        {format(new Date(c.deadline), 'dd/MM/yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} limit={10} total={data?.total ?? 0} onChange={setPage} />
    </div>
  );
}
