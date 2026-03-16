import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useAgreements, useUpdateAgreement } from '../api/hooks/useAgreements';
import type { Agreement, UpdateAgreementRequest } from '../api/schemas/agreement.schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

const AGREEMENT_TYPE_LABELS: Record<number, string> = {
  1: 'Mediación',
  2: 'Juicio',
};

const EXTRACTION_STATUS_LABELS: Record<number, string> = {
  1: 'Pendiente',
  2: 'Completado',
  3: 'Fallido',
};

type DueStatus = 'vigente' | 'proximo' | 'vencido' | 'sin_fecha';

const STATUS_BADGE: Record<DueStatus, { label: string; cls: string }> = {
  vigente:   { label: 'Vigente',          cls: 'bg-green-100 text-green-700' },
  proximo:   { label: 'Próximo a vencer', cls: 'bg-amber-100 text-amber-700' },
  vencido:   { label: 'Vencido',          cls: 'bg-red-100 text-red-700' },
  sin_fecha: { label: 'Sin fecha',        cls: 'bg-gray-100 text-gray-500' },
};

const EXTRACTION_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: 'Extrayendo…', cls: 'bg-blue-50 text-blue-600' },
  2: { label: 'Completo',    cls: 'bg-green-50 text-green-600' },
  3: { label: 'Error',       cls: 'bg-red-50 text-red-600' },
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  agreement: Agreement;
  onClose: () => void;
}

function EditModal({ agreement, onClose }: EditModalProps) {
  const [form, setForm] = useState<UpdateAgreementRequest>({
    agreement_type: agreement.agreement_type as 1 | 2 | undefined,
    claim_number:   agreement.claim_number,
    producer:       agreement.producer,
    beneficiary:    agreement.beneficiary,
    concept:        agreement.concept,
    invoice_number: agreement.invoice_number,
    amount:         agreement.amount ?? undefined,
    due_date:       agreement.due_date ?? undefined,
  });

  const update = useUpdateAgreement();

  const set = <K extends keyof UpdateAgreementRequest>(k: K, v: UpdateAgreementRequest[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    update.mutate({ id: agreement.id, req: form }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">Editar acuerdo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select
              value={form.agreement_type ?? ''}
              onChange={e => set('agreement_type', Number(e.target.value) as 1 | 2)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— Sin definir —</option>
              <option value={1}>Mediación</option>
              <option value={2}>Juicio</option>
            </select>
          </div>

          {([
            ['claim_number',   'Nro. siniestro'],
            ['producer',       'Productor'],
            ['beneficiary',    'Beneficiario'],
            ['concept',        'Concepto'],
            ['invoice_number', 'Nro. factura'],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                value={(form[field] as string) ?? ''}
                onChange={e => set(field, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Importe</label>
            <input
              type="number"
              step="0.01"
              value={form.amount ?? ''}
              onChange={e => set('amount', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha vencimiento</label>
            <input
              type="date"
              value={form.due_date ? form.due_date.substring(0, 10) : ''}
              onChange={e => set('due_date', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {update.error && (
          <p className="text-sm text-red-500">{(update.error as Error).message ?? 'Error al guardar'}</p>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={update.isPending}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {update.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | DueStatus;

export default function Agreements() {
  const navigate = useNavigate();
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editing, setEditing]           = useState<Agreement | null>(null);

  const { data, isLoading } = useAgreements(page, 20);

  const agreements = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const filtered = statusFilter === 'all'
    ? agreements
    : agreements.filter(a => a.status === statusFilter);

  const formatAmount = (v: number | null) =>
    v == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v);

  const formatDate = (d: string | null) =>
    d ? format(parseISO(d), 'dd/MM/yyyy') : '—';

  return (
    <div className="space-y-6">
      {editing && <EditModal agreement={editing} onClose={() => setEditing(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Acuerdos</h1>

        {/* Status filter pills */}
        <div className="flex gap-2">
          {(['all', 'vencido', 'proximo', 'vigente', 'sin_fecha'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Todos' : STATUS_BADGE[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
          ))
        ) : (
          <>
            {(['vencido', 'proximo', 'vigente', 'sin_fecha'] as DueStatus[]).map(s => {
              const count = agreements.filter(a => a.status === s).length;
              const { label } = STATUS_BADGE[s];
              return (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1 text-left hover:border-indigo-200 transition-colors"
                >
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-3xl font-bold text-gray-900">{count}</span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg">No hay acuerdos{statusFilter !== 'all' ? ` con estado "${STATUS_BADGE[statusFilter as DueStatus]?.label}"` : ''}</p>
            <p className="text-sm mt-1">Los acuerdos se crean automáticamente al aprobar un evento de tipo Acuerdo.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Siniestro', 'Tipo', 'Concepto', 'Nro. Factura', 'Importe', 'Vence', 'Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(a => {
                const statusInfo = STATUS_BADGE[a.status];
                return (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/acuerdos/${a.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{a.claim_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{AGREEMENT_TYPE_LABELS[a.agreement_type] ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{a.concept || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{a.invoice_number || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatAmount(a.amount)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(a.due_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Página {page} de {totalPages} ({total} acuerdos)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
