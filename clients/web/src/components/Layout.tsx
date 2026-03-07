import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Briefcase, Bot, Users, BarChart3, Bell, Search, Settings, FileText, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { formatTableTime } from '../lib/formatTime';
import { es } from 'date-fns/locale';
import { useCaseEventMetrics, usePendingEvents } from '../api/hooks/useCaseEvents';

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { name: 'Panel Principal', path: '/', icon: LayoutDashboard },
    { name: 'Casos', path: '/casos', icon: Briefcase },
    { name: 'Agentes', path: '/agentes', icon: Bot },
    { name: 'Equipo', path: '/equipo', icon: Users },
    { name: 'Métricas', path: '/metricas', icon: BarChart3 },
    { name: 'Documentos', path: '/documentos', icon: FileText },
    { name: 'Actividad', path: '/actividad', icon: Activity, badge: pendingCount > 0 ? pendingCount : undefined },
  ];

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1a1a1a] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#455362] text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-[#eb5d2a] rounded flex items-center justify-center font-bold text-lg">L</div>
          <span className="font-semibold text-lg tracking-wide">Libra Seguros</span>
        </div>
        
        <div className="px-4 py-6">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 px-2">Panel de Control</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-[#eb5d2a]" : "text-white/50")} />
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

        <div className="mt-auto p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white w-full">
            <Settings className="w-5 h-5 text-white/50" />
            Configuración
          </button>
          <div className="mt-4 flex items-center gap-3 px-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-white/50 capitalize">{user?.role ?? ''}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#455362]">
              Buenos días, {user?.first_name ?? ''}
            </h1>
            <span className="text-sm text-[#6b7280] ml-2 capitalize">{today}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input 
                type="text" 
                placeholder="Buscar caso, póliza, abogado..." 
                className="pl-9 pr-4 py-1.5 bg-[#f7f8fa] border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#eb5d2a]/20 focus:border-[#eb5d2a] w-64 transition-all"
              />
            </div>
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
              >
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-8 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">Notificaciones</span>
                    {pendingCount > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
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
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => { navigate('/actividad'); setNotifOpen(false); }}
                        className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-3 hover:bg-indigo-50 transition-colors"
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
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
