import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
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

// ─── Section card ─────────────────────────────────────────────────────────────

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

// ─── Claim detail sections ────────────────────────────────────────────────────

function ClaimSection({ claim }: { claim: Claim }) {
  return (
    <Card title="Siniestro">
      <Row label="Nro. siniestro"    value={String(claim.claim_number)} />
      <Row label="Subreclamo"        value={String(claim.claim_subnumber)} />
      <Row label="Ramo"              value={String(claim.ramo_code)} />
      <Row label="Causa"             value={claim.cause} />
      <Row label="Cobertura"         value={claim.coverage} />
      <Row label="Fecha del hecho"   value={formatDate(claim.incident_date)} />
      <Row label="Fecha de aviso"    value={formatDate(claim.notice_date)} />
      <Row label="Fecha registro"    value={formatDate(claim.registration_date)} />
      {claim.payment_date && (
        <Row label="Fecha de pago"   value={formatDate(claim.payment_date)} />
      )}
      <Row label="Importe estimado"  value={currency(claim.estimated_amount)} />
      <Row label="Importe pagado"    value={currency(claim.paid_amount)} />
    </Card>
  );
}

function PolicyholderSection({ claim }: { claim: Claim }) {
  return (
    <Card title="Asegurado / Contratante">
      <Row label="Nombre"      value={claim.contratante} />
      <Row label="Tipo doc."   value={claim.doc_type} />
      <Row label="Documento"   value={claim.doc_number} />
    </Card>
  );
}

function PolicySection({ claim }: { claim: Claim }) {
  return (
    <Card title="Póliza">
      <Row label="Nro. póliza"      value={String(claim.policy_number)} />
      <Row label="Endoso"           value={String(claim.policy_endorsement)} />
      <Row label="Tipo"             value={claim.policy_type} />
      <Row label="Suma asegurada"   value={currency(claim.insured_amount)} />
      <Row label="Vigencia desde"   value={formatDate(claim.policy_valid_from)} />
      <Row label="Vigencia hasta"   value={formatDate(claim.policy_valid_to)} />
      <Row label="Producto"         value={claim.commercial_product} />
    </Card>
  );
}

function ProducerSection({ claim }: { claim: Claim }) {
  return (
    <Card title="Productor">
      <Row label="Nombre"      value={claim.producer_name.trim()} />
      <Row label="Código"      value={String(claim.producer_code)} />
      <Row label="Tipo agente" value={claim.producer_type} />
      <Row label="Estado"      value={claim.producer_status === 'A' ? 'Activo' : 'Inactivo'} />
    </Card>
  );
}

// ─── Right panel ─────────────────────────────────────────────────────────────

function CasePanel() {
  // TODO: fetch linked case once case detail page exists
  const hasCase = false;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Caso judicial</span>
      </div>
      {hasCase ? (
        <div className="p-5">
          <a
            href="/casos/TODO"
            className="flex items-center gap-2 text-sm text-[#eb5d2a] hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Ver detalle del caso
          </a>
        </div>
      ) : (
        <div className="p-5 flex flex-col items-center gap-3 py-8">
          <FileText className="w-8 h-8 text-gray-300" />
          <p className="text-sm text-gray-400 text-center">
            Este siniestro no tiene un caso judicial asociado.
          </p>
          <button
            disabled
            className="mt-1 px-4 py-2 text-sm rounded-lg bg-[#eb5d2a] text-white opacity-40 cursor-not-allowed"
          >
            Iniciar caso judicial
          </button>
          <p className="text-xs text-gray-300">Próximamente</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: claim, isLoading, error } = useClaimById(id ?? '');

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-gray-400 animate-pulse">Cargando siniestro...</div>
    );
  }

  if (error || !claim) {
    return (
      <div className="p-8 text-sm text-red-500">No se encontró el siniestro.</div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/siniestros')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Siniestros
        </button>

        <div className="flex items-start justify-between">
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
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — data */}
        <div className="lg:col-span-2 space-y-4">
          <ClaimSection      claim={claim} />
          <PolicyholderSection claim={claim} />
          <PolicySection     claim={claim} />
          <ProducerSection   claim={claim} />
        </div>

        {/* Right — case panel */}
        <div className="space-y-4">
          <CasePanel />
        </div>
      </div>
    </div>
  );
}
