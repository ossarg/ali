import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Briefcase, Bot, Users, BarChart3, Bell, Search, Settings, FileText, Activity, ShieldAlert, MessageSquareText, Handshake } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { formatTableTime } from '../lib/formatTime';
import { es } from 'date-fns/locale';
import { useCaseEventMetrics, usePendingEvents } from '../api/hooks/useCaseEvents';
import CommandPalette from './CommandPalette';

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  const today = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });
  const displayName = user ? `${user.first_name} ${user.last_name}` : '';
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?';

  const navigate = useNavigate();
  const { data: eventMetrics } = useCaseEventMetrics();
  const pendingCount = eventMetrics?.pending ?? 0;
  const { data: pendingEvents = [] } = usePendingEvents();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [cmdKOpen, setCmdKOpen] = useState(false);

  // Close notif dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Global Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdKOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { name: 'Panel Principal', path: '/', icon: LayoutDashboard },
    { name: 'Inbox', path: '/actividad', icon: Activity, badge: pendingCount > 0 ? pendingCount : undefined },
    { name: 'Siniestros', path: '/siniestros', icon: ShieldAlert },
    { name: 'Casos', path: '/casos', icon: Briefcase },
    { name: 'Documentos', path: '/documentos', icon: FileText },
    { name: 'Equipo', path: '/equipo', icon: Users },
    { name: 'Métricas', path: '/metricas', icon: BarChart3 },
    { name: 'Acuerdos',  path: '/acuerdos',  icon: Handshake },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-surface-bg)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-surface-sidebar)] text-[var(--color-sidebar-text)] flex flex-col shrink-0 border-r border-[var(--color-border-dim)]">
        <div className="p-6 flex items-center gap-3 border-b border-[var(--color-border-dim)]">
          <div className="w-8 h-8 bg-[var(--color-brand-primary)] rounded flex items-center justify-center font-bold text-lg text-white">L</div>
          <span className="font-semibold text-lg text-white tracking-wide">Libra Seguros</span>
        </div>
        
        <div className="px-4 py-6">
          <div className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4 px-2">Panel de Control</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm font-medium",
                    isActive 
                      ? "bg-[var(--color-sidebar-bg-active)] text-[var(--color-sidebar-text-active)]" 
                      : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-bg-hover)] hover:text-[var(--color-sidebar-text-hover)]"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-[var(--color-sidebar-text-active)]" : "text-[var(--color-text-tertiary)]")} />
                  <span className="flex-1">{item.name}</span>
                  {'badge' in item && item.badge !== undefined && (
                    <span className="ml-auto bg-amber-400 text-amber-900 text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-[var(--color-border-dim)]">
          <Link 
            to="/agentes" 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium w-full",
              location.pathname === '/agentes'
                ? "bg-[var(--color-sidebar-bg-active)] text-[var(--color-sidebar-text-active)]"
                : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-bg-hover)] hover:text-[var(--color-sidebar-text-hover)]"
            )}
          >
             <Settings className={cn("w-5 h-5", location.pathname === '/agentes' ? "text-[var(--color-sidebar-text-active)]" : "text-[var(--color-text-tertiary)]")} />
             Configuración
          </Link>
          <div className="mt-4 flex items-center gap-3 px-3">
            <div className="w-8 h-8 bg-[var(--color-surface-bg)] text-[var(--color-text-primary)] rounded-full flex items-center justify-center text-sm font-medium border border-[var(--color-border-dim)]">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{displayName}</span>
              <span className="text-xs text-[var(--color-text-tertiary)] capitalize">{user?.role ?? ''}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar w/ Glassmorphism */}
        <header className="h-16 glass-panel border-b border-[var(--color-border-dim)] flex items-center justify-between px-8 shrink-0 absolute top-0 w-full z-10 transition-all">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
              Buenos días, {user?.first_name ?? ''}
            </h1>
            <span className="text-sm text-[var(--color-text-secondary)] ml-2 capitalize font-medium">{today}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCmdKOpen(true)}
              className="relative flex items-center w-64 h-9 pl-3 pr-2 bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] hover:border-[var(--color-border-focus)] rounded-md text-sm transition-all group shadow-sm"
            >
              <Search className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-primary)] transition-colors" />
              <span className="ml-2 text-[var(--color-text-secondary)]">Buscar...</span>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="hidden sm:inline-flex items-center justify-center font-sans text-xs font-semibold text-[var(--color-text-tertiary)] bg-white border border-[var(--color-border-dim)] rounded-md px-1.5 h-5 shadow-sm">
                  ⌘
                </kbd>
                <kbd className="hidden sm:inline-flex items-center justify-center font-sans text-xs font-semibold text-[var(--color-text-tertiary)] bg-white border border-[var(--color-border-dim)] rounded-md px-1.5 h-5 shadow-sm">
                  K
                </kbd>
              </div>
            </button>
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] bg-[var(--color-brand-primary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-8 w-80 bg-[var(--color-surface-card)] rounded-xl shadow-lg border border-[var(--color-border-dim)] animate-in z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-border-dim)] flex items-center justify-between">
                    <span className="font-semibold text-sm text-[var(--color-text-primary)]">Notificaciones</span>
                    {pendingCount > 0 && (
                      <span className="text-xs bg-[var(--color-sidebar-bg-active)] text-[var(--color-brand-primary)] font-medium px-2 py-0.5 rounded-full">
                        {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {pendingEvents.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">
                        Sin notificaciones pendientes
                      </p>
                    ) : (
                      pendingEvents.slice(0, 5).map(event => (
                        <div key={event.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {event.subject || event.mail_id}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Rachel → <span className="font-medium">{event.mail_type}</span>
                                {' · '}{Math.round(event.confidence * 100)}% confianza
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {formatTableTime(event.received_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {pendingEvents.length > 0 && (
                    <div className="border-t border-[var(--color-border-dim)]">
                      <button
                        onClick={() => { navigate('/actividad'); setNotifOpen(false); }}
                        className="w-full text-sm text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] font-medium py-3 hover:bg-[var(--color-sidebar-bg-active)] transition-colors"
                      >
                        Ver todas las clasificaciones →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 pt-24">
          <div className="animate-in">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette isOpen={cmdKOpen} onClose={() => setCmdKOpen(false)} />
    </div>
  );
}
