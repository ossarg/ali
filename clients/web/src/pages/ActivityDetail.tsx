import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Paperclip, Download, MoreVertical, FileText, CreditCard, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useCaseEvent,
  useReviewEvent,
  useUpdateCaseEvent,
  useDeleteCaseEvent,
} from '../api/hooks/useCaseEvents';
import type { CaseEvent, ReviewCaseEventRequest, UpdateCaseEventRequest } from '../api/schemas/case.schemas';

// ─── Constants ────────────────────────────────────────────────────────────────

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
  sentencia: 1, reclamo_pago: 2, intimacion: 3, acuerdo: 4,
  embargo: 5, pericia: 6, oficio: 7, gestion: 8,
  apertura: 9, apelacion: 10, cierre: 11,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <dt className="w-36 shrink-0 text-sm text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-900 flex-1">{children}</dd>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round((value ?? 0) * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{pct}%</span>
    </div>
  );
}

// ─── Identifier field ─────────────────────────────────────────────────────────

function IdentifierField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
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

// ─── Review modal ─────────────────────────────────────────────────────────────

function ReviewModal({ event, onClose }: { event: CaseEvent; onClose: () => void }) {
  const [selectedType, setSelectedType] = useState<string>(event.mail_type);
  const [comment,      setComment]      = useState('');
  const [claimNumber,  setClaimNumber]  = useState(event.raw_claim_number ?? '');
  const [policy,       setPolicy]       = useState(event.raw_policy ?? '');
  const [caseNumber,   setCaseNumber]   = useState(event.raw_case_number ?? '');
  const [caratula,     setCaratula]     = useState(event.raw_caratula ?? '');
  const reviewEvent = useReviewEvent();

  const isChanging = selectedType !== event.mail_type;
  const canSubmit  = claimNumber.trim() !== '' &&
                     (!isChanging || comment.trim() !== '') &&
                     !reviewEvent.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const req: ReviewCaseEventRequest = {
      claim_number:   claimNumber.trim(),
      review_comment: comment,
      ...(isChanging && { mail_type: MAIL_TYPE_VALUES[selectedType] }),
      ...(policy     && { raw_policy: policy }),
      ...(caseNumber && { raw_case_number: caseNumber }),
      ...(caratula   && { raw_caratula: caratula }),
    };
    reviewEvent.mutate({ id: event.id, req }, { onSuccess: onClose });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Revisar clasificación</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex divide-x divide-gray-100 min-h-0">
          {/* LEFT — contexto */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto text-sm text-gray-600">
            {event.subject && (
              <div className="flex items-start gap-2">
                <p className="font-medium text-gray-800 text-xs leading-snug flex-1">{event.subject}</p>
                <button
                  onClick={() => {
                    const text = event.subject ?? '';
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(text).catch(() => {
                        const el = document.createElement('textarea');
                        el.value = text; document.body.appendChild(el);
                        el.select(); document.execCommand('copy');
                        document.body.removeChild(el);
                      });
                    } else {
                      const el = document.createElement('textarea');
                      el.value = text; document.body.appendChild(el);
                      el.select(); document.execCommand('copy');
                      document.body.removeChild(el);
                    }
                  }}
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
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs">
                <span className="font-medium">Rachel clasificó:</span>{' '}
                <span className="font-semibold text-indigo-600">
                  {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
                </span>
                {' '}({Math.round(event.confidence * 100)}% confianza)
              </p>
              {event.reasoning && (
                <p className="text-xs text-gray-400 italic">{event.reasoning}</p>
              )}
            </div>
            {(event.title || event.description) && (
              <div className="space-y-2">
                {event.title && <p className="text-sm font-semibold text-gray-800">{event.title}</p>}
                {event.description && <p className="text-xs text-gray-500 leading-relaxed">{event.description}</p>}
              </div>
            )}
          </div>

          {/* RIGHT — acciones */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identificadores
                <span className="text-xs text-gray-400 font-normal ml-1">— corregí lo que Rachel haya extraído mal</span>
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
                <IdentifierField label="Póliza"          value={policy}     onChange={setPolicy}     />
                <IdentifierField label="Nro. expediente" value={caseNumber} onChange={setCaseNumber} />
                <IdentifierField label="Carátula"        value={caratula}   onChange={setCaratula}   />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario {isChanging && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder={isChanging ? 'Explicá por qué cambiás la clasificación...' : 'Opcional'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {reviewEvent.error && (
              <p className="text-sm text-red-500">{(reviewEvent.error as Error).message ?? 'Error al guardar'}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 justify-end">
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
    </div>,
    document.body
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ event, onClose }: { event: CaseEvent; onClose: () => void }) {
  const [mailType,     setMailType]     = useState<string>(event.mail_type);
  const [title,        setTitle]        = useState(event.title ?? '');
  const [description,  setDescription]  = useState(event.description ?? '');
  const [receivedAt,   setReceivedAt]   = useState(
    event.received_at ? format(new Date(event.received_at), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const updateEvent = useUpdateCaseEvent();

  const handleSave = () => {
    const req: UpdateCaseEventRequest = {};
    const typeNum = MAIL_TYPE_VALUES[mailType];
    if (typeNum && typeNum !== MAIL_TYPE_VALUES[event.mail_type]) req.mail_type = typeNum;
    if (title       !== (event.title       ?? '')) req.title       = title;
    if (description !== (event.description ?? '')) req.description = description;
    if (receivedAt) req.received_at = new Date(receivedAt).toISOString();
    updateEvent.mutate({ id: event.id, req }, { onSuccess: onClose });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Editar evento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
            <select value={mailType} onChange={e => setMailType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {Object.entries(MAIL_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de recepción</label>
            <input type="datetime-local" value={receivedAt} onChange={e => setReceivedAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        {updateEvent.error && <p className="text-sm text-red-500">Error al guardar</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={updateEvent.isPending}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
            {updateEvent.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Options menu (⋮) ─────────────────────────────────────────────────────────

function OptionsMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
        className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 text-sm">
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
          >
            Editar
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useCaseEvent(id!);
  const deleteEvent = useDeleteCaseEvent();

  const [showReview, setShowReview] = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando evento...
      </div>
    );
  }
  if (isError || !event) {
    return (
      <div className="flex items-center justify-center py-24 text-red-500 gap-2">
        <AlertCircle className="w-5 h-5" /> No se encontró el evento.
      </div>
    );
  }

  const isPending  = !event.approved;
  const typeLabel  = MAIL_TYPE_LABELS[String(event.mail_type)] ?? String(event.mail_type);
  const attachments = event.attachments ?? [];

  const handleDelete = () => {
    const msg = event.approved
      ? 'Este evento está aprobado. ¿Eliminarlo de todas formas? (se marcará como eliminado)'
      : '¿Eliminar este evento? Esta acción no se puede deshacer.';
    if (window.confirm(msg)) {
      deleteEvent.mutate(event.id, { onSuccess: () => navigate('/actividad') });
    }
  };

  const pct = Math.round((event.confidence ?? 0) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Back */}
      <button
        onClick={() => navigate('/actividad')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Actividad
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {event.title || event.subject || 'Sin título'}
            </h1>
            {event.approved && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 shrink-0">
                Aprobado
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isPending && (
            <button
              onClick={() => setShowReview(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Revisar
            </button>
          )}
          <OptionsMenu
            onEdit={() => setShowEdit(true)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Fila resumen */}
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Siniestro:</span>
          <span className="text-gray-900">{event.raw_claim_number || '—'}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Póliza:</span>
          <span className="text-gray-900">{event.raw_policy || '—'}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Expediente:</span>
          <span className="text-gray-900">{event.raw_case_number || '—'}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Confianza:</span>
          <span className="text-gray-900">{pct}%</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Recibido:</span>
          <span className="text-gray-900">{format(new Date(event.received_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 min-h-0">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Contenido del mail</h2>
            </div>
            {event.body_clean ? (
              <pre className="px-5 py-4 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed flex-1 overflow-y-auto min-h-0">
                {event.body_clean}
              </pre>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-400 text-center italic">Sin contenido guardado</p>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">
                  Archivos adjuntos ({attachments.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-gray-800">{att.name}</p>
                      {att.size && <p className="text-xs text-gray-400">{formatFileSize(att.size)}</p>}
                    </div>
                    <a
                      href={`/api/v1/attachments/${att.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Clasificación (unifica tipo + asunto) */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Clasificación</h2>
            </div>
            <dl className="px-5">
              <InfoRow label="Tipo">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {typeLabel}
                </span>
              </InfoRow>
              {event.subject && (
                <InfoRow label="Asunto"><span className="break-words text-sm">{event.subject}</span></InfoRow>
              )}
              {event.reasoning && (
                <InfoRow label="Razonamiento">
                  <span className="text-gray-500 italic leading-snug text-xs">{event.reasoning}</span>
                </InfoRow>
              )}
            </dl>
          </div>

          {/* Revisión */}
          {event.approved && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Revisión</h2>
              </div>
              <dl className="px-5">
                {event.reviewed_by_name && (
                  <InfoRow label="Aprobado por">{event.reviewed_by_name}</InfoRow>
                )}
                {event.reviewed_at && (
                  <InfoRow label="Fecha">
                    {format(new Date(event.reviewed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </InfoRow>
                )}
                {event.review_comment && (
                  <InfoRow label="Comentario">
                    <span className="text-gray-600">{event.review_comment}</span>
                  </InfoRow>
                )}
                {event.original_mail_type && event.original_mail_type !== String(event.mail_type) && (
                  <InfoRow label="Tipo original">
                    <span className="text-gray-500 line-through">
                      {MAIL_TYPE_LABELS[event.original_mail_type] ?? event.original_mail_type}
                    </span>
                    {' → '}
                    <span>{typeLabel}</span>
                  </InfoRow>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showReview && <ReviewModal event={event} onClose={() => setShowReview(false)} />}
      {showEdit   && <EditModal   event={event} onClose={() => setShowEdit(false)}   />}
    </div>
  );
}
