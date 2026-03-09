import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import { formatMetricTime, formatTableTime } from '../lib/formatTime';
import {
  useApprovedEventsPaginated,
  usePendingEventsPaginated,
  useCaseEventMetrics,
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
    <div className="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border-dim)] p-5 flex flex-col gap-1">
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-3xl font-semibold text-[var(--color-text-primary)]">{value}</span>
      {sub && <span className="text-xs text-[var(--color-text-tertiary)]">{sub}</span>}
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-[var(--color-border-dim)] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[var(--color-text-tertiary)]">{pct}%</span>
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

interface ReviewModalProps {
  event: CaseEvent;
  onClose: () => void;
}

function IdentifierField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-tertiary)] w-28 shrink-0">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 border border-[var(--color-border-dim)] bg-[var(--color-surface-bg)] rounded px-2 py-1 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)]"
        placeholder="—"
      />
    </div>
  );
}

function ReviewModal({ event, onClose }: ReviewModalProps) {
  const [selectedType,   setSelectedType]   = useState<string>(event.mail_type);
  const [comment,        setComment]         = useState('');
  const [claimNumber,    setClaimNumber]     = useState(event.raw_claim_number ?? '');
  const [policy,         setPolicy]          = useState(event.raw_policy ?? '');
  const [caseNumber,     setCaseNumber]      = useState(event.raw_case_number ?? '');
  const [caratula,       setCaratula]        = useState(event.raw_caratula ?? '');

  const reviewEvent = useReviewEvent();
  const isChanging  = selectedType !== event.mail_type;
  const canSubmit   = claimNumber.trim() !== '' &&
                      (!isChanging || comment.trim() !== '') &&
                      !reviewEvent.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const req: ReviewCaseEventRequest = {
      claim_number:   claimNumber.trim(),
      review_comment: comment,
      ...(isChanging  && { mail_type:       MAIL_TYPE_VALUES[selectedType] }),
      ...(policy      && { raw_policy:      policy }),
      ...(caseNumber  && { raw_case_number: caseNumber }),
      ...(caratula    && { raw_caratula:    caratula }),
    };
    reviewEvent.mutate({ id: event.id, req }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[var(--color-surface-card)] rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Revisar clasificación</h3>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] text-xl leading-none">×</button>
        </div>

        {/* Mail info */}
        <div className="text-sm text-[var(--color-text-secondary)] space-y-1 bg-[var(--color-surface-bg)] rounded-lg p-3">
          {event.subject && <p className="font-medium text-[var(--color-text-primary)] text-xs leading-snug">{event.subject}</p>}
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
            <span>{event.mail_id}</span>
            <span>·</span>
            <span>Recibido: <span className="font-medium text-[var(--color-text-secondary)]">{format(new Date(event.received_at), 'dd/MM/yyyy HH:mm')}</span></span>
          </div>
          <p className="mt-1">
            <span className="font-medium">Rachel clasificó:</span>{' '}
            <span className="font-semibold text-[var(--color-brand-primary)]">
              {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
            </span>
            {' '}({Math.round(event.confidence * 100)}% confianza)
          </p>
          {event.reasoning && <p className="text-xs text-[var(--color-text-tertiary)] italic">{event.reasoning}</p>}
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Tipo correcto</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full border border-[var(--color-border-dim)] bg-[var(--color-surface-bg)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
          >
            {Object.entries(MAIL_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Identificadores */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Identificadores
            <span className="text-xs text-[var(--color-text-tertiary)] font-normal ml-1">— corregí lo que Rachel haya extraído mal o dejado vacío</span>
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--color-text-primary)] w-28 shrink-0">
                Nro. siniestro <span className="text-red-500">*</span>
              </span>
              <input
                value={claimNumber}
                onChange={e => setClaimNumber(e.target.value)}
                placeholder="Ej: 123456"
                className={`flex-1 border rounded px-2 py-1 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface-bg)] focus:outline-none focus:ring-1 ${
                  claimNumber.trim() === ''
                    ? 'border-red-300 bg-red-50 focus:ring-red-400'
                    : 'border-[var(--color-border-dim)] focus:ring-[var(--color-border-focus)]'
                }`}
              />
            </div>
            {claimNumber.trim() === '' && (
              <p className="text-xs text-red-500 pl-[7.5rem]">Requerido para poder aprobar</p>
            )}
            <IdentifierField label="Póliza"          value={policy}      onChange={setPolicy}      />
            <IdentifierField label="Nro. expediente" value={caseNumber}  onChange={setCaseNumber}  />
            <IdentifierField label="Carátula"        value={caratula}    onChange={setCaratula}    />
          </div>
        </div>

        {/* Comentario */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Comentario {isChanging && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            placeholder={isChanging ? 'Explicá por qué cambiás la clasificación...' : 'Opcional — dejá una nota para Rachel'}
            className="w-full border border-[var(--color-border-dim)] bg-[var(--color-surface-bg)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] resize-none"
          />
        </div>

        {reviewEvent.error && (
          <p className="text-sm text-red-500">{(reviewEvent.error as Error).message ?? 'Error al guardar'}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border-dim)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-bg)]">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reviewEvent.isPending ? 'Guardando...' : isChanging ? 'Corregir' : 'Aprobar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Event table ──────────────────────────────────────────────────────────────

function EventTable({ events, showConfidence, showReviewed, showCase }: {
  events: CaseEvent[];
  showConfidence?: boolean;
  showReviewed?: boolean;
  showCase?: boolean;
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
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
          {showCase && <th className="pb-3 pt-4 pl-4 pr-4 w-36 whitespace-nowrap">Nro. siniestro</th>}
          <th className="pb-3 pt-4 pl-4 pr-4">Asunto</th>
          <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Tipo</th>
          {showConfidence && <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Confianza</th>}
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
            {showCase && (
              <td className="pl-4 pr-4 py-3.5 w-36">
                {event.raw_claim_number
                  ? <span className="font-mono text-xs text-gray-700">{event.raw_claim_number}</span>
                  : <span className="text-gray-300 text-xs">—</span>}
              </td>
            )}
            <td className="pl-4 pr-4 py-3.5 min-w-0 max-w-xs">
              <div className="font-medium text-gray-800 truncate">
                {event.title || event.subject || event.mail_id}
              </div>
            </td>
            <td className="pr-4 py-3.5 whitespace-nowrap">
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
  const [pendingPage, setPendingPage]   = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);

  const { data: metrics, isLoading: metricsLoading } = useCaseEventMetrics();
  const { data: approvedData, isLoading: approvedLoading } = useApprovedEventsPaginated(approvedPage, 10);
  const approved = approvedData?.data ?? [];
  const { data: pendingData, isLoading: pendingLoading } = usePendingEventsPaginated(pendingPage, 10);
  const pending = pendingData?.data ?? [];

  const lastSeen = metrics?.last_event_at ? formatMetricTime(metrics.last_event_at) : null;
  const pendingCount = metrics?.pending ?? 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Inbox — Rachel"
        subtitle="Emails clasificados por Rachel para revisión humana."
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border-dim)] p-5 h-24 animate-pulse" />
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
            : <>
                <EventTable events={pending} showConfidence showCase />
                {(pendingData?.total ?? 0) > 10 && (
                  <div className="px-4 pb-4">
                    <Pagination page={pendingPage} limit={10} total={pendingData?.total ?? 0} onChange={setPendingPage} />
                  </div>
                )}
              </>
        )}

        {tab === 'aprobados' && (
          approvedLoading
            ? <p className="text-sm text-gray-400 animate-pulse px-4 py-8">Cargando...</p>
            : <>
                <EventTable events={approved} showReviewed showCase />
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
