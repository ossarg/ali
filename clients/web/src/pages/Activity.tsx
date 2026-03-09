import { useState } from 'react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import { formatMetricTime, formatTableTime } from '../lib/formatTime';
import {
  useApprovedEventsPaginated,
  useCaseEventMetrics,
  usePendingEvents,
  useReviewEvent,
} from '../api/hooks/useCaseEvents';
import Pagination from '../components/Pagination';
import type { CaseEvent, ReviewCaseEventRequest } from '../api/schemas/case.schemas';

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
};

const MAIL_TYPE_VALUES: Record<string, number> = {
  sentencia:    1,
  reclamo_pago: 2,
  intimacion:   3,
  acuerdo:      4,
  embargo:      5,
  pericia:      6,
  oficio:       7,
  gestion:      8,
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

interface EventTableProps {
  events: CaseEvent[];
  showActions?: boolean;
  onReview?: (event: CaseEvent) => void;
}

function EventTable({ events, showActions, onReview }: EventTableProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        No hay eventos para mostrar.
      </p>
    );
  }

  return (
    <div>
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col style={{ width: '50%' }} />
          {showActions
            ? <><col /><col /><col /><col style={{ width: '80px' }} /></>
            : <><col /><col /><col /></>
          }
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="pb-3 pr-8">Asunto / Mail ID</th>
            <th className="pb-3 pr-8">Tipo</th>
            {showActions && <th className="pb-3 pr-8">Confianza</th>}
            <th className="pb-3 pr-8">Recibido</th>
            {!showActions && <th className="pb-3 pr-8">Revisado</th>}
            {showActions && <th className="pb-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {events.map(event => (
            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-8 min-w-0 max-w-xs">
                <div className="font-medium text-gray-800 truncate">
                  {event.title || event.subject || event.mail_id}
                </div>
                {event.description && (
                  <div className="text-xs text-gray-400 truncate mt-0.5">{event.description}</div>
                )}
                {!event.description && event.subject && (
                  <div className="text-xs text-gray-400 truncate">{event.mail_id}</div>
                )}
              </td>
              <td className="py-3 pr-8">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
                </span>
              </td>
              {showActions && (
                <td className="py-3 pr-8">
                  <ConfidenceBar value={event.confidence} />
                </td>
              )}
              <td className="py-3 pr-8 text-gray-500 whitespace-nowrap">
                {formatTableTime(event.received_at)}
              </td>
              {!showActions && (
                <td className="py-3 pr-8 text-gray-500 text-xs">
                  {event.reviewed_at ? formatTableTime(event.reviewed_at) : '—'}
                </td>
              )}
              {showActions && (
                <td className="py-3 text-right">
                  <button
                    onClick={() => onReview?.(event)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Revisar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Activity() {
  const [pendingOpen, setPendingOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<CaseEvent | null>(null);
  const [approvedPage, setApprovedPage] = useState(1);

  const { data: metrics, isLoading: metricsLoading } = useCaseEventMetrics();
  const { data: approvedData, isLoading: approvedLoading } = useApprovedEventsPaginated(approvedPage, 10);
  const approved = approvedData?.data ?? [];
  const { data: pending  = [], isLoading: pendingLoading  } = usePendingEvents();

  const lastSeen = metrics?.last_event_at
    ? formatMetricTime(metrics.last_event_at)
    : null;

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
            <MetricCard label="Total emails"      value={metrics?.total     ?? 0} />
            <MetricCard label="Aprobados"          value={metrics?.approved  ?? 0} />
            <MetricCard label="Pendientes"         value={metrics?.pending   ?? 0} />
            <MetricCard
              label="Último evento"
              value={lastSeen ? lastSeen.time : '—'}
              sub={lastSeen ? lastSeen.label : undefined}
            />
          </>
        )}
      </div>

      {/* Pending alert */}
      {(metrics?.pending ?? 0) > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 text-xl">⚠️</span>
            <div>
              <p className="font-medium text-amber-800">
                {metrics!.pending} {metrics!.pending === 1 ? 'clasificación pendiente' : 'clasificaciones pendientes'} de revisión
              </p>
              <p className="text-sm text-amber-600">Rachel procesó emails que aún no fueron aprobados.</p>
            </div>
          </div>
          <button
            onClick={() => setPendingOpen(o => !o)}
            className="px-4 py-2 text-sm rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
          >
            {pendingOpen ? 'Cerrar' : 'Revisar'}
          </button>
        </div>
      )}

      {/* Pending table (collapsible) */}
      {pendingOpen && (
        <div className="bg-[var(--color-surface-card)] rounded-xl border border-amber-200 p-5 space-y-3">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Pendientes de revisión</h2>
          {pendingLoading ? (
            <p className="text-sm text-[var(--color-text-tertiary)] animate-pulse">Cargando...</p>
          ) : (
            <EventTable
              events={pending}
              showActions
              onReview={e => setReviewTarget(e)}
            />
          )}
        </div>
      )}

      {/* Approved history */}
      <div className="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border-dim)] p-5 space-y-3">
        <h2 className="font-semibold text-[var(--color-text-primary)]">Historial de clasificaciones aprobadas</h2>
        {approvedLoading ? (
          <p className="text-sm text-[var(--color-text-tertiary)] animate-pulse">Cargando...</p>
        ) : approved.length === 0 ? (
          <p className="text-sm text-[var(--color-text-tertiary)] py-6 text-center">
            Rachel está al día — no hay clasificaciones aprobadas todavía.
          </p>
        ) : (
          <>
            <EventTable events={approved} />
            <Pagination page={approvedPage} limit={10} total={approvedData?.total ?? 0} onChange={setApprovedPage} />
          </>
        )}
      </div>

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          event={reviewTarget}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}
