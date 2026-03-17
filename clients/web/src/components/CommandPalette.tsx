import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Briefcase, Users, ShieldAlert, Bot, Settings, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_CASES, MOCK_LAWYERS, MOCK_AGENTS } from '../data/mockData';

type CommandItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  onSelect: () => void;
  category: string;
};

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick Actions
  const routes: CommandItem[] = [
    { id: 'r1', title: 'Ir al Dashboard', icon: Activity, onSelect: () => navigate('/'), category: 'Navegación' },
    { id: 'r2', title: 'Ver todos los Casos', icon: Briefcase, onSelect: () => navigate('/casos'), category: 'Navegación' },
    { id: 'r3', title: 'Bandeja de Entrada (Actividad)', icon: Search, onSelect: () => navigate('/actividad'), category: 'Navegación' },
    { id: 'r4', title: 'Configuración de Agentes', icon: Settings, onSelect: () => { /* TODO: route to Settings */ onClose(); }, category: 'Navegación' },
  ];

  // Map data to searchable items
  const caseItems: CommandItem[] = MOCK_CASES.map(c => ({
    id: `case-${c.id}`,
    title: c.title,
    subtitle: `Caso #${c.id} · ${c.stage}`,
    icon: FileText,
    category: 'Casos Activos',
    onSelect: () => navigate(`/casos/${c.id}`),
  }));

  const lawyerItems: CommandItem[] = MOCK_LAWYERS.map(l => ({
    id: `lawyer-${l.id}`,
    title: l.name,
    subtitle: l.seniority,
    icon: Users,
    category: 'Equipo',
    onSelect: () => navigate(`/equipo/${l.id}`),
  }));

  const allItems = [...routes, ...caseItems, ...lawyerItems];

  // Filter based on query
  const filteredItems = query.trim() === '' 
    ? routes // Show only routes by default if no query
    : allItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8); // Limit results

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Slight delay to allow render before focus
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].onSelect();
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-[#e2e8f0] animate-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#f1f5f9]">
          <Search className="w-5 h-5 text-[#94a3b8] shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 ml-3 bg-transparent outline-none text-[#0f172a] placeholder:text-[#94a3b8] text-lg"
            placeholder="Buscar casos, abogados, o comandos... (ej. 'Demanda Lopez')"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-[#f8fafc] border border-[#e2e8f0] rounded px-2 text-xs font-mono font-medium text-[#64748b]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center px-4">
              <Search className="w-8 h-8 mx-auto text-[#cbd5e1] mb-3" />
              <p className="text-sm text-[#64748b] font-medium">No se encontraron resultados para "{query}"</p>
            </div>
          ) : (
            <div className="px-2">
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    index === selectedIndex 
                      ? "bg-[#eb5d2a]/10 text-[var(--color-text-primary)]" 
                      : "hover:bg-[#f8fafc] text-[#475569]"
                  )}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md shrink-0",
                    index === selectedIndex ? "bg-white text-[#eb5d2a] shadow-sm" : "bg-[#f1f5f9]"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      index === selectedIndex ? "text-[#eb5d2a]" : ""
                    )}>{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-[#64748b] truncate">{item.subtitle}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-wider hidden sm:block">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-4 py-2 border-t border-[#f1f5f9] bg-[#f8fafc] text-xs text-[#64748b] flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="bg-white border border-[#e2e8f0] rounded px-1.5 shadow-sm">↑</kbd>
            <kbd className="bg-white border border-[#e2e8f0] rounded px-1.5 shadow-sm">↓</kbd>
            Navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-white border border-[#e2e8f0] rounded px-1.5 shadow-sm">↵</kbd>
            Seleccionar
          </span>
        </div>
      </div>
    </div>
  );
}
