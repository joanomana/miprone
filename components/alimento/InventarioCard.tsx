'use client'

import { Wheat, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface InventarioCardProps {
  galpon: { nombre: string; gallinas: number }
  inventarioKg: number
  consumoDiarioEstimado?: number
  umbralDias?: number
}

type Estado = 'suficiente' | 'bajo' | 'critico'

export default function InventarioCard({
  galpon,
  inventarioKg,
  consumoDiarioEstimado = 0,
  umbralDias = 7,
}: InventarioCardProps) {
  const diasRestantes =
    consumoDiarioEstimado > 0 ? inventarioKg / consumoDiarioEstimado : Infinity

  const estado: Estado =
    diasRestantes === Infinity
      ? 'suficiente'
      : diasRestantes < 3
      ? 'critico'
      : diasRestantes < umbralDias
      ? 'bajo'
      : 'suficiente'

  const estadoConfig = {
    suficiente: {
      label: 'Suficiente',
      bg: 'bg-green-100 text-green-700',
      border: 'border-green-200',
      bar: 'bg-green-500',
      Icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    bajo: {
      label: 'Bajo',
      bg: 'bg-amber-100 text-amber-700',
      border: 'border-amber-200',
      bar: 'bg-amber-400',
      Icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    critico: {
      label: 'Crítico',
      bg: 'bg-red-100 text-red-700',
      border: 'border-red-200',
      bar: 'bg-red-500',
      Icon: XCircle,
      iconColor: 'text-red-600',
    },
  }

  const config = estadoConfig[estado]
  const pct = consumoDiarioEstimado > 0
    ? Math.min((diasRestantes / (umbralDias * 2)) * 100, 100)
    : inventarioKg > 0
    ? 100
    : 0

  return (
    <div className={`rounded-xl border ${config.border} bg-white p-5 shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Wheat size={16} className="text-green-700" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{galpon.nombre}</p>
            <p className="text-xs text-gray-400">{galpon.gallinas.toLocaleString()} gallinas</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${config.bg}`}>
          {config.label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Inventario actual</span>
          <span className="font-bold text-gray-900">{inventarioKg.toFixed(1)} kg</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${config.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <config.Icon size={13} className={config.iconColor} />
        {consumoDiarioEstimado > 0 ? (
          <span className="text-gray-600">
            {diasRestantes === Infinity
              ? 'Sin estimado de consumo'
              : diasRestantes < 1
              ? 'Inventario agotado'
              : `~${Math.floor(diasRestantes)} días restantes`}
            {consumoDiarioEstimado > 0 && ` · ${consumoDiarioEstimado.toFixed(1)} kg/día est.`}
          </span>
        ) : (
          <span className="text-gray-400">Sin datos de consumo</span>
        )}
      </div>
    </div>
  )
}
