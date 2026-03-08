import { useState } from 'react';
import { MOCK_AGENTS } from '../data/mockData';
import { Save, Bot, Settings, Power, SlidersHorizontal, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Agents() {
  // Local state to simulate unsaved changes
  const [agents, setAgents] = useState(MOCK_AGENTS.map(a => ({
    ...a,
    isActive: a.status === 'Activo',
    confidenceThreshold: a.name.includes('Rachel') ? 85 : 90,
    systemPrompt: `Eres ${a.name}, un agente especializado en ${a.description}. Tu objetivo es procesar la información entrante con la mayor precisión posible y notificar a los abogados humanos cuando la confianza sea baja.`
  })));

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    setHasChanges(true);
  };

  const handleSliderChange = (id: string, value: number) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, confidenceThreshold: value } : a));
    setHasChanges(true);
  };

  const handlePromptChange = (id: string, value: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, systemPrompt: value } : a));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border-dim)]">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Configuración de Agentes</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Administra el comportamiento y los parámetros de los agentes de IA del equipo.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm",
            hasChanges 
              ? "bg-[var(--color-brand-primary)] text-white hover:bg-[#d44d1e]" 
              : "bg-[var(--color-surface-bg)] text-[var(--color-text-tertiary)] border border-[var(--color-border-dim)] cursor-not-allowed"
          )}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="space-y-6">
        {agents.map(agent => (
          <div key={agent.id} className="glass-panel rounded-xl overflow-hidden shadow-sm transition-all focus-within:border-[var(--color-border-focus)]">
            
            {/* Header / Main Toggle */}
            <div className="p-6 border-b border-[var(--color-border-dim)] bg-white/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-colors",
                  agent.isActive ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-[var(--color-surface-bg)] border-[var(--color-border-dim)] text-[var(--color-text-tertiary)]"
                )}>
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{agent.name}</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">{agent.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={cn("text-xs font-semibold uppercase tracking-wider", agent.isActive ? "text-green-600" : "text-[var(--color-text-tertiary)]")}>
                  {agent.isActive ? 'Activo' : 'Apagado'}
                </span>
                <button 
                  onClick={() => handleToggle(agent.id)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2",
                    agent.isActive ? "bg-[var(--color-brand-primary)]" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                    agent.isActive ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>

            {/* Config Body */}
            <div className={cn(
              "p-6 grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 bg-white",
              !agent.isActive && "opacity-50 pointer-events-none grayscale"
            )}>
              
              {/* Left Col: Sliders & Quick Settings */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      Umbral de Confianza
                    </label>
                    <span className="text-sm font-medium text-[var(--color-brand-primary)]">{agent.confidenceThreshold}%</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                    Si la confianza del agente cae por debajo de este valor, la tarea requerirá aprobación humana.
                  </p>
                  <input 
                    type="range" 
                    min="50" max="99" 
                    value={agent.confidenceThreshold}
                    onChange={(e) => handleSliderChange(agent.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-primary)]"
                  />
                  <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] mt-2 font-medium">
                    <span>50% (Permisivo)</span>
                    <span>99% (Estricto)</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--color-border-dim)]">
                  <label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    Parámetros Operativos
                  </label>
                  <div className="space-y-3 mt-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]" onChange={() => setHasChanges(true)} />
                      <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">Aprender de correcciones humanas</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]" onChange={() => setHasChanges(true)} />
                      <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">Notificar por email en caso de falla</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Col: System Prompts */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                  Instrucciones Base (System Prompt)
                </label>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Modifica las directivas principales que guían el razonamiento de este agente.
                </p>
                <textarea 
                  value={agent.systemPrompt}
                  onChange={(e) => handlePromptChange(agent.id, e.target.value)}
                  className="w-full h-48 p-4 bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] font-mono resize-none leading-relaxed"
                />
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
