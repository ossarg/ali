import { useState } from 'react';
import { MOCK_LAWYERS } from '../data/mockData';
import { Briefcase, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import PageHeader from '../components/PageHeader';
import AgentOrgChart from '../components/AgentOrgChart';

type Tab = 'Abogados' | 'Agentes';

export default function Team() {
  const [tab, setTab] = useState<Tab>('Abogados');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Equipo Legal"
        subtitle="Conoce al equipo híbrido de abogados y agentes especializados."
        actions={
          <div className="flex bg-[var(--color-surface-bg)] rounded-lg p-1 border border-[var(--color-border-dim)] shadow-sm">
            {(['Abogados', 'Agentes'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-5 py-1.5 text-sm font-medium rounded-md transition-all',
                  tab === t
                    ? 'bg-[var(--color-surface-card)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {tab === 'Abogados' ? (
          <motion.div
            key="abogados"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {MOCK_LAWYERS.map(lawyer => (
              <div key={lawyer.id} className="glass-panel rounded-xl flex flex-col hover:border-[var(--color-border-focus)] transition-all group shadow-sm bg-[var(--color-surface-card)]">
                <div className="p-5 border-b border-[var(--color-border-dim)] flex items-center gap-4 bg-[var(--color-surface-bg)]/50 rounded-t-xl">
                  <div className="w-12 h-12 bg-[var(--color-surface-card)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] font-bold text-lg border border-[var(--color-border-dim)] shadow-sm">
                    {lawyer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
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
                        'block text-xl font-semibold',
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
                    className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] text-[var(--color-text-secondary)] text-sm font-medium rounded-lg hover:border-[var(--color-border-focus)] hover:text-[var(--color-brand-primary)] transition-all shadow-sm group-hover:border-[var(--color-brand-primary)]/30"
                  >
                    Ver perfil <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="agentes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <AgentOrgChart />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
