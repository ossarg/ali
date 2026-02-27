import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_AGENTS } from '../data/mockData';
import { ArrowLeft, Activity, CheckCircle2, AlertTriangle, AlertCircle, Clock, BarChart3, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const agent = MOCK_AGENTS.find(a => a.id === id);

  if (!agent) {
    return <div className="p-8 text-center text-[#6b7280]">Agente no encontrado.</div>;
  }

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
            <h1 className="text-2xl font-semibold text-[#1a1a1a]">{agent.name}</h1>
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              agent.status === 'Activo' ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20' : 
              agent.status === 'En espera' ? 'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20' : 
              'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
            )}>
              <div className={cn("w-2 h-2 rounded-full", agent.status === 'Activo' ? 'bg-[#22c55e] animate-pulse' : agent.status === 'En espera' ? 'bg-[#eab308]' : 'bg-[#ef4444]')} />
              {agent.status}
            </div>
          </div>
          <p className="text-[#6b7280]">{agent.description}</p>
        </div>
      </div>

      {id === 'a0' && (
        <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Mapa del Sistema</h3>
          <div className="flex items-center justify-between px-8">
            {['Ingesta', 'Extracción', 'Triage', 'Fichero', 'Borrador'].map((step, i, arr) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#f7f8fa] border-2 border-[#eb5d2a] flex items-center justify-center mb-3 shadow-sm relative">
                    <Activity className="w-6 h-6 text-[#eb5d2a]" />
                    {i === 2 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#22c55e] rounded-full animate-pulse border-2 border-white"></span>}
                  </div>
                  <span className="text-sm font-medium text-[#455362]">{step}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-24 h-0.5 bg-[#e5e7eb] mx-4 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-[#e5e7eb] rotate-45"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Metrics & Queue */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#6b7280]" />
              Rendimiento
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#e5e7eb] pb-3">
                <span className="text-sm text-[#6b7280]">Procesados hoy</span>
                <span className="text-lg font-semibold text-[#1a1a1a]">{agent.metrics.processedToday}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] pb-3">
                <span className="text-sm text-[#6b7280]">Tiempo promedio</span>
                <span className="text-lg font-semibold text-[#1a1a1a]">{agent.metrics.avgTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6b7280]">Tasa de éxito</span>
                <span className="text-lg font-semibold text-[#22c55e]">{agent.metrics.successRate}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-[#6b7280]" />
              Cola de Trabajo ({agent.queue.length})
            </h3>
            {agent.queue.length > 0 ? (
              <div className="space-y-3">
                {agent.queue.map(item => (
                  <div key={item.caseId} className="p-3 bg-[#f7f8fa] rounded border border-[#e5e7eb]">
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/casos/${item.caseId}`} className="text-sm font-medium text-[#1a1a1a] hover:text-[#eb5d2a] hover:underline">
                        {item.caseId}
                      </Link>
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded",
                        item.priority === 'Alta' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 
                        item.priority === 'Media' ? 'bg-[#eab308]/10 text-[#eab308]' : 'bg-[#22c55e]/10 text-[#22c55e]'
                      )}>{item.priority}</span>
                    </div>
                    <p className="text-xs text-[#6b7280] truncate">{item.caseName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#6b7280] text-sm">
                No hay casos en espera.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity */}
        <div className="col-span-2 bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#6b7280]" />
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {agent.recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-[#f7f8fa] rounded-md transition-colors border border-transparent hover:border-[#e5e7eb]">
                <div className="mt-1">
                  {activity.result === 'Éxito' ? <CheckCircle2 className="w-5 h-5 text-[#22c55e]" /> :
                   activity.result === 'Requiere revisión' ? <AlertTriangle className="w-5 h-5 text-[#eab308]" /> :
                   <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <Link to={`/casos/${activity.caseId}`} className="text-sm font-medium text-[#1a1a1a] hover:text-[#eb5d2a] hover:underline">
                      {activity.caseId} - {activity.caseName}
                    </Link>
                    <span className="text-xs text-[#6b7280] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(new Date(activity.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={cn(
                      "font-medium",
                      activity.result === 'Éxito' ? 'text-[#22c55e]' : 
                      activity.result === 'Requiere revisión' ? 'text-[#eab308]' : 'text-[#ef4444]'
                    )}>{activity.result}</span>
                    <span className="text-[#e5e7eb]">|</span>
                    <span className="text-[#6b7280]">Duración: {activity.duration}</span>
                  </div>
                </div>
              </div>
            ))}
            {agent.recentActivity.length === 0 && (
              <div className="text-center py-8 text-[#6b7280]">No hay actividad reciente.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
