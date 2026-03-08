import { useParams, useNavigate } from 'react-router-dom';
import { useCaseEvents } from '../api/hooks/useCaseEvents';
import { MOCK_CASES, MOCK_LAWYERS } from '../data/mockData';
import { ArrowLeft, Clock, AlertTriangle, FileText, CheckCircle2, User, Activity, Download, Eye } from 'lucide-react';
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
};

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resumen' | 'documentos' | 'borrador' | 'actividad' | 'asignacion'>('resumen');

  const { data: caseEvents = [], isLoading: eventsLoading } = useCaseEvents(id ?? '');

  const caseData = MOCK_CASES.find(c => c.id === id);

  if (!caseData) {
    return <div className="p-8 text-center text-[#6b7280]">Caso no encontrado.</div>;
  }

  const assignedLawyer = caseData.lawyerId ? MOCK_LAWYERS.find(l => l.id === caseData.lawyerId) : null;
  const suggestedLawyer = caseData.assignment.suggestedLawyerId ? MOCK_LAWYERS.find(l => l.id === caseData.assignment.suggestedLawyerId) : null;

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
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-[#6b7280] bg-[#f7f8fa] px-2 py-1 rounded border border-[#e5e7eb]">{caseData.id}</span>
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              caseData.priority === 'Alta' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 
              caseData.priority === 'Media' ? 'bg-[#eab308]/10 text-[#eab308]' : 
              'bg-[#22c55e]/10 text-[#22c55e]'
            )}>
              Prioridad {caseData.priority}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#455362]/10 text-[#455362]">
              Etapa: {caseData.stage}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-4">{caseData.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-[#455362] bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#eb5d2a]" />
              <span className="font-medium">Vencimiento:</span>
              <span className={cn(
                "font-semibold",
                caseData.priority === 'Alta' ? 'text-[#ef4444]' : 'text-[#1a1a1a]'
              )}>
                {format(new Date(caseData.deadline), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
            <div className="w-px h-4 bg-[#e5e7eb]"></div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#6b7280]" />
              <span className="font-medium">Asignado a:</span>
              <span className="text-[#1a1a1a]">{assignedLawyer ? assignedLawyer.name : 'Sin asignar'}</span>
            </div>
            <div className="w-px h-4 bg-[#e5e7eb]"></div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6b7280]" />
              <span className="font-medium">Última act:</span>
              <span className="text-[#1a1a1a]">{format(new Date(caseData.lastActivity), 'dd/MM/yyyy HH:mm')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e5e7eb]">
        <nav className="flex gap-8">
          {[
            { id: 'resumen', label: 'Resumen y Extracción' },
            { id: 'documentos', label: 'Fichero Digital' },
            { id: 'borrador', label: 'Borrador de Contestación' },
            { id: 'actividad', label: 'Trazabilidad' },
            { id: 'asignacion', label: 'Asignación' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "pb-4 text-sm font-medium transition-colors relative",
                activeTab === tab.id ? "text-[#eb5d2a]" : "text-[#6b7280] hover:text-[#1a1a1a]"
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
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm min-h-[500px]">
        
        {/* RESUMEN TAB */}
        {activeTab === 'resumen' && (
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Resumen Ejecutivo (Triage)</h3>
              <div className="bg-[#f7f8fa] p-5 rounded-md border border-[#e5e7eb] text-[#455362] leading-relaxed">
                {caseData.dataExtraction.summary || 'No hay resumen disponible para este caso.'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Datos Extraídos</h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(caseData.dataExtraction.fields).map(([key, data]) => (
                  <div key={key} className="flex flex-col border-b border-[#e5e7eb] pb-3">
                    <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1">{key}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-[#1a1a1a]">{data.value}</span>
                      <div className="flex items-center gap-1.5" title={`Confianza: ${data.confidence}`}>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          data.confidence === 'Alta' ? 'bg-[#22c55e]' : 
                          data.confidence === 'Media' ? 'bg-[#eab308]' : 'bg-[#ef4444]'
                        )} />
                        <span className="text-xs text-[#6b7280]">{data.confidence}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(caseData.dataExtraction.fields).length === 0 && (
                  <div className="col-span-2 text-[#6b7280] italic">Aún no se han extraído datos estructurados.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTOS TAB */}
        {activeTab === 'documentos' && (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Documentos del Caso</h3>
            {caseData.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-[#e5e7eb] rounded-md hover:border-[#eb5d2a]/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f7f8fa] rounded flex items-center justify-center text-[#eb5d2a]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">{doc.name}</p>
                        <p className="text-xs text-[#6b7280]">{doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-[#455362] hover:bg-[#f7f8fa] rounded transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#455362] hover:bg-[#f7f8fa] rounded transition-colors" title="Descargar">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#6b7280]">
                <FileText className="w-12 h-12 mx-auto text-[#e5e7eb] mb-4" />
                <p>No hay documentos en el fichero digital todavía.</p>
              </div>
            )}
          </div>
        )}

        {/* BORRADOR TAB */}
        {activeTab === 'borrador' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1a1a1a]">Borrador de Contestación</h3>
              {caseData.draft?.requiresReview && (
                <span className="flex items-center gap-2 bg-[#eab308]/10 text-[#eab308] px-3 py-1.5 rounded-md text-sm font-medium border border-[#eab308]/20">
                  <AlertTriangle className="w-4 h-4" />
                  Requiere revisión humana
                </span>
              )}
            </div>
            
            {caseData.draft ? (
              <div className="bg-[#f7f8fa] p-8 rounded-lg border border-[#e5e7eb] font-serif text-[#1a1a1a] leading-relaxed max-w-4xl mx-auto shadow-inner">
                <div dangerouslySetInnerHTML={{ __html: caseData.draft.content.replace(/\n/g, '<br/>') }} />
              </div>
            ) : (
              <div className="text-center py-12 text-[#6b7280]">
                <p>El borrador de contestación aún no ha sido generado.</p>
              </div>
            )}
          </div>
        )}

        {/* ACTIVIDAD TAB */}
        {activeTab === 'actividad' && (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Eventos del caso</h3>
            {eventsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : caseEvents.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                <p>No hay eventos registrados para este caso.</p>
                <p className="text-sm mt-1 text-gray-400">Los emails clasificados por Rachel aparecerán aquí una vez aprobados.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-[#e5e7eb] ml-4 space-y-6">
                {caseEvents.map(event => (
                  <div key={event.id} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-[#eb5d2a]" />
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-semibold text-[#eb5d2a]">Rachel</span>
                      <span className="text-xs text-[#6b7280]">{format(new Date(event.received_at), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {MAIL_TYPE_LABELS[event.mail_type] ?? event.mail_type}
                      </span>
                      <span className="text-xs text-gray-400">{Math.round(event.confidence * 100)}% confianza</span>
                      {event.approved && <span className="text-xs text-green-600 font-medium">✓ Aprobado</span>}
                    </div>
                    {event.subject && (
                      <p className="text-sm text-[#455362] bg-[#f7f8fa] p-3 rounded border border-[#e5e7eb] truncate">
                        {event.subject}
                      </p>
                    )}
                    {event.reasoning && (
                      <p className="text-xs text-gray-400 italic mt-1">{event.reasoning}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASIGNACION TAB */}
        {activeTab === 'asignacion' && (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Asignación de Abogado</h3>
            
            <div className="max-w-2xl bg-[#f7f8fa] rounded-lg border border-[#e5e7eb] p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-[#6b7280] uppercase tracking-wider">Sugerencia del Sistema</span>
                <span className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  caseData.assignment.status === 'Aprobada' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 
                  caseData.assignment.status === 'Pendiente' ? 'bg-[#eab308]/10 text-[#eab308]' : 
                  'bg-[#455362]/10 text-[#455362]'
                )}>
                  {caseData.assignment.status}
                </span>
              </div>

              {suggestedLawyer ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-md border border-[#e5e7eb]">
                    <div className="w-12 h-12 bg-[#455362] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {suggestedLawyer.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a]">{suggestedLawyer.name}</h4>
                      <p className="text-sm text-[#6b7280]">{suggestedLawyer.specialty} • {suggestedLawyer.seniority}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-[#1a1a1a] mb-2">Razonamiento del Agente Coordinador:</h5>
                    <p className="text-sm text-[#455362] leading-relaxed bg-white p-4 rounded-md border border-[#e5e7eb]">
                      {caseData.assignment.reason}
                    </p>
                  </div>

                  {caseData.assignment.status === 'Pendiente' && (
                    <div className="flex gap-4 pt-4 border-t border-[#e5e7eb]">
                      <button className="flex-1 bg-[#eb5d2a] text-white py-2 rounded-md font-medium hover:bg-[#d45325] transition-colors">
                        Aprobar Asignación
                      </button>
                      <button className="flex-1 bg-white border border-[#e5e7eb] text-[#455362] py-2 rounded-md font-medium hover:bg-[#f7f8fa] transition-colors">
                        Modificar / Reasignar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6b7280]">
                  El sistema aún no ha generado una sugerencia de asignación.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
