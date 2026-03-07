import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Briefcase, Bot, Users, BarChart3, Bell, Search, Settings, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  const today = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });
  const displayName = user ? `${user.first_name} ${user.last_name}` : '';
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?';

  const navItems = [
    { name: 'Panel Principal', path: '/', icon: LayoutDashboard },
    { name: 'Casos', path: '/casos', icon: Briefcase },
    { name: 'Agentes', path: '/agentes', icon: Bot },
    { name: 'Equipo', path: '/equipo', icon: Users },
    { name: 'Métricas', path: '/metricas', icon: BarChart3 },
    { name: 'Documentos', path: '/documentos', icon: FileText },
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
                  {item.name}
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
            <button className="relative text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ef4444] rounded-full"></span>
            </button>
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
