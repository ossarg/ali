import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useClaims, useClaimLookup, useCreateClaim } from '../api/hooks/useClaims';
import type { ClaimLookupResponse, Claim } from '../api/schemas/claim.schemas';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(s: string) {
  try { return format(new Date(s), 'dd/MM/yyyy', { locale: es }); }
  catch { return s; }
}

function StatusBadge({ status }: { status: string }) {
  const isOpen = status.toUpperCase() === 'ABIERTO';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {status}
    </span>
  );
}

// ─── Add Claim Modal ──────────────────────────────────────────────────────────

function AddClaimModal({ onClose }: { onClose: () => void }) {
  const [nroStro, setNroStro] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const { data: lookup, isLoading, error } = useClaimLookup(confirmed ? nroStro : '');
  const createClaim = useCreateClaim();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (nroStro.trim()) setConfirmed(true);
  };

  const handleSave = () => {
    createClaim.mutate(nroStro, {
      onSuccess: onClose,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Agregar siniestro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={nroStro}
              onChange={e => { setNroStro(e.target.value); setConfirmed(false); }}
              placeholder="Número de siniestro"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#eb5d2a]/30 focus:border-[#eb5d2a]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#eb5d2a] text-white text-sm rounded-lg hover:bg-[#d45225] transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="text-sm text-gray-400 animate-pulse text-center py-8">
              Consultando SISE...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm py-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              No se encontró el siniestro o hubo un error al consultar SISE.
            </div>
          )}

          {lookup && <LookupPreview data={lookup} />}
        </div>

        {/* Footer */}
        {lookup && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={createClaim.isPending}
              className="px-4 py-2 text-sm rounded-lg bg-[#eb5d2a] text-white hover:bg-[#d45225] disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {createClaim.isPending ? 'Guardando...' : 'Confirmar y guardar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lookup Preview ───────────────────────────────────────────────────────────

function LookupPreview({ data }: { data: ClaimLookupResponse }) {
  const { claim, policy, producer } = data;
  return (
    <div className="space-y-4">
      {/* Claim */}
      <Section title="Siniestro">
        <Row label="Nro. siniestro"    value={String(claim.nro_siniestro)} />
        <Row label="Fecha incurrido"   value={formatDate(claim.fecha_incurrido)} />
        <Row label="Causa"             value={claim.causa} />
        <Row label="Cobertura"         value={claim.cobertura} />
        <Row label="Estado"            value={claim.estado} />
        <Row label="Importe estimado"  value={`$ ${claim.importe_estimado.toLocaleString('es-AR')}`} />
        <Row label="Contratante"       value={claim.contratante_pagador} />
        <Row label="Documento"         value={`${claim.tomador_tipo_doc} ${claim.tomador_doc}`} />
      </Section>

      {/* Policy */}
      {policy && (
        <Section title="Póliza">
          <Row label="Nro. póliza"       value={String(policy.Numero_Poliza)} />
          <Row label="Ramo"              value={policy.Ramo} />
          <Row label="Tipo"              value={policy.Tipo_de_Poliza} />
          <Row label="Estado"            value={policy.Estado} />
          <Row label="Producto"          value={policy.Producto_comercial} />
          <Row label="Suma asegurada"    value={`$ ${policy.Suma_Asegurada.toLocaleString('es-AR')}`} />
          <Row label="Vigencia"          value={`${formatDate(policy.Vigencia_Desde)} → ${formatDate(policy.Vigencia_Hasta)}`} />
        </Section>
      )}

      {/* Producer */}
      {producer && (
        <Section title="Productor">
          <Row label="Nombre"       value={producer.nombre.trim()} />
          <Row label="Tipo agente"  value={producer.tipo_agente} />
          <Row label="Código"       value={String(producer.cod_agente)} />
          <Row label="Estado"       value={producer.cod_estado === 'A' ? 'Activo' : 'Inactivo'} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode; }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {title}
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value || '—'}</span>
    </div>
  );
}

// ─── Claims List ──────────────────────────────────────────────────────────────

interface ClaimRowProps { claim: Claim; }
function ClaimRow({ claim }: ClaimRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 pr-4">
        <div className="font-medium text-gray-800">{claim.claim_number}</div>
        <div className="text-xs text-gray-400">{claim.sise_claim_id}</div>
      </td>
      <td className="py-3 pr-4">
        <div className="text-sm text-gray-700 truncate max-w-[180px]">{claim.cause || '—'}</div>
        <div className="text-xs text-gray-400 truncate max-w-[180px]">{claim.coverage}</div>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600">{claim.contratante.trim()}</td>
      <td className="py-3 pr-4 text-sm text-gray-500">{formatDate(claim.incident_date)}</td>
      <td className="py-3 pr-4 text-sm text-gray-700">
        $ {claim.estimated_amount.toLocaleString('es-AR')}
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={claim.status} />
      </td>
      <td className="py-3 text-xs text-gray-400">
        {formatDistanceToNow(new Date(claim.created_at), { locale: es, addSuffix: true })}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClaimsPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: claims = [], isLoading } = useClaims();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Siniestros</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#eb5d2a] text-white text-sm rounded-lg hover:bg-[#d45225] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar siniestro
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Cargando...</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No hay siniestros registrados todavía.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-sm text-[#eb5d2a] hover:underline"
            >
              Agregar el primero →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pt-4 px-4">Nro. siniestro</th>
                  <th className="pb-3 pt-4 pr-4">Causa / Cobertura</th>
                  <th className="pb-3 pt-4 pr-4">Contratante</th>
                  <th className="pb-3 pt-4 pr-4">Fecha hecho</th>
                  <th className="pb-3 pt-4 pr-4">Importe est.</th>
                  <th className="pb-3 pt-4 pr-4">Estado</th>
                  <th className="pb-3 pt-4 pr-4">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map(c => (
                  <React.Fragment key={c.id}>
                    <ClaimRow claim={c} />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <AddClaimModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
