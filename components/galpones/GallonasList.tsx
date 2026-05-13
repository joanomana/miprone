import { IGalpon } from '@/types'

interface GallonaListProps {
  galpon: IGalpon
}

function getEtapa(semanas: number): { label: string; color: string } {
  if (semanas < 18) return { label: 'Cría', color: 'bg-blue-100 text-blue-700' }
  if (semanas < 20) return { label: 'Desarrollo', color: 'bg-yellow-100 text-yellow-700' }
  if (semanas <= 45) return { label: 'Pico', color: 'bg-green-100 text-green-700' }
  return { label: 'Declive', color: 'bg-gray-100 text-gray-600' }
}

function formatFecha(date: Date | string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function diasDesdeIngreso(date: Date | string) {
  const diffMs = Date.now() - new Date(date).getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export default function GallonasList({ galpon }: GallonaListProps) {
  const etapa = getEtapa(galpon.semanasAproximadas)
  const progresoPct = Math.min(Math.round((galpon.semanasAproximadas / 120) * 100), 100)
  const dias = diasDesdeIngreso(galpon.fechaIngreso)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Información del Lote</h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${etapa.color}`}>
          {etapa.label}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Cantidad total */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Total de gallinas</span>
          <span className="text-lg font-bold text-gray-900">
            {galpon.cantidadGallinas.toLocaleString('es-CO')}
          </span>
        </div>

        {/* Semanas de vida */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-gray-500">Semanas de vida</span>
            <span className="text-sm font-semibold text-gray-800">
              {galpon.semanasAproximadas} sem
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${progresoPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 sem</span>
            <span>60 sem</span>
            <span>120 sem</span>
          </div>
        </div>

        {/* Raza */}
        {galpon.raza && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Raza</span>
            <span className="text-sm font-medium text-gray-800">{galpon.raza}</span>
          </div>
        )}

        {/* Fecha de ingreso */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Fecha de ingreso</span>
          <span className="text-sm font-medium text-gray-800">
            {formatFecha(galpon.fechaIngreso)}
          </span>
        </div>

        {/* Días desde ingreso */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Días en granja</span>
          <span className="text-sm font-semibold text-green-700">
            {dias} {dias === 1 ? 'día' : 'días'}
          </span>
        </div>
      </div>
    </div>
  )
}
