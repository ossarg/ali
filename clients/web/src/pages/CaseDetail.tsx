import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../api/hooks/useCases';
import { useCaseEvents } from '../api/hooks/useCaseEvents';
import { ArrowLeft, Clock, FileText, User, Activity, Download, Eye, Loader2, AlertCircle, Building2, Gavel } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

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

const CASE_TYPE_LABELS: Record<string, string> = {
  lawsuit:     'Juicio',
  mediation:   'Mediación',
  third_party: 'Administrativo',
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
  const [activeTab, setActiveTab] = useState<'resumen' | 'documentos' | 'borrador' | 'actividad'>('resumen');

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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#e5e7eb] rounded-full transition-colors mt-1 text-[#455362]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-mono text-sm text-[#6b7280] bg-[#f7f8fa] px-2 py-1 rounded border border-[#e5e7eb]">
              {displayId}
            </span>
            {caso.case_type && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#455362]/10 text-[#455362]">
                {CASE_TYPE_LABELS[caso.case_type] ?? caso.case_type}
              </span>
            )}
            {caso.pipeline_stage && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#eb5d2a]/10 text-[#eb5d2a]">
                {PIPELINE_STAGE_LABELS[caso.pipeline_stage] ?? caso.pipeline_stage}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-4">{caso.title}</h1>

          <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-[#455362] bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-sm">
            {caso.incident_date && (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#eb5d2a]" />
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
                  : 'Sin asignar'}
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

            {caso.claim_number && (
              <>
                <div className="w-px h-4 bg-[#e5e7eb]" />
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-[#6b7280]" />
                  <span className="font-medium">Siniestro:</span>
                  <span className="text-[#1a1a1a] font-mono">{caso.claim_number}</span>
                </div>
              </>
            )}
          </div>
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
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-semibold text-[#eb5d2a]">Rachel</span>
                      <span className="text-xs text-[#6b7280]">
                        {format(new Date(event.received_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
                      </span>
                      <span className="text-xs text-gray-400">{Math.round(event.confidence * 100)}% confianza</span>
                      {event.approved && (
                        <span className="text-xs text-green-600 font-medium">✓ Aprobado</span>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
