'use client'

import { IRegistroProduccion, IGalpon } from '@/types'
import { Trash2 } from 'lucide-react'

interface RegistroTablaProps {
  registros: (IRegistroProduccion & { galponNombre?: string })[]
  galpones?: IGalpon[]
  onDelete?: (id: string) => void
  showGalpon?: boolean
}

const turnoColors: Record<string, string> = {
  mañana: 'bg-amber-100 text-amber-700',
  tarde: 'bg-blue-100 text-blue-700',
  noche: 'bg-purple-100 text-purple-700',
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function RegistroTabla({ registros, onDelete, showGalpon = false }: RegistroTablaProps) {
  if (registros.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
        <p className="text-gray-400 text-sm">No hay registros disponibles.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turno</th>
            {showGalpon && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Galpón</th>
            )}
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Huevos</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Rotos</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Mortalidad</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registrado por</th>
            {onDelete && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {registros.map((r, i) => (
            <tr
              key={r._id.toString()}
              className={`hover:bg-green-50/30 transition-colors ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
              }`}
            >
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(r.fecha)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${turnoColors[r.turno]}`}>
                  {r.turno}
                </span>
              </td>
              {showGalpon && (
                <td className="px-4 py-3 text-gray-700">{r.galponNombre ?? '—'}</td>
              )}
              <td className="px-4 py-3 text-right font-bold text-gray-900">{r.cantidadHuevos}</td>
              <td className="px-4 py-3 text-right text-amber-600 font-medium">{r.huevosRotos}</td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`font-semibold ${
                    r.mortalidad > 5 ? 'text-red-600' : r.mortalidad > 0 ? 'text-amber-600' : 'text-gray-400'
                  }`}
                >
                  {r.mortalidad}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{r.registradoPor}</td>
              {onDelete && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(r._id.toString())}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
