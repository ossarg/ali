import { MOCK_LAWYERS } from '../data/mockData';
import { Briefcase, Activity, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Team() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Equipo Legal</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_LAWYERS.map(lawyer => (
          <div key={lawyer.id} className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm flex flex-col hover:border-[#eb5d2a]/50 transition-colors">
            <div className="p-5 border-b border-[#e5e7eb] flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f7f8fa] rounded-full flex items-center justify-center text-[#455362] font-bold text-lg border border-[#e5e7eb]">
                {lawyer.name.split(' ').map(n => n[0]).join('').substring(0,2)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1a1a1a]">{lawyer.name}</h2>
                <p className="text-sm text-[#6b7280]">{lawyer.seniority}</p>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider block mb-2">Especialidades</span>
                <div className="flex flex-wrap gap-2">
                  {lawyer.specialty.split(', ').map(spec => (
                    <span key={spec} className="bg-[#f7f8fa] text-[#455362] text-xs font-medium px-2 py-1 rounded border border-[#e5e7eb]">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#f7f8fa] p-3 rounded border border-[#e5e7eb] text-center">
                  <span className="block text-xl font-semibold text-[#1a1a1a]">{lawyer.activeCases}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-[#6b7280] mt-1 flex items-center justify-center gap-1">
                    <Briefcase className="w-3 h-3" /> Casos Activos
                  </span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded border border-[#e5e7eb] text-center">
                  <span className={cn(
                    "block text-xl font-semibold",
                    lawyer.workload === 'Alta' ? 'text-[#ef4444]' : 
                    lawyer.workload === 'Normal' ? 'text-[#eab308]' : 'text-[#22c55e]'
                  )}>
                    {lawyer.workload}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-[#6b7280] mt-1 flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3" /> Carga
                  </span>
                </div>
              </div>

              <Link 
                to={`/equipo/${lawyer.id}`}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-[#e5e7eb] text-[#455362] text-sm font-medium rounded hover:bg-[#f7f8fa] transition-colors"
              >
                Ver perfil <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
