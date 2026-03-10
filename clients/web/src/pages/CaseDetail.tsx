import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../api/hooks/useCases';
import { useCaseEvents } from '../api/hooks/useCaseEvents';
import { ArrowLeft, Clock, FileText, User, Activity, Download, Eye, Loader2, AlertCircle, Building2, Gavel, Paperclip, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface AttachmentMeta {
  name: string;
  key:  string;
  mime: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

const CASE_TYPE_LABELS: Record<string, string> = {
  lawsuit:     'Juicio',
  mediation:   'Mediación',
  third_party: 'Administrativo',
};

const CASE_TYPE_COLORS: Record<string, string> = {
  lawsuit:     'bg-red-50 text-red-700',
  mediation:   'bg-amber-50 text-amber-700',
  third_party: 'bg-blue-50 text-blue-700',
};

const PIPELINE_STAGE_LABELS: Record<string, string> = {
  ingesta:    'Ingesta',
  extraccion: 'Extracción',
  triage:     'Triage',
  asignado:   'Asignado',
  borrador:   'Borrador',
  completado: 'Completado',
};

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resumen' | 'documentos' | 'borrador' | 'actividad' | 'archivos'>('resumen');
  const [expandedAttachments, setExpandedAttachments] = useState<string | null>(null);

  const { data: caso, isLoading, isError } = useCase(id ?? '');
  const { data: caseEvents = [], isLoading: eventsLoading } = useCaseEvents(id ?? '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#6b7280]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando caso...
      </div>
    );
  }

  if (isError || !caso) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#6b7280] gap-3">
        <AlertCircle className="w-8 h-8 text-[#ef4444]" />
        <p>Caso no encontrado.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#eb5d2a] hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  const displayId = caso.case_number || caso.id.slice(0, 8).toUpperCase();

  return (
    <div className="space-y-6 pb-12">
      {/* Back */}
      <button
        onClick={() => navigate('/casos')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Casos
      </button>

      {/* Header */}
      <div>
        {/* Carátula + labels en la misma línea */}
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {caso.caratula || caso.title}
          </h1>
          {caso.case_type && (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CASE_TYPE_COLORS[caso.case_type] ?? 'bg-gray-100 text-gray-600'}`}>
              {CASE_TYPE_LABELS[caso.case_type] ?? caso.case_type}
            </span>
          )}
        </div>

        {/* Fila resumen: siniestro primero, luego fecha, luego asignado */}
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-[#455362] bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-sm">
          {caso.claim_number && (
            <>
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-[#6b7280]" />
                <span className="font-medium">Siniestro:</span>
                <span className="text-[#1a1a1a] font-mono">{caso.claim_number}</span>
              </div>
              <div className="w-px h-4 bg-[#e5e7eb]" />
            </>
          )}

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6b7280]" />
            <span className="font-medium">Expediente:</span>
            {caso.case_number
              ? <span className="text-[#1a1a1a] font-mono">{caso.case_number}</span>
              : <span className="text-gray-400">—</span>}
          </div>
          <div className="w-px h-4 bg-[#e5e7eb]" />

          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#6b7280]" />
            <span className="font-medium">Póliza:</span>
            {caso.policy
              ? <span className="text-[#1a1a1a] font-mono">{caso.policy}</span>
              : <span className="text-gray-400">—</span>}
          </div>
          <div className="w-px h-4 bg-[#e5e7eb]" />

          {caso.incident_date && (
            <>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6b7280]" />
                <span className="font-medium">Fecha siniestro:</span>
                <span className="text-[#1a1a1a]">{format(new Date(caso.incident_date), 'dd/MM/yyyy')}</span>
              </div>
              <div className="w-px h-4 bg-[#e5e7eb]" />
            </>
          )}

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#6b7280]" />
            <span className="font-medium">Asignado a:</span>
            <span className="text-[#1a1a1a]">
              {caso.assigned_user
                ? `${caso.assigned_user.first_name} ${caso.assigned_user.last_name}`
                : '—'}
            </span>
          </div>

          {caso.defense_firm && (
            <>
              <div className="w-px h-4 bg-[#e5e7eb]" />
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6b7280]" />
                <span className="font-medium">Estudio defensor:</span>
                <span className="text-[#1a1a1a]">{caso.defense_firm.name}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e5e7eb]">
        <nav className="flex gap-8">
          {[
            { id: 'resumen',    label: 'Resumen' },
            { id: 'documentos', label: 'Fichero Digital' },
            { id: 'borrador',   label: 'Borrador de Contestación' },
            { id: 'actividad',  label: 'Trazabilidad' },
            { id: 'archivos',   label: 'Archivos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'pb-4 text-sm font-medium transition-colors relative',
                activeTab === tab.id ? 'text-[#eb5d2a]' : 'text-[#6b7280] hover:text-[#1a1a1a]'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#eb5d2a] rounded-t-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm min-h-[400px]">

        {/* RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Datos del caso</h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                {[
                  { label: 'Carátula',          value: caso.title },
                  { label: 'Nro. siniestro',    value: caso.claim_number },
                  { label: 'Nro. expediente',   value: caso.case_number },
                  { label: 'Póliza',            value: caso.policy },
                  { label: 'Tipo de caso',       value: CASE_TYPE_LABELS[caso.case_type] ?? caso.case_type },
                  { label: 'Tipo de acción',     value: caso.action_type ?? null },
                  { label: 'Tribunal',           value: caso.tribunal },
                  { label: 'Juzgado',            value: caso.court },
                  { label: 'Monto estimado',     value: caso.estimated_amount != null
                      ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(caso.estimated_amount)
                      : null },
                  { label: 'Fecha de apertura', value: caso.opened_at ? format(new Date(caso.opened_at), 'dd/MM/yyyy') : null },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="flex flex-col border-b border-[#e5e7eb] pb-3">
                    <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1">{f.label}</span>
                    <span className="text-base font-medium text-[#1a1a1a]">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {(caso.defense_firm || caso.plaintiff_firm) && (
              <div>
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Estudios intervinientes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {caso.defense_firm && (
                    <div className="flex items-center gap-3 p-4 bg-[#f7f8fa] rounded-lg border border-[#e5e7eb]">
                      <Building2 className="w-5 h-5 text-[#455362] shrink-0" />
                      <div>
                        <p className="text-xs text-[#6b7280] mb-0.5">Estudio defensor</p>
                        <p className="font-medium text-[#1a1a1a]">{caso.defense_firm.name}</p>
                      </div>
                    </div>
                  )}
                  {caso.plaintiff_firm && (
                    <div className="flex items-center gap-3 p-4 bg-[#f7f8fa] rounded-lg border border-[#e5e7eb]">
                      <Building2 className="w-5 h-5 text-[#eb5d2a] shrink-0" />
                      <div>
                        <p className="text-xs text-[#6b7280] mb-0.5">Estudio demandante</p>
                        <p className="font-medium text-[#1a1a1a]">{caso.plaintiff_firm.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTOS */}
        {activeTab === 'documentos' && (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Documentos del caso</h3>
            <div className="text-center py-12 text-[#6b7280]">
              <FileText className="w-12 h-12 mx-auto text-[#e5e7eb] mb-4" />
              <p>El fichero digital estará disponible próximamente.</p>
            </div>
          </div>
        )}

        {/* BORRADOR */}
        {activeTab === 'borrador' && (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Borrador de Contestación</h3>
            <div className="text-center py-12 text-[#6b7280]">
              <FileText className="w-12 h-12 mx-auto text-[#e5e7eb] mb-4" />
              <p>El borrador de contestación aún no ha sido generado.</p>
            </div>
          </div>
        )}

        {/* ACTIVIDAD */}
        {activeTab === 'actividad' && (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Eventos del caso</h3>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12 text-[#6b7280]">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando eventos...
              </div>
            ) : caseEvents.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                <Activity className="w-12 h-12 mx-auto text-[#e5e7eb] mb-4" />
                <p>No hay eventos registrados para este caso.</p>
                <p className="text-sm mt-1 text-gray-400">
                  Los emails clasificados por Rachel aparecerán aquí una vez aprobados.
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-[#e5e7eb] ml-4 space-y-6">
                {caseEvents.map(event => (
                  <div key={event.id} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-[#eb5d2a]" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#6b7280]">
                          {format(new Date(event.received_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
                        </span>
                      </div>
                      {event.reviewed_by_name && (
                        <span className="text-xs text-[#6b7280]">
                          Aprobado por: <span className="font-medium text-[#455362]">{event.reviewed_by_name}</span>
                        </span>
                      )}
                    </div>
                    {event.title && (
                      <p className="text-sm font-medium text-[#1a1a1a] mb-1">{event.title}</p>
                    )}
                    {event.description && (
                      <p className="text-sm text-[#455362] bg-[#f7f8fa] p-3 rounded border border-[#e5e7eb]">
                        {event.description}
                      </p>
                    )}
                    {!event.description && event.subject && (
                      <p className="text-sm text-[#455362] bg-[#f7f8fa] p-3 rounded border border-[#e5e7eb] truncate">
                        {event.subject}
                      </p>
                    )}
                    {/* Adjuntos del evento */}
                    {event.attachments && event.attachments.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => setExpandedAttachments(expandedAttachments === event.id ? null : event.id)}
                          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <Paperclip size={13} />
                          <span>{event.attachments.length} archivo{event.attachments.length > 1 ? 's' : ''} adjunto{event.attachments.length > 1 ? 's' : ''}</span>
                        </button>
                        {expandedAttachments === event.id && (
                          <div className="mt-2 space-y-1.5 pl-1">
                            {event.attachments.map((att: AttachmentMeta) => (
                              <a
                                key={att.key}
                                href={`/api/v1/attachments/${att.key}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-gray-700 hover:text-indigo-700 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-200 transition-all group"
                              >
                                <FileText size={13} className="text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                                <span className="truncate">{att.name}</span>
                                <span className="text-gray-300 ml-auto flex-shrink-0">{formatFileSize(att.size)}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ARCHIVOS */}
        {activeTab === 'archivos' && (() => {
          const allAttachments: (AttachmentMeta & { eventId: string; eventTitle: string; receivedAt: string })[] = caseEvents.flatMap(ev =>
            (ev.attachments ?? []).map((att: AttachmentMeta) => ({
              ...att,
              eventId: ev.id,
              eventTitle: ev.title || ev.subject || ev.mail_id,
              receivedAt: ev.received_at,
            }))
          );

          return (
            <div className="p-8">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Archivos adjuntos</h3>
              {eventsLoading ? (
                <div className="flex items-center justify-center py-12 text-[#6b7280]">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
                </div>
              ) : allAttachments.length === 0 ? (
                <div className="text-center py-12 text-[#6b7280]">
                  <Paperclip className="w-12 h-12 mx-auto text-[#e5e7eb] mb-4" />
                  <p>No hay archivos adjuntos en este caso.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allAttachments.map(att => (
                    <a
                      key={att.key}
                      href={`/api/v1/attachments/${att.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-4 py-3 rounded-xl border border-[#e5e7eb] hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
                        <FileText size={18} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{att.name}</p>
                        <p className="text-xs text-[#6b7280] truncate mt-0.5">{att.eventTitle}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#6b7280]">{formatFileSize(att.size)}</p>
                        <p className="text-xs text-[#9ca3af] mt-0.5">{format(new Date(att.receivedAt), 'dd/MM/yyyy')}</p>
                      </div>
                      <Download size={16} className="text-gray-300 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
