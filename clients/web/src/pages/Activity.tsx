import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { formatMetricTime, formatTableTime } from '../lib/formatTime';
import {
  useApprovedEventsPaginated,
  useCaseEventMetrics,
  usePendingEvents,
  useReviewEvent,
  useUpdateCaseEvent,
  useDeleteCaseEvent,
} from '../api/hooks/useCaseEvents';
import Pagination from '../components/Pagination';
import type { CaseEvent, ReviewCaseEventRequest, UpdateCaseEventRequest } from '../api/schemas/case.schemas';

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

const MAIL_TYPE_VALUES: Record<string, number> = {
  sentencia:    1,
  reclamo_pago: 2,
  intimacion:   3,
  acuerdo:      4,
  embargo:      5,
  pericia:      6,
  oficio:       7,
  gestion:      8,
  apertura:     9,
  apelacion:    10,
  cierre:       11,
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

function IdentifierField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">Revisar clasificación</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Mail info */}
        <div className="text-sm text-gray-600 space-y-2 bg-gray-50 rounded-lg p-3">
          {/* Asunto con botón copiar */}
          {event.subject && (
            <div className="flex items-start gap-2">
              <p className="font-medium text-gray-800 text-xs leading-snug flex-1">{event.subject}</p>
              <button
                onClick={() => navigator.clipboard.writeText(event.subject ?? '')}
                title="Copiar asunto"
                className="flex-shrink-0 text-gray-400 hover:text-indigo-600 transition-colors p-0.5 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Recibido: <span className="font-medium text-gray-500">{format(new Date(event.received_at), 'dd/MM/yyyy HH:mm')}</span>
          </p>

          <p>
            <span className="font-medium">Rachel clasificó:</span>{' '}
            <span className="font-semibold text-indigo-600">
              {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
            </span>
            {' '}({Math.round(event.confidence * 100)}% confianza)
          </p>
          {event.reasoning && <p className="text-xs text-gray-400 italic">{event.reasoning}</p>}

          {/* Título y descripción generados */}
          {(event.title || event.description) && (
            <div className="border-t border-gray-200 pt-2 mt-1 space-y-1">
              {event.title && (
                <p className="text-xs font-semibold text-gray-700">{event.title}</p>
              )}
              {event.description && (
                <p className="text-xs text-gray-500 leading-relaxed">{event.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Tipo */}
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

        {/* Identificadores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identificadores
            <span className="text-xs text-gray-400 font-normal ml-1">— corregí lo que Rachel haya extraído mal o dejado vacío</span>
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 w-28 shrink-0">
                Nro. siniestro <span className="text-red-500">*</span>
              </span>
              <input
                value={claimNumber}
                onChange={e => setClaimNumber(e.target.value)}
                placeholder="Ej: 123456"
                className={`flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 ${
                  claimNumber.trim() === ''
                    ? 'border-red-300 bg-red-50 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-indigo-400'
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentario {isChanging && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            placeholder={isChanging ? 'Explicá por qué cambiás la clasificación...' : 'Opcional — dejá una nota para Rachel'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {reviewEvent.error && (
          <p className="text-sm text-red-500">{(reviewEvent.error as Error).message ?? 'Error al guardar'}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reviewEvent.isPending ? 'Guardando...' : isChanging ? 'Corregir' : 'Aprobar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  event: CaseEvent;
  onClose: () => void;
}

function EditModal({ event, onClose }: EditModalProps) {
  const [mailType, setMailType]     = useState<string>(event.mail_type);
  const [title, setTitle]           = useState(event.title ?? '');
  const [description, setDescription] = useState(event.description ?? '');
  const [receivedAt, setReceivedAt] = useState(
    event.received_at ? format(new Date(event.received_at), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const updateEvent = useUpdateCaseEvent();

  const handleSave = () => {
    const req: UpdateCaseEventRequest = {};
    const typeNum = MAIL_TYPE_VALUES[mailType];
    if (typeNum && typeNum !== MAIL_TYPE_VALUES[event.mail_type]) req.mail_type = typeNum;
    if (title !== (event.title ?? ''))             req.title       = title;
    if (description !== (event.description ?? '')) req.description = description;
    if (receivedAt) req.received_at = new Date(receivedAt).toISOString();

    updateEvent.mutate({ id: event.id, req }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Editar evento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
            <select
              value={mailType}
              onChange={e => setMailType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(MAIL_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de recepción</label>
            <input
              type="datetime-local"
              value={receivedAt}
              onChange={e => setReceivedAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {updateEvent.error && (
          <p className="text-sm text-red-500">Error al guardar</p>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={updateEvent.isPending}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {updateEvent.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kebab menu ───────────────────────────────────────────────────────────────

interface KebabMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onReview?: () => void;
}

function KebabMenu({ onEdit, onDelete, onReview }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 text-sm">
          {onReview && (
            <button
              onClick={() => { setOpen(false); onReview(); }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-indigo-700 font-medium"
            >
              Revisar
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { setOpen(false); onDelete(); }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Event table ──────────────────────────────────────────────────────────────

interface EventTableProps {
  events: CaseEvent[];
  showActions?: boolean;
  onReview?: (event: CaseEvent) => void;
  onEdit?: (event: CaseEvent) => void;
  onDelete?: (event: CaseEvent) => void;
}

function EventTable({ events, showActions, onReview, onEdit, onDelete }: EventTableProps) {
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
          <col /><col /><col />
          {(showActions || onEdit || onDelete) && <col style={{ width: '44px' }} />}
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="pb-3 pr-8">Asunto / Mail ID</th>
            <th className="pb-3 pr-8">Tipo</th>
            {showActions && <th className="pb-3 pr-8">Confianza</th>}
            <th className="pb-3 pr-8">Recibido</th>
            {!showActions && <th className="pb-3 pr-8">Revisado</th>}
            {(showActions || onEdit || onDelete) && <th className="pb-3" />}
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
              {(showActions || onEdit || onDelete) && (
                <td className="py-3 text-right">
                  <KebabMenu
                    onReview={showActions && onReview ? () => onReview(event) : undefined}
                    onEdit={onEdit ? () => onEdit(event) : undefined}
                    onDelete={onDelete ? () => onDelete(event) : undefined}
                  />
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
  const [pendingOpen, setPendingOpen]   = useState(false);
  const [reviewTarget, setReviewTarget] = useState<CaseEvent | null>(null);
  const [editTarget, setEditTarget]     = useState<CaseEvent | null>(null);
  const [approvedPage, setApprovedPage] = useState(1);
  const deleteCaseEvent = useDeleteCaseEvent();

  const { data: metrics, isLoading: metricsLoading } = useCaseEventMetrics();
  const { data: approvedData, isLoading: approvedLoading } = useApprovedEventsPaginated(approvedPage, 10);
  const approved = approvedData?.data ?? [];
  const { data: pending  = [], isLoading: pendingLoading  } = usePendingEvents();

  const lastSeen = metrics?.last_event_at
    ? formatMetricTime(metrics.last_event_at)
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
        <div className="bg-white rounded-xl border border-amber-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Pendientes de revisión</h2>
          {pendingLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Cargando...</p>
          ) : (
            <EventTable
              events={pending}
              showActions
              onReview={e => setReviewTarget(e)}
              onEdit={e => setEditTarget(e)}
              onDelete={e => { if (window.confirm('¿Eliminar este evento?')) deleteCaseEvent.mutate(e.id); }}
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
          <>
            <EventTable
              events={approved}
              onEdit={e => setEditTarget(e)}
              onDelete={e => { if (window.confirm('Este evento está aprobado. ¿Eliminarlo de todas formas? (se marcará como eliminado)')) deleteCaseEvent.mutate(e.id); }}
            />
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

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          event={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
