import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_LAWYERS, MOCK_CASES } from '../data/mockData';
import { ArrowLeft, Briefcase, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function LawyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lawyer = MOCK_LAWYERS.find(l => l.id === id);

  if (!lawyer) {
    return <div className="p-8 text-center text-[#6b7280]">Abogado no encontrado.</div>;
  }

  const assignedCases = MOCK_CASES.filter(c => c.lawyerId === id && c.stage !== 'Completado');
  const completedCases = MOCK_CASES.filter(c => c.lawyerId === id && c.stage === 'Completado');

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
        <div className="flex-1 flex items-center gap-6">
          <div className="w-20 h-20 bg-[#f7f8fa] rounded-full flex items-center justify-center text-[#455362] font-bold text-3xl border-2 border-[#e5e7eb] shadow-sm">
            {lawyer.name.split(' ').map(n => n[0]).join('').substring(0,2)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-1">{lawyer.name}</h1>
            <p className="text-[#6b7280] font-medium">{lawyer.seniority} • {lawyer.specialty}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Metrics */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Métricas de Desempeño</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#e5e7eb] pb-3">
                <span className="text-sm text-[#6b7280]">Casos Activos</span>
                <span className="text-lg font-semibold text-[#1a1a1a]">{lawyer.activeCases}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] pb-3">
                <span className="text-sm text-[#6b7280]">Carga de Trabajo</span>
                <span className={cn(
                  "text-sm font-semibold px-2 py-1 rounded",
                  lawyer.workload === 'Alta' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 
                  lawyer.workload === 'Normal' ? 'bg-[#eab308]/10 text-[#eab308]' : 'bg-[#22c55e]/10 text-[#22c55e]'
                )}>{lawyer.workload}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] pb-3">
                <span className="text-sm text-[#6b7280]">Casos Completados (Mes)</span>
                <span className="text-lg font-semibold text-[#1a1a1a]">{completedCases.length + 12}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6b7280]">Tiempo Promedio Resolución</span>
                <span className="text-lg font-semibold text-[#1a1a1a]">14 días</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cases */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#6b7280]" />
                Casos Asignados Activos
              </h3>
              <span className="bg-[#f7f8fa] text-[#455362] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#e5e7eb]">
                {assignedCases.length}
              </span>
            </div>
            
            {assignedCases.length > 0 ? (
              <div className="space-y-3">
                {assignedCases.map(c => (
                  <Link 
                    key={c.id} 
                    to={`/casos/${c.id}`}
                    className="block p-4 bg-[#f7f8fa] rounded-md border border-[#e5e7eb] hover:border-[#eb5d2a]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-[#6b7280]">{c.id}</span>
                      <span className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        c.priority === 'Alta' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 
                        c.priority === 'Media' ? 'bg-[#eab308]/10 text-[#eab308]' : 'bg-[#22c55e]/10 text-[#22c55e]'
                      )}>{c.priority}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#1a1a1a] mb-2">{c.title}</h4>
                    <div className="flex items-center justify-between text-xs text-[#6b7280]">
                      <span>Etapa: <span className="font-medium text-[#455362]">{c.stage}</span></span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Vence: {format(new Date(c.deadline), 'dd/MM/yyyy')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#6b7280]">No tiene casos activos asignados.</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#6b7280]" />
              Historial Reciente
            </h3>
            {completedCases.length > 0 ? (
              <div className="space-y-3">
                {completedCases.map(c => (
                  <div key={c.id} className="p-4 bg-white rounded-md border border-[#e5e7eb] opacity-75">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-[#6b7280]">{c.id}</span>
                      <span className="text-xs text-[#22c55e] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completado
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-[#1a1a1a]">{c.title}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#6b7280]">No hay historial reciente disponible.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
