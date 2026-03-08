import { MOCK_CASES, MOCK_INBOX } from '../data/mockData';
import { AlertCircle, CheckCircle2, Clock, Activity, ArrowRight, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import LiveActivityFeed from '../components/LiveActivityFeed';

export default function Home() {
  const navigate = useNavigate();
  
  const activeCasesCount = MOCK_CASES.filter(c => c.stage !== 'Completado').length;
  const pendingReviewCount = MOCK_INBOX.length;
  const upcomingDeadlinesCount = MOCK_CASES.filter(c => c.priority === 'Alta' && c.stage !== 'Completado').length;
  const processedTodayCount = 42; // Mock stat

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Overview</h2>
          <p className="text-[var(--color-text-secondary)] mt-1 text-sm">Monitor your AI agents and active litigation pipeline.</p>
        </div>
      </div>

      {/* KPI Cards - Linear Style */}
      <div className="grid grid-cols-4 gap-4">
        <div 
          className="glass-panel p-5 rounded-xl cursor-pointer hover:border-[var(--color-border-focus)] transition-all group" 
          onClick={() => navigate('/casos')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-sidebar)] flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">Casos Activos</h3>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)] tracking-tight">{activeCasesCount}</div>
          </div>
        </div>
        
        <div className="glass-panel p-5 rounded-xl cursor-pointer hover:border-[var(--color-border-focus)] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">Revisión Humana</h3>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)] tracking-tight">{pendingReviewCount}</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl cursor-pointer hover:border-[var(--color-border-focus)] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">Vencimientos Próximos</h3>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)] tracking-tight">{upcomingDeadlinesCount}</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl cursor-pointer hover:border-[var(--color-border-focus)] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">Procesados Hoy</h3>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)] tracking-tight">{processedTodayCount}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Action Center - Refined Inbox */}
        <div className="glass-panel rounded-xl flex flex-col h-[500px] overflow-hidden">
          <div className="p-5 border-b border-[var(--color-border-dim)] flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Action Center</h2>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">{pendingReviewCount} requiere atención</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {MOCK_INBOX.map((item) => (
              <Link 
                key={item.id} 
                to={`/casos/${item.caseId}`}
                className="block p-4 bg-white rounded-lg border border-[var(--color-border-dim)] hover:border-[var(--color-border-focus)] transition-all group shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)]">{item.agent}</span>
                  <span className="text-xs text-[var(--color-text-tertiary)] font-medium">Hace 2h</span>
                </div>
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1.5 line-clamp-1 group-hover:text-[var(--color-brand-primary)] transition-colors">{item.caseName}</h4>
                <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2 bg-[var(--color-surface-bg)] p-2 rounded-md">
                  <AlertCircle className={cn("w-4 h-4", item.urgency === 'Alta' ? 'text-red-500' : 'text-amber-500')} />
                  {item.actionRequired}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-panel rounded-xl flex flex-col h-[500px] overflow-hidden relative">
          <div className="p-5 border-b border-[var(--color-border-dim)] flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Live Agent Flow</h2>
            </div>
            <Link to="/actividad" className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Ver Actividad Completa →
            </Link>
          </div>
          <LiveActivityFeed />
        </div>
      </div>
    </div>
  );
}
