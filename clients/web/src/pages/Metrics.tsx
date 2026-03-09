import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const monthlyData = [
  { name: 'Nov', demandas: 45 },
  { name: 'Dic', demandas: 38 },
  { name: 'Ene', demandas: 52 },
  { name: 'Feb', demandas: 61 },
  { name: 'Mar', demandas: 58 },
  { name: 'Abr', demandas: 74 },
];

const priorityData = [
  { name: 'Alta', value: 15, color: '#ef4444' },
  { name: 'Media', value: 45, color: '#eab308' },
  { name: 'Baja', value: 40, color: '#22c55e' },
];

const siniestroData = [
  { name: 'Accidente Vehicular', value: 45, color: '#455362' },
  { name: 'Responsabilidad Civil', value: 25, color: '#eb5d2a' },
  { name: 'Robo/Hurto', value: 15, color: '#6b7280' },
  { name: 'Mala Praxis', value: 10, color: '#9ca3af' },
  { name: 'Otros', value: 5, color: '#e5e7eb' },
];

const jurisdictionData = [
  { id: 1, name: 'CABA', volume: 145, avgAmount: 12500000 },
  { id: 2, name: 'Buenos Aires', volume: 98, avgAmount: 8400000 },
  { id: 3, name: 'Córdoba', volume: 45, avgAmount: 6200000 },
  { id: 4, name: 'Santa Fe', volume: 32, avgAmount: 5800000 },
  { id: 5, name: 'Mendoza', volume: 28, avgAmount: 4900000 },
];

const lawyerLoadData = [
  { name: 'V. Herrera', casos: 12 },
  { name: 'M. Aguirre', casos: 8 },
  { name: 'C. Ruiz', casos: 5 },
  { name: 'F. López', casos: 15 },
  { name: 'S. Peralta', casos: 7 },
  { name: 'N. Vega', casos: 4 },
];

export default function Metrics() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Métricas y Analytics"
        subtitle="Reportes de volumen, distribución y rendimiento del equipo."
        actions={
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-bg)] transition-colors">
              <Filter className="w-4 h-4" />
              Últimos 6 meses
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-bg)] transition-colors">
              <Download className="w-4 h-4" />
              Exportar Reporte
            </button>
          </div>
        }
      />

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[var(--color-surface-card)] p-5 rounded-xl border border-[var(--color-border-dim)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Total Demandas (Mes)</h3>
          <div className="text-3xl font-semibold text-[var(--color-text-primary)]">74</div>
          <span className="text-xs text-green-600 font-medium">↑ 12% vs mes anterior</span>
        </div>
        <div className="bg-[var(--color-surface-card)] p-5 rounded-xl border border-[var(--color-border-dim)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Monto Total Reclamado</h3>
          <div className="text-3xl font-semibold text-[var(--color-text-primary)]">$845M</div>
          <span className="text-xs text-red-500 font-medium">↑ 5% vs mes anterior</span>
        </div>
        <div className="bg-[var(--color-surface-card)] p-5 rounded-xl border border-[var(--color-border-dim)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tiempo Promedio (Recepción → Contestación)</h3>
          <div className="text-3xl font-semibold text-[var(--color-text-primary)]">4.2 días</div>
          <span className="text-xs text-green-600 font-medium">↓ 1.5 días vs mes anterior</span>
        </div>
        <div className="bg-[var(--color-surface-card)] p-5 rounded-xl border border-[var(--color-border-dim)] shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Prioridad</h3>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"><span className="w-2 h-2 rounded-full bg-red-500"></span> Alta: 15%</div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Media: 45%</div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"><span className="w-2 h-2 rounded-full bg-green-500"></span> Baja: 40%</div>
            </div>
          </div>
          <div className="w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface-card)] p-6 rounded-xl border border-[var(--color-border-dim)] shadow-sm">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-6">Volumen de Demandas (6 meses)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-dim)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'var(--color-surface-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border-dim)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: 'var(--color-surface-card)' }} />
                <Bar dataKey="demandas" fill="var(--color-text-secondary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--color-surface-card)] p-6 rounded-xl border border-[var(--color-border-dim)] shadow-sm">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-6">Distribución por Tipo de Siniestro</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={siniestroData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                  {siniestroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border-dim)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: 'var(--color-surface-card)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 pl-4">
              {siniestroData.map((item, i) => (
                <div key={i} className="flex items-center justify-between mb-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-[var(--color-text-secondary)]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--color-text-primary)]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Tables & Horizontal Bars */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border-dim)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border-dim)]">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Jurisdicciones Principales</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-bg)] text-[var(--color-text-tertiary)] font-medium">
              <tr>
                <th className="px-6 py-3">Jurisdicción</th>
                <th className="px-6 py-3">Volumen</th>
                <th className="px-6 py-3">Monto Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-dim)]">
              {jurisdictionData.map(row => (
                <tr key={row.id} className="hover:bg-[var(--color-surface-bg)] transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{row.name}</td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">{row.volume}</td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(row.avgAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[var(--color-surface-card)] p-6 rounded-xl border border-[var(--color-border-dim)] shadow-sm">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-6">Carga por Abogado (Casos Activos)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lawyerLoadData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-dim)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }} width={80} />
                <Tooltip cursor={{ fill: 'var(--color-surface-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border-dim)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: 'var(--color-surface-card)' }} />
                <Bar dataKey="casos" radius={[0, 4, 4, 0]} barSize={20}>
                  {lawyerLoadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.casos > 10 ? '#ef4444' : entry.casos > 6 ? '#eab308' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
