'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import KpiCard from '@/components/shared/KpiCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import AlimentoForm from '@/components/alimento/AlimentoForm'
import ConsumoChart from '@/components/alimento/ConsumoChart'
import { IRegistroAlimento } from '@/types'
import { Wheat, AlertTriangle, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'

interface Stats {
  inventarioActual: number
  consumoSemana: number
  costoSemana: number
  consumoDiarioEstimado: number
}

interface ChartPoint {
  fecha: string
  kg: number
  costo: number
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AlimentoGalponPage() {
  const { id } = useParams<{ id: string }>()
  const [galponNombre, setGalponNombre] = useState('')
  const [registros, setRegistros] = useState<IRegistroAlimento[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const UMBRAL_DIAS = 7

  const cargar = useCallback(async () => {
    try {
      const [galponRes, aliRes] = await Promise.all([
        fetch(`/api/galpones/${id}`),
        fetch(`/api/galpones/${id}/alimento?limit=15&page=${page}`),
      ])
      const [galponJson, aliJson] = await Promise.all([galponRes.json(), aliRes.json()])
      if (galponJson.success) setGalponNombre(galponJson.data.galpon.nombre)
      if (aliJson.success) {
        setRegistros(aliJson.data.registros)
        setStats(aliJson.data.stats)
        setChartData(aliJson.data.chartData)
        setTotalPages(aliJson.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [id, page])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (loading) return <div className="p-6"><LoadingSpinner /></div>

  const diasRestantes =
    stats && stats.consumoDiarioEstimado > 0
      ? stats.inventarioActual / stats.consumoDiarioEstimado
      : Infinity

  const inventarioBajo = diasRestantes < UMBRAL_DIAS && diasRestantes !== Infinity

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={`Alimento${galponNombre ? ` — ${galponNombre}` : ''}`}
        subtitle="Control de inventario y suministro de alimento"
        breadcrumbs={[
          { label: 'Galpones', href: '/galpones' },
          { label: galponNombre || id, href: `/galpones/${id}` },
          { label: 'Alimento' },
        ]}
      />

      {/* Alerta visual */}
      {inventarioBajo && stats && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Inventario bajo</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Solo quedan {stats.inventarioActual.toFixed(1)} kg — aproximadamente{' '}
              {Math.floor(diasRestantes)} día(s) de alimento. Considera reabastecer pronto.
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard
            title="Inventario actual"
            value={`${stats.inventarioActual.toFixed(1)} kg`}
            subtitle={
              diasRestantes === Infinity
                ? 'Sin estimado'
                : `~${Math.floor(diasRestantes)} días restantes`
            }
            icon={<Wheat size={18} />}
            color={inventarioBajo ? 'amber' : 'green'}
          />
          <KpiCard
            title="Consumo esta semana"
            value={`${stats.consumoSemana.toFixed(1)} kg`}
            subtitle="últimos 7 días"
            icon={<Wheat size={18} />}
            color="blue"
          />
          <KpiCard
            title="Costo esta semana"
            value={`$${stats.costoSemana.toLocaleString('es-CO')}`}
            subtitle="últimos 7 días"
            icon={<Wheat size={18} />}
            color="purple"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">Registrar suministro</h2>
            <AlimentoForm galponId={id} onSuccess={cargar} />
          </div>
        </div>

        {/* Tabla + Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfica */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <ConsumoChart data={chartData} title="Consumo de alimento — últimos 30 días" />
          </div>

          {/* Tabla */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Historial de suministros</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad (kg)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Costo/kg</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registros.map((r, i) => (
                    <tr key={r._id.toString()} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(r.fecha)}</td>
                      <td className="px-4 py-3 text-gray-700">{r.tipoAlimento}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{r.cantidadKg} kg</td>
                      <td className="px-4 py-3 text-right text-gray-600">${r.costoUnitario.toLocaleString('es-CO')}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">${r.costoTotal.toLocaleString('es-CO')}</td>
                      <td className="px-4 py-3 text-right text-green-700 font-medium">{r.inventarioRestante.toFixed(1)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registros.length === 0 && (
                <div className="py-10 text-center text-gray-400 text-sm">
                  No hay registros de alimento aún.
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">Página {page} de {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
