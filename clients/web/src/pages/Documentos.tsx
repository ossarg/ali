import { FileText, Download, Search } from 'lucide-react';
import { useState } from 'react';

// Tipos de documentos producidos por los agentes
const DOC_TYPES = ['Todos', 'Borrador contestación', 'Ficha de caso', 'Triage', 'Acuerdo', 'Sentencia'];

export default function Documentos() {
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Documentos</h1>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#eb5d2a]/20 focus:border-[#eb5d2a] w-72"
          />
        </div>
        <div className="flex gap-2">
          {DOC_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tipoFiltro === t
                  ? 'bg-[#455362] text-white'
                  : 'bg-white border border-[#e5e7eb] text-[#455362] hover:bg-[#f7f8fa]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Placeholder — conectar con API cuando esté disponible */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center">
        <FileText className="w-12 h-12 text-[#e5e7eb] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#455362] mb-2">Documentos en construcción</h3>
        <p className="text-sm text-[#6b7280] max-w-md mx-auto">
          Acá vas a poder acceder a todos los documentos producidos por los agentes: 
          borradores de contestación, fichas de caso, reportes de triage y documentación adjunta.
        </p>
      </div>
    </div>
  );
}
