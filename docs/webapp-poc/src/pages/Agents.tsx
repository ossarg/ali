import { MOCK_AGENTS } from '../data/mockData';
import { Activity, CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Agents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Monitoreo de Agentes</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_AGENTS.map(agent => (
          <div key={agent.id} className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm flex flex-col hover:border-[#eb5d2a]/50 transition-colors">
            <div className="p-5 border-b border-[#e5e7eb]">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-lg font-semibold text-[#1a1a1a]">{agent.name}</h2>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    agent.status === 'Activo' ? 'bg-[#22c55e] animate-pulse' : 
                    agent.status === 'En espera' ? 'bg-[#eab308]' : 'bg-[#ef4444]'
                  )} />
                  <span className="text-xs font-medium text-[#6b7280]">{agent.status}</span>
                </div>
              </div>
              <p className="text-sm text-[#6b7280] line-clamp-2 h-10">{agent.description}</p>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              {agent.status === 'Activo' && agent.currentCaseId ? (
                <div className="mb-6 bg-[#f7f8fa] p-3 rounded border border-[#e5e7eb]">
                  <span className="text-xs font-medium text-[#eb5d2a] block mb-1">Procesando ahora:</span>
                  <Link to={`/casos/${agent.currentCaseId}`} className="text-sm font-medium text-[#1a1a1a] hover:underline flex items-center justify-between">
                    <span className="truncate pr-2">{agent.currentCaseId}</span>
                    <Activity className="w-4 h-4 text-[#eb5d2a] animate-pulse" />
                  </Link>
                </div>
              ) : (
                <div className="mb-6 h-[70px] flex items-center justify-center text-sm text-[#6b7280] bg-[#f7f8fa] rounded border border-dashed border-[#e5e7eb]">
                  Sin tarea activa
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <span className="block text-xl font-semibold text-[#1a1a1a]">{agent.metrics.processedToday}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-[#6b7280] mt-1">Hoy</span>
                </div>
                <div className="text-center border-l border-r border-[#e5e7eb]">
                  <span className="block text-xl font-semibold text-[#1a1a1a]">{agent.metrics.avgTime}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-[#6b7280] mt-1">Promedio</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-semibold text-[#22c55e]">{agent.metrics.successRate}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-[#6b7280] mt-1">Éxito</span>
                </div>
              </div>

              <Link 
                to={`/agentes/${agent.id}`}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#f7f8fa] text-[#455362] text-sm font-medium rounded hover:bg-[#e5e7eb] transition-colors"
              >
                Ver detalles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
