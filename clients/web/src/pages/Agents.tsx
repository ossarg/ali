import { useState } from 'react';
import { Save, DollarSign, GitBranch, ShieldAlert, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import PageHeader from '../components/PageHeader';

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Default config state — matches the v1 spec (umbrales + flags + escalation) */
/* ──────────────────────────────────────────────────────────────────────────── */

interface AmountThresholds {
  baja: number;
  media: number;
  alta: number;
  critica: number;
}

interface PipelineFlags {
  borradorAutomatico: boolean;
  skipReviewBaja: boolean;
}

interface EscalationRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  value?: string;
}

const DEFAULT_THRESHOLDS: AmountThresholds = {
  baja: 5_000_000,
  media: 15_000_000,
  alta: 50_000_000,
  critica: 100_000_000,
};

const DEFAULT_FLAGS: PipelineFlags = {
  borradorAutomatico: true,
  skipReviewBaja: false,
};

const DEFAULT_ESCALATION: EscalationRule[] = [
  { id: 'monto_alto', label: 'Monto supera umbral', description: 'Si el monto reclamado supera el umbral "Crítica", forzar revisión humana antes de asignar.', enabled: true, value: '100000000' },
  { id: 'fallecimiento', label: 'Siniestro con fallecimiento', description: 'Si la causa del siniestro involucra fallecimiento, escalar inmediatamente al abogado Senior asignado.', enabled: true },
  { id: 'dano_punitivo', label: 'Reclamo de daño punitivo', description: 'Si la demanda incluye reclamo de daños punitivos, escalar y bloquear borrador automático.', enabled: true },
  { id: 'multi_demandante', label: 'Demanda colectiva / Múltiples demandantes', description: 'Si hay más de un demandante, escalar para revisión de equipo.', enabled: false },
  { id: 'jurisdiccion_federal', label: 'Jurisdicción federal', description: 'Casos en juzgados federales requieren aprobación del head del departamento.', enabled: false },
];

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Number formatter helper                                                    */
/* ──────────────────────────────────────────────────────────────────────────── */
function fmtARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Main Component                                                             */
/* ──────────────────────────────────────────────────────────────────────────── */

export default function Agents() {
  const [thresholds, setThresholds] = useState<AmountThresholds>(DEFAULT_THRESHOLDS);
  const [flags, setFlags] = useState<PipelineFlags>(DEFAULT_FLAGS);
  const [escalation, setEscalation] = useState<EscalationRule[]>(DEFAULT_ESCALATION);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ thresholds: true, flags: true, escalation: true });

  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); setHasChanges(false); }, 800);
  };

  const updateThreshold = (key: keyof AmountThresholds, value: string) => {
    const num = parseInt(value.replace(/\D/g, ''), 10) || 0;
    setThresholds(prev => ({ ...prev, [key]: num }));
    setHasChanges(true);
  };

  const toggleFlag = (key: keyof PipelineFlags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const toggleEscalation = (id: string) => {
    setEscalation(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    setHasChanges(true);
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Configuración"
        subtitle="Parámetros operativos que determinan cómo los agentes procesan los casos."
        actions={
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm",
              hasChanges
                ? "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)]"
                : "bg-[var(--color-surface-card)] text-[var(--color-text-tertiary)] border border-[var(--color-border-dim)] cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        }
      />
      <div className="max-w-4xl mx-auto space-y-8">

      {/* ─── Section 1: Umbrales de Monto ─────────────────────────────────── */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-surface-bg)] transition-colors"
          onClick={() => toggleSection('thresholds')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Umbrales de Monto</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">Rangos ARS para clasificación de riesgo — Usado por Edu (Risk Assessment)</p>
            </div>
          </div>
          {openSections.thresholds ? <ChevronDown className="w-5 h-5 text-[var(--color-text-tertiary)]" /> : <ChevronRight className="w-5 h-5 text-[var(--color-text-tertiary)]" />}
        </button>

        {openSections.thresholds && (
          <div className="px-5 pb-5 border-t border-[var(--color-border-dim)]">
            <div className="flex items-start gap-2 mt-4 mb-5 p-3 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Estos umbrales definen cómo <strong>Edu</strong> clasifica el riesgo de cada caso. Ajustá periódicamente por inflación. 
                Montos por debajo del umbral "Baja" se clasifican automáticamente como riesgo bajo.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([
                { key: 'baja' as const, label: 'Baja Complejidad', hint: 'Hasta este monto → riesgo bajo', color: 'border-l-green-500' },
                { key: 'media' as const, label: 'Media Complejidad', hint: 'Hasta este monto → riesgo medio', color: 'border-l-amber-500' },
                { key: 'alta' as const, label: 'Alta Complejidad', hint: 'Hasta este monto → riesgo alto', color: 'border-l-orange-500' },
                { key: 'critica' as const, label: 'Crítica', hint: 'A partir de este monto → escalación forzosa', color: 'border-l-red-500' },
              ]).map(item => (
                <div key={item.key} className={cn("p-4 bg-[var(--color-surface-bg)] rounded-lg border border-[var(--color-border-dim)] border-l-4", item.color)}>
                  <label className="text-sm font-semibold text-[var(--color-text-primary)] block mb-1">{item.label}</label>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-3">{item.hint}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">ARS</span>
                    <input
                      type="text"
                      value={thresholds[item.key].toLocaleString('es-AR')}
                      onChange={e => updateThreshold(item.key, e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-lg text-sm font-mono text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)] transition-colors"
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-2 text-right">{fmtARS(thresholds[item.key])}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Section 2: Pipeline Flags ────────────────────────────────────── */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-surface-bg)] transition-colors"
          onClick={() => toggleSection('flags')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Pipeline Flags</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">Controles de automatización del pipeline — Usado por Ali (Orquestación)</p>
            </div>
          </div>
          {openSections.flags ? <ChevronDown className="w-5 h-5 text-[var(--color-text-tertiary)]" /> : <ChevronRight className="w-5 h-5 text-[var(--color-text-tertiary)]" />}
        </button>

        {openSections.flags && (
          <div className="px-5 pb-5 border-t border-[var(--color-border-dim)] pt-4 space-y-4">
            {/* Borrador Automático */}
            <div className="flex items-start justify-between p-4 bg-[var(--color-surface-bg)] rounded-lg border border-[var(--color-border-dim)]">
              <div className="flex-1 mr-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Borrador Automático</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Cuando está activado, <strong>Jess</strong> genera automáticamente un borrador de contestación una vez que el triage de <strong>Edu</strong> se completa. 
                  Si se desactiva, el pipeline se detiene después del triage y requiere intervención manual.
                </p>
              </div>
              <button 
                onClick={() => toggleFlag('borradorAutomatico')}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2 shrink-0 mt-1",
                  flags.borradorAutomatico ? "bg-[var(--color-brand-primary)]" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                  flags.borradorAutomatico ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            {/* Skip Review Baja */}
            <div className="flex items-start justify-between p-4 bg-[var(--color-surface-bg)] rounded-lg border border-[var(--color-border-dim)]">
              <div className="flex-1 mr-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Omitir Revisión para Baja Complejidad</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Si se activa, los casos clasificados como <em>Baja Complejidad</em> por <strong>Edu</strong> saltan la verificación de <strong>Lou</strong> y van directo a la revisión final del abogado.
                  <span className="text-amber-600 dark:text-amber-400 font-medium"> ⚠ Usar con cautela.</span>
                </p>
              </div>
              <button 
                onClick={() => toggleFlag('skipReviewBaja')}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2 shrink-0 mt-1",
                  flags.skipReviewBaja ? "bg-[var(--color-brand-primary)]" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                  flags.skipReviewBaja ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Section 3: Reglas de Escalación ──────────────────────────────── */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-surface-bg)] transition-colors"
          onClick={() => toggleSection('escalation')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Reglas de Escalación</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">Condiciones que fuerzan intervención humana — Usado por Edu + Ali</p>
            </div>
          </div>
          {openSections.escalation ? <ChevronDown className="w-5 h-5 text-[var(--color-text-tertiary)]" /> : <ChevronRight className="w-5 h-5 text-[var(--color-text-tertiary)]" />}
        </button>

        {openSections.escalation && (
          <div className="px-5 pb-5 border-t border-[var(--color-border-dim)] pt-4 space-y-3">
            {escalation.map(rule => (
              <div 
                key={rule.id} 
                className={cn(
                  "flex items-start justify-between p-4 rounded-lg border transition-all",
                  rule.enabled 
                    ? "bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10" 
                    : "bg-[var(--color-surface-bg)] border-[var(--color-border-dim)]"
                )}
              >
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{rule.label}</h3>
                    {rule.enabled && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">Activa</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{rule.description}</p>
                </div>
                <button 
                  onClick={() => toggleEscalation(rule.id)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2 shrink-0 mt-1",
                    rule.enabled ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                    rule.enabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-center pb-4">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          ¿Necesitás configurar umbrales de confianza, asignación de abogados o templates? <span className="text-[var(--color-brand-primary)] font-medium cursor-pointer hover:underline">Contactar al equipo →</span>
        </p>
      </div>
      </div>
    </div>
  );
}
