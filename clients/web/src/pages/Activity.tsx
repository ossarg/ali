import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useApprovedEvents,
  useCaseEventMetrics,
  usePendingEvents,
  useReviewEvent,
} from '../api/hooks/useCaseEvents';
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
};

const MAIL_TYPE_VALUES: Record<string, number> = {
  sentencia:    1,
  reclamo_pago: 2,
  intimacion:   3,
  acuerdo:      4,
  embargo:      5,
  pericia:      6,
  oficio:       7,
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

// ─── Review Modal ─────────────────────────────────────────────────────────────

interface ReviewModalProps {
  event: CaseEvent;
  onClose: () => void;
}

function ReviewModal({ event, onClose }: ReviewModalProps) {
  const [selectedType, setSelectedType] = useState<string>(event.mail_type);
  const [comment, setComment]           = useState('');
  const reviewEvent = useReviewEvent();
  const isChanging  = selectedType !== event.mail_type;

  const handleSubmit = () => {
    const req: ReviewCaseEventRequest = { review_comment: comment };
    if (isChanging) {
      req.mail_type = MAIL_TYPE_VALUES[selectedType];
    }
    reviewEvent.mutate(
      { id: event.id, req },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">Revisar clasificación</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Mail ID:</span> {event.mail_id}</p>
          {event.subject && <p><span className="font-medium">Asunto:</span> {event.subject}</p>}
          <p>
            <span className="font-medium">Rachel clasificó como:</span>{' '}
            <span className="font-semibold text-indigo-600">
              {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
            </span>
            {' '}({Math.round(event.confidence * 100)}% confianza)
          </p>
          {event.reasoning && (
            <p className="text-xs text-gray-400 italic">{event.reasoning}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo correcto</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.entries(MAIL_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentario {isChanging && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder={isChanging ? 'Explicá por qué cambiás la clasificación...' : 'Opcional — dejá una nota para Rachel'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {reviewEvent.error && (
          <p className="text-sm text-red-500">
            {(reviewEvent.error as Error).message ?? 'Error al guardar'}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={reviewEvent.isPending || (isChanging && !comment.trim())}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="pb-3 pr-4">Asunto / Mail ID</th>
            <th className="pb-3 pr-4">Tipo</th>
            <th className="pb-3 pr-4">Confianza</th>
            <th className="pb-3 pr-4">Recibido</th>
            {!showActions && <th className="pb-3 pr-4">Revisado por</th>}
            {showActions && <th className="pb-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {events.map(event => (
            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4">
                <div className="font-medium text-gray-800 truncate max-w-[200px]">
                  {event.subject || event.mail_id}
                </div>
                {event.subject && (
                  <div className="text-xs text-gray-400 truncate max-w-[200px]">{event.mail_id}</div>
                )}
              </td>
              <td className="py-3 pr-4">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
                </span>
                {event.original_mail_type && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    antes: {MAIL_TYPE_LABELS[event.original_mail_type] ?? event.original_mail_type}
                  </div>
                )}
              </td>
              <td className="py-3 pr-4">
                <ConfidenceBar value={event.confidence} />
              </td>
              <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                {formatDistanceToNow(new Date(event.received_at), { locale: es, addSuffix: true })}
              </td>
              {!showActions && (
                <td className="py-3 pr-4 text-gray-500 text-xs">
                  {event.reviewed_at
                    ? formatDistanceToNow(new Date(event.reviewed_at), { locale: es, addSuffix: true })
                    : '—'}
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

  const { data: metrics, isLoading: metricsLoading } = useCaseEventMetrics();
  const { data: approved = [], isLoading: approvedLoading } = useApprovedEvents();
  const { data: pending  = [], isLoading: pendingLoading  } = usePendingEvents();

  const lastSeen = metrics?.last_event_at
    ? formatDistanceToNow(new Date(metrics.last_event_at), { locale: es, addSuffix: true })
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Actividad</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
          ))
        ) : (
          <>
            <MetricCard label="Total emails"      value={metrics?.total     ?? 0} />
            <MetricCard label="Aprobados"          value={metrics?.approved  ?? 0} />
            <MetricCard label="Pendientes"         value={metrics?.pending   ?? 0} />
            <MetricCard
              label="Último evento"
              value={lastSeen ?? '—'}
              sub={metrics?.last_event_at ? new Date(metrics.last_event_at).toLocaleDateString('es-AR') : undefined}
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
        <div className="bg-white rounded-xl border border-amber-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Pendientes de revisión</h2>
          {pendingLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Cargando...</p>
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
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Historial de clasificaciones aprobadas</h2>
        {approvedLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">Cargando...</p>
        ) : approved.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Rachel está al día — no hay clasificaciones aprobadas todavía.
          </p>
        ) : (
          <EventTable events={approved} />
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
