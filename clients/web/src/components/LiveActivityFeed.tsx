import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { formatTableTime } from '../lib/formatTime';

const AGENT_ACTIVITIES = [
  { id: 1, agent: 'Rachel', action: 'Clasificando nuevo correo',      detail: 'Reclamo de Daños - Póliza #8921',              status: 'processing', time: new Date(Date.now() - 1000 * 60 * 2)  },
  { id: 2, agent: 'Mike',   action: 'Extrayendo datos estructurados', detail: 'Demanda_Lopez_v_Libra.pdf',                    status: 'completed',  time: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 3, agent: 'Jess',   action: 'Generando borrador',             detail: 'Contestación Caso #4421',                     status: 'processing', time: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 4, agent: 'Donna',  action: 'Revisión formal completada',     detail: 'Expediente García c/ Libra',                  status: 'completed',  time: new Date(Date.now() - 1000 * 60 * 45) },
  { id: 5, agent: 'Edu',    action: 'Scoring de riesgo',              detail: 'Siniestro #992 — Monto: ARS 15M',             status: 'processing', time: new Date()                             },
  { id: 6, agent: 'Lou',    action: 'Verificación adversarial',       detail: 'Borrador Caso #4421 vs. póliza',              status: 'completed',  time: new Date(Date.now() - 1000 * 60 * 60) },
];

interface LiveActivityFeedProps {
  onAgentClick?: (agentName: string) => void;
}

export default function LiveActivityFeed({ onAgentClick }: LiveActivityFeedProps = {}) {
  const [activities, setActivities] = useState(
    AGENT_ACTIVITIES.sort((a, b) => b.time.getTime() - a.time.getTime())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const next = [...prev];
        const idx = next.findIndex(a => a.status === 'processing');
        if (idx !== -1 && Math.random() > 0.5) {
          next[idx] = {
            ...next[idx],
            status: 'completed',
            action: next[idx].action
              .replace('Clasificando', 'Clasificado')
              .replace('Generando', 'Generado')
              .replace('Extrayendo', 'Extraído')
              .replace('Scoring', 'Score completado —'),
            time: new Date(),
          };
        }
        return next.sort((a, b) => b.time.getTime() - a.time.getTime());
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-[#F3F4F6] dark:divide-zinc-800">
      {activities.map(activity => (
        <div
          key={activity.id}
          onClick={() => onAgentClick?.(activity.agent)}
          className={cn(
            'flex items-start gap-3 px-5 py-3.5 transition-colors duration-150',
            'hover:bg-[#FAFAFA] dark:hover:bg-zinc-800/30',
            onAgentClick && 'cursor-pointer'
          )}
        >
          {/* Status dot */}
          <div className={cn(
            'w-2 h-2 rounded-full shrink-0 mt-[5px]',
            activity.status === 'processing'
              ? 'bg-green-500 animate-pulse'
              : 'bg-gray-300 dark:bg-zinc-600'
          )} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[0.85rem] font-semibold text-[var(--color-text-primary)]">
                {activity.agent}
              </span>
              <span className="text-[0.72rem] text-[var(--color-text-tertiary)] shrink-0">
                {formatTableTime(activity.time.toISOString())}
              </span>
            </div>
            <p className="text-[0.8rem] text-[var(--color-text-secondary)] leading-snug">
              {activity.action}
              {' · '}
              <span className="text-[var(--color-text-secondary)]">{activity.detail}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
