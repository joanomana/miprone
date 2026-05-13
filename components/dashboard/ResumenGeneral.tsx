import React from 'react'
import { Egg, AlertTriangle, Building2, Bell, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ResumenGeneralProps {
  totalHuevosHoy: number
  mortalidadHoy: number
  galponesActivos: number
  alertasPendientes: number
}

interface KpiCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  iconBg: string
  iconColor: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  highlight?: boolean
}

function KpiCard({ icon, title, value, subtitle, iconBg, iconColor, trend, trendLabel, highlight }: KpiCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-shadow hover:shadow-md ${
      highlight ? 'border-red-100 ring-1 ring-red-100' : 'border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-50 text-green-600'
            : trend === 'down' ? 'bg-red-50 text-red-500'
            : 'bg-gray-100 text-gray-500'
          }`}>
            {trend === 'up' ? <TrendingUp size={11} /> : trend === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1 leading-none">
        {typeof value === 'number' ? value.toLocaleString('es-CO') : value}
      </p>
      <p className="text-sm font-medium text-gray-600 mb-0.5">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  )
}

export default function ResumenGeneral({
  totalHuevosHoy,
  mortalidadHoy,
  galponesActivos,
  alertasPendientes,
}: ResumenGeneralProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={<Egg size={22} />}
        title="Huevos hoy"
        value={totalHuevosHoy}
        subtitle="Total recolectados"
        iconBg="bg-green-50"
        iconColor="text-green-600"
        trend="up"
        trendLabel="hoy"
      />
      <KpiCard
        icon={<AlertTriangle size={22} />}
        title="Mortalidad hoy"
        value={mortalidadHoy}
        subtitle="Bajas registradas"
        iconBg={mortalidadHoy > 0 ? 'bg-red-50' : 'bg-gray-50'}
        iconColor={mortalidadHoy > 0 ? 'text-red-500' : 'text-gray-400'}
        highlight={mortalidadHoy > 0}
        trend={mortalidadHoy > 0 ? 'down' : 'neutral'}
        trendLabel={mortalidadHoy > 0 ? 'alertar' : 'normal'}
      />
      <KpiCard
        icon={<Building2 size={22} />}
        title="Galpones activos"
        value={galponesActivos}
        subtitle="En producción"
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        trend="neutral"
        trendLabel="activos"
      />
      <KpiCard
        icon={<Bell size={22} />}
        title="Alertas pendientes"
        value={alertasPendientes}
        subtitle="Sin leer"
        iconBg={alertasPendientes > 0 ? 'bg-amber-50' : 'bg-gray-50'}
        iconColor={alertasPendientes > 0 ? 'text-amber-500' : 'text-gray-400'}
        highlight={alertasPendientes > 0}
        trend={alertasPendientes > 0 ? 'down' : 'neutral'}
        trendLabel={alertasPendientes > 0 ? 'revisar' : 'al día'}
      />
    </div>
  )
}
