'use client'

import Link from 'next/link'
import { AlertTriangle, Info, Zap, CheckCircle2, ChevronRight } from 'lucide-react'
import { IAlerta, AlertaSeveridad } from '@/types'
import { useAlertasStore } from '@/store/useAlertasStore'

interface AlertasBannerProps {
  alertas: IAlerta[]
}

const severidadConfig: Record<AlertaSeveridad, {
  icon: React.ReactNode
  bg: string
  border: string
  iconBg: string
  text: string
  badge: string
  badgeText: string
}> = {
  critical: {
    icon: <Zap size={15} />,
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-100',
    text: 'text-red-700',
    badge: 'bg-red-500',
    badgeText: 'Crítico',
  },
  warning: {
    icon: <AlertTriangle size={15} />,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    text: 'text-amber-700',
    badge: 'bg-amber-500',
    badgeText: 'Alerta',
  },
  info: {
    icon: <Info size={15} />,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    text: 'text-blue-700',
    badge: 'bg-blue-500',
    badgeText: 'Info',
  },
}

function timeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export default function AlertasBanner({ alertas }: AlertasBannerProps) {
  const marcarLeida = useAlertasStore((s) => s.marcarLeida)

  const visibles = alertas.filter((a) => !a.leida).slice(0, 3)

  if (visibles.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-2xl border border-green-100">
        <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
        <p className="text-sm font-medium text-green-700">Sin alertas pendientes — todo está al día</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {visibles.map((alerta) => {
        const config = severidadConfig[alerta.severidad]
        return (
          <div
            key={String(alerta._id)}
            className={`flex items-start gap-3 p-4 rounded-2xl border ${config.bg} ${config.border}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${config.iconBg}`}>
              <span className={config.text}>{config.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${config.badge}`}>
                  {config.badgeText}
                </span>
                <span className="text-[11px] text-gray-400">{timeAgo(alerta.createdAt)}</span>
              </div>
              <p className={`text-sm font-semibold ${config.text} leading-tight`}>{alerta.titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{alerta.mensaje}</p>
            </div>
            <button
              onClick={() => marcarLeida(String(alerta._id))}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
              title="Marcar como leída"
            >
              <CheckCircle2 size={16} className="text-gray-400 hover:text-green-600" />
            </button>
          </div>
        )
      })}

      <Link
        href="/alertas"
        className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors group"
      >
        <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">
          Ver todas las alertas
        </span>
        <ChevronRight size={16} className="text-gray-400 group-hover:text-green-600" />
      </Link>
    </div>
  )
}
