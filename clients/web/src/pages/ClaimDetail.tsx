import React, { useState } from 'react';
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
  const isOpen = status.toUpperCase() === 'ABIERTO';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
      isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {status}
    </span>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

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

// ─── Tab: Información ─────────────────────────────────────────────────────────

function InfoTab({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-4">
      <Card title="Siniestro">
        <Row label="Nro. siniestro"   value={String(claim.claim_number)} />
        <Row label="Subreclamo"       value={String(claim.claim_subnumber)} />
        <Row label="Ramo"             value={String(claim.ramo_code)} />
        <Row label="Causa"            value={claim.cause} />
        <Row label="Cobertura"        value={claim.coverage} />
        <Row label="Fecha del hecho"  value={formatDate(claim.incident_date)} />
        <Row label="Fecha de aviso"   value={formatDate(claim.notice_date)} />
        <Row label="Fecha registro"   value={formatDate(claim.registration_date)} />
        {claim.payment_date && (
          <Row label="Fecha de pago"  value={formatDate(claim.payment_date)} />
        )}
        <Row label="Importe estimado" value={currency(claim.estimated_amount)} />
        <Row label="Importe pagado"   value={currency(claim.paid_amount)} />
      </Card>

      <Card title="Partes">
        <Row label="Contratante"  value={claim.contratante.trim()} />
        <Row label="Documento"    value={`${claim.doc_type} ${claim.doc_number}`} />
        <Row label="Productor"    value={claim.producer_name.trim()} />
      </Card>
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
  // TODO: fetch linked case once case detail exists
  const hasCase = false;

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

  // TODO: replace with real case link once case detail page exists
  const linkedCaseId: string | null = null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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
            <StatusBadge status={claim.status} />
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
