'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  fecha: string
  kg: number
  costo: number
}

interface ConsumoChartProps {
  data: DataPoint[]
  title?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-white border border-gray-200 shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-green-600 font-bold">{payload[0]?.value?.toFixed(1)} kg</p>
      {payload[1] && (
        <p className="text-blue-600 text-xs mt-0.5">
          ${Number(payload[1].value).toLocaleString('es-CO')} COP
        </p>
      )}
    </div>
  )
}

export default function ConsumoChart({ data, title = 'Consumo de alimento' }: ConsumoChartProps) {
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
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="kg"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ fill: '#16a34a', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
