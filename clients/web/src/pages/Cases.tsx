import { useState } from 'react';
import { Search, Loader2, AlertCircle, Building2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useCasesPaginated } from '../api/hooks/useCases';
import { useQueryClient } from '@tanstack/react-query';
import { caseKeys } from '../api/hooks/useCases';
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

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function Cases() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [lastSync, setLastSync] = useState(new Date());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, isError } = useCasesPaginated(
    page,
    10,
    searchQuery ? { search: searchQuery } : undefined
  );
  const casos = data?.data ?? [];
  const total = data?.total ?? 0;

  const byType = casos.reduce<Record<string, number>>((acc, c) => {
    acc[c.case_type] = (acc[c.case_type] ?? 0) + 1;
    return acc;
  }, {});

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: caseKeys.all });
    setLastSync(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Casos</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por carátula, siniestro..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#eb5d2a]/20 focus:border-[#eb5d2a] w-72"
          />
        </div>
      </div>

      {/* Metrics */}
      {!isLoading && !isError && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total de casos" value={total} />
            <MetricCard label="Juicios"         value={byType['lawsuit']     ?? 0} />
            <MetricCard label="Mediaciones"     value={byType['mediation']   ?? 0} />
            <MetricCard label="Administrativos" value={byType['third_party'] ?? 0} />
          </div>
          <div className="flex items-center justify-end gap-3">
            <span className="text-xs text-gray-400">
              Última sincronización: {format(lastSync, 'HH:mm', { locale: es })}
            </span>
            <button
              onClick={handleReload}
              disabled={isFetching}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando casos...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-16 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> No se pudieron cargar los casos. Intentá de nuevo.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pt-4 pl-4 pr-4">Carátula</th>
                  <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Nro. siniestro</th>
                  <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Nro. expediente</th>
                  <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Nro. póliza</th>
                  <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Estudio defensor</th>
                  <th className="pb-3 pt-4 pr-4 whitespace-nowrap">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {casos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                      No hay casos registrados.
                    </td>
                  </tr>
                ) : (
                  casos.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/casos/${c.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Carátula */}
                      <td className="pl-4 pr-4 py-3.5 max-w-xs">
                        {c.caratula ? (
                          <span className="font-medium text-gray-900 line-clamp-2" title={c.caratula}>
                            {c.caratula}
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">{c.title}</span>
                        )}
                      </td>

                      {/* Nro. siniestro */}
                      <td className="pr-4 py-3.5 text-gray-600 whitespace-nowrap">
                        {c.claim_number || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Nro. expediente */}
                      <td className="pr-4 py-3.5 text-gray-600 whitespace-nowrap">
                        {c.case_number || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Nro. póliza */}
                      <td className="pr-4 py-3.5 text-gray-600 whitespace-nowrap">
                        {c.policy || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Estudio defensor */}
                      <td className="pr-4 py-3.5 whitespace-nowrap">
                        {c.defense_firm ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Building2 className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            <span className="truncate max-w-[160px]" title={c.defense_firm.name}>
                              {c.defense_firm.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">Sin asignar</span>
                        )}
                      </td>

                      {/* Estado — última columna */}
                      <td className="pr-4 py-3.5 whitespace-nowrap">
                        <span className={cn(
                          'text-xs font-medium px-2.5 py-1 rounded-full',
                          CaseTypeColor[c.case_type] ?? 'bg-gray-100 text-gray-600'
                        )}>
                          {CaseTypeLabel[c.case_type] ?? c.case_type}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} limit={10} total={total} onChange={setPage} />
    </div>
  );
}
