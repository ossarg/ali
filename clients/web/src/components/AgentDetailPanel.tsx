import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { X, Bot, CheckCircle2, Clock, Activity, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { AGENT_BY_PERSONA } from '../data/agentPersonas';
import { MOCK_AGENTS } from '../data/mockData';

interface AgentDetailPanelProps {
  agentName: string | null;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Activo':    'bg-green-500',
  'En espera': 'bg-amber-500',
  'Error':     'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  'Activo':    'Activo',
  'En espera': 'En espera',
  'Error':     'Error',
};

export default function AgentDetailPanel({ agentName, onClose }: AgentDetailPanelProps) {
  const persona = agentName ? AGENT_BY_PERSONA[agentName] : null;
  const mockAgent = persona ? MOCK_AGENTS.find(a => a.id === persona.id) : null;

  return createPortal(
    <AnimatePresence>
      {agentName && persona && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-96 z-50 bg-[var(--color-surface-card)] border-l border-[var(--color-border-dim)] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={cn('p-5 border-b border-[var(--color-border-dim)]', persona.color.bg, persona.color.darkBg)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border relative', persona.color.bg, persona.color.border)}>
                    <Bot className={cn('w-6 h-6', persona.color.text)} />
                    {mockAgent && (
                      <div className={cn(
                        'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--color-surface-card)]',
                        STATUS_COLORS[mockAgent.status] ?? 'bg-gray-400'
                      )} />
                    )}
                  </div>
                  <div>
                    <h2 className={cn('text-lg font-bold', persona.color.text)}>{persona.persona}</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">{persona.role}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)]/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-3 leading-relaxed">{persona.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {mockAgent ? (
                <>
                  {/* Status + current case */}
                  <div>
                    <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Estado actual</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn('w-2 h-2 rounded-full', STATUS_COLORS[mockAgent.status] ?? 'bg-gray-400')} />
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{STATUS_LABELS[mockAgent.status] ?? mockAgent.status}</span>
                    </div>
                    {mockAgent.currentCaseId ? (
                      <Link
                        to={`/casos/${mockAgent.currentCaseId}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] hover:border-[var(--color-border-focus)] transition-all group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Activity className={cn('w-4 h-4 shrink-0', persona.color.text)} />
                          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            Procesando {mockAgent.currentCaseId}
                          </span>
                        </div>
                        <LinkIcon className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-primary)] transition-colors shrink-0" />
                      </Link>
                    ) : (
                      <p className="text-sm text-[var(--color-text-tertiary)] italic">Sin caso activo en este momento.</p>
                    )}
                  </div>

                  {/* Metrics */}
                  <div>
                    <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Métricas</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-[var(--color-text-primary)]">{mockAgent.metrics.processedToday}</div>
                        <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 leading-tight">Hoy</div>
                      </div>
                      <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-600">{mockAgent.metrics.successRate}</div>
                        <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 leading-tight">Éxito</div>
                      </div>
                      <div className="bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-[var(--color-text-primary)]">{mockAgent.metrics.avgTime}</div>
                        <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 leading-tight">Prom.</div>
                      </div>
                    </div>
                  </div>

                  {/* Queue */}
                  {mockAgent.queue && mockAgent.queue.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Cola de trabajo</h3>
                      <div className="space-y-1.5">
                        {mockAgent.queue.map((item, i) => (
                          <div key={item.caseId} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)]">
                            <span className="text-xs font-bold text-[var(--color-text-tertiary)] w-4 shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{item.caseName}</p>
                              <p className="text-[10px] text-[var(--color-text-tertiary)]">{item.caseId}</p>
                            </div>
                            <span className={cn(
                              'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                              item.priority === 'Alta' ? 'bg-red-50 text-red-600' :
                              item.priority === 'Media' ? 'bg-amber-50 text-amber-600' :
                              'bg-green-50 text-green-600'
                            )}>
                              {item.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent activity */}
                  {mockAgent.recentActivity && mockAgent.recentActivity.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Actividad reciente</h3>
                      <div className="space-y-2">
                        {mockAgent.recentActivity.slice(0, 5).map(item => (
                          <div key={item.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{item.caseName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[var(--color-text-tertiary)]">{item.result}</span>
                                <span className="text-[10px] text-[var(--color-text-tertiary)]">·</span>
                                <Clock className="w-2.5 h-2.5 text-[var(--color-text-tertiary)]" />
                                <span className="text-[10px] text-[var(--color-text-tertiary)]">{item.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bot className={cn('w-10 h-10 mb-3', persona.color.text)} />
                  <p className="text-sm text-[var(--color-text-secondary)]">No hay datos de actividad disponibles.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
