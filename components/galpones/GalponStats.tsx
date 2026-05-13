'use client'

interface GalponStatsProps {
  gallinasActivas: number
  totalGallinas: number
  mortalidadAcumulada: number
  huevosHoy: number
  porcentajePosicion: number
}

export default function GalponStats({
  gallinasActivas,
  totalGallinas,
  mortalidadAcumulada,
  huevosHoy,
  porcentajePosicion,
}: GalponStatsProps) {
  const pctGallinas = totalGallinas > 0 ? (gallinasActivas / totalGallinas) * 100 : 0
  const pctMortalidad = totalGallinas > 0 ? (mortalidadAcumulada / totalGallinas) * 100 : 0

  const posColor =
    porcentajePosicion >= 80
      ? 'bg-green-500'
      : porcentajePosicion >= 60
      ? 'bg-amber-500'
      : 'bg-red-500'

  return (
    <div className="space-y-4">
      {/* % Posición */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">% Posición</span>
          <span className="font-bold text-gray-900">{porcentajePosicion.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${posColor}`}
            style={{ width: `${Math.min(porcentajePosicion, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {huevosHoy} huevos hoy · {gallinasActivas} gallinas activas
        </p>
      </div>

      {/* Gallinas activas */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Gallinas activas</span>
          <span className="font-bold text-gray-900">
            {gallinasActivas} / {totalGallinas}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(pctGallinas, 100)}%` }}
          />
        </div>
      </div>

      {/* Mortalidad acumulada */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Mortalidad acumulada</span>
          <span
            className={`font-bold ${
              pctMortalidad > 5
                ? 'text-red-600'
                : pctMortalidad > 2
                ? 'text-amber-600'
                : 'text-gray-900'
            }`}
          >
            {mortalidadAcumulada} ({pctMortalidad.toFixed(2)}%)
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pctMortalidad > 5 ? 'bg-red-500' : pctMortalidad > 2 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(pctMortalidad * 5, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
