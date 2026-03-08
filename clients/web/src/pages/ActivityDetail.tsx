import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Paperclip, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCaseEvent } from '../api/hooks/useCaseEvents';

const MAIL_TYPE_LABELS: Record<string, string> = {
  '1':  'Sentencia',
  '2':  'Reclamo de pago',
  '3':  'Intimación',
  '4':  'Acuerdo',
  '5':  'Embargo',
  '6':  'Pericia',
  '7':  'Oficio',
  '8':  'Gestión',
  '9':  'Apertura',
  '10': 'Apelación',
  '11': 'Cierre',
};

function formatFileSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-gray-400">{label}</dt>
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

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useCaseEvent(id!);

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

  const typeLabel = MAIL_TYPE_LABELS[String(event.mail_type)] ?? String(event.mail_type);
  const attachments = event.attachments ?? [];

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
      <div>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">
            {event.title || event.subject || 'Sin título'}
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
            {typeLabel}
          </span>
          {event.approved && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">
              Aprobado
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{event.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: body */}
        <div className="lg:col-span-2 space-y-4">
          {/* Body */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Contenido del mail</h2>
            </div>
            {event.body_clean ? (
              <pre className="px-5 py-4 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {event.body_clean}
              </pre>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-400 text-center italic">
                Sin contenido guardado
              </p>
            )}
          </div>

          {/* Attachments */}
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
                      {att.size && (
                        <p className="text-xs text-gray-400">{formatFileSize(att.size)}</p>
                      )}
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

        {/* Right: metadata */}
        <div className="space-y-4">
          {/* Classification */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Clasificación</h2>
            </div>
            <dl className="px-5">
              <InfoRow label="Tipo">
                <span className="font-medium">{typeLabel}</span>
              </InfoRow>
              <InfoRow label="Confianza">
                <ConfidenceBar value={event.confidence} />
              </InfoRow>
              {event.reasoning && (
                <InfoRow label="Razonamiento">
                  <span className="text-gray-600 leading-snug">{event.reasoning}</span>
                </InfoRow>
              )}
            </dl>
          </div>

          {/* Mail metadata */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Datos del mail</h2>
            </div>
            <dl className="px-5">
              {event.subject && (
                <InfoRow label="Asunto">
                  <span className="break-words">{event.subject}</span>
                </InfoRow>
              )}
              <InfoRow label="Recibido">
                {format(new Date(event.received_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </InfoRow>
              <InfoRow label="Mail ID">
                <span className="font-mono text-xs text-gray-500 break-all">{event.mail_id}</span>
              </InfoRow>
            </dl>
          </div>

          {/* Identifiers */}
          {(event.raw_claim_number || event.raw_policy || event.raw_case_number || event.raw_caratula) && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Identificadores</h2>
              </div>
              <dl className="px-5">
                {event.raw_claim_number && (
                  <InfoRow label="Nro. siniestro">
                    <span className="font-mono">{event.raw_claim_number}</span>
                  </InfoRow>
                )}
                {event.raw_policy && (
                  <InfoRow label="Nro. póliza">
                    <span className="font-mono">{event.raw_policy}</span>
                  </InfoRow>
                )}
                {event.raw_case_number && (
                  <InfoRow label="Nro. expediente">
                    <span className="font-mono">{event.raw_case_number}</span>
                  </InfoRow>
                )}
                {event.raw_caratula && (
                  <InfoRow label="Carátula">{event.raw_caratula}</InfoRow>
                )}
              </dl>
            </div>
          )}

          {/* Review */}
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
    </div>
  );
}
