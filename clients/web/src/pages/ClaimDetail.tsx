import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatTableTime } from '../lib/formatTime';
import { useClaimById } from '../api/hooks/useClaims';
import type { Claim } from '../api/schemas/claim.schemas';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(s: string) {
  try { return format(new Date(s), 'dd/MM/yyyy', { locale: es }); }
  catch { return '—'; }
}

function currency(n: number) {
  return `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase();
  const color =
    upper === 'ABIERTO'   ? 'bg-green-100 text-green-700'  :
    upper === 'MEDIACION' ? 'bg-amber-100 text-amber-700'  :
    upper === 'JUICIO'    ? 'bg-red-100 text-red-700'      :
    upper === 'RECHAZO'   ? 'bg-orange-100 text-orange-700':
    upper === 'TERMINADO' ? 'bg-blue-100 text-blue-700'    :
    'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {status || '—'}
    </span>
  );
}

// ─── Shared card components ───────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value || '—'}</span>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'info' | 'asegurado' | 'productor' | 'proceso';

const TABS: { id: Tab; label: string }[] = [
  { id: 'info',      label: 'Información'     },
  { id: 'asegurado', label: 'Asegurado'       },
  { id: 'productor', label: 'Productor'       },
  { id: 'proceso',   label: 'Proceso judicial' },
];

// ─── Stages accordion ────────────────────────────────────────────────────────

import type { ClaimStage } from '../api/schemas/claim.schemas';

function StageStatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase();
  const color =
    upper === 'ABIERTO'   ? 'bg-green-100 text-green-700'  :
    upper === 'MEDIACION' ? 'bg-amber-100 text-amber-700'  :
    upper === 'JUICIO'    ? 'bg-red-100 text-red-700'      :
    upper === 'RECHAZO'   ? 'bg-orange-100 text-orange-700':
    upper === 'TERMINADO' ? 'bg-blue-100 text-blue-700'    :
    'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

function StagesAccordion({ stages }: { stages: ClaimStage[] }) {
  const [openId, setOpenId] = useState<string | null>(
    stages.length > 0 ? stages[stages.length - 1].id : null
  );

  const toggle = useCallback((id: string) => {
    setOpenId(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Etapas SISE</span>
      </div>
      <div className="divide-y divide-gray-100">
        {stages.map(stage => {
          const isOpen = openId === stage.id;
          const payments = stage.payments ?? [];
          return (
            <div key={stage.id}>
              {/* Stage header — clickable */}
              <button
                onClick={() => toggle(stage.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-24 shrink-0">
                    Subreclamo {stage.stage_number}
                  </span>
                  <StageStatusBadge status={stage.status} />
                </div>
                <div className="flex items-center gap-3">
                  {payments.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {payments.length} pago{payments.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Payments — expanded */}
              {isOpen && (
                <div className="bg-gray-50 border-t border-gray-100">
                  {payments.length === 0 ? (
                    <p className="px-5 py-3 text-xs text-gray-400 italic">Sin pagos registrados.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-400 uppercase tracking-wide">
                          <th className="px-5 py-2 text-left font-medium">Fecha de pago</th>
                          <th className="px-5 py-2 text-right font-medium">Importe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {payments.map(p => (
                          <tr key={p.id} className="hover:bg-white transition-colors">
                            <td className="px-5 py-2.5 text-gray-600">{formatDate(p.payment_date)}</td>
                            <td className="px-5 py-2.5 text-gray-800 text-right font-medium">
                              {currency(p.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Información ─────────────────────────────────────────────────────────

function InfoTab({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-4">
      <Card title="Siniestro">
        <Row label="Nro. siniestro"  value={String(claim.claim_number)} />
        <Row label="Ramo"            value={String(claim.ramo_code)} />
        <Row label="Causa"           value={claim.cause} />
        <Row label="Cobertura"       value={claim.coverage} />
        <Row label="Fecha del hecho" value={formatDate(claim.incident_date)} />
        <Row label="Fecha de aviso"  value={formatDate(claim.notice_date)} />
        <Row label="Fecha registro"  value={formatDate(claim.registration_date)} />
      </Card>

      <Card title="Partes">
        <Row label="Contratante" value={claim.contratante.trim()} />
        <Row label="Documento"   value={`${claim.doc_type} ${claim.doc_number}`} />
        <Row label="Productor"   value={claim.producer_name.trim()} />
      </Card>

      {claim.stages && claim.stages.length > 0 && (
        <StagesAccordion stages={claim.stages} />
      )}
    </div>
  );
}

// ─── Tab: Asegurado ───────────────────────────────────────────────────────────

function AseguradoTab({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-4">
      <Card title="Contratante">
        <Row label="Nombre"    value={claim.contratante.trim()} />
        <Row label="Tipo doc." value={claim.doc_type} />
        <Row label="Documento" value={claim.doc_number} />
      </Card>

      <Card title="Póliza">
        <Row label="Nro. póliza"    value={String(claim.policy_number)} />
        <Row label="Endoso"         value={String(claim.policy_endorsement)} />
        <Row label="Tipo"           value={claim.policy_type} />
        <Row label="Suma asegurada" value={currency(claim.insured_amount)} />
        <Row label="Vigencia desde" value={formatDate(claim.policy_valid_from)} />
        <Row label="Vigencia hasta" value={formatDate(claim.policy_valid_to)} />
        <Row label="Producto"       value={claim.commercial_product} />
      </Card>
    </div>
  );
}

// ─── Tab: Productor ───────────────────────────────────────────────────────────

function ProductorTab({ claim }: { claim: Claim }) {
  return (
    <Card title="Productor">
      <Row label="Nombre"      value={claim.producer_name.trim()} />
      <Row label="Código"      value={String(claim.producer_code)} />
      <Row label="Tipo agente" value={claim.producer_type} />
      <Row label="Estado"      value={claim.producer_status === 'A' ? 'Activo' : 'Inactivo'} />
    </Card>
  );
}

// ─── Tab: Proceso judicial ────────────────────────────────────────────────────

function ProcesoTab() {
  const hasCase = false; // TODO: link to real case once case detail exists

  if (hasCase) {
    return (
      <Card title="Caso judicial">
        <div className="p-5">
          <a href="/casos/TODO" className="flex items-center gap-2 text-sm text-[#eb5d2a] hover:underline">
            <ExternalLink className="w-4 h-4" />
            Ver detalle del caso
          </a>
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 gap-3">
      <Scale className="w-10 h-10 text-gray-200" />
      <p className="text-sm text-gray-400">No hay proceso judicial iniciado para este siniestro.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: claim, isLoading, error } = useClaimById(id ?? '');
  const [activeTab, setActiveTab] = useState<Tab>('info');

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-400 animate-pulse">Cargando siniestro...</div>;
  }

  if (error || !claim) {
    return <div className="p-8 text-sm text-red-500">No se encontró el siniestro.</div>;
  }

  const linkedCaseId: string | null = null; // TODO: from claim.case_id once wired

  return (
    <div className="px-6 pt-1 pb-6 max-w-7xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/siniestros')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Siniestros
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">#{claim.claim_number}</h1>
            <StatusBadge status={claim.current_status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {claim.contratante.trim()} • {claim.doc_type} {claim.doc_number}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Registrado {formatTableTime(claim.created_at)}
          </p>
        </div>

        {/* CTA */}
        {linkedCaseId ? (
          <a
            href={`/casos/${linkedCaseId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-[#eb5d2a] text-[#eb5d2a] rounded-lg hover:bg-[#eb5d2a]/5 transition-colors shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            Ver caso judicial
          </a>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#eb5d2a] text-white rounded-lg opacity-40 cursor-not-allowed shrink-0"
          >
            <FileText className="w-4 h-4" />
            Iniciar caso judicial
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[#eb5d2a] text-[#eb5d2a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'info'      && <InfoTab      claim={claim} />}
        {activeTab === 'asegurado' && <AseguradoTab claim={claim} />}
        {activeTab === 'productor' && <ProductorTab claim={claim} />}
        {activeTab === 'proceso'   && <ProcesoTab />}
      </div>
    </div>
  );
}
