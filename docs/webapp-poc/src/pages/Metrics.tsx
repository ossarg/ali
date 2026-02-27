import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Filter, Download } from 'lucide-react';

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
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Métricas y Analytics</h1>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-md text-sm font-medium text-[#455362] hover:bg-[#f7f8fa] transition-colors">
            <Filter className="w-4 h-4" />
            Últimos 6 meses
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-md text-sm font-medium text-[#455362] hover:bg-[#f7f8fa] transition-colors">
            <Download className="w-4 h-4" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <h3 className="text-sm font-medium text-[#6b7280] mb-1">Total Demandas (Mes)</h3>
          <div className="text-3xl font-semibold text-[#1a1a1a]">74</div>
          <span className="text-xs text-[#22c55e] font-medium">↑ 12% vs mes anterior</span>
        </div>
        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <h3 className="text-sm font-medium text-[#6b7280] mb-1">Monto Total Reclamado</h3>
          <div className="text-3xl font-semibold text-[#1a1a1a]">$845M</div>
          <span className="text-xs text-[#ef4444] font-medium">↑ 5% vs mes anterior</span>
        </div>
        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <h3 className="text-sm font-medium text-[#6b7280] mb-1">Tiempo Promedio (Recepción → Contestación)</h3>
          <div className="text-3xl font-semibold text-[#1a1a1a]">4.2 días</div>
          <span className="text-xs text-[#22c55e] font-medium">↓ 1.5 días vs mes anterior</span>
        </div>
        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[#6b7280] mb-1">Prioridad</h3>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Alta: 15%</div>
              <div className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> Media: 45%</div>
              <div className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full bg-[#22c55e]"></span> Baja: 40%</div>
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
        <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Volumen de Demandas (6 meses)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f7f8fa' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="demandas" fill="#455362" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Distribución por Tipo de Siniestro</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={siniestroData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                  {siniestroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 pl-4">
              {siniestroData.map((item, i) => (
                <div key={i} className="flex items-center justify-between mb-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-[#455362]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#1a1a1a]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Tables & Horizontal Bars */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h3 className="text-lg font-semibold text-[#1a1a1a]">Jurisdicciones Principales</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f8fa] text-[#6b7280] font-medium">
              <tr>
                <th className="px-6 py-3">Jurisdicción</th>
                <th className="px-6 py-3">Volumen</th>
                <th className="px-6 py-3">Monto Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {jurisdictionData.map(row => (
                <tr key={row.id} className="hover:bg-[#f7f8fa] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1a1a1a]">{row.name}</td>
                  <td className="px-6 py-4 text-[#455362]">{row.volume}</td>
                  <td className="px-6 py-4 text-[#455362]">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(row.avgAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Carga por Abogado (Casos Activos)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lawyerLoadData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#455362', fontSize: 12, fontWeight: 500 }} width={80} />
                <Tooltip cursor={{ fill: '#f7f8fa' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="casos" fill="#eb5d2a" radius={[0, 4, 4, 0]} barSize={20}>
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
