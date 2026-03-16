import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAgreement, useUpdateAgreement } from '../api/hooks/useAgreements';
import type { UpdateAgreementRequest } from '../api/schemas/agreement.schemas';

// ─── Constants ────────────────────────────────────────────────────────────────

const AGREEMENT_TYPE_LABELS: Record<number, string> = { 1: 'Mediación', 2: 'Juicio' };

type DueStatus = 'vigente' | 'proximo' | 'vencido' | 'sin_fecha';

const STATUS_BADGE: Record<DueStatus, { label: string; cls: string }> = {
  vigente:   { label: 'Vigente',          cls: 'bg-green-100 text-green-700' },
  proximo:   { label: 'Próximo a vencer', cls: 'bg-amber-100 text-amber-700' },
  vencido:   { label: 'Vencido',          cls: 'bg-red-100 text-red-700' },
  sin_fecha: { label: 'Sin fecha',        cls: 'bg-gray-100 text-gray-500' },
};

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-900 flex-1">{value || '—'}</dd>
    </div>
  );
}

// ─── Edit section ─────────────────────────────────────────────────────────────

function EditForm({ id, initial, onCancel }: {
  id: string;
  initial: UpdateAgreementRequest;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<UpdateAgreementRequest>(initial);
  const update = useUpdateAgreement();

  const set = <K extends keyof UpdateAgreementRequest>(k: K, v: UpdateAgreementRequest[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Editar acuerdo</h3>

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
            type="number" step="0.01"
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

      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={() => update.mutate({ id, req: form }, { onSuccess: onCancel })}
          disabled={update.isPending}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {update.isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgreementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const { data: agreement, isLoading } = useAgreement(id ?? '');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/acuerdos')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Volver a Acuerdos
        </button>
        <p className="text-gray-500">Acuerdo no encontrado.</p>
      </div>
    );
  }

  const statusInfo = STATUS_BADGE[agreement.status as DueStatus];
  const formatAmount = (v: number | null) =>
    v == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v);
  const formatDate = (d: string | null) =>
    d ? format(parseISO(d), 'dd/MM/yyyy') : '—';

  const editInitial: UpdateAgreementRequest = {
    agreement_type: agreement.agreement_type as 1 | 2,
    claim_number:   agreement.claim_number,
    producer:       agreement.producer,
    beneficiary:    agreement.beneficiary,
    concept:        agreement.concept,
    invoice_number: agreement.invoice_number,
    amount:         agreement.amount,
    due_date:       agreement.due_date,
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/acuerdos')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Acuerdos
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {agreement.claim_number || 'Sin siniestro'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">
              {AGREEMENT_TYPE_LABELS[agreement.agreement_type] ?? '—'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Editar
          </button>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <EditForm id={agreement.id} initial={editInitial} onCancel={() => setEditing(false)} />
      )}

      {/* Detail card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <dl>
          <FieldRow label="Nro. siniestro"  value={agreement.claim_number} />
          <FieldRow label="Tipo"            value={AGREEMENT_TYPE_LABELS[agreement.agreement_type] ?? '—'} />
          <FieldRow label="Beneficiario"    value={agreement.beneficiary} />
          <FieldRow label="Concepto"        value={agreement.concept} />
          <FieldRow label="Productor"       value={agreement.producer} />
          <FieldRow label="Nro. factura"    value={agreement.invoice_number} />
          <FieldRow label="Importe"         value={formatAmount(agreement.amount)} />
          <FieldRow label="Vencimiento"     value={formatDate(agreement.due_date)} />
          <FieldRow label="Creado"          value={format(parseISO(agreement.created_at), 'dd/MM/yyyy HH:mm')} />
          <FieldRow label="Estado"          value={statusInfo.label} />
          <FieldRow label="Extracción"      value={agreement.extraction_status_label} />
        </dl>
      </div>
    </div>
  );
}
