import { MOCK_CASES, MOCK_INBOX, type Stage } from '../data/mockData';
import { AlertCircle, CheckCircle2, Clock, FileText, ArrowRight, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  
  const activeCasesCount = MOCK_CASES.filter(c => c.stage !== 'Completado').length;
  const pendingReviewCount = MOCK_INBOX.length;
  const upcomingDeadlinesCount = MOCK_CASES.filter(c => c.priority === 'Alta' && c.stage !== 'Completado').length;
  const processedTodayCount = 42; // Mock stat

  const stages: Stage[] = ['Ingesta', 'Extracción', 'Triage', 'Fichero', 'Borrador', 'Revisión Humana', 'Completado'];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm cursor-pointer hover:border-[#eb5d2a]/50 transition-colors" onClick={() => navigate('/casos')}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#6b7280]">Casos Activos</h3>
            <Activity className="w-5 h-5 text-[#455362]" />
          </div>
          <div className="text-3xl font-semibold text-[#1a1a1a]">{activeCasesCount}</div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm cursor-pointer hover:border-[#eb5d2a]/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#6b7280]">Pendientes de Revisión</h3>
            <AlertCircle className="w-5 h-5 text-[#eab308]" />
          </div>
          <div className="text-3xl font-semibold text-[#1a1a1a]">{pendingReviewCount}</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm cursor-pointer hover:border-[#eb5d2a]/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#6b7280]">Vencimientos Próximos</h3>
            <Clock className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div className="text-3xl font-semibold text-[#1a1a1a]">{upcomingDeadlinesCount}</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm cursor-pointer hover:border-[#eb5d2a]/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#6b7280]">Procesados Hoy</h3>
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div className="text-3xl font-semibold text-[#1a1a1a]">{processedTodayCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Inbox */}
        <div className="col-span-1 bg-white rounded-lg border border-[#e5e7eb] shadow-sm flex flex-col h-[500px]">
          <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#455362]">Bandeja de Entrada</h2>
            <span className="bg-[#ef4444]/10 text-[#ef4444] text-xs font-medium px-2.5 py-1 rounded-full">{pendingReviewCount} tareas</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {MOCK_INBOX.map((item) => (
              <Link 
                key={item.id} 
                to={`/casos/${item.caseId}`}
                className="block p-4 hover:bg-[#f7f8fa] rounded-md transition-colors border-b border-transparent hover:border-[#e5e7eb] mb-1"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-medium text-[#eb5d2a]">{item.agent}</span>
                  <span className="text-xs text-[#6b7280]">Hace 2h</span>
                </div>
                <h4 className="text-sm font-semibold text-[#1a1a1a] mb-1 line-clamp-1">{item.caseName}</h4>
                <p className="text-sm text-[#455362] flex items-center gap-2">
                  <AlertCircle className={cn("w-4 h-4", item.urgency === 'Alta' ? 'text-[#ef4444]' : 'text-[#eab308]')} />
                  {item.actionRequired}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Pipeline Kanban Mini */}
        <div className="col-span-2 bg-white rounded-lg border border-[#e5e7eb] shadow-sm flex flex-col h-[500px]">
          <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#455362]">Pipeline Activo</h2>
            <Link to="/casos" className="text-sm text-[#eb5d2a] font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto p-5">
            <div className="flex gap-4 h-full min-w-max">
              {stages.map(stage => {
                const stageCases = MOCK_CASES.filter(c => c.stage === stage);
                return (
                  <div key={stage} className="w-64 flex flex-col bg-[#f7f8fa] rounded-md border border-[#e5e7eb]">
                    <div className="p-3 border-b border-[#e5e7eb] flex items-center justify-between bg-white rounded-t-md">
                      <h3 className="text-sm font-medium text-[#455362]">{stage}</h3>
                      <span className="text-xs font-medium text-[#6b7280] bg-[#e5e7eb] px-2 py-0.5 rounded-full">{stageCases.length}</span>
                    </div>
                    <div className="p-2 flex-1 overflow-y-auto space-y-2">
                      {stageCases.map(c => (
                        <Link 
                          key={c.id} 
                          to={`/casos/${c.id}`}
                          className="block bg-white p-3 rounded border border-[#e5e7eb] shadow-sm hover:border-[#eb5d2a]/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-[#6b7280]">{c.id}</span>
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              c.priority === 'Alta' ? 'bg-[#ef4444]' : c.priority === 'Media' ? 'bg-[#eab308]' : 'bg-[#22c55e]'
                            )} />
                          </div>
                          <h4 className="text-sm font-medium text-[#1a1a1a] line-clamp-2 mb-2" title={c.title}>{c.title}</h4>
                          <div className="flex items-center justify-between text-xs text-[#6b7280]">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(c.deadline).toLocaleDateString()}</span>
                            {c.lawyerId && <span className="bg-[#455362]/10 text-[#455362] px-1.5 py-0.5 rounded">Asignado</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
