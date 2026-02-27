import { useState } from 'react';
import { MOCK_CASES, type Stage, type Priority } from '../data/mockData';
import { LayoutGrid, List, Search, Filter, Clock, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Cases() {
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');

  const stages: Stage[] = ['Ingesta', 'Extracción', 'Triage', 'Fichero', 'Borrador', 'Revisión Humana', 'Completado'];

  const filteredCases = MOCK_CASES.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Gestión de Casos</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input 
              type="text" 
              placeholder="Buscar casos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#eb5d2a]/20 focus:border-[#eb5d2a] w-64"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-md text-sm font-medium text-[#455362] hover:bg-[#f7f8fa] transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          {view === 'table' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-md text-sm font-medium text-[#455362] hover:bg-[#f7f8fa] transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          )}

          <div className="flex items-center bg-[#f7f8fa] border border-[#e5e7eb] rounded-md p-1">
            <button 
              onClick={() => setView('pipeline')}
              className={cn(
                "p-1.5 rounded text-sm font-medium transition-colors",
                view === 'pipeline' ? "bg-white shadow-sm text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('table')}
              className={cn(
                "p-1.5 rounded text-sm font-medium transition-colors",
                view === 'table' ? "bg-white shadow-sm text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {view === 'pipeline' ? (
          <div className="flex gap-6 h-full overflow-x-auto pb-4">
            {stages.map(stage => {
              const stageCases = filteredCases.filter(c => c.stage === stage);
              return (
                <div key={stage} className="w-80 flex flex-col bg-[#f7f8fa] rounded-lg border border-[#e5e7eb] shrink-0">
                  <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between bg-white rounded-t-lg">
                    <h3 className="font-semibold text-[#455362]">{stage}</h3>
                    <span className="text-xs font-semibold text-[#6b7280] bg-[#e5e7eb] px-2.5 py-1 rounded-full">{stageCases.length}</span>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto space-y-3">
                    {stageCases.map(c => (
                      <Link 
                        key={c.id} 
                        to={`/casos/${c.id}`}
                        className="block bg-white p-4 rounded-md border border-[#e5e7eb] shadow-sm hover:border-[#eb5d2a]/50 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-[#6b7280]">{c.id}</span>
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            c.priority === 'Alta' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 
                            c.priority === 'Media' ? 'bg-[#eab308]/10 text-[#eab308]' : 
                            'bg-[#22c55e]/10 text-[#22c55e]'
                          )}>
                            {c.priority}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#1a1a1a] line-clamp-2 mb-3 group-hover:text-[#eb5d2a] transition-colors" title={c.title}>
                          {c.title}
                        </h4>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6b7280]">Monto:</span>
                            <span className="font-medium text-[#1a1a1a]">
                              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6b7280]">Siniestro:</span>
                            <span className="font-medium text-[#1a1a1a] truncate ml-2 text-right">
                              {c.dataExtraction.fields['Tipo de Siniestro']?.value || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#6b7280]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 
                            Vence: {format(new Date(c.deadline), 'dd/MM/yyyy')}
                          </span>
                          {c.lawyerId && (
                            <div className="w-6 h-6 rounded-full bg-[#455362] text-white flex items-center justify-center text-[10px] font-bold" title="Asignado">
                              L
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f7f8fa] text-[#455362] font-semibold border-b border-[#e5e7eb] sticky top-0">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Carátula</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Prioridad</th>
                    <th className="px-6 py-4">Etapa</th>
                    <th className="px-6 py-4">Vencimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filteredCases.map(c => (
                    <tr key={c.id} className="hover:bg-[#f7f8fa] transition-colors cursor-pointer" onClick={() => window.location.href = `/casos/${c.id}`}>
                      <td className="px-6 py-4 font-mono text-xs text-[#6b7280]">{c.id}</td>
                      <td className="px-6 py-4 font-medium text-[#1a1a1a] max-w-md truncate">{c.title}</td>
                      <td className="px-6 py-4 text-[#455362]">
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c.amount)}
                      </td>
                      <td className="px-6 py-4">
                         <span className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-full",
                            c.priority === 'Alta' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 
                            c.priority === 'Media' ? 'bg-[#eab308]/10 text-[#eab308]' : 
                            'bg-[#22c55e]/10 text-[#22c55e]'
                          )}>
                            {c.priority}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-[#455362]">{c.stage}</td>
                      <td className="px-6 py-4 text-[#455362]">{format(new Date(c.deadline), 'dd/MM/yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
