import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_INBOX } from '../data/mockData';
import {
  AlertCircle,
  Sparkles, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import LiveActivityFeed from '../components/LiveActivityFeed';
import PageHeader from '../components/PageHeader';
import AgentDetailPanel from '../components/AgentDetailPanel';

/* ── Pipeline nodes (agent track) ── */
const PIPELINE_NODES = [
  { name: 'Donna',       sub: 'Revisión formal', count: 1, blocked: 0, cases: ['García c/ Libra Seguros'] },
  { name: 'Mike',        sub: 'Extracción',      count: 1, blocked: 0, cases: ['López c/ Libra Seguros'] },
  { name: 'Edu',         sub: 'Scoring',          count: 1, blocked: 0, cases: ['Martínez c/ Libra Seguros'] },
  { name: 'Jess',        sub: 'Borrador',         count: 1, blocked: 0, cases: ['Pérez c/ Libra Seguros'] },
  { name: 'Rev. humana', sub: 'Validación',       count: 1, blocked: 0, cases: ['Fernández c/ Libra Seguros'] },
  { name: 'Presentada',  sub: 'En juzgado',       count: 1, blocked: 0, cases: ['Díaz c/ Libra Seguros'] },
  { name: 'En trámite',  sub: 'Procesal',         count: 0, blocked: 0, cases: [] },
] as const;

const PIPELINE_ACTIVE  = PIPELINE_NODES.reduce((n, s) => n + s.count, 0);
const PIPELINE_BLOCKED = PIPELINE_NODES.reduce((n, s) => n + s.blocked, 0);

/* ── Hardcoded alert (renders only when deadline within 5 business days) ── */
const URGENT_ALERT = {
  show: true,
  text: '1 contestación vence en 3 días — García c/ Libra Seguros S.A.',
  link: '/contestaciones',
};

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const pendingReviewCount = MOCK_INBOX.length;

  const AGENT_LABEL_MAP: Record<string, string> = {
    'Agente de Borrador':   'Jess · Borrador',
    'Agente de Extracción': 'Donna · Extracción',
    'Agente Coordinador':   'Ali · Coordinador',
    'Agente de Triage':     'Mike · Triage',
    'Agente de Scoring':    'Edu · Scoring',
  };

  const INBOX_TIMES: Record<string, string> = {
    'i4': 'Hace 30m',
    'i1': 'Hace 2h',
    'i2': 'Hace 3h',
    'i3': 'Ayer',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Panel Principal"
        subtitle="Visión general del pipeline de litigación y actividad de los agentes."
        actions={
          <button
            onClick={() => setInsightsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--color-border-dim)] bg-[var(--color-surface-card)] text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-focus)] hover:text-[var(--color-text-primary)] transition-all"
          >
            <Sparkles className="w-4 h-4 text-[var(--color-brand-primary)]" />
            Insights del pipeline
          </button>
        }
      />

      {/* ── Urgent Alert + Metric Cards ── */}
      <div className="space-y-3">
        {/* Alert bar — only renders when there are upcoming deadlines */}
        {URGENT_ALERT.show && (
          <div
            className="flex items-center justify-between px-5 py-3 bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl"
            style={{ borderLeft: '2px solid #ef4444' }}
          >
            <p className="text-sm text-[var(--color-text-secondary)]">
              {URGENT_ALERT.text}
            </p>
            <Link
              to={URGENT_ALERT.link}
              className="text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors shrink-0 ml-6"
            >
              Ver →
            </Link>
          </div>
        )}

        {/* Three metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Casos Activos */}
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl p-6 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors duration-150">
            <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest">
              Casos activos
            </p>
            <div className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mt-2">
              6
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">+3 este mes</p>
          </div>

          {/* Card 2 — Exposición Total */}
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl p-6 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors duration-150">
            <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest">
              Exposición total
            </p>
            <div className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mt-2">
              $89.2M
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              4 determinados · 2 indeterminados
            </p>
          </div>

          {/* Card 3 — Vencimientos */}
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl p-6 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors duration-150">
            <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest">
              Vencimientos próximos
            </p>
            <div className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mt-2">
              3
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                1 esta semana
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                1 próx. semana
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                1 en 15 días
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pipeline de Litigación ── */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Pipeline</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {PIPELINE_ACTIVE} casos activos
            {PIPELINE_BLOCKED > 0
              ? <span className="text-red-500"> · {PIPELINE_BLOCKED} bloqueado{PIPELINE_BLOCKED !== 1 ? 's' : ''}</span>
              : <span> · 0 bloqueados</span>
            }
          </p>
        </div>

        {/* Track */}
        <div className="relative">
          <div className="overflow-x-auto">
            <div className="flex min-w-[560px]">
              {PIPELINE_NODES.map((node, i) => (
                <div
                  key={node.name}
                  className="flex-1 flex flex-col items-center relative cursor-pointer group"
                >
                  {/* Agent / stage name */}
                  <span className={cn(
                    'text-[11px] font-medium mb-2 whitespace-nowrap',
                    node.count > 0 ? 'text-[var(--color-text-tertiary)]' : 'text-zinc-300 dark:text-zinc-600'
                  )}>
                    {node.name}
                  </span>

                  {/* Dot row with connectors */}
                  <div className="relative w-full flex items-center justify-center h-7">
                    {/* Left connector */}
                    {i > 0 && (
                      <div
                        className={cn(
                          'absolute left-0 border-t',
                          PIPELINE_NODES[i - 1].count > 0 && node.count > 0
                            ? 'border-zinc-300 dark:border-zinc-600'
                            : 'border-dashed border-zinc-200 dark:border-zinc-700'
                        )}
                        style={{ right: 'calc(50% + 14px)', top: '50%' }}
                      />
                    )}

                    {/* Right connector */}
                    {i < PIPELINE_NODES.length - 1 && (
                      <div
                        className={cn(
                          'absolute right-0 border-t',
                          PIPELINE_NODES[i + 1].count > 0 && node.count > 0
                            ? 'border-zinc-300 dark:border-zinc-600'
                            : 'border-dashed border-zinc-200 dark:border-zinc-700'
                        )}
                        style={{ left: 'calc(50% + 14px)', top: '50%' }}
                      />
                    )}

                    {/* Dot */}
                    <div
                      className={cn(
                        'relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold',
                        node.blocked > 0
                          ? 'border-2 border-red-500 text-red-500 bg-[var(--color-surface-card)]'
                          : node.count > 0
                            ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
                            : 'border border-zinc-200 dark:border-zinc-700 bg-[var(--color-surface-card)]'
                      )}
                      style={{ animation: `fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms both` }}
                    >
                      {node.count > 0 && node.count}
                    </div>
                  </div>

                  {/* Action label */}
                  <span className={cn(
                    'text-[10px] mt-2 whitespace-nowrap',
                    node.count > 0 ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-300 dark:text-zinc-600'
                  )}>
                    {node.sub}
                  </span>

                  {/* Tooltip on hover */}
                  {node.cases.length > 0 && (
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-20">
                      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                        {node.cases.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scroll fade hint (mobile only) */}
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:hidden"
            style={{ background: 'linear-gradient(to left, var(--color-surface-card), transparent)' }}
          />
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Center */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl flex flex-col h-[460px] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border-dim)] flex items-center justify-between">
            <h2 className="text-[0.9rem] font-semibold text-[var(--color-text-primary)]">Acciones pendientes</h2>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {pendingReviewCount} pendientes
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {MOCK_INBOX.map((item) => (
              <Link
                key={item.id}
                to={`/casos/${item.caseId}`}
                className="block px-4 py-3.5 bg-[var(--color-surface-card)] rounded-lg border border-[#E5E7EB] dark:border-zinc-700 hover:bg-[#FAFAFA] dark:hover:bg-zinc-800/40 transition-colors duration-150"
              >
                {/* Line 1: agent name + timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.85rem] font-semibold text-[var(--color-text-primary)]">
                    {AGENT_LABEL_MAP[item.agent] ?? item.agent}
                  </span>
                  <span className="text-[0.75rem] text-[var(--color-text-tertiary)] shrink-0 ml-2">
                    {INBOX_TIMES[item.id] ?? 'Hace 2h'}
                  </span>
                </div>
                {/* Line 2: case name */}
                <p className="text-[0.85rem] text-[var(--color-text-primary)] mb-1.5 line-clamp-1">
                  {item.caseName}
                </p>
                {/* Line 3: action required */}
                <p className="text-[0.8rem] text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-tertiary)]" />
                  {item.actionRequired}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl flex flex-col h-[460px] overflow-hidden relative">
          <div className="p-5 border-b border-[var(--color-border-dim)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Actividad en Vivo</h2>
            </div>
            <Link to="/actividad" className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Ver Completa →
            </Link>
          </div>
          <LiveActivityFeed onAgentClick={setSelectedAgent} />
        </div>
      </div>

      <AgentDetailPanel agentName={selectedAgent} onClose={() => setSelectedAgent(null)} />

      {/* ── Insights Modal ── */}
      {insightsOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30"
            onClick={() => setInsightsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="animate-in w-full max-w-[480px] bg-[var(--color-surface-card)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-y-auto max-h-[90vh] p-5 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Insights del pipeline</h2>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Marzo 2026</p>
                </div>
                <button
                  onClick={() => setInsightsOpen(false)}
                  className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors -mt-1 -mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hero metric */}
              <div className="mb-6">
                <div className="text-[2.5rem] font-bold text-[var(--color-text-primary)] tracking-tight leading-none">
                  4.2 min
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">Tiempo promedio por caso</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">vs. ~3 horas de procesamiento manual</p>
              </div>

              <div className="border-t border-[var(--color-border-dim)] mb-6" />

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">142h</div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Tiempo ahorrado</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-px">este mes vs. manual</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">38</div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Interacciones ahorradas</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-px">emails y llamadas evitados</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">73%</div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Sin intervención humana</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-px">2 de 6 casos</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">97.8%</div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Precisión de agentes</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-px">clasificación y extracción</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">ARS 2.8M</div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Ahorro en honorarios</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-px">equiv. estudio externo</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">6</div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Casos procesados</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-px">este mes</p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--color-border-dim)] mt-6 pt-4 flex items-end justify-between">
                <p className="text-[11px] text-[var(--color-text-tertiary)] italic leading-relaxed max-w-[280px]">
                  * Estimaciones basadas en tiempos promedio de procesamiento manual
                </p>
                <button className="text-sm font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] transition-colors shrink-0 ml-4">
                  Exportar reporte
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
