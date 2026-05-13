'use client'

import { IAlerta, AlertaSeveridad } from '@/types'
import { CheckCircle, AlertTriangle, AlertCircle, Info, X, type LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

interface AlertaItemProps {
  alerta: IAlerta & { galponNombre?: string }
  onMarcarLeida: (id: string) => void
}

function tiempoRelativo(fecha: Date | string): string {
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  const diffMs = new Date(fecha).getTime() - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour')
  return rtf.format(diffDay, 'day')
}

const severidadConfig: Record<
  AlertaSeveridad,
  { border: string; bg: string; iconBg: string; badge: string; icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>> }
> = {
  critical: {
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    badge: 'bg-red-100 text-red-700',
    icon: AlertCircle,
  },
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    icon: AlertTriangle,
  },
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    icon: Info,
  },
}

export default function AlertaItem({ alerta, onMarcarLeida }: AlertaItemProps) {
  const cfg = severidadConfig[alerta.severidad]
  const Icon = cfg.icon

  return (
    <div
      className={`relative flex items-start gap-4 p-4 rounded-xl border-l-4 ${cfg.border} ${cfg.bg} ${
        alerta.leida ? 'opacity-60' : ''
      } transition-opacity`}
    >
      {/* Ícono */}
      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${cfg.iconBg}`}>
        <Icon
          size={20}
          className={
            alerta.severidad === 'critical'
              ? 'text-red-600'
              : alerta.severidad === 'warning'
              ? 'text-amber-600'
              : 'text-blue-600'
          }
        />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-gray-900 text-sm">{alerta.titulo}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
            {alerta.severidad === 'critical'
              ? 'Crítica'
              : alerta.severidad === 'warning'
              ? 'Advertencia'
              : 'Información'}
          </span>
          {!alerta.leida && (
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="No leída" />
          )}
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{alerta.mensaje}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {alerta.galponNombre && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {alerta.galponNombre}
            </span>
          )}
          <span>{tiempoRelativo(alerta.createdAt)}</span>
        </div>
      </div>

      {/* Botón marcar leída */}
      {!alerta.leida && (
        <button
          onClick={() => onMarcarLeida(alerta._id.toString())}
          title="Marcar como leída"
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
        >
          <CheckCircle size={18} />
        </button>
      )}
      {alerta.leida && (
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full">
          <X size={16} className="text-gray-300" />
        </div>
      )}
    </div>
  )
}
