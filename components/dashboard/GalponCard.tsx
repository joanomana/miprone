import Link from 'next/link'
import { Egg, AlertTriangle, Users, Clock, ChevronRight, TrendingUp } from 'lucide-react'
import { IGalpon } from '@/types'

interface GalponCardProps {
  galpon: IGalpon
  stats: {
    huevosHoy: number
    porcentajePosicion: number
    mortalidadHoy: number
  }
}

function getPosicionColor(pct: number): { bg: string; text: string; border: string; label: string } {
  if (pct >= 80) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Excelente' }
  if (pct >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Regular' }
  return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Bajo' }
}

function getTopBorderColor(pct: number): string {
  if (pct >= 80) return '#16a34a'
  if (pct >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function GalponCard({ galpon, stats }: GalponCardProps) {
  const { huevosHoy, porcentajePosicion, mortalidadHoy } = stats
  const posColor = getPosicionColor(porcentajePosicion)
  const topColor = getTopBorderColor(porcentajePosicion)

  return (
    <Link
      href={`/galpones/${galpon._id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: topColor }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors">
              {galpon.nombre}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock size={11} />
              {galpon.semanasAproximadas} semanas
              {galpon.raza && <span className="ml-1">· {galpon.raza}</span>}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${posColor.bg} ${posColor.text} ${posColor.border}`}>
            {porcentajePosicion.toFixed(1)}%
            <TrendingUp size={10} />
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Users size={13} className="text-gray-400" />
              <span className="text-[11px] text-gray-400 font-medium">Gallinas</span>
            </div>
            <p className="text-lg font-bold text-gray-800 leading-none">
              {galpon.cantidadGallinas.toLocaleString('es-CO')}
            </p>
          </div>

          <div className={`rounded-xl p-3 ${huevosHoy > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Egg size={13} className={huevosHoy > 0 ? 'text-green-500' : 'text-gray-400'} />
              <span className="text-[11px] text-gray-400 font-medium">Huevos hoy</span>
            </div>
            <p className={`text-lg font-bold leading-none ${huevosHoy > 0 ? 'text-green-700' : 'text-gray-800'}`}>
              {huevosHoy.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Posición bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-400 font-medium">% Posición</span>
            <span className={`text-[11px] font-semibold ${posColor.text}`}>{posColor.label}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(porcentajePosicion, 100)}%`,
                backgroundColor: topColor,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <AlertTriangle
              size={13}
              className={mortalidadHoy > 0 ? 'text-red-500' : 'text-gray-300'}
            />
            <span className={`text-xs font-medium ${mortalidadHoy > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {mortalidadHoy > 0 ? `${mortalidadHoy} bajas hoy` : 'Sin bajas hoy'}
            </span>
          </div>
          <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium group-hover:gap-1.5 transition-all">
            Ver detalle
            <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  )
}
