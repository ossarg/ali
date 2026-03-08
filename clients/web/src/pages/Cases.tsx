import { useState } from 'react';
import { Search, ChevronRight, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useCasesPaginated } from '../api/hooks/useCases';
import Pagination from '../components/Pagination';

const CaseTypeLabel: Record<string, string> = {
  lawsuit:     'Juicio',
  mediation:   'Mediación',
  third_party: 'Administrativo',
};

const CaseTypeColor: Record<string, string> = {
  lawsuit:     'bg-red-50 text-red-700',
  mediation:   'bg-amber-50 text-amber-700',
  third_party: 'bg-blue-50 text-blue-700',
};


export default function Cases() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useCasesPaginated(
    page,
    20,
    searchQuery ? { search: searchQuery } : undefined
  );
  const casos = data?.data ?? [];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Casos</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar por carátula, siniestro..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-white border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#eb5d2a]/20 focus:border-[#eb5d2a] w-72"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading && (
          <div className="flex items-center justify-center flex-1 text-[#6b7280]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando casos...
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center flex-1 text-[#ef4444] gap-2">
            <AlertCircle className="w-5 h-5" /> No se pudieron cargar los casos. Intentá de nuevo.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f7f8fa] text-[#455362] font-semibold border-b border-[#e5e7eb] sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5 whitespace-nowrap">ID de caso</th>
                    <th className="px-5 py-3.5">Carátula</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Nro. siniestro</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Estado</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Estudio defensor</th>
                    <th className="px-5 py-3.5 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {casos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-[#6b7280] text-sm">
                        No hay casos registrados.
                      </td>
                    </tr>
                  ) : (
                    casos.map(c => (
                      <tr
                        key={c.id}
                        className="hover:bg-[#f7f8fa] transition-colors"
                      >
                        {/* ID */}
                        <td className="px-5 py-4 font-mono text-xs text-[#6b7280] whitespace-nowrap">
                          {c.case_number || c.id.slice(0, 8).toUpperCase()}
                        </td>

                        {/* Carátula */}
                        <td className="px-5 py-4 max-w-xs">
                          <span className="font-medium text-[#1a1a1a] line-clamp-2" title={c.title}>
                            {c.title}
                          </span>
                        </td>

                        {/* Nro. siniestro */}
                        <td className="px-5 py-4 text-[#455362] whitespace-nowrap">
                          {c.claim_number || <span className="text-[#9ca3af]">—</span>}
                        </td>

                        {/* Estado (case_type) */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={cn(
                            'text-xs font-medium px-2.5 py-1 rounded-full',
                            CaseTypeColor[c.case_type] ?? 'bg-gray-100 text-gray-600'
                          )}>
                            {CaseTypeLabel[c.case_type] ?? c.case_type}
                          </span>
                        </td>

                        {/* Estudio defensor */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {c.defense_firm ? (
                            <div className="flex items-center gap-1.5 text-sm text-[#455362]">
                              <Building2 className="w-3.5 h-3.5 text-[#9ca3af] shrink-0" />
                              <span className="truncate max-w-[140px]" title={c.defense_firm.name}>
                                {c.defense_firm.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#9ca3af] text-xs">Sin asignar</span>
                          )}
                        </td>

                        {/* Arrow */}
                        <td className="px-5 py-4">
                          <Link to={`/casos/${c.id}`}>
                            <ChevronRight className="w-4 h-4 text-[#9ca3af] hover:text-[#eb5d2a] transition-colors" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="px-2 shrink-0">
        <Pagination page={page} limit={20} total={data?.total ?? 0} onChange={setPage} />
      </div>
    </div>
  );
}
