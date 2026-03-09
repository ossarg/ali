import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Briefcase, Bot, Users, BarChart3, Handshake, Bell, Search, Settings, FileText, Activity, ShieldAlert, MessageSquareText, Sun, Moon, Kanban } from 'lucide-react';
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

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleTheme = () => {
    setIsDark(prev => {
      const newDark = !prev;
      if (newDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newDark;
    });
  };

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
    { name: 'Contestaciones', path: '/contestaciones', icon: Kanban },
    { name: 'Documentos', path: '/documentos', icon: FileText },
    { name: 'Equipo', path: '/equipo', icon: Users },
    { name: 'Métricas', path: '/metricas', icon: BarChart3 },
    { name: 'Acuerdos',  path: '/acuerdos',  icon: Handshake },
  ];

  const isAgentesActive = location.pathname === '/agentes';

  return (
    <div className="flex h-screen bg-[var(--color-surface-bg)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-surface-sidebar)] flex flex-col shrink-0 border-r border-[var(--color-border-dim)]">

        {/* Logo / Brand */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[var(--color-brand-primary)] rounded-lg flex items-center justify-center font-bold text-base text-white shrink-0">
              L
            </div>
            <span
              className="font-semibold text-[var(--color-text-primary)]"
              style={{ letterSpacing: '-0.2px' }}
            >
              Libra Seguros
            </span>
          </div>
          <div className="h-px bg-[#E5E7EB] dark:bg-[var(--color-border-dim)]" />
        </div>

        {/* Nav section */}
        <div className="px-3 pb-3 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="text-[0.65rem] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2 px-2">
            Panel de Control
          </div>
          <nav className="space-y-px flex-1 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "sidebar-item relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                    "transition-colors duration-200",
                    isActive
                      ? "bg-[var(--color-sidebar-bg-active)] text-[var(--color-sidebar-text-active)]"
                      : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-bg-hover)]"
                  )}
                  style={{
                    animation: `sidebarItemIn 200ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 30}ms both`,
                  }}
                >
                  {/* Active indicator bar */}
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-[2px] bg-[var(--color-brand-primary)]",
                      "transition-all duration-200",
                      isActive ? "h-5 opacity-100" : "h-0 opacity-0"
                    )}
                  />
                  <item.icon
                    className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-opacity duration-200",
                      isActive
                        ? "opacity-100 text-[var(--color-sidebar-text-active)]"
                        : "opacity-50 text-[var(--color-text-tertiary)]"
                    )}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
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

        {/* Bottom section */}
        <div className="px-3 pb-4">
          <div className="h-px bg-[#E5E7EB] dark:bg-[var(--color-border-dim)] mb-3" />

          <Link
            to="/agentes"
            className={cn(
              "relative flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 text-sm font-medium w-full",
              isAgentesActive
                ? "bg-[var(--color-sidebar-bg-active)] text-[var(--color-sidebar-text-active)]"
                : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-bg-hover)]"
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-[2px] bg-[var(--color-brand-primary)]",
                "transition-all duration-200",
                isAgentesActive ? "h-5 opacity-100" : "h-0 opacity-0"
              )}
            />
            <Settings
              className={cn(
                "w-[18px] h-[18px] shrink-0 transition-opacity duration-200",
                isAgentesActive
                  ? "opacity-100 text-[var(--color-sidebar-text-active)]"
                  : "opacity-50 text-[var(--color-text-tertiary)]"
              )}
            />
            Configuración
          </Link>

          <div className="mt-1 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-sidebar-bg-hover)] transition-colors duration-150 cursor-pointer">
            <div className="w-8 h-8 bg-[var(--color-surface-bg)] text-[var(--color-text-primary)] rounded-full flex items-center justify-center text-xs font-semibold border border-[var(--color-border-dim)] shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{displayName}</span>
              <span className="text-xs text-[var(--color-text-tertiary)] capitalize">{user?.role ?? ''}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 glass-panel border-b border-[var(--color-border-dim)] flex items-center justify-between px-8 shrink-0 absolute top-0 w-full z-10 header-fade-in">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold text-[var(--color-text-primary)] tracking-tight">
              Buenos días, {user?.first_name ?? ''}
            </h1>
            <span className="text-[#D1D5DB] text-sm select-none">·</span>
            <span className="text-sm text-[var(--color-text-tertiary)] capitalize font-normal">{today}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCmdKOpen(true)}
              className="search-trigger relative flex items-center w-60 h-9 pl-3 pr-2 bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-lg text-sm transition-all duration-150 group shadow-sm hover:border-[#D1D5DB] focus-visible:border-[var(--color-brand-primary)] focus-visible:outline-none"
            >
              <Search className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-primary)] transition-colors shrink-0" />
              <span className="ml-2 text-[var(--color-text-tertiary)]">Buscar...</span>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="hidden sm:inline-flex items-center justify-center font-sans text-[10px] font-medium text-[var(--color-text-tertiary)] bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded px-1.5 h-5">
                  ⌘
                </kbd>
                <kbd className="hidden sm:inline-flex items-center justify-center font-sans text-[10px] font-medium text-[var(--color-text-tertiary)] bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded px-1.5 h-5">
                  K
                </kbd>
              </div>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-bg-hover)] transition-all duration-150"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-bg-hover)] transition-all duration-150"
              >
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] bg-red-500 rounded-full" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 bg-[var(--color-surface-card)] rounded-xl shadow-lg border border-[var(--color-border-dim)] animate-in z-50 overflow-hidden">
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
