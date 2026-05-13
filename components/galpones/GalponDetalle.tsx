'use client'

import { useState } from 'react'
import { IGalpon, IRegistroProduccion, IRegistroAlimento } from '@/types'
import GalponStats from './GalponStats'
import Link from 'next/link'
import { PlusCircle, BarChart3, Wheat, Package } from 'lucide-react'

interface ProduccionData {
  registros: IRegistroProduccion[]
  stats: {
    huevosHoy: number
    porcentajePosicion: number
    mortalidadAcumulada: number
  }
}

interface AlimentoData {
  registros: IRegistroAlimento[]
  inventarioActual: number
}

interface GalponDetalleProps {
  galpon: IGalpon
  produccionData: ProduccionData
  alimentoData: AlimentoData
}

type Tab = 'produccion' | 'alimento' | 'estadisticas'

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

export default function GalponDetalle({ galpon, produccionData, alimentoData }: GalponDetalleProps) {
  const [tab, setTab] = useState<Tab>('produccion')
  const galponId = galpon._id.toString()

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'produccion', label: 'Producción', icon: <Package size={15} /> },
    { id: 'alimento', label: 'Alimento', icon: <Wheat size={15} /> },
    { id: 'estadisticas', label: 'Estadísticas', icon: <BarChart3 size={15} /> },
  ]

  return (
    <div className="flex gap-6">
      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Producción */}
        {tab === 'produccion' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Últimos registros de producción</h3>
              <Link
                href={`/galpones/${galponId}/produccion`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
              >
                <PlusCircle size={15} />
                Registrar producción
              </Link>
            </div>
            {produccionData.registros.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
                <p className="text-gray-400 text-sm">No hay registros de producción aún.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turno</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Huevos</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Rotos</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Mortalidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {produccionData.registros.slice(0, 10).map((r, i) => (
                      <tr key={r._id.toString()} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 text-gray-700">{formatDate(r.fecha)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${turnoColors[r.turno]}`}>
                            {r.turno}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{r.cantidadHuevos}</td>
                        <td className="px-4 py-3 text-right text-amber-600">{r.huevosRotos}</td>
                        <td className="px-4 py-3 text-right text-red-600">{r.mortalidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Alimento */}
        {tab === 'alimento' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Últimos registros de alimento</h3>
              <Link
                href={`/galpones/${galponId}/alimento`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
              >
                <PlusCircle size={15} />
                Registrar suministro
              </Link>
            </div>
            <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
              <Wheat size={20} className="text-green-600" />
              <div>
                <p className="text-xs text-green-700 font-medium">Inventario actual estimado</p>
                <p className="text-lg font-bold text-green-800">{alimentoData.inventarioActual.toFixed(1)} kg</p>
              </div>
            </div>
            {alimentoData.registros.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
                <p className="text-gray-400 text-sm">No hay registros de alimento aún.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad (kg)</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Costo total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {alimentoData.registros.slice(0, 10).map((r, i) => (
                      <tr key={r._id.toString()} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 text-gray-700">{formatDate(r.fecha)}</td>
                        <td className="px-4 py-3 text-gray-700">{r.tipoAlimento}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{r.cantidadKg} kg</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          ${r.costoTotal.toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-right text-green-700 font-medium">{r.inventarioRestante.toFixed(1)} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Estadísticas */}
        {tab === 'estadisticas' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Estadísticas del galpón</h3>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
              <BarChart3 size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm font-medium">Gráficas de producción</p>
              <p className="text-gray-400 text-xs mt-1">Disponible en la vista detallada de producción</p>
              <Link
                href={`/galpones/${galponId}/produccion`}
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
              >
                Ver estadísticas completas
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel derecho */}
      <div className="w-72 flex-shrink-0">
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Indicadores del galpón</h4>
            <GalponStats
              gallinasActivas={galpon.cantidadGallinas - produccionData.stats.mortalidadAcumulada}
              totalGallinas={galpon.cantidadGallinas}
              mortalidadAcumulada={produccionData.stats.mortalidadAcumulada}
              huevosHoy={produccionData.stats.huevosHoy}
              porcentajePosicion={produccionData.stats.porcentajePosicion}
            />
          </div>
          <hr className="border-gray-100" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Raza</span>
              <span className="font-medium text-gray-800">{galpon.raza || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Semanas de vida</span>
              <span className="font-medium text-gray-800">{galpon.semanasAproximadas} sem</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha ingreso</span>
              <span className="font-medium text-gray-800">{formatDate(galpon.fechaIngreso)}</span>
            </div>
          </div>
          <hr className="border-gray-100" />
          <div className="space-y-2">
            <Link
              href={`/galpones/${galpon._id.toString()}/editar`}
              className="w-full block text-center py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Editar galpón
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
