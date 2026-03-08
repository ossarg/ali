import { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Clock, Mail, FileText, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatTableTime } from '../lib/formatTime';

// Simulating real-time agent activity for the demo
const AGENT_ACTIVITIES = [
  { id: 1, agent: 'Rachel (Inbox)', action: 'Clasificando nuevo correo', detail: 'Reclamo de Daños - Poliza #8921', status: 'processing', type: 'mail', time: new Date(Date.now() - 1000 * 60 * 2) },
  { id: 2, agent: 'Harvey (Extracción)', action: 'Extrayendo metadatos', detail: 'Demanda_Lopez_v_Libra.pdf', status: 'completed', type: 'document', time: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 3, agent: 'Mike (Redacción)', action: 'Generando borrador', detail: 'Contestación Caso #4421', status: 'processing', type: 'draft', time: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 4, agent: 'Rachel (Inbox)', action: 'Clasificación completada', detail: 'Notificación Juzgado N°4', status: 'completed', type: 'mail', time: new Date(Date.now() - 1000 * 60 * 45) },
  { id: 5, agent: 'Harvey (Extracción)', action: 'Análisis de póliza', detail: 'Verificando cobertura Siniestro #992', status: 'processing', type: 'search', time: new Date() },
];

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState(AGENT_ACTIVITIES.sort((a, b) => b.time.getTime() - a.time.getTime()));

  // Simulate incoming live events
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivities = [...prev];
        // Randomly complete a processing task
        const processingTaskIndex = newActivities.findIndex(a => a.status === 'processing');
        if (processingTaskIndex !== -1 && Math.random() > 0.5) {
          newActivities[processingTaskIndex] = {
            ...newActivities[processingTaskIndex],
            status: 'completed',
            action: newActivities[processingTaskIndex].action.replace('ndo', 'do').replace('ando', 'ado').replace('endo', 'ido'),
            time: new Date()
          };
        }
        return newActivities.sort((a, b) => b.time.getTime() - a.time.getTime());
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'mail': return <Mail className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'draft': return <Bot className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-[var(--color-surface-bg)] rounded-xl transition-all group border border-transparent hover:border-[var(--color-border-dim)]">
          {/* Agent Avatar / Icon */}
          <div className="relative shrink-0 mt-1">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border shadow-sm",
              activity.agent.includes('Rachel') ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
              activity.agent.includes('Harvey') ? "bg-amber-50 border-amber-100 text-amber-600" :
              "bg-emerald-50 border-emerald-100 text-emerald-600"
            )}>
              {getIcon(activity.type)}
            </div>
            {/* Status Indicator */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center",
              activity.status === 'processing' ? "bg-[var(--color-brand-primary)]" : "bg-green-500"
            )}>
              {activity.status === 'processing' 
                ? <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                : <CheckCircle2 className="w-3 h-3 text-white" />
              }
            </div>
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">{activity.agent}</span>
              <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTableTime(activity.time.toISOString())}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {activity.action} <span className="text-[var(--color-text-primary)] font-medium">· {activity.detail}</span>
            </p>
            
            {activity.status === 'processing' && (
              <div className="mt-2 h-1 w-full bg-[var(--color-surface-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-brand-primary)] rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '45%' }} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
