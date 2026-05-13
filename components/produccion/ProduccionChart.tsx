'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  fecha: string
  huevos: number
  galponId?: string
}

interface ProduccionChartProps {
  data: DataPoint[]
  title?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-white border border-gray-200 shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-green-600 font-bold">{payload[0].value?.toLocaleString()} huevos</p>
    </div>
  )
}

export default function ProduccionChart({ data, title = 'Producción últimos 30 días' }: ProduccionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 h-48 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Sin datos para mostrar</p>
      </div>
    )
  }

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
          <Bar dataKey="huevos" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
