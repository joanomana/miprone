'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  fecha: string
  huevos: number
}

interface GraficaProduccionProps {
  data: DataPoint[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
        <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-green-700">
          {(payload[0].value as number).toLocaleString('es-CO')}
          <span className="text-xs font-normal text-gray-400 ml-1">huevos</span>
        </p>
      </div>
    )
  }
  return null
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatYAxis(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toString()
}

export default function GraficaProduccion({ data }: GraficaProduccionProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-gray-400">
        <p className="text-sm">Sin datos de producción</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorHuevos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f0f0f0"
          vertical={false}
        />
        <XAxis
          dataKey="fecha"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#16a34a', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="huevos"
          stroke="#16a34a"
          strokeWidth={2.5}
          fill="url(#colorHuevos)"
          dot={{ r: 3.5, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 5.5, fill: '#16a34a', stroke: '#fff', strokeWidth: 2.5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
