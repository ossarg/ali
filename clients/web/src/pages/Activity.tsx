import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatMetricTime, formatTableTime } from '../lib/formatTime';
import {
  useApprovedEventsPaginated,
  useCaseEventMetrics,
  usePendingEvents,
} from '../api/hooks/useCaseEvents';
import Pagination from '../components/Pagination';
import type { CaseEvent } from '../api/schemas/case.schemas';

// ─── Mail type labels ────────────────────────────────────────────────────────

const MAIL_TYPE_LABELS: Record<string, string> = {
  sentencia:    'Sentencia',
  reclamo_pago: 'Reclamo de Pago',
  intimacion:   'Intimación',
  acuerdo:      'Acuerdo',
  embargo:      'Embargo',
  pericia:      'Pericia',
  oficio:       'Oficio',
  gestion:      'Gestión',
  apertura:     'Apertura',
  apelacion:    'Apelación',
  cierre:       'Cierre',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{pct}%</span>
    </div>
  );
}

// ─── Event table ──────────────────────────────────────────────────────────────

function EventTable({ events, showConfidence, showReviewed }: {
  events: CaseEvent[];
  showConfidence?: boolean;
  showReviewed?: boolean;
}) {
  const navigate = useNavigate();

  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-10 text-center">
        No hay eventos para mostrar.
      </p>
    );
  }

  return (
    <table className="w-full text-sm table-fixed">
      <colgroup>
        <col style={{ width: '45%' }} />
        <col /><col /><col />
      </colgroup>
      <thead>
        <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
          <th className="pb-3 pt-4 pl-4 pr-4">Asunto</th>
          <th className="pb-3 pt-4 pr-4">Tipo</th>
          {showConfidence && <th className="pb-3 pt-4 pr-4">Confianza</th>}
          <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Recibido</th>
          {showReviewed && <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Revisado</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {events.map(event => (
          <tr
            key={event.id}
            onClick={() => navigate(`/actividad/${event.id}`)}
            className="hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <td className="pl-4 pr-4 py-3.5 min-w-0 max-w-xs">
              <div className="font-medium text-gray-800 truncate">
                {event.title || event.subject || event.mail_id}
              </div>
              {event.description && (
                <div className="text-xs text-gray-400 truncate mt-0.5">{event.description}</div>
              )}
            </td>
            <td className="pr-4 py-3.5">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
              </span>
            </td>
            {showConfidence && (
              <td className="pr-4 py-3.5">
                <ConfidenceBar value={event.confidence} />
              </td>
            )}
            <td className="pr-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">
              {formatTableTime(event.received_at)}
            </td>
            {showReviewed && (
              <td className="pr-4 py-3.5 text-gray-500 text-xs">
                {event.reviewed_at ? formatTableTime(event.reviewed_at) : '—'}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'pendientes' | 'aprobados';

export default function Activity() {
  const [tab, setTab]             = useState<Tab>('pendientes');
  const [approvedPage, setApprovedPage] = useState(1);

  const { data: metrics, isLoading: metricsLoading } = useCaseEventMetrics();
  const { data: approvedData, isLoading: approvedLoading } = useApprovedEventsPaginated(approvedPage, 10);
  const approved = approvedData?.data ?? [];
  const { data: pending = [], isLoading: pendingLoading } = usePendingEvents();

  const lastSeen = metrics?.last_event_at ? formatMetricTime(metrics.last_event_at) : null;
  const pendingCount = metrics?.pending ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Actividad</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
          ))
        ) : (
          <>
            <MetricCard label="Total emails" value={metrics?.total    ?? 0} />
            <MetricCard label="Aprobados"    value={metrics?.approved ?? 0} />
            <MetricCard label="Pendientes"   value={pendingCount} />
            <MetricCard
              label="Último evento"
              value={lastSeen ? lastSeen.time : '—'}
              sub={lastSeen ? lastSeen.label : undefined}
            />
          </>
        )}
      </div>

      {/* Tabs + table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab nav */}
        <div className="border-b border-gray-100">
          <nav className="flex px-4 gap-1">
            {([
              { id: 'pendientes', label: 'Pendientes', count: pendingCount },
              { id: 'aprobados',  label: 'Aprobados',  count: null },
            ] as { id: Tab; label: string; count: number | null }[]).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {tab === 'pendientes' && (
          pendingLoading
            ? <p className="text-sm text-gray-400 animate-pulse px-4 py-8">Cargando...</p>
            : <EventTable events={pending} showConfidence />
        )}

        {tab === 'aprobados' && (
          approvedLoading
            ? <p className="text-sm text-gray-400 animate-pulse px-4 py-8">Cargando...</p>
            : <>
                <EventTable events={approved} showReviewed />
                {(approvedData?.total ?? 0) > 10 && (
                  <div className="px-4 pb-4">
                    <Pagination page={approvedPage} limit={10} total={approvedData?.total ?? 0} onChange={setApprovedPage} />
                  </div>
                )}
              </>
        )}
      </div>
    </div>
  );
}
