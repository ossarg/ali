import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatTableTime } from '../lib/formatTime';
import { Search, Plus, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useClaimsPaginated, useClaimLookup, useCreateClaim, useClaimMetrics } from '../api/hooks/useClaims';
import Pagination from '../components/Pagination';
import { useUnresolvedEvents, useRetryResolution, useBatchResolve } from '../api/hooks/useCaseEvents';
import { useQueryClient } from '@tanstack/react-query';
import { claimKeys } from '../api/services/claim.service';
import type { ClaimLookupResponse, Claim } from '../api/schemas/claim.schemas';
import type { CaseEvent, RetryResolutionRequest } from '../api/schemas/case.schemas';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(s: string) {
  try { return format(new Date(s), 'dd/MM/yyyy', { locale: es }); }
  catch { return s; }
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
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
  const header = claim.Header;
  const latestStage = claim.Stages.length > 0 ? claim.Stages[claim.Stages.length - 1] : null;

  return (
    <div className="space-y-4">
      {/* Claim header */}
      <Section title="Siniestro">
        <Row label="Nro. siniestro"  value={String(header.nro_siniestro)} />
        <Row label="Fecha incurrido" value={formatDate(header.fecha_incurrido)} />
        <Row label="Causa"           value={header.causa} />
        <Row label="Cobertura"       value={header.cobertura} />
        <Row label="Estado actual"   value={latestStage?.Status ?? '—'} />
        <Row label="Contratante"     value={header.contratante_pagador} />
        <Row label="Documento"       value={`${header.tomador_tipo_doc} ${header.tomador_doc}`} />
      </Section>

      {/* Stages */}
      {claim.Stages.length > 0 && (
        <Section title={`Etapas (${claim.Stages.length})`}>
          {claim.Stages.map(stage => (
            <div key={stage.StageNumber} className="px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs text-gray-500">Subreclamo {stage.StageNumber}</span>
              <span className="text-sm text-gray-800">{stage.Status}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Policy */}
      {policy && (
        <Section title="Póliza">
          <Row label="Nro. póliza"    value={String(policy.Numero_Poliza)} />
          <Row label="Ramo"           value={policy.Ramo} />
          <Row label="Tipo"           value={policy.Tipo_de_Poliza} />
          <Row label="Estado"         value={policy.Estado} />
          <Row label="Producto"       value={policy.Producto_comercial} />
          <Row label="Suma asegurada" value={`$ ${policy.Suma_Asegurada.toLocaleString('es-AR')}`} />
          <Row label="Vigencia"       value={`${formatDate(policy.Vigencia_Desde)} → ${formatDate(policy.Vigencia_Hasta)}`} />
        </Section>
      )}

      {/* Producer */}
      {producer && (
        <Section title="Productor">
          <Row label="Nombre"      value={producer.nombre.trim()} />
          <Row label="Tipo agente" value={producer.tipo_agente} />
          <Row label="Código"      value={String(producer.cod_agente)} />
          <Row label="Estado"      value={producer.cod_estado === 'A' ? 'Activo' : 'Inactivo'} />
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
  const navigate = useNavigate();
  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/siniestros/${claim.id}`)}
    >
      <td className="py-3 pl-4 pr-4">
        <div className="font-medium text-gray-800">{claim.claim_number}</div>
        <div className="text-xs text-gray-400">{claim.sise_claim_id}</div>
      </td>
      <td className="py-3 pr-4">
        <div className="text-sm text-gray-700 truncate max-w-[180px]">{claim.cause || '—'}</div>
        <div className="text-xs text-gray-400 truncate max-w-[180px]">{claim.coverage}</div>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600">{claim.contratante.trim()}</td>
      <td className="py-3 pr-4 text-sm text-gray-500">{formatDate(claim.incident_date)}</td>
      <td className="py-3 pr-4">
        <StatusBadge status={claim.current_status} />
      </td>
      <td className="py-3 text-xs text-gray-400">
        {formatTableTime(claim.created_at)}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  );
}

// ─── Unresolved events ────────────────────────────────────────────────────────

function RetryModal({ event, onClose }: { event: CaseEvent; onClose: () => void }) {
  const [nroStro, setNroStro] = useState(event.raw_claim_number || '');
  const [comment, setComment] = useState('');
  const retry = useRetryResolution();

  const handleSubmit = () => {
    const req: RetryResolutionRequest = {
      corrected_claim_number: nroStro,
      correction_comment: comment,
    };
    retry.mutate({ id: event.id, req }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">Corregir nro. siniestro</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          {event.subject && <p><span className="font-medium">Mail:</span> {event.subject}</p>}
          <p><span className="font-medium">Rachel extrajo:</span> <code className="bg-gray-100 px-1 rounded">{event.raw_claim_number || '—'}</code></p>
          {event.resolution_error && (
            <p className="text-red-500 text-xs">Error SISE: {event.resolution_error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nro. siniestro correcto <span className="text-red-500">*</span></label>
          <input
            value={nroStro}
            onChange={e => setNroStro(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="ej: 12345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comentario para Rachel</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            placeholder="¿Por qué es incorrecto el número extraído?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {retry.error && (
          <p className="text-sm text-red-500">{(retry.error as Error).message}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={retry.isPending || !nroStro.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retry.isPending ? 'Reintentando...' : 'Reintentar con SISE'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnresolvedSection() {
  const { data: events = [], isLoading } = useUnresolvedEvents();
  const batchResolve = useBatchResolve();
  const [retryTarget, setRetryTarget] = useState<CaseEvent | null>(null);
  const [open, setOpen] = useState(false);

  if (isLoading || events.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-medium text-red-800">
              {events.length} siniestro{events.length > 1 ? 's' : ''} sin resolver
            </p>
            <p className="text-sm text-red-600">SISE no encontró el nro. extraído por Rachel. Revisá y corregí.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => batchResolve.mutate()}
            disabled={batchResolve.isPending}
            className="px-3 py-1.5 text-xs rounded-lg border border-red-300 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {batchResolve.isPending ? 'Reintentando...' : 'Reintentar todos'}
          </button>
          <button
            onClick={() => setOpen(o => !o)}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {open ? 'Cerrar' : 'Ver'}
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-white rounded-xl border border-red-100 p-5 space-y-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-3 pr-4">Mail</th>
                <th className="pb-3 pr-4">Nro. extraído</th>
                <th className="pb-3 pr-4">Error SISE</th>
                <th className="pb-3 pr-4">Recibido</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-800 truncate max-w-[180px]">{event.subject || event.mail_id}</div>
                    {event.subject && <div className="text-xs text-gray-400 truncate max-w-[180px]">{event.mail_id}</div>}
                  </td>
                  <td className="py-3 pr-4">
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{event.raw_claim_number || '—'}</code>
                  </td>
                  <td className="py-3 pr-4 text-xs text-red-500 max-w-[200px] truncate">
                    {event.resolution_error || '—'}
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(event.received_at), { locale: es, addSuffix: true })}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setRetryTarget(event)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Corregir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {retryTarget && <RetryModal event={retryTarget} onClose={() => setRetryTarget(null)} />}
    </div>
  );
}

export default function ClaimsPage() {
  const [showModal, setShowModal] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: claimsData, isLoading } = useClaimsPaginated(page, 10);
  const claims = claimsData?.data ?? [];
  const { data: metrics, isFetching } = useClaimMetrics();

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: claimKeys.all });
    setLastSync(new Date());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Standarized Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">Siniestros</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-sm">Explora el registro maestro de siniestros sincronizados con SISE.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar siniestro
        </button>
      </div>

      <UnresolvedSection />

      {/* Metrics */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total"        value={metrics?.total     ?? 0} />
          <MetricCard label="Abiertos"     value={metrics?.open      ?? 0} />
          <MetricCard label="En mediación" value={metrics?.mediation ?? 0} />
          <MetricCard label="En juicio"    value={metrics?.lawsuit   ?? 0} />
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-gray-400">
            Última sincronización: {format(lastSync, 'HH:mm', { locale: es })}
          </span>
          <button
            onClick={handleReload}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
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
                  <th className="pb-3 pt-4 pl-4 pr-4">Nro. siniestro</th>
                  <th className="pb-3 pt-4 pr-4">Causa / Cobertura</th>
                  <th className="pb-3 pt-4 pr-4">Contratante</th>
                  <th className="pb-3 pt-4 pr-4">Fecha hecho</th>
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

      <div className="px-1">
        <Pagination page={page} limit={10} total={claimsData?.total ?? 0} onChange={setPage} />
      </div>

      {showModal && <AddClaimModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
