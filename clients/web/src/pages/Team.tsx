import { useState } from 'react';
import { MOCK_LAWYERS, MOCK_AGENTS } from '../data/mockData';
import { Briefcase, Activity, User, ArrowRight, Bot, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Team() {
  const [filter, setFilter] = useState<'Todos' | 'Humanos' | 'IA'>('Todos');

  const showHumanos = filter === 'Todos' || filter === 'Humanos';
  const showIA = filter === 'Todos' || filter === 'IA';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border-dim)]">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Equipo Legal</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Conoce al equipo híbrido de abogados y agentes especializados.</p>
        </div>
        
        {/* Toggle / Filter */}
        <div className="flex bg-[var(--color-surface-bg)] rounded-lg p-1 border border-[var(--color-border-dim)] shadow-sm">
          {['Todos', 'Humanos', 'IA'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                filter === tab 
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm" 
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* HUMAN LAWYERS */}
        {showHumanos && MOCK_LAWYERS.map(lawyer => (
          <div key={lawyer.id} className="glass-panel rounded-xl flex flex-col hover:border-[var(--color-border-focus)] transition-all group shadow-sm bg-white">
            <div className="p-5 border-b border-[var(--color-border-dim)] flex items-center gap-4 bg-[var(--color-surface-bg)]/50 rounded-t-xl">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-bold text-lg border border-[var(--color-border-dim)] shadow-sm">
                {lawyer.name.split(' ').map(n => n[0]).join('').substring(0,2)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">{lawyer.name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">{lawyer.seniority}</p>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider block mb-2">Especialidades</span>
                <div className="flex flex-wrap gap-2">
                  {lawyer.specialty.split(', ').map(spec => (
                    <span key={spec} className="bg-[var(--color-surface-bg)] text-[var(--color-text-secondary)] text-[10px] font-medium px-2 py-1 rounded-md border border-[var(--color-border-dim)]">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[var(--color-surface-bg)] p-3 rounded-lg border border-[var(--color-border-dim)] text-center">
                  <span className="block text-xl font-semibold text-[var(--color-text-primary)]">{lawyer.activeCases}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1 flex items-center justify-center gap-1">
                    <Briefcase className="w-3 h-3" /> Casos Activos
                  </span>
                </div>
                <div className="bg-[var(--color-surface-bg)] p-3 rounded-lg border border-[var(--color-border-dim)] text-center">
                  <span className={cn(
                    "block text-xl font-semibold",
                    lawyer.workload === 'Alta' ? 'text-red-500' : 
                    lawyer.workload === 'Normal' ? 'text-amber-500' : 'text-green-500'
                  )}>
                    {lawyer.workload}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1 flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3" /> Carga
                  </span>
                </div>
              </div>

              <Link 
                to={`/equipo/${lawyer.id}`}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-[var(--color-border-dim)] text-[var(--color-text-secondary)] text-sm font-medium rounded-lg hover:border-[var(--color-border-focus)] hover:text-[var(--color-brand-primary)] transition-all shadow-sm group-hover:border-[var(--color-brand-primary)]/30"
              >
                Ver perfil humano <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}

        {/* AI AGENTS */}
        {showIA && MOCK_AGENTS.map(agent => (
          <div key={`ia-${agent.id}`} className="glass-panel rounded-xl flex flex-col hover:border-indigo-300 transition-all group shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent opacity-50 pointer-events-none" />
            
            <div className="p-5 border-b border-[var(--color-border-dim)] flex items-center gap-4 bg-indigo-50/30 rounded-t-xl relative">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm relative">
                <Bot className="w-6 h-6" />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
                  agent.status === 'Activo' ? "bg-green-500" : agent.status === 'En espera' ? "bg-amber-500" : "bg-red-500"
                )} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-indigo-600 transition-colors">{agent.name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                  Agente IA <span className="w-1 h-1 rounded-full bg-[var(--color-border-dim)]" /> {agent.status}
                </p>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider block mb-2">Rol Asignado</span>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed h-[3.5rem] line-clamp-2">
                  {agent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 text-center">
                  <span className="block text-xl font-semibold text-[var(--color-text-primary)]">{agent.metrics.processedToday}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Resoluciones (Hoy)
                  </span>
                </div>
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 text-center">
                  <span className="block text-xl font-semibold text-green-600">{agent.metrics.successRate}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1 flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-indigo-400" /> Tasa de Éxito
                  </span>
                </div>
              </div>

              <Link 
                to={`/agentes`}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50/30 border border-indigo-100 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
              >
                Configurar Parámetros <Settings className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
